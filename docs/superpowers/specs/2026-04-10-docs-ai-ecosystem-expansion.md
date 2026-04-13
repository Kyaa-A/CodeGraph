# Docs Expansion — AI Developer Ecosystem

## Overview

Expand CodeGraph's documentation system from programming language tutorials into a comprehensive AI developer knowledge base. Six new topic areas covering models, prompting, tools, plugins, MCPs, and CLIs — all served through the existing `doc_topics` infrastructure with a restructured landing page. A seventh area (AI Frameworks) is deferred to avoid overlap with existing LangChain content.

**Audience:** Beginner-to-practitioner progression. Introductory content ("What is an MCP?") through curated power-user guides ("Best MCPs for database workflows").

**Content strategy:** LLM-generated bulk content, manually curated tool recommendations and comparison lists over time.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Content system | Reuse existing `doc_topics` table + viewer | One system to maintain, shared XP/read-tracking, familiar UX |
| Landing page | Restructure into 3 category sections | Makes expanded scope visible without a separate hub |
| Content generation | Extend `generate_docs.py` | Same proven pipeline, skip-existing logic already works |
| Topic slugs | Use `lang` field with descriptive keys | e.g., `lang: "claude-code"`, `lang: "mcp"` — no schema changes needed |

## Landing Page Restructure

The current `/docs` landing page shows a flat grid of language cards in 3 hardcoded categories (Web Development, Programming Languages, Data & AI). The new structure adds tool/concept categories alongside the existing ones.

### New Category Layout

```
/docs landing page
├── Learn to Code (existing)
│   ├── Web Development: HTML & CSS, JavaScript, TypeScript, React, Node.js, PHP
│   ├── Programming Languages: Python, Java, Go, Rust, C, C++, C#, Kotlin, Ruby, Swift
│   └── Data & AI: SQL, LangChain
│
├── AI Models & Prompting (new)
│   ├── AI Models — Understanding and using LLMs
│   └── Prompt Engineering — Writing effective prompts
│
├── AI Coding Tools (new)
│   ├── Claude Code — The AI coding CLI
│   ├── AI Coding Tools — Cursor, Copilot, Windsurf, and more
│   └── Plugins & Extensions — Superpowers, open-source plugins, building your own
│
└── Infrastructure & Frameworks (new)
    ├── MCPs — Model Context Protocol servers
    ├── CLI & Automation — Terminal-based AI workflows
    └── AI Frameworks — LangChain, LangGraph, CrewAI, AutoGen
```

Each new topic gets a card on the landing page with an icon (SVG, not language logos), page count, and click-through to the first page. Topics without content show "Coming soon" like existing languages.

### Landing Page Visual Changes

- Section headers become more prominent with descriptions
- New sections get a subtle visual distinction (e.g., a colored left border or badge) to signal "new content area"
- Card design stays the same — icon, name, page count, link
- Search (`DocSearch`) already searches across all `doc_topics`, so new content is automatically searchable

## Content Structure — 6 Topic Areas (+1 Deferred)

### 1. AI Models (`lang: "ai-models"`, ~20 pages)

| Section | Topics |
|---------|--------|
| Getting Started | What Are LLMs, How LLMs Work, Tokens and Context Windows, Temperature and Parameters |
| Model Comparison | Claude (Opus/Sonnet/Haiku), GPT (4o/o1/o3), Gemini (Pro/Flash), Llama and Open Source Models, How to Choose a Model |
| Using Model APIs | API Keys and Authentication, Your First API Call, Streaming Responses, Tool Use and Function Calling, Structured Output |
| Advanced | Fine-Tuning Basics, Embeddings and Vector Search, Multi-Modal Models, Cost Optimization, Rate Limits and Best Practices |

### 2. Prompt Engineering (`lang: "prompt-engineering"`, ~16 pages)

| Section | Topics |
|---------|--------|
| Fundamentals | What Is Prompt Engineering, Anatomy of a Good Prompt, System vs User Prompts, Zero-Shot vs Few-Shot |
| Techniques | Chain of Thought, Role Prompting, Output Formatting (JSON/XML), Prompt Chaining, Guardrails |
| Patterns | Code Generation Prompts, Data Analysis Prompts, Writing and Summarization, Debugging with AI, Agent Prompts |
| Advanced | Prompt Caching, Evaluating Quality, A/B Testing, Prompt Injection Defense, Production Management |

### 3. Claude Code (`lang: "claude-code"`, ~20 pages)

| Section | Topics |
|---------|--------|
| Getting Started | What Is Claude Code, Installation and Setup, Your First Session, The CLI Interface |
| Core Features | Reading and Editing Files, Running Commands, Multi-File Changes, Git Integration, Slash Commands |
| Workflows | Debugging, Building Features, Code Review, Test-Driven Development, Pair Programming |
| Customization | CLAUDE.md Configuration, Hooks, Permissions and Safety, Memory and Context, Custom Instructions |
| Ecosystem | Plugins and Extensions, Superpowers Plugin, MCP Servers in Claude Code, IDE Integrations |

### 4. AI Coding Tools (`lang: "ai-coding-tools"`, ~14 pages)

| Section | Topics |
|---------|--------|
| Overview | The AI Coding Landscape, How AI Code Assistants Work, Choosing the Right Tool |
| Tools | Cursor Deep Dive, GitHub Copilot Deep Dive, Windsurf Deep Dive, Cline and Open-Source Alternatives, Comparison Matrix |
| Workflows | AI-Powered IDE Setup, Effective Autocomplete, Chat-Driven Development, Multi-File Refactoring, AI-Assisted Debugging |
| Best Practices | When to Use vs Not Use AI, Reviewing AI Code, Security Considerations, Team Workflows |

### 5. Plugins & Extensions (`lang: "plugins"`, ~12 pages)

| Section | Topics |
|---------|--------|
| Getting Started | What Are AI Plugins, Plugin Architecture, Installing Plugins |
| Best Plugins | Superpowers Deep Dive, Top Open Source Plugins, Productivity Plugins, Code Quality Plugins, Documentation Plugins |
| Building Plugins | Plugin Development Basics, Skill System Architecture, Creating Your First Skill, Publishing and Sharing |

### 6. MCPs (`lang: "mcp"`, ~14 pages)

| Section | Topics |
|---------|--------|
| Getting Started | What Is Model Context Protocol, How MCPs Work, MCP Architecture |
| Best MCPs | Database MCPs, Git and GitHub MCPs, File System MCPs, API Integration MCPs, Search and Browser MCPs |
| Building MCPs | Your First MCP Server, TypeScript MCP SDK, Python MCP SDK, Tools vs Resources vs Prompts, Testing and Debugging |
| Advanced | MCP in Production, Security Best Practices, Chaining MCPs, Performance Optimization |

### 7. CLI & Automation (`lang: "ai-cli"`, ~14 pages)

| Section | Topics |
|---------|--------|
| Getting Started | AI in the Terminal, Setting Up Your AI Terminal, Shell Integration |
| Tools | Claude Code CLI, GitHub CLI with AI, Aider, OpenAI CLI, Other AI CLIs |
| Automation | Scripting with AI, CI/CD with AI, Automated Code Review, Automated Testing, Git Hooks with AI |
| Advanced | Building CLI Agents, Headless Workflows, Monitoring and Logging, Cost Management |

**Total: ~110 new doc pages across 7 topic areas.**

## Technical Implementation

### Database — No Schema Changes

The existing `doc_topics` table handles everything. New topics use the `lang` column with descriptive slugs:

```
lang: "ai-models"          → /docs/ai-models/what-are-llms
lang: "claude-code"         → /docs/claude-code/installation-and-setup
lang: "mcp"                 → /docs/mcp/what-is-mcp
lang: "prompt-engineering"  → /docs/prompt-engineering/chain-of-thought
lang: "ai-coding-tools"     → /docs/ai-coding-tools/cursor-deep-dive
lang: "plugins"             → /docs/plugins/superpowers-deep-dive
lang: "ai-cli"              → /docs/ai-cli/scripting-with-ai
```

The `section`, `title`, `slug`, `order_index`, and `content` columns work identically to language docs.

### Content Generation — Extend `generate_docs.py`

Add the 7 new topic structures to the existing `DOCS_STRUCTURE` dict in `backend/generate_docs.py`. The script already:
- Upserts on `(lang, slug)` conflict
- Skips existing content
- Supports targeting a single lang: `python generate_docs.py ai-models`

The LLM prompt template needs adjustment for tool/concept docs vs language tutorials:
- Language docs: "Write a W3Schools-style tutorial with code examples"
- Tool docs: "Write a practical guide with real commands, screenshots descriptions, and step-by-step setup instructions"
- Comparison docs: "Write an objective comparison with feature tables, pros/cons, and recommendations"

### Frontend — Landing Page Update

**File: `frontend/src/app/docs/page.tsx`**

Current hardcoded categories:
```typescript
const CATEGORIES = {
  "Web Development": ["html-css", "javascript", "typescript", "react", "nodejs", "php"],
  "Programming Languages": ["python", "java", ...],
  "Data & AI": ["sql", "langchain"],
};
```

New categories:
```typescript
const CATEGORIES = {
  // Learn to Code
  "Web Development": ["html-css", "javascript", "typescript", "react", "nodejs", "php"],
  "Programming Languages": ["python", "java", "go", "rust", "c", "cpp", "csharp", "kotlin", "ruby", "swift"],
  "Data & AI": ["sql", "langchain"],
  // AI Models & Prompting
  "AI Models & Prompting": ["ai-models", "prompt-engineering"],
  // AI Coding Tools
  "AI Coding Tools": ["claude-code", "ai-coding-tools", "plugins"],
  // Infrastructure & Frameworks
  "Infrastructure & Frameworks": ["mcp", "ai-cli"],
};
```

Note: "AI Frameworks" (`lang: "ai-frameworks"`) is intentionally excluded from the initial launch since LangChain already exists under "Data & AI." It can be added later as a separate topic once LangChain docs are fleshed out — avoids content overlap.

**Revised total: ~96 pages across 6 topic areas (deferring AI Frameworks).**

### Frontend — `LANG_NAMES` Update

**File: `frontend/src/app/docs/[lang]/[slug]/page.tsx`**

Add display names for new topic slugs:

```typescript
const LANG_NAMES: Record<string, string> = {
  // existing...
  "ai-models": "AI Models",
  "prompt-engineering": "Prompt Engineering",
  "claude-code": "Claude Code",
  "ai-coding-tools": "AI Coding Tools",
  "plugins": "Plugins & Extensions",
  "mcp": "MCPs",
  "ai-cli": "CLI & Automation",
};
```

### Frontend — Topic Icons

Language docs use `<LangLogo>` component for icons. New topics use Lucide icons (already a project dependency) with a fallback in the card renderer when `<LangLogo>` has no match:

| Topic | Lucide Icon |
|-------|-------------|
| AI Models | `Brain` |
| Prompt Engineering | `MessageSquareText` |
| Claude Code | `Terminal` |
| AI Coding Tools | `Code` |
| Plugins & Extensions | `Puzzle` |
| MCPs | `Server` |
| CLI & Automation | `TerminalSquare` |

### Content Generation Prompt Templates

Three prompt templates for different content types:

**Tutorial template** (existing, for conceptual topics):
> Write a beginner-friendly guide about {title}. Include clear explanations, practical examples, and a "Key Points" summary. 600-1000 words.

**Tool guide template** (new, for tools like Claude Code, Cursor):
> Write a practical guide for {title}. Include installation steps, real CLI commands or UI workflows, common use cases, and tips. Use code blocks for commands. 600-1000 words.

**Comparison template** (new, for "Best X" and comparison pages):
> Write an objective comparison of {title}. Include a feature comparison table, pros and cons for each option, and a recommendation based on use case. Link to official documentation where relevant. 600-1000 words.

## Content Quality Notes

- **Model comparison pages** will date quickly. Include a "Last updated" note and flag these for periodic refresh.
- **"Best plugins" and "Best MCPs" lists** should be manually curated after initial LLM generation. The LLM won't know the latest community favorites.
- **Claude Code docs** can reference official documentation for accuracy — the LLM prompt should instruct: "Reference the official Claude Code documentation for feature details."

## What's NOT Changing

- `doc_topics` table schema — no migration needed
- `doc_reads` table and XP tracking — works automatically for new topics
- `DocSidebar`, `DocViewer`, `DocSearch` components — no changes needed
- `/docs/[lang]/[slug]` routing — already handles any `lang` value
- Admin panel — still no docs management UI (out of scope)

## Implementation Order

1. **Landing page restructure** — Update categories, add icons, section headers
2. **`LANG_NAMES` + `generate_docs.py` structure** — Add topic structures and display names
3. **Prompt templates** — Add tool-guide and comparison templates to the generation script
4. **Generate content** — Run `generate_docs.py` for each new topic area
5. **Manual curation pass** — Review and edit comparison/recommendation pages

## Success Criteria

- All 6 new topic areas appear on the `/docs` landing page with correct categorization
- At least one topic area fully generated and browsable end-to-end
- Search works across new and existing content
- Read tracking and XP work for new topics
- Landing page clearly communicates the expanded scope without confusing existing users
