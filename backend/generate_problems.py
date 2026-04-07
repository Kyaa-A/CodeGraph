"""
Bulk problem generator for CodeGraph.
Multi-provider key rotation: Cerebras → Groq → OpenRouter.
Gap-aware: queries existing problems per topic/difficulty, only fills gaps.
Dedup: feeds existing titles to LLM + normalized title matching.
"""
import json, re, time, sys, uuid, os, argparse
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

BASE_COUNTS = {"easy": 18, "medium": 22, "hard": 12}

# Prompt now includes existing titles to avoid duplicates
PROMPT_WITH_EXISTING = '''Create 1 unique {difficulty} coding problem about "{topic}" as JSON.

IMPORTANT: The following problems ALREADY EXIST for this topic. You MUST create something COMPLETELY DIFFERENT — different algorithm, different data structure usage, different problem scenario. Do NOT create variations of these:
{existing_titles}

Return JSON: {{"title":"...","slug":"kebab-case","description":"Problem statement with 2+ examples showing Input/Output","starter_code":{{"python":"def func(params):\\n    pass","javascript":"function func(params) {{\\n}}"}},"test_code":{{"python":"r=[]\\nr.append(('t1',func(input1)==expected1))\\nr.append(('t2',func(input2)==expected2))\\nr.append(('t3',func(input3)==expected3))\\nr.append(('t4',func(input4)==expected4))\\nfor n,p in r:\\n    print(f\\'PASS: {{n}}\\' if p else f\\'FAIL: {{n}}\\')\\nif all(p for _,p in r): print(\\'ALL_TESTS_PASSED\\')","javascript":"const r=[];\\nr.push(['t1',func(i1)===e1]);\\nr.push(['t2',func(i2)===e2]);\\nr.push(['t3',func(i3)===e3]);\\nr.push(['t4',func(i4)===e4]);\\nr.forEach(([n,p])=>console.log(p?`PASS: ${{n}}`:`FAIL: ${{n}}`));\\nif(r.every(([,p])=>p))console.log('ALL_TESTS_PASSED');"}},"hints":["hint1","hint2"],"constraints":["c1","c2"]}}. Python=snake_case, JS=camelCase. Return ONLY the JSON object, no explanation.'''

PROMPT_NO_EXISTING = '''Create 1 unique {difficulty} coding problem about "{topic}" as JSON: {{"title":"...","slug":"kebab-case","description":"Problem statement with 2+ examples showing Input/Output","starter_code":{{"python":"def func(params):\\n    pass","javascript":"function func(params) {{\\n}}"}},"test_code":{{"python":"r=[]\\nr.append(('t1',func(input1)==expected1))\\nr.append(('t2',func(input2)==expected2))\\nr.append(('t3',func(input3)==expected3))\\nr.append(('t4',func(input4)==expected4))\\nfor n,p in r:\\n    print(f\\'PASS: {{n}}\\' if p else f\\'FAIL: {{n}}\\')\\nif all(p for _,p in r): print(\\'ALL_TESTS_PASSED\\')","javascript":"const r=[];\\nr.push(['t1',func(i1)===e1]);\\nr.push(['t2',func(i2)===e2]);\\nr.push(['t3',func(i3)===e3]);\\nr.push(['t4',func(i4)===e4]);\\nr.forEach(([n,p])=>console.log(p?`PASS: ${{n}}`:`FAIL: ${{n}}`));\\nif(r.every(([,p])=>p))console.log('ALL_TESTS_PASSED');"}},"hints":["hint1","hint2"],"constraints":["c1","c2"]}}. Python=snake_case, JS=camelCase. Return ONLY the JSON object, no explanation.'''


def normalize_title(title):
    """Normalize title for dedup: lowercase, strip, remove extra spaces."""
    return re.sub(r'\s+', ' ', title.lower().strip())


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


def fetch_existing_for_topic(tags, difficulty):
    """Fetch existing problem titles for a specific topic (by first tag) and difficulty."""
    # Use the first tag to match — problems are tagged with the topic's tags
    primary_tag = tags[0]
    result = supabase.table("problems") \
        .select("title") \
        .eq("difficulty", difficulty) \
        .contains("tags", [primary_tag]) \
        .execute()
    return [r["title"] for r in result.data]


def try_generate(provider, key, topic, difficulty, existing_titles_for_topic):
    """Single attempt with one provider/key. Returns parsed dict or raises."""
    llm = make_llm(provider, key)

    if existing_titles_for_topic:
        # Feed up to 50 existing titles to avoid duplicates
        titles_str = "\n".join(f"- {t}" for t in existing_titles_for_topic[:50])
        prompt = PROMPT_WITH_EXISTING.format(
            difficulty=difficulty, topic=topic, existing_titles=titles_str
        )
    else:
        prompt = PROMPT_NO_EXISTING.format(difficulty=difficulty, topic=topic)

    r = llm.invoke(prompt)
    return parse(r.content)


def gen_one(topic, tags, difficulty, existing_normalized, existing_titles_for_topic):
    """Try Cerebras first (3 keys), then Groq, then OpenRouter."""
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
            p = try_generate(provider, key, topic, difficulty, existing_titles_for_topic)
            if not p or not p.get("title"):
                continue

            title = p["title"].strip()
            norm = normalize_title(title)

            # Normalized dedup — catches "Two Sum" vs "two sum" vs "Two  Sum"
            if norm in existing_normalized:
                print(f"    [{provider}] duplicate: {title}", flush=True)
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
            existing_normalized.add(norm)
            existing_titles_for_topic.append(title)
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
    parser = argparse.ArgumentParser(description="Generate coding problems for CodeGraph")
    parser.add_argument("--start-batch", type=int, default=0,
                        help="Skip batches before this index (for resuming)")
    parser.add_argument("--target-multiplier", type=float, default=2.0,
                        help="Multiply base counts (default 2x = 36 easy, 44 medium, 24 hard per topic)")
    parser.add_argument("--topic", type=str, default=None,
                        help="Only generate for a specific topic (e.g. 'Stack')")
    parser.add_argument("--difficulty", type=str, default=None,
                        choices=["easy", "medium", "hard"],
                        help="Only generate for a specific difficulty")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show gaps without generating")
    args = parser.parse_args()

    # Build target counts with multiplier
    targets = {k: int(v * args.target_multiplier) for k, v in BASE_COUNTS.items()}

    # Load all existing titles for global dedup (normalized)
    result = supabase.table("problems").select("title").execute()
    existing_normalized = {normalize_title(r["title"]) for r in result.data}
    print(f"Starting with {len(existing_normalized)} existing problems", flush=True)
    print(f"Targets per topic: easy={targets['easy']}, medium={targets['medium']}, hard={targets['hard']}", flush=True)

    total = 0
    batch_idx = 0
    skipped = 0

    for topic, tags in TOPICS:
        if args.topic and topic != args.topic:
            continue

        for difficulty in ["easy", "medium", "hard"]:
            if args.difficulty and difficulty != args.difficulty:
                continue

            target = targets[difficulty]
            batch_idx += 1

            if batch_idx <= args.start_batch:
                continue

            # Gap analysis: how many do we already have for this topic+difficulty?
            existing_for_topic = fetch_existing_for_topic(tags, difficulty)
            have = len(existing_for_topic)
            need = max(0, target - have)

            if need == 0:
                print(f"\n[Batch {batch_idx}/60] {topic} | {difficulty} | have={have}/{target} — SKIP (full)", flush=True)
                skipped += 1
                continue

            print(f"\n[Batch {batch_idx}/60] {topic} | {difficulty} | have={have}, need={need} more (target={target})", flush=True)

            if args.dry_run:
                continue

            stored = 0
            fails = 0

            for _ in range(need + 5):  # +5 buffer for failures
                if stored >= need:
                    break
                if fails > 12:
                    print(f"  Too many failures, skipping batch", flush=True)
                    break

                title, provider = gen_one(topic, tags, difficulty, existing_normalized, existing_for_topic)
                if title:
                    stored += 1
                    total += 1
                    print(f"  [{stored}/{need}] [{provider}] {title} (total: {total})", flush=True)
                    fails = 0
                else:
                    fails += 1
                    print(f"  Failed, consecutive: {fails}", flush=True)

                time.sleep(1)

            print(f"  Batch done: {stored}/{need}", flush=True)

    print(f"\n{'='*50}", flush=True)
    if args.dry_run:
        print(f"DRY RUN: no problems generated", flush=True)
    else:
        print(f"COMPLETE: {total} new problems generated ({skipped} batches skipped — already full)", flush=True)
        final = supabase.table("problems").select("title", count="exact").execute()
        print(f"Total in DB: {final.count}", flush=True)


if __name__ == "__main__":
    main()
