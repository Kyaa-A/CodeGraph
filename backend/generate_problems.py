"""
Bulk problem generator for CodeGraph.
Multi-provider key rotation: Cerebras → Groq → OpenRouter.
"""
import json, re, time, sys, uuid, os
from dotenv import load_dotenv
load_dotenv()
from langchain_openai import ChatOpenAI
from app.core.supabase import supabase

# Keys loaded from environment variables (comma-separated)
CEREBRAS_KEYS = [k.strip() for k in os.environ.get("CEREBRAS_KEYS", "").split(",") if k.strip()]
GROQ_KEYS = [k.strip() for k in os.environ.get("GROQ_KEYS", "").split(",") if k.strip()]
OPENROUTER_KEY = os.environ.get("OPENROUTER_KEY", "")

_cerebras_idx = 0
_groq_idx = 0


def make_llm(provider, key):
    configs = {
        "cerebras": ("https://api.cerebras.ai/v1", "qwen-3-235b-a22b-instruct-2507"),
        "groq": ("https://api.groq.com/openai/v1", "llama-3.3-70b-versatile"),
        "openrouter": ("https://openrouter.ai/api/v1", "meta-llama/llama-3.3-70b-instruct"),
    }
    base_url, model = configs[provider]
    return ChatOpenAI(
        base_url=base_url, api_key=key, model=model,
        temperature=0.95, max_tokens=3000, timeout=60,
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


TOPICS = [
    ("Arrays & Hashing", ["arrays", "hash-table"]),
    ("Two Pointers", ["two-pointers", "arrays"]),
    ("Sliding Window", ["sliding-window", "arrays"]),
    ("Stack", ["stack"]),
    ("Binary Search", ["binary-search"]),
    ("Linked List", ["linked-list"]),
    ("Trees", ["trees", "binary-tree"]),
    ("Heap / Priority Queue", ["heap", "sorting"]),
    ("Backtracking", ["backtracking", "recursion"]),
    ("Graphs", ["graphs", "dfs"]),
    ("Dynamic Programming", ["dynamic-programming"]),
    ("Greedy", ["greedy"]),
    ("Intervals", ["intervals", "sorting"]),
    ("Math", ["math"]),
    ("Bit Manipulation", ["bit-manipulation"]),
    ("String", ["string"]),
    ("Sorting & Searching", ["sorting"]),
    ("Recursion", ["recursion"]),
    ("Matrix", ["matrix", "arrays"]),
    ("Simulation", ["simulation"]),
]

COUNTS = {"easy": 18, "medium": 22, "hard": 12}

PROMPT = '''Create 1 unique {difficulty} coding problem about "{topic}" as JSON: {{"title":"...","slug":"kebab-case","description":"Problem statement with 2+ examples showing Input/Output","starter_code":{{"python":"def func(params):\\n    pass","javascript":"function func(params) {{\\n}}"}},"test_code":{{"python":"r=[]\\nr.append(('t1',func(input1)==expected1))\\nr.append(('t2',func(input2)==expected2))\\nr.append(('t3',func(input3)==expected3))\\nr.append(('t4',func(input4)==expected4))\\nfor n,p in r:\\n    print(f\\'PASS: {{n}}\\' if p else f\\'FAIL: {{n}}\\')\\nif all(p for _,p in r): print(\\'ALL_TESTS_PASSED\\')","javascript":"const r=[];\\nr.push(['t1',func(i1)===e1]);\\nr.push(['t2',func(i2)===e2]);\\nr.push(['t3',func(i3)===e3]);\\nr.push(['t4',func(i4)===e4]);\\nr.forEach(([n,p])=>console.log(p?`PASS: ${{n}}`:`FAIL: ${{n}}`));\\nif(r.every(([,p])=>p))console.log('ALL_TESTS_PASSED');"}},"hints":["hint1","hint2"],"constraints":["c1","c2"]}}. Python=snake_case, JS=camelCase. Return ONLY the JSON object, no explanation.'''


def parse(text):
    # Strip thinking tags (Qwen sometimes adds them)
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
    text = re.sub(r'^```(?:json)?\s*', '', text.strip())
    text = re.sub(r'\s*```$', '', text)
    try:
        r = json.loads(text)
        return r if isinstance(r, dict) else r[0] if isinstance(r, list) and r else None
    except Exception:
        m = re.search(r'\{.*\}', text, re.DOTALL)
        if m:
            try:
                return json.loads(m.group())
            except Exception:
                pass
    return None


def try_generate(provider, key, topic, difficulty):
    """Single attempt with one provider/key. Returns parsed dict or raises."""
    llm = make_llm(provider, key)
    r = llm.invoke(PROMPT.format(difficulty=difficulty, topic=topic))
    return parse(r.content)


def gen_one(topic, tags, difficulty, existing):
    """Try Cerebras first (5 keys), then Groq, then OpenRouter."""
    providers_to_try = []

    # Cerebras is fastest and least rate-limited — try 3 different keys
    for _ in range(3):
        providers_to_try.append(next_cerebras())
    # Groq backup
    providers_to_try.append(next_groq())
    # OpenRouter last resort
    providers_to_try.append(("openrouter", OPENROUTER_KEY))

    for provider, key in providers_to_try:
        try:
            p = try_generate(provider, key, topic, difficulty)
            if not p or not p.get("title"):
                continue

            title = p["title"].strip()
            if title in existing:
                continue

            slug_base = p.get("slug", re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-'))
            slug = f"{slug_base}-{uuid.uuid4().hex[:6]}"
            row = {
                "title": title, "slug": slug,
                "description": p.get("description", ""),
                "difficulty": difficulty, "tags": tags,
                "starter_code": p.get("starter_code", {}),
                "test_code": p.get("test_code", {}),
                "hints": p.get("hints", []),
                "constraints": p.get("constraints", []),
            }
            supabase.table("problems").insert(row).execute()
            existing.add(title)
            return title, provider

        except Exception as e:
            err = str(e)
            if "429" in err or "rate" in err.lower():
                wait = 5
                m = re.search(r'try again in (\d+(?:\.\d+)?)', err.lower())
                if m:
                    wait = int(float(m.group(1))) + 2
                print(f"    [{provider}] rate limited, wait {wait}s", flush=True)
                time.sleep(wait)
            else:
                print(f"    [{provider}] err: {err[:80]}", flush=True)
                time.sleep(1)

    return None, None


def main():
    result = supabase.table("problems").select("title").execute()
    existing = {r["title"] for r in result.data}
    print(f"Starting with {len(existing)} existing problems", flush=True)

    start_batch = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    total = 0
    batch_idx = 0

    for topic, tags in TOPICS:
        for difficulty in ["easy", "medium", "hard"]:
            count = COUNTS[difficulty]
            if batch_idx < start_batch:
                batch_idx += 1
                continue
            batch_idx += 1

            print(f"\n[Batch {batch_idx}/60] {topic} | {difficulty} | target={count}", flush=True)
            stored = 0
            fails = 0

            for _ in range(count):
                if fails > 12:
                    print(f"  Too many failures, skipping batch", flush=True)
                    break

                title, provider = gen_one(topic, tags, difficulty, existing)
                if title:
                    stored += 1
                    total += 1
                    print(f"  [{stored}/{count}] [{provider}] {title} (total: {total})", flush=True)
                    fails = 0
                else:
                    fails += 1
                    print(f"  Failed, consecutive: {fails}", flush=True)

                time.sleep(1)

            print(f"  Batch done: {stored}/{count}", flush=True)

    print(f"\n{'='*50}", flush=True)
    print(f"COMPLETE: {total} new problems generated", flush=True)
    final = supabase.table("problems").select("title", count="exact").execute()
    print(f"Total in DB: {final.count}", flush=True)


if __name__ == "__main__":
    main()
