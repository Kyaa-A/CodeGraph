# CodeGraph - Development Conventions

**Version:** 1.0
**Date:** 2026-04-02

---

## 1. Ticket System

### Ticket Types

| Prefix | Type | Description |
|--------|------|-------------|
| EP-XXX | Epic | High-level feature group |
| US-XXX | User Story | Deliverable unit of work from the PRD |
| DF-XXX | Defect | A flaw in an implemented user story (doesn't meet acceptance criteria) |
| BG-XXX | Bug | A runtime error, crash, or unexpected behavior |

### Ticket Hierarchy

```
EP-001 (Epic: Foundation)
  |-- US-001 (User Story: Set up monorepo)
  |     |-- DF-001 (Defect: Missing .gitignore for Python venv)
  |     |-- BG-001 (Bug: FastAPI crashes on startup with missing env var)
  |-- US-002 (User Story: FastAPI boilerplate)
  |-- US-003 (User Story: Database schema)
```

### Defect vs Bug

- **Defect (DF):** The feature was built but doesn't meet acceptance criteria. Found during development/review.
  - Example: "Search endpoint returns chunks but missing lesson_title in response" -> DF linked to US-005
- **Bug (BG):** Something that worked before is now broken, or an unexpected runtime error.
  - Example: "Chat endpoint returns 500 when lesson has no chunks" -> BG linked to US-007

### Creating Tickets

Defects and bugs reference their parent user story:

```
DF-001 [US-001]: Missing .gitignore for Python venv
BG-001 [US-007]: Chat 500 error when lesson has no chunks
```

## 2. Git Branch Naming

```
feature/US-XXX-short-description
defect/DF-XXX-short-description
bugfix/BG-XXX-short-description
```

Examples:
```
feature/US-001-monorepo-setup
feature/US-007-rag-chain
defect/DF-001-missing-gitignore
bugfix/BG-001-chat-500-no-chunks
```

## 3. Commit Message Format

```
[Ticket: <ID>] [<Layer>] <Description>
```

### Layers

| Tag | When to use |
|-----|-------------|
| `[Frontend]` | Next.js, UI components, styling |
| `[Backend]` | FastAPI, API endpoints, services |
| `[AI]` | LangChain, LangGraph, embeddings, RAG |
| `[DB]` | Schema changes, migrations, seeds |
| `[Docs]` | Documentation changes |
| `[Config]` | Environment, CI/CD, project config |

### Examples

```
[Ticket: US-001] [Config] Initialize monorepo with frontend and backend directories
[Ticket: US-002] [Backend] Add FastAPI boilerplate with Supabase connection
[Ticket: US-004] [AI] Add lesson chunking and embedding pipeline
[Ticket: US-007] [AI] Implement basic RAG chain for AI tutor chat
[Ticket: US-012] [Frontend] Initialize Next.js with shadcn/ui and Tailwind
[Ticket: US-014] [Frontend] Add course browsing and lesson viewer pages
[Ticket: DF-001] [Config] Add Python venv to .gitignore
[Ticket: BG-001] [Backend] Handle missing chunks in chat endpoint
```

### Rules

- Always start with `[Ticket: <ID>]`
- Always include layer tag `[Frontend]`, `[Backend]`, etc.
- Use imperative mood ("Add", "Fix", "Update", not "Added", "Fixed")
- Capitalize first letter of description
- No emojis in commit messages
- For commits without a ticket (rare): `[Frontend] Refactor code structure for readability`

## 4. Branch Workflow

```
main (production-ready)
  |-- feature/US-XXX-description (one branch per user story)
        |-- commits for the user story
        |-- commits for defects found during development
```

### Flow

1. Create branch from `main`: `feature/US-XXX-description`
2. Work on the user story, commit with ticket prefix
3. If defect found, commit with `[Ticket: DF-XXX]` on same branch
4. If bug found, create separate branch: `bugfix/BG-XXX-description`
5. Open PR when done
6. **Squash merge** into `main` — one clean commit per PR

## 5. PR / Merge Rules

### Squash Merge (Required)

All PRs are **squash merged** into `main`. This means:
- Multiple commits during development get squashed into **one clean commit**
- The squash commit message follows the format:

```
[Ticket: US-XXX] [Layer] Short description of the feature
```

- If the PR spans multiple layers, use the primary layer
- The PR description should list what was done

### Example

During development on `feature/US-007-rag-chain`, you might have:
```
[Ticket: US-007] [AI] Add retrieval logic for lesson chunks
[Ticket: US-007] [AI] Wire up LLM generation with context
[Ticket: US-007] [Backend] Add /api/chat endpoint
[Ticket: DF-002] [AI] Fix chunk ordering in retrieval
```

After squash merge into `main`, it becomes one commit:
```
[Ticket: US-007] [AI] Implement basic RAG chain for AI tutor chat (#3)
```

### PR Checklist

Before merging to main:
- [ ] All acceptance criteria from PRD met
- [ ] Code tested (manually or via tests)
- [ ] No hardcoded secrets or env vars
- [ ] Squash merge commit message follows convention
- [ ] Branch deleted after merge

## 6. File Naming

| Layer | Convention | Example |
|-------|-----------|---------|
| Python | snake_case | `lesson_service.py` |
| TypeScript/React | kebab-case for files | `ai-chat-panel.tsx` |
| React components | PascalCase exports | `export function AIChatPanel()` |
| API routes | kebab-case | `/api/chat/stream` |
| Database | snake_case | `lesson_chunks` |

## 7. Definition of Done

A user story is **done** when:
1. All acceptance criteria checked off
2. Code committed with proper ticket prefix
3. Tested on localhost
4. No open defects blocking functionality
5. Branch merged to main
