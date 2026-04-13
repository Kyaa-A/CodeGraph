# Docs AI Ecosystem Expansion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand CodeGraph docs from programming languages into a full AI developer knowledge base — 6 new topic areas (~96 pages) with a restructured landing page.

**Architecture:** Reuse existing `doc_topics` table and viewer infrastructure. Extend the `generate_docs.py` script with new topic structures and prompt templates. Restructure the `/docs` landing page into categorized sections. No schema changes, no new routes.

**Tech Stack:** Next.js (App Router), Supabase (doc_topics table), Python (generate_docs.py), Lucide React (icons)

---

### Task 1: Extract shared `LANG_NAMES` to a single source of truth

`LANG_NAMES` is duplicated in 3 files. Before adding 7 new entries to each copy, extract it to one shared file.

**Files:**
- Create: `frontend/src/lib/doc-constants.ts`
- Modify: `frontend/src/app/docs/[lang]/[slug]/page.tsx:12-31`
- Modify: `frontend/src/app/docs/doc-search.tsx:14-19`
- Modify: `frontend/src/app/docs/[lang]/[slug]/opengraph-image.tsx:7-12`

- [ ] **Step 1: Create the shared constants file**

```typescript
// frontend/src/lib/doc-constants.ts

/** Display names for all doc topic lang slugs */
export const LANG_NAMES: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  react: "React",
  "html-css": "HTML & CSS",
  java: "Java",
  sql: "SQL",
  go: "Go",
  rust: "Rust",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  php: "PHP",
  nodejs: "Node.js",
  langchain: "LangChain",
  kotlin: "Kotlin",
  ruby: "Ruby",
  swift: "Swift",
  // AI ecosystem topics
  "ai-models": "AI Models",
  "prompt-engineering": "Prompt Engineering",
  "claude-code": "Claude Code",
  "ai-coding-tools": "AI Coding Tools",
  plugins: "Plugins & Extensions",
  mcp: "MCPs",
  "ai-cli": "CLI & Automation",
};
```

- [ ] **Step 2: Update `docs/[lang]/[slug]/page.tsx` to import from shared file**

Replace the local `LANG_NAMES` constant (lines 12-31) with:
```typescript
import { LANG_NAMES } from "@/lib/doc-constants";
```

Remove the entire `const LANG_NAMES: Record<string, string> = { ... };` block.

- [ ] **Step 3: Update `doc-search.tsx` to import from shared file**

Replace the local `LANG_NAMES` (line 14-19) with:
```typescript
import { LANG_NAMES } from "@/lib/doc-constants";
```

- [ ] **Step 4: Update `opengraph-image.tsx` to import from shared file**

Replace the local `LANG_NAMES` (line 7-12) with:
```typescript
import { LANG_NAMES } from "@/lib/doc-constants";
```

- [ ] **Step 5: Verify build passes**

Run: `cd frontend && npx next build 2>&1 | tail -5`
Expected: "Compiled successfully"

- [ ] **Step 6: Commit**

```bash
git add frontend/src/lib/doc-constants.ts \
  frontend/src/app/docs/[lang]/[slug]/page.tsx \
  frontend/src/app/docs/doc-search.tsx \
  frontend/src/app/docs/[lang]/[slug]/opengraph-image.tsx
git commit -m "refactor: extract LANG_NAMES to shared doc-constants.ts"
```

---

### Task 2: Restructure docs landing page categories

Add 3 new category sections to the `/docs` landing page for AI ecosystem topics, with Lucide icons as fallback for non-language topics.

**Files:**
- Modify: `frontend/src/app/docs/page.tsx:42-79` (CATEGORIES array)
- Modify: `frontend/src/app/docs/page.tsx:35-39` (LangLogo function)
- Modify: `frontend/src/app/docs/page.tsx:100-112` (hero text)

- [ ] **Step 1: Update CATEGORIES array to include new sections**

Replace the existing `CATEGORIES` array (lines 42-79) with:

```typescript
const CATEGORIES = [
  {
    title: "Web Development",
    description: "Build websites and web applications",
    languages: [
      { lang: "html-css", name: "HTML & CSS", description: "Semantic HTML, Flexbox, Grid, responsive design" },
      { lang: "javascript", name: "JavaScript", description: "DOM, async/await, closures, ES6+" },
      { lang: "typescript", name: "TypeScript", description: "Interfaces, generics, utility types" },
      { lang: "react", name: "React", description: "Components, hooks, state, Next.js" },
      { lang: "nodejs", name: "Node.js", description: "Express, REST APIs, streams" },
      { lang: "php", name: "PHP", description: "Server-side web, OOP, PDO" },
    ],
  },
  {
    title: "Programming Languages",
    description: "Core languages for software development",
    languages: [
      { lang: "python", name: "Python", description: "Variables, OOP, file handling, advanced" },
      { lang: "java", name: "Java", description: "OOP, collections, generics, threads" },
      { lang: "c", name: "C", description: "Pointers, memory, structs, file I/O" },
      { lang: "cpp", name: "C++", description: "Classes, templates, STL, smart pointers" },
      { lang: "csharp", name: "C#", description: "LINQ, generics, async, .NET" },
      { lang: "go", name: "Go", description: "Goroutines, channels, interfaces" },
      { lang: "rust", name: "Rust", description: "Ownership, borrowing, lifetimes, traits" },
      { lang: "kotlin", name: "Kotlin", description: "Null safety, coroutines, data classes, extensions" },
      { lang: "ruby", name: "Ruby", description: "Blocks, procs, metaprogramming, Rails" },
      { lang: "swift", name: "Swift", description: "Optionals, protocols, closures, SwiftUI" },
    ],
  },
  {
    title: "Data & AI",
    description: "Databases, data science, and AI frameworks",
    languages: [
      { lang: "sql", name: "SQL", description: "JOINs, subqueries, indexes, optimization" },
      { lang: "langchain", name: "LangChain", description: "Chains, agents, RAG, embeddings" },
    ],
  },
  {
    title: "AI Models & Prompting",
    description: "Understand and use large language models effectively",
    languages: [
      { lang: "ai-models", name: "AI Models", description: "LLMs, model comparison, APIs, tool use" },
      { lang: "prompt-engineering", name: "Prompt Engineering", description: "Chain of thought, few-shot, output formatting" },
    ],
  },
  {
    title: "AI Coding Tools",
    description: "Tools that write, review, and debug code with you",
    languages: [
      { lang: "claude-code", name: "Claude Code", description: "The AI coding CLI — setup, workflows, plugins" },
      { lang: "ai-coding-tools", name: "AI Coding Tools", description: "Cursor, Copilot, Windsurf, and more" },
      { lang: "plugins", name: "Plugins & Extensions", description: "Superpowers, open-source plugins, building your own" },
    ],
  },
  {
    title: "Infrastructure & Automation",
    description: "Connect AI tools to your systems and workflows",
    languages: [
      { lang: "mcp", name: "MCPs", description: "Model Context Protocol — servers, tools, resources" },
      { lang: "ai-cli", name: "CLI & Automation", description: "Terminal AI workflows, scripting, CI/CD" },
    ],
  },
];
```

- [ ] **Step 2: Add SVG icon fallbacks for non-language topics**

The current `LangLogo` component (line 35-39) returns `null` for unknown langs. Add inline SVG fallbacks for AI topics. Replace the `LangLogo` function and add a new `TOPIC_ICONS` map above it:

```typescript
/* ── SVG icons for non-language topics ── */
const TOPIC_ICONS: Record<string, React.ReactNode> = {
  "ai-models": (
    <svg className="h-full w-full text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  ),
  "prompt-engineering": (
    <svg className="h-full w-full text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  "claude-code": (
    <svg className="h-full w-full text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  "ai-coding-tools": (
    <svg className="h-full w-full text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  ),
  plugins: (
    <svg className="h-full w-full text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
    </svg>
  ),
  mcp: (
    <svg className="h-full w-full text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
    </svg>
  ),
  "ai-cli": (
    <svg className="h-full w-full text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3M3 20.25V3.75A2.25 2.25 0 015.25 1.5h13.5A2.25 2.25 0 0121 3.75v16.5A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 20.25z" />
    </svg>
  ),
};

function LangLogo({ lang, className = "h-full w-full" }: { lang: string; className?: string }) {
  // Check for topic icon first (non-language topics)
  if (TOPIC_ICONS[lang]) {
    return <div className={className}>{TOPIC_ICONS[lang]}</div>;
  }
  // Fall back to CDN language logo
  const url = LOGO_URLS[lang];
  if (!url) return null;
  return <Image src={url} alt={lang} width={32} height={32} className={className} />;
}
```

- [ ] **Step 3: Update hero text to reflect expanded scope**

Change the hero section (around line 100-112). Update the heading and description:

```tsx
<h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">
  Learn to Code & Build with AI
</h1>
<p className="text-lg text-slate-500 max-w-xl mx-auto mb-6">
  Free programming references, AI tool guides, and developer resources. No account required.
</p>
```

Update the badge text:
```tsx
{totalPages}+ pages across {langCounts.size} topics
```

- [ ] **Step 4: Update quick links to include popular AI topics**

Update the quick links array (around line 126) to add Claude Code and MCPs:
```typescript
{["python", "javascript", "claude-code", "mcp", "sql", "ai-models"].map((lang) => {
```

- [ ] **Step 5: Verify build passes**

Run: `cd frontend && npx next build 2>&1 | tail -5`
Expected: "Compiled successfully"

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/docs/page.tsx
git commit -m "feat: restructure docs landing page with AI ecosystem categories"
```

---

### Task 3: Update doc-search to handle non-language topic icons

The `DocSearch` component hardcodes CDN URLs for language logos. Non-language topics need a fallback.

**Files:**
- Modify: `frontend/src/app/docs/doc-search.tsx:126`

- [ ] **Step 1: Update the search result icon rendering**

The current Image src (line 126) uses a complex ternary for CDN URLs that will break for non-language topics. Wrap it with a fallback. Find the Image tag inside the search results and add an icon fallback:

```tsx
{LOGO_URLS[item.lang] ? (
  <Image
    src={LOGO_URLS[item.lang]}
    alt={`${LANG_NAMES[item.lang] || item.lang} icon`}
    width={16}
    height={16}
    className="h-4 w-4 shrink-0 rounded-sm"
  />
) : (
  <div className="h-4 w-4 shrink-0 rounded-sm bg-slate-100 flex items-center justify-center">
    <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  </div>
)}
```

Also import `LOGO_URLS` from the page or define it locally. Since `doc-search.tsx` currently builds URLs inline (line 126), replace that inline URL builder with a lookup to `LOGO_URLS`. Import it:

```typescript
import { LANG_NAMES } from "@/lib/doc-constants";
```

(Already done in Task 1 — just make sure the inline LOGO_URLS reference exists or is imported from page.tsx. Since `LOGO_URLS` is defined in `page.tsx` and not exported, create a simple check: if the lang has a devicon logo, use it. Otherwise, use the fallback.)

- [ ] **Step 2: Verify build passes**

Run: `cd frontend && npx next build 2>&1 | tail -5`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/docs/doc-search.tsx
git commit -m "feat: add icon fallback for non-language topics in doc search"
```

---

### Task 4: Add new topic structures to `generate_docs.py`

Extend the `DOCS_STRUCTURE` dict with 6 new topic areas and add prompt templates for tool guides and comparisons.

**Files:**
- Modify: `backend/generate_docs.py:48` (DOCS_STRUCTURE)
- Modify: `backend/generate_docs.py:208-221` (PROMPT)
- Modify: `backend/generate_docs.py:274-285` (main — lang_codes, lang_names)

- [ ] **Step 1: Add 3 prompt templates**

Replace the single `PROMPT` (line 208-221) with 3 templates:

```python
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
- Include real CLI commands, configuration snippets, or code examples in ``` blocks
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
- Include code or command examples showing key differences
- End with a "Which Should You Choose?" recommendation section based on use case
- Add a "Key Points" summary at the end as bullet points
- Be balanced and objective — mention real strengths and weaknesses
- Total length: 600-1000 words of content (not counting code blocks)

Write ONLY the markdown content. No meta-commentary."""
```

- [ ] **Step 2: Add topic-to-prompt mapping**

After the prompt templates, add a mapping that tells `gen_page` which prompt to use:

```python
# Map topic types to prompt templates
# Format: lang -> set of section names that use each template
TOOL_GUIDE_SECTIONS = {
    "claude-code", "ai-coding-tools", "plugins", "mcp", "ai-cli",
}
COMPARISON_SECTIONS = {
    "Model Comparison", "Tools", "Best Plugins", "Best MCPs",
    "Best Practices",
}
```

- [ ] **Step 3: Update `gen_page` to select the right prompt**

Modify the `gen_page` function (line 224) to accept and use the correct prompt template. Add a `prompt_template` parameter:

Change the signature to:
```python
def gen_page(lang, lang_name, lang_code, section, title, order_index, prompt_template=None):
```

And change the `llm.invoke` call from:
```python
result = llm.invoke(PROMPT.format(
    title=title, lang_name=lang_name, lang_code=lang_code
))
```
to:
```python
template = prompt_template or PROMPT_TUTORIAL
result = llm.invoke(template.format(
    title=title, lang_name=lang_name, lang_code=lang_code
))
```

- [ ] **Step 4: Add new topic structures to `DOCS_STRUCTURE`**

After the existing entries in `DOCS_STRUCTURE` (after the `"langchain"` entry), add:

```python
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
```

- [ ] **Step 5: Update `main()` with new lang_codes and lang_names**

In the `main()` function (around line 278-285), update the dicts:

```python
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
```

- [ ] **Step 6: Update `main()` to pass prompt template to `gen_page`**

In the inner loop of `main()` (around line 310), determine which prompt to use and pass it:

```python
                # Select prompt template based on topic type
                if lang in TOOL_GUIDE_SECTIONS:
                    if section in COMPARISON_SECTIONS:
                        prompt_template = PROMPT_COMPARISON
                    else:
                        prompt_template = PROMPT_TOOL_GUIDE
                else:
                    prompt_template = PROMPT_TUTORIAL

                provider = gen_page(lang, lang_name, lang_code, section, title, order, prompt_template)
```

- [ ] **Step 7: Verify script syntax**

Run: `cd backend && python3 -c "import generate_docs; print('OK')"`
Expected: "OK" (no syntax errors)

- [ ] **Step 8: Commit**

```bash
git add backend/generate_docs.py
git commit -m "feat: add 6 AI ecosystem topic structures and prompt templates to doc generator"
```

---

### Task 5: Generate content for first topic area (Claude Code)

Run the generation script for `claude-code` as a proof-of-concept. This validates the full pipeline end-to-end.

**Files:**
- No code changes — running the existing script

- [ ] **Step 1: Generate Claude Code docs**

Run: `cd backend && python3 generate_docs.py claude-code`

Expected: ~19 new doc pages generated (the script skips existing ones). Watch for rate limits — the script handles retries.

- [ ] **Step 2: Verify content in Supabase**

Run a quick check:
```bash
cd backend && python3 -c "
from app.core.supabase import supabase
result = supabase.table('doc_topics').select('lang, section, title, slug').eq('lang', 'claude-code').order('order_index').execute()
for r in result.data:
    print(f'  [{r[\"section\"]}] {r[\"title\"]} → /docs/claude-code/{r[\"slug\"]}')
print(f'\nTotal: {len(result.data)} pages')
"
```

Expected: 19 pages listed across 5 sections.

- [ ] **Step 3: Verify in browser**

Start the frontend dev server and navigate to `/docs`. The "AI Coding Tools" section should show "Claude Code" with a page count. Click through to `/docs/claude-code/what-is-claude-code` and verify the sidebar, content viewer, and read tracking all work.

- [ ] **Step 4: Commit (no code changes — just verify)**

No commit needed — content is in Supabase, not in git.

---

### Task 6: Generate remaining 5 topic areas

Generate content for all remaining topics.

**Files:**
- No code changes — running the existing script

- [ ] **Step 1: Generate AI Models docs**

Run: `cd backend && python3 generate_docs.py ai-models`

- [ ] **Step 2: Generate Prompt Engineering docs**

Run: `cd backend && python3 generate_docs.py prompt-engineering`

- [ ] **Step 3: Generate AI Coding Tools docs**

Run: `cd backend && python3 generate_docs.py ai-coding-tools`

- [ ] **Step 4: Generate Plugins docs**

Run: `cd backend && python3 generate_docs.py plugins`

- [ ] **Step 5: Generate MCPs docs**

Run: `cd backend && python3 generate_docs.py mcp`

- [ ] **Step 6: Generate CLI & Automation docs**

Run: `cd backend && python3 generate_docs.py ai-cli`

- [ ] **Step 7: Verify total page count**

```bash
cd backend && python3 -c "
from app.core.supabase import supabase
result = supabase.table('doc_topics').select('lang').execute()
from collections import Counter
counts = Counter(r['lang'] for r in result.data)
for lang, count in sorted(counts.items()):
    print(f'  {lang}: {count} pages')
print(f'\nTotal: {len(result.data)} pages')
"
```

Expected: ~96 new pages + existing ~200 = ~296 total.

- [ ] **Step 8: Visual smoke test**

Navigate to `/docs` landing page and verify:
- All 6 new categories visible with correct page counts
- Click into each topic area — sidebar loads, content renders, navigation works
- Search finds new content (try "Claude Code", "MCP", "prompt engineering")

---

### Task 7: Final build verification and commit

**Files:**
- Verify all modified files

- [ ] **Step 1: Run production build**

Run: `cd frontend && npx next build 2>&1 | tail -10`
Expected: "Compiled successfully"

- [ ] **Step 2: Final commit with spec**

```bash
git add docs/superpowers/specs/2026-04-10-docs-ai-ecosystem-expansion.md \
  docs/superpowers/plans/2026-04-10-docs-ai-ecosystem-expansion.md
git commit -m "docs: add spec and plan for AI ecosystem docs expansion"
```
