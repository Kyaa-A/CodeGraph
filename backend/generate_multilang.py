"""
Add multi-language starter_code + test_code to existing problems.
Uses existing Python + JS as reference to generate: TypeScript, Java, C++, C, Go, Rust, C#.
Multi-provider key rotation: Cerebras -> Groq -> OpenRouter.
"""
import json, re, time, sys, os
from dotenv import load_dotenv
load_dotenv()
from langchain_openai import ChatOpenAI
from app.core.supabase import supabase

CEREBRAS_KEYS = [k.strip() for k in os.environ.get("CEREBRAS_KEYS", "").split(",") if k.strip()]
GROQ_KEYS = [k.strip() for k in os.environ.get("GROQ_KEYS", "").split(",") if k.strip()]
OPENROUTER_KEY = os.environ.get("OPENROUTER_KEY", "")

_cerebras_idx = 0
_groq_idx = 0

TARGET_LANGS = ["typescript", "java", "cpp", "c", "go", "rust", "csharp"]

LANG_DETAILS = {
    "typescript": {
        "name": "TypeScript",
        "naming": "camelCase",
        "notes": "Write valid JavaScript (runs on Node.js). Use const/let, no type annotations.",
    },
    "java": {
        "name": "Java",
        "naming": "camelCase",
        "notes": "Wrap solution in a class named Solution. Do NOT use 'public class', just 'class Solution'. Methods should be static. For test_code: only the body that goes inside main() - create ArrayList of results, print PASS:/FAIL: lines, then ALL_TESTS_PASSED if all pass. Call methods via Solution.methodName().",
    },
    "cpp": {
        "name": "C++",
        "naming": "camelCase",
        "notes": "Include necessary headers (#include <vector>, #include <string>, etc). Use 'using namespace std;'. For test_code: append after user code, write a main() function that tests and prints PASS:/FAIL: lines.",
    },
    "c": {
        "name": "C",
        "naming": "snake_case",
        "notes": "Include necessary headers (#include <stdio.h>, #include <stdlib.h>, etc). For arrays, pass size as separate parameter. For test_code: append after user code, write a main() function that tests and prints PASS:/FAIL: lines using printf.",
    },
    "go": {
        "name": "Go",
        "naming": "camelCase (exported: PascalCase)",
        "notes": "Use package main. Import fmt and any needed packages. For test_code: append after user code, write a main() function. Use fmt.Println for PASS:/FAIL:/ALL_TESTS_PASSED output.",
    },
    "rust": {
        "name": "Rust",
        "naming": "snake_case",
        "notes": "For test_code: append after user code, write a main() function. Use println! macro for PASS:/FAIL:/ALL_TESTS_PASSED output. Use Vec<i32> for arrays, String/&str for strings.",
    },
    "csharp": {
        "name": "C#",
        "naming": "PascalCase for methods, camelCase for params",
        "notes": "Use a class Solution with static methods. For test_code: append after user code, write a class Program with static Main that tests and prints PASS:/FAIL: lines using Console.WriteLine.",
    },
}

PROMPT_TEMPLATE = '''You are translating a coding problem's starter code and test code from Python/JavaScript to {lang_name}.

PROBLEM TITLE: {title}
PROBLEM DESCRIPTION: {description}

EXISTING PYTHON STARTER CODE:
```
{python_starter}
```

EXISTING PYTHON TEST CODE:
```
{python_test}
```

EXISTING JAVASCRIPT STARTER CODE:
```
{js_starter}
```

Language-specific rules for {lang_name}:
- Naming convention: {naming}
- {notes}

Generate ONLY a JSON object with exactly two keys:
{{"starter_code": "...", "test_code": "..."}}

CRITICAL RULES:
1. The starter_code should have the function signature with empty body (user fills in logic)
2. The test_code must print "PASS: test_name" or "FAIL: test_name" for each test case
3. If ALL tests pass, print "ALL_TESTS_PASSED" at the end
4. Use the EXACT SAME test cases/values as the Python test code
5. The test_code gets APPENDED after the user's code (except Java where it goes inside main)
6. Return ONLY the JSON object, no explanation, no markdown fences'''


def make_llm(provider, key):
    configs = {
        "cerebras": ("https://api.cerebras.ai/v1", "qwen-3-235b-a22b-instruct-2507"),
        "groq": ("https://api.groq.com/openai/v1", "llama-3.3-70b-versatile"),
        "openrouter": ("https://openrouter.ai/api/v1", "meta-llama/llama-3.3-70b-instruct"),
    }
    base_url, model = configs[provider]
    return ChatOpenAI(
        base_url=base_url, api_key=key, model=model,
        temperature=0.3, max_tokens=3000, timeout=60,
    )


def next_cerebras():
    global _cerebras_idx
    key = CEREBRAS_KEYS[_cerebras_idx % len(CEREBRAS_KEYS)]
    _cerebras_idx += 1
    return "cerebras", key


def next_groq():
    global _groq_idx
    key = GROQ_KEYS[_groq_idx % len(GROQ_KEYS)]
    _groq_idx += 1
    return "groq", key


def parse(text):
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
    text = re.sub(r'^```(?:json)?\s*', '', text.strip())
    text = re.sub(r'\s*```$', '', text)
    try:
        r = json.loads(text)
        if isinstance(r, dict) and "starter_code" in r and "test_code" in r:
            return r
    except Exception:
        m = re.search(r'\{.*\}', text, re.DOTALL)
        if m:
            try:
                r = json.loads(m.group())
                if isinstance(r, dict) and "starter_code" in r and "test_code" in r:
                    return r
            except Exception:
                pass
    return None


def generate_for_lang(problem, lang):
    """Generate starter_code + test_code for one language, one problem."""
    detail = LANG_DETAILS[lang]
    prompt = PROMPT_TEMPLATE.format(
        lang_name=detail["name"],
        title=problem["title"],
        description=problem.get("description", ""),
        python_starter=problem["starter_code"].get("python", ""),
        python_test=problem["test_code"].get("python", ""),
        js_starter=problem["starter_code"].get("javascript", ""),
        naming=detail["naming"],
        notes=detail["notes"],
    )

    providers_to_try = []
    for _ in range(3):
        providers_to_try.append(next_cerebras())
    providers_to_try.append(next_groq())
    providers_to_try.append(("openrouter", OPENROUTER_KEY))

    for provider, key in providers_to_try:
        try:
            llm = make_llm(provider, key)
            r = llm.invoke(prompt)
            result = parse(r.content)
            if result and result["starter_code"] and result["test_code"]:
                return result, provider
        except Exception as e:
            err = str(e)
            if "429" in err or "rate" in err.lower():
                wait = 5
                m = re.search(r'try again in (\d+(?:\.\d+)?)', err.lower())
                if m:
                    wait = int(float(m.group(1))) + 2
                print(f"      [{provider}] rate limited, wait {wait}s", flush=True)
                time.sleep(wait)
            else:
                print(f"      [{provider}] err: {err[:80]}", flush=True)
                time.sleep(1)

    return None, None


def main():
    # Fetch all problems (paginate past Supabase 1000-row default)
    all_problems = []
    page_size = 1000
    offset = 0
    while True:
        result = supabase.table("problems").select("id, title, description, starter_code, test_code").range(offset, offset + page_size - 1).execute()
        all_problems.extend(result.data)
        if len(result.data) < page_size:
            break
        offset += page_size
    print(f"Total problems in DB: {len(all_problems)}", flush=True)

    # Filter: only problems that have python + javascript but missing target langs
    problems_to_update = []
    for p in all_problems:
        sc = p.get("starter_code", {})
        if "python" not in sc or "javascript" not in sc:
            continue
        missing = [l for l in TARGET_LANGS if l not in sc]
        if missing:
            problems_to_update.append((p, missing))

    print(f"Problems needing translation: {len(problems_to_update)}", flush=True)

    # Optional: start from a specific offset
    start_idx = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    batch_size = int(sys.argv[2]) if len(sys.argv) > 2 else len(problems_to_update)

    total_generated = 0
    total_failed = 0

    for idx, (problem, missing_langs) in enumerate(problems_to_update[start_idx:start_idx + batch_size]):
        actual_idx = start_idx + idx
        print(f"\n[{actual_idx + 1}/{len(problems_to_update)}] {problem['title']}", flush=True)
        print(f"  Missing: {', '.join(missing_langs)}", flush=True)

        new_starter = dict(problem["starter_code"])
        new_test = dict(problem["test_code"])
        langs_added = []

        for lang in missing_langs:
            result, provider = generate_for_lang(problem, lang)
            if result:
                new_starter[lang] = result["starter_code"]
                new_test[lang] = result["test_code"]
                langs_added.append(lang)
                total_generated += 1
                print(f"    + {lang} [{provider}]", flush=True)
            else:
                total_failed += 1
                print(f"    x {lang} FAILED", flush=True)

            time.sleep(0.5)  # small delay between languages

        if langs_added:
            supabase.rpc("update_problem_languages", {
                "p_id": problem["id"],
                "p_starter_code": new_starter,
                "p_test_code": new_test,
            }).execute()
            print(f"  Updated: +{len(langs_added)} languages", flush=True)

    print(f"\n{'='*50}", flush=True)
    print(f"COMPLETE: {total_generated} translations generated, {total_failed} failed", flush=True)


if __name__ == "__main__":
    main()
