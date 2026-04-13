"""
Bulk documentation generator for CodeGraph.
Generates W3Schools-style comprehensive docs for 5 languages.
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
        temperature=0.7, max_tokens=4000, timeout=90,
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


DOCS_STRUCTURE = {
    "python": [
        ("Tutorial", [
            "Introduction to Python", "Getting Started & Setup", "Syntax & Indentation",
            "Comments", "Variables", "Data Types", "Numbers", "Casting",
            "Strings", "String Methods", "Booleans", "Operators",
            "If...Else", "While Loops", "For Loops", "Break & Continue",
        ]),
        ("Data Structures", [
            "Lists", "List Methods", "List Comprehensions", "Tuples",
            "Sets", "Set Methods", "Dictionaries", "Dictionary Methods",
        ]),
        ("Functions", [
            "Functions", "Function Arguments", "Lambda Functions",
            "Scope", "Recursion", "Decorators", "Generators",
        ]),
        ("OOP", [
            "Classes & Objects", "Inheritance", "Polymorphism",
            "Encapsulation", "Abstract Classes", "Magic Methods",
        ]),
        ("Modules & Files", [
            "Modules & Import", "pip & Packages", "File Handling",
            "Read Files", "Write Files", "Delete Files",
            "Exception Handling", "Try...Except...Finally",
        ]),
        ("Advanced", [
            "List Comprehensions Advanced", "Regular Expressions",
            "JSON Handling", "Math Module", "Datetime Module",
            "Type Hints", "Virtual Environments", "Unit Testing",
        ]),
    ],
    "javascript": [
        ("Tutorial", [
            "Introduction to JavaScript", "Getting Started", "Syntax & Statements",
            "Comments", "Variables (let, const, var)", "Data Types",
            "Numbers", "Strings", "String Methods", "Template Literals",
            "Booleans", "Operators", "Comparisons",
            "If...Else", "Switch", "While Loops", "For Loops",
            "Break & Continue", "Type Conversion",
        ]),
        ("Functions & Scope", [
            "Functions", "Arrow Functions", "Parameters & Arguments",
            "Default Parameters", "Rest & Spread", "Closures",
            "Scope & Hoisting", "Callbacks",
        ]),
        ("Objects & Arrays", [
            "Arrays", "Array Methods", "Array Iteration",
            "Objects", "Object Methods", "Destructuring",
            "JSON", "Maps", "Sets",
        ]),
        ("DOM & Events", [
            "DOM Introduction", "Selecting Elements", "Changing HTML & CSS",
            "Event Listeners", "Event Propagation", "Forms & Validation",
        ]),
        ("Async JavaScript", [
            "Callbacks & Callback Hell", "Promises", "Async/Await",
            "Fetch API", "Error Handling in Async",
        ]),
        ("ES6+ Features", [
            "let & const", "Template Literals", "Destructuring",
            "Spread & Rest", "Modules (import/export)", "Classes",
            "Symbols", "Iterators & Generators", "Proxy & Reflect",
            "Optional Chaining", "Nullish Coalescing",
        ]),
    ],
    "java": [
        ("Tutorial", [
            "Introduction to Java", "Getting Started & Setup", "Syntax",
            "Output (System.out)", "Comments", "Variables", "Data Types",
            "Type Casting", "Operators", "Strings", "String Methods",
            "Math", "Booleans",
            "If...Else", "Switch", "While Loop", "For Loop",
            "Break & Continue", "Arrays",
        ]),
        ("Methods", [
            "Methods", "Method Parameters", "Method Overloading",
            "Scope", "Recursion",
        ]),
        ("OOP", [
            "Classes & Objects", "Class Attributes", "Class Methods",
            "Constructors", "this Keyword", "Modifiers",
            "Encapsulation", "Inheritance", "Polymorphism",
            "super Keyword", "Abstract Classes", "Interfaces",
            "Enums", "Inner Classes",
        ]),
        ("Error Handling", [
            "Exceptions", "Try...Catch...Finally", "Throw & Throws",
            "Custom Exceptions", "Multiple Exceptions",
        ]),
        ("Data Structures", [
            "Collections Framework", "ArrayList", "LinkedList",
            "HashMap", "HashSet", "TreeMap", "TreeSet",
            "Iterator", "Comparable & Comparator",
        ]),
        ("Advanced", [
            "Generics", "Lambda Expressions", "Streams API",
            "File I/O", "Threads & Concurrency", "Annotations",
            "Regular Expressions",
        ]),
    ],
    "sql": [
        ("Basics", [
            "Introduction to SQL", "SQL Syntax", "SELECT",
            "DISTINCT", "WHERE", "AND, OR, NOT", "ORDER BY",
            "LIMIT & OFFSET", "NULL Values", "Aliases",
        ]),
        ("Filtering & Sorting", [
            "LIKE & Wildcards", "IN", "BETWEEN",
            "GROUP BY", "HAVING", "EXISTS",
        ]),
        ("Joins", [
            "INNER JOIN", "LEFT JOIN", "RIGHT JOIN",
            "FULL OUTER JOIN", "CROSS JOIN", "Self Join",
        ]),
        ("Data Manipulation", [
            "INSERT INTO", "UPDATE", "DELETE",
            "UPSERT (INSERT ON CONFLICT)", "RETURNING Clause",
        ]),
        ("Advanced Queries", [
            "Subqueries", "Common Table Expressions (CTEs)",
            "Window Functions", "UNION & INTERSECT",
            "CASE Expressions", "Aggregate Functions",
        ]),
        ("Database Design", [
            "CREATE TABLE", "ALTER TABLE", "Drop Table",
            "Constraints (PK, FK, UNIQUE)", "Indexes",
            "Views", "Transactions", "Data Types",
        ]),
    ],
    "langchain": [
        ("Getting Started", [
            "What is LangChain?", "Installation & Setup",
            "LLM Basics", "Chat Models", "Prompt Templates",
        ]),
        ("Core Concepts", [
            "Chains", "Sequential Chains", "Output Parsers",
            "Memory", "Conversation Memory Types",
        ]),
        ("RAG Pipeline", [
            "What are Embeddings?", "Text Splitting & Chunking",
            "Vector Stores (pgvector)", "Retrieval Strategies",
            "RAG Chain", "Conversational RAG",
        ]),
        ("Agents & Tools", [
            "What are Agents?", "Tools", "Agent Types",
            "Custom Tools", "Agent with Memory",
        ]),
        ("LangGraph", [
            "Introduction to LangGraph", "State Graphs",
            "Nodes & Edges", "Conditional Routing",
            "Human-in-the-Loop", "Multi-Agent Systems",
        ]),
        ("Advanced", [
            "Streaming", "Callbacks & Tracing",
            "Evaluation & Testing", "Deployment",
            "LangSmith Integration",
        ]),
    ],
    "ai-models": [
        ("Getting Started", [
            "What Are LLMs",
            "How LLMs Work",
            "Tokens and Context Windows",
            "Temperature and Parameters",
        ]),
        ("Model Comparison", [
            "Claude — Opus, Sonnet, and Haiku",
            "GPT — 4o, o1, and o3",
            "Gemini — Pro and Flash",
            "Llama and Open Source Models",
            "How to Choose a Model",
        ]),
        ("Using Model APIs", [
            "API Keys and Authentication",
            "Your First API Call",
            "Streaming Responses",
            "Tool Use and Function Calling",
            "Structured Output",
        ]),
        ("Advanced", [
            "Fine-Tuning Basics",
            "Embeddings and Vector Search",
            "Multi-Modal Models",
            "Cost Optimization",
            "Rate Limits and Best Practices",
        ]),
    ],
    "prompt-engineering": [
        ("Fundamentals", [
            "What Is Prompt Engineering",
            "Anatomy of a Good Prompt",
            "System Prompts vs User Prompts",
            "Zero-Shot vs Few-Shot Prompting",
        ]),
        ("Techniques", [
            "Chain of Thought Prompting",
            "Role Prompting",
            "Output Formatting with JSON and XML",
            "Prompt Chaining",
            "Guardrails and Safety",
        ]),
        ("Patterns", [
            "Code Generation Prompts",
            "Data Analysis Prompts",
            "Writing and Summarization Prompts",
            "Debugging with AI",
            "Building Agents via Prompts",
        ]),
        ("Advanced", [
            "Prompt Caching",
            "Evaluating Prompt Quality",
            "A/B Testing Prompts",
            "Prompt Injection Defense",
            "Production Prompt Management",
        ]),
    ],
    "claude-code": [
        ("Getting Started", [
            "What Is Claude Code",
            "Installation and Setup",
            "Your First Session",
            "The CLI Interface",
        ]),
        ("Core Features", [
            "Reading and Editing Files",
            "Running Commands",
            "Multi-File Changes",
            "Git Integration",
            "Slash Commands",
        ]),
        ("Workflows", [
            "Debugging with Claude Code",
            "Building Features",
            "Code Review with Claude Code",
            "Test-Driven Development",
            "Pair Programming",
        ]),
        ("Customization", [
            "CLAUDE.md Configuration",
            "Hooks",
            "Permissions and Safety",
            "Memory and Context",
            "Custom Instructions",
        ]),
        ("Ecosystem", [
            "Plugins and Extensions",
            "Superpowers Plugin",
            "MCP Servers in Claude Code",
            "IDE Integrations",
        ]),
    ],
    "ai-coding-tools": [
        ("Overview", [
            "The AI Coding Landscape",
            "How AI Code Assistants Work",
            "Choosing the Right Tool",
        ]),
        ("Tools", [
            "Cursor Deep Dive",
            "GitHub Copilot Deep Dive",
            "Windsurf Deep Dive",
            "Cline and Open Source Alternatives",
            "AI Coding Tools Comparison Matrix",
        ]),
        ("Workflows", [
            "AI-Powered IDE Setup",
            "Effective Autocomplete Usage",
            "Chat-Driven Development",
            "Multi-File Refactoring with AI",
            "AI-Assisted Debugging",
        ]),
        ("Best Practices", [
            "When to Use AI vs Not",
            "Reviewing AI-Generated Code",
            "Security Considerations",
            "Team Workflows with AI Tools",
        ]),
    ],
    "plugins": [
        ("Getting Started", [
            "What Are AI Plugins",
            "Plugin Architecture",
            "Installing Plugins",
        ]),
        ("Best Plugins", [
            "Superpowers Deep Dive",
            "Top Open Source Plugins",
            "Productivity Plugins",
            "Code Quality Plugins",
            "Documentation Plugins",
        ]),
        ("Building Plugins", [
            "Plugin Development Basics",
            "Skill System Architecture",
            "Creating Your First Skill",
            "Publishing and Sharing Plugins",
        ]),
    ],
    "mcp": [
        ("Getting Started", [
            "What Is Model Context Protocol",
            "How MCPs Work",
            "MCP Architecture",
        ]),
        ("Best MCPs", [
            "Database MCPs",
            "Git and GitHub MCPs",
            "File System MCPs",
            "API Integration MCPs",
            "Search and Browser MCPs",
        ]),
        ("Building MCPs", [
            "Your First MCP Server",
            "TypeScript MCP SDK",
            "Python MCP SDK",
            "Tools vs Resources vs Prompts",
            "Testing and Debugging MCPs",
        ]),
        ("Advanced", [
            "MCP in Production",
            "Security Best Practices for MCPs",
            "Chaining Multiple MCPs",
            "Performance Optimization",
        ]),
    ],
    "ai-cli": [
        ("Getting Started", [
            "AI in the Terminal",
            "Setting Up Your AI Terminal",
            "Shell Integration",
        ]),
        ("Tools", [
            "Claude Code CLI",
            "GitHub CLI with AI",
            "Aider",
            "OpenAI CLI",
            "Other AI CLIs",
        ]),
        ("Automation", [
            "Scripting with AI",
            "CI/CD with AI Tools",
            "Automated Code Review",
            "Automated Testing with AI",
            "Git Hooks with AI",
        ]),
        ("Advanced", [
            "Building CLI Agents",
            "Headless AI Workflows",
            "Monitoring and Logging",
            "Cost Management",
        ]),
    ],
}

PROMPT_TUTORIAL = """Write a comprehensive tutorial page about "{title}" for {lang_name} documentation.

Requirements:
- Start with a clear # heading, then an intro paragraph
- Use ## for major sections within the page
- Include 3-5 code examples with ```{lang_code} blocks
- Show practical, real-world examples (not just "hello world")
- Include a "Try it Yourself" section with a practice exercise
- Add a "Key Points" summary at the end as bullet points
- Explain concepts clearly for beginners but include depth for intermediate learners
- Use tables where comparing options/methods makes sense
- Total length: 400-800 words of content (not counting code blocks)

Write ONLY the markdown content. No meta-commentary."""

PROMPT_TOOL_GUIDE = """Write a practical guide about "{title}" for the {lang_name} documentation.

Requirements:
- Start with a clear # heading, then an intro paragraph explaining what this is and why it matters
- Use ## for major sections within the page
- Include real CLI commands, configuration snippets, or code examples in ```{lang_code} blocks
- Show step-by-step setup or workflow instructions
- Include a "Quick Start" or "Getting Started" section near the top
- Add a "Tips & Best Practices" section
- Add a "Key Points" summary at the end as bullet points
- Write for developers who are new to this tool but experienced in general
- Total length: 600-1000 words of content (not counting code blocks)

Write ONLY the markdown content. No meta-commentary."""

PROMPT_COMPARISON = """Write an objective comparison page about "{title}" for the {lang_name} documentation.

Requirements:
- Start with a clear # heading, then an intro paragraph framing the comparison
- Use ## for major sections within the page
- Include a feature comparison table (use markdown tables)
- List pros and cons for each option discussed
- Include code or command examples showing key differences in ```{lang_code} blocks
- End with a "Which Should You Choose?" recommendation section based on use case
- Add a "Key Points" summary at the end as bullet points
- Be balanced and objective — mention real strengths and weaknesses
- Total length: 600-1000 words of content (not counting code blocks)

Write ONLY the markdown content. No meta-commentary."""

# Topics that use tool guide prompt (non-programming-language topics)
TOOL_GUIDE_LANGS = {"claude-code", "ai-coding-tools", "plugins", "mcp", "ai-cli"}

# Sections within tool topics that use comparison prompt instead
COMPARISON_SECTIONS = {"Model Comparison", "Tools", "Best Plugins", "Best MCPs", "Best Practices"}


def gen_page(lang, lang_name, lang_code, section, title, order_index, prompt_template=None):
    """Generate one documentation page."""
    providers_to_try = []
    for _ in range(3):
        providers_to_try.append(next_cerebras())
    providers_to_try.append(next_groq())
    providers_to_try.append(("openrouter", OPENROUTER_KEY))

    slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')

    for provider, key in providers_to_try:
        try:
            llm = make_llm(provider, key)
            template = prompt_template or PROMPT_TUTORIAL
            result = llm.invoke(template.format(
                title=title, lang_name=lang_name, lang_code=lang_code
            ))
            content = result.content.strip()
            # Strip thinking tags
            content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL).strip()

            if len(content) < 200:
                continue

            row = {
                "lang": lang,
                "section": section,
                "title": title,
                "slug": slug,
                "order_index": order_index,
                "content": content,
            }
            supabase.table("doc_topics").upsert(row, on_conflict="lang,slug").execute()
            return provider

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

    return None


def main():
    result = supabase.table("doc_topics").select("lang, slug").execute()
    existing = {(r["lang"], r["slug"]) for r in result.data}
    print(f"Starting with {len(existing)} existing doc pages", flush=True)

    lang_codes = {
        "python": "python", "javascript": "javascript",
        "java": "java", "sql": "sql", "langchain": "python",
        "ai-models": "python", "prompt-engineering": "text",
        "claude-code": "bash", "ai-coding-tools": "bash",
        "plugins": "bash", "mcp": "typescript", "ai-cli": "bash",
    }
    lang_names = {
        "python": "Python", "javascript": "JavaScript",
        "java": "Java", "sql": "SQL", "langchain": "LangChain",
        "ai-models": "AI Models", "prompt-engineering": "Prompt Engineering",
        "claude-code": "Claude Code", "ai-coding-tools": "AI Coding Tools",
        "plugins": "Plugins & Extensions", "mcp": "MCPs", "ai-cli": "CLI & Automation",
    }

    target_lang = sys.argv[1] if len(sys.argv) > 1 else None

    total = 0

    for lang, sections in DOCS_STRUCTURE.items():
        if target_lang and lang != target_lang:
            continue

        lang_name = lang_names[lang]
        lang_code = lang_codes[lang]

        print(f"\n{'='*50}", flush=True)
        print(f"  {lang_name} Documentation", flush=True)
        print(f"{'='*50}", flush=True)

        order = 0
        for section, topics in sections:
            print(f"\n[{section}]", flush=True)
            for title in topics:
                order += 1
                slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')

                if (lang, slug) in existing:
                    print(f"  SKIP: {title} (already exists)", flush=True)
                    continue

                # Select prompt template
                if lang in TOOL_GUIDE_LANGS:
                    if section in COMPARISON_SECTIONS:
                        prompt_template = PROMPT_COMPARISON
                    else:
                        prompt_template = PROMPT_TOOL_GUIDE
                else:
                    prompt_template = PROMPT_TUTORIAL

                provider = gen_page(lang, lang_name, lang_code, section, title, order, prompt_template)
                if provider:
                    total += 1
                    print(f"  [{provider}] {title} (#{total})", flush=True)
                    existing.add((lang, slug))
                else:
                    print(f"  FAILED: {title}", flush=True)

                time.sleep(2)

    print(f"\n{'='*50}", flush=True)
    print(f"COMPLETE: {total} new doc pages generated", flush=True)


if __name__ == "__main__":
    main()
