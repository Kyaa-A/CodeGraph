# CodeGraph — AI-Powered Course Platform for Developers

## Overview

CodeGraph is an AI-enhanced course platform for developers. The primary goal is to learn LangChain, LangGraph, embeddings, and Python by building a real, visually appealing product. The platform features an AI tutor chat, semantic search, and AI-powered quiz generation — all backed by a Python FastAPI backend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js + Tailwind CSS + shadcn/ui + Framer Motion |
| AI Backend | Python + FastAPI + LangChain + LangGraph |
| LLM Provider | Azure AI Foundry (swappable via LangChain) |
| Embeddings | Azure embedding model (swappable to VoyageAI) |
| Database | Supabase (Postgres + pgvector + Auth + Storage) |
| Vector Store | pgvector (on same Supabase Postgres instance) |

## Architecture

```
Next.js frontend (localhost:3000)
    |-- Supabase (auth, DB, storage, course data)
    |-- FastAPI (localhost:8000) (AI chat, smart search, quiz generation)
            |-- LangChain (RAG chains, LLM abstraction)
            |-- LangGraph (conversation flow, agentic quiz gen)
            |-- pgvector (vector similarity search)
```

Hybrid architecture: Supabase handles auth, user data, course content, and storage. FastAPI handles all AI-specific logic and talks to Supabase's pgvector for embeddings retrieval.

## AI Features

### 1. AI Tutor Chat (RAG + LangGraph)

- Student asks a question about a lesson
- System retrieves relevant lesson chunks from pgvector using embedding similarity
- LangGraph manages conversation as a stateful graph: retrieve -> generate -> respond
- Maintains chat history per session
- Streaming responses for real-time feel

**Learning concepts:** Embeddings, vector search, RAG pipeline, LangGraph state management, streaming

### 2. Smart Search (Embeddings + Semantic Search)

- All lesson content is chunked and embedded using Azure's embedding model
- Student types a natural language query
- pgvector finds the most similar lesson chunks via cosine similarity
- Returns ranked lesson results with previews
- Accessible via Cmd+K command palette

**Learning concepts:** Text chunking, embedding models, cosine similarity, pgvector queries

### 3. AI Quiz Generator (LangGraph Agent)

- Takes a lesson as input
- LangGraph multi-step workflow:
  1. Generate questions from lesson content
  2. Self-review for quality (relevance, clarity, difficulty)
  3. Regenerate bad questions
  4. Return final quiz
- Conditional branching in the graph based on quality scores

**Learning concepts:** LangGraph nodes, edges, conditional routing, agentic workflows, prompt engineering

### Shared AI Layer

- **Lesson ingestion pipeline:** Takes lesson content (markdown), chunks it, embeds it, stores in pgvector
- **LLM provider config:** Swappable between Azure, OpenAI, Anthropic via LangChain abstraction

## Database Schema

### users
- id (uuid, PK)
- email (text, unique)
- password_hash (text)
- name (text)
- avatar_url (text, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)

### courses
- id (uuid, PK)
- title (text)
- description (text)
- thumbnail_url (text, nullable)
- price (numeric)
- is_free (boolean)
- created_at (timestamptz)

### lessons
- id (uuid, PK)
- course_id (uuid, FK -> courses)
- title (text)
- content (text, markdown)
- order_index (integer)
- created_at (timestamptz)

### lesson_chunks
- id (uuid, PK)
- lesson_id (uuid, FK -> lessons)
- chunk_text (text)
- chunk_index (integer)
- embedding (vector, pgvector column)

### user_progress
- id (uuid, PK)
- user_id (uuid, FK -> users)
- lesson_id (uuid, FK -> lessons)
- completed (boolean)
- completed_at (timestamptz)

### chat_sessions
- id (uuid, PK)
- user_id (uuid, FK -> users)
- lesson_id (uuid, FK -> lessons)
- created_at (timestamptz)

### chat_messages
- id (uuid, PK)
- session_id (uuid, FK -> chat_sessions)
- role (text, 'user' or 'assistant')
- content (text)
- created_at (timestamptz)

### quiz_attempts
- id (uuid, PK)
- user_id (uuid, FK -> users)
- lesson_id (uuid, FK -> lessons)
- score (integer)
- total_questions (integer)
- questions_json (jsonb)
- created_at (timestamptz)

## Frontend Pages

```
/                           -> Landing page (hero, features, course preview)
/courses                    -> Browse all courses
/courses/[id]               -> Course detail (lessons list, enroll button)
/courses/[id]/[lessonId]    -> Lesson viewer (main learning page)
    |-- Lesson content (rendered markdown)
    |-- AI Tutor chat panel (slide-out right sidebar)
    |-- Smart search (Cmd+K command palette)
    |-- Quiz button (generates quiz for current lesson)

/dashboard                  -> Student dashboard (enrolled courses, progress)
/search                     -> Full search results page

/auth/login                 -> Login
/auth/signup                -> Signup

/admin                      -> Admin panel
/admin/courses              -> Manage courses
/admin/lessons              -> Manage lessons (markdown editor)
/admin/analytics            -> Signups, engagement stats
```

### Key UI Interactions

- **AI Tutor:** Slide-out chat panel on the right side of lesson page. Framer Motion animation. Messages stream in real-time.
- **Smart Search:** Command palette (Cmd+K) overlay. Natural language query, instant results with lesson previews.
- **Quiz Mode:** Modal overlay on lesson page. Questions shown one at a time with smooth transitions. Score displayed at the end.

## Project Structure

```
/home/asnari/Project/CodeGraph/
|-- frontend/               # Next.js + Tailwind + shadcn/ui
|   |-- src/
|   |   |-- app/            # Next.js app router pages
|   |   |-- components/     # Reusable UI components
|   |   |-- lib/            # Utilities, API clients
|   |   |-- styles/         # Global styles
|   |-- public/
|   |-- package.json
|
|-- backend/                # FastAPI + LangChain + LangGraph
|   |-- app/
|   |   |-- main.py         # FastAPI app entry
|   |   |-- routers/        # API route handlers
|   |   |-- services/       # AI services (chat, search, quiz)
|   |   |-- models/         # Pydantic models
|   |   |-- core/           # Config, LLM setup, DB connection
|   |   |-- ingestion/      # Lesson chunking + embedding pipeline
|   |-- requirements.txt
|
|-- docs/                   # Design specs, notes
|-- README.md
```

## Build Order (Phases)

### Phase 1 — Foundation
1. Set up monorepo structure
2. FastAPI boilerplate + Supabase connection
3. Database schema setup + seed sample lesson content

### Phase 2 — Embeddings & Search
4. Lesson ingestion pipeline (chunk + embed + store)
5. Smart search endpoint (semantic search via pgvector)
6. Test via FastAPI Swagger docs (localhost:8000/docs)

**You'll learn:** Embeddings, text chunking, vector storage, cosine similarity

### Phase 3 — AI Tutor Chat
7. Basic RAG chain (retrieve relevant chunks + generate answer)
8. LangGraph conversation flow (stateful multi-turn chat)
9. Streaming responses endpoint

**You'll learn:** LangChain chains, RAG pipeline, LangGraph state management, SSE streaming

### Phase 4 — Quiz Generator
10. Multi-step quiz generation agent with self-review
11. Quiz validation and quality control loop

**You'll learn:** LangGraph nodes/edges, conditional routing, agentic workflows

### Phase 5 — Frontend
12. Next.js + shadcn/ui setup
13. Auth flow (Supabase)
14. Course/lesson pages with markdown rendering
15. AI Tutor chat panel (slide-out sidebar)
16. Smart search (Cmd+K command palette)
17. Quiz mode UI (modal with transitions)
18. Dashboard + admin panel

## Approach

AI-first build order. Backend AI features are built and tested first (via FastAPI Swagger docs at localhost:8000/docs), then wrapped in a polished Next.js frontend. This ensures the AI foundations are solid before building UI around them, and maximizes learning of the target technologies.

## Learning Flow

For each feature:
1. Build the AI feature in Python
2. Test it live on localhost:8000/docs
3. Understand what each piece does (chains, embeddings, graph nodes)
4. Move to the next feature
5. Wrap everything in the Next.js UI at the end
