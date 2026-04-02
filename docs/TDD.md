# CodeGraph - Technical Design Document

**Version:** 1.0
**Date:** 2026-04-02
**Author:** Asnari Pacalna

---

## 1. System Architecture

```
Next.js frontend (localhost:3000)
    |-- Supabase (auth, DB, storage, course data)
    |-- FastAPI (localhost:8000) (AI chat, smart search, quiz generation)
            |-- LangChain (RAG chains, LLM abstraction)
            |-- LangGraph (conversation flow, agentic quiz gen)
            |-- pgvector (vector similarity search)
```

**Hybrid architecture:** Supabase handles auth, user data, course content, and storage. FastAPI handles all AI-specific logic and talks to Supabase's pgvector for embeddings retrieval.

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router) | 14+ |
| Styling | Tailwind CSS + shadcn/ui | Latest |
| Animation | Framer Motion | Latest |
| AI Backend | Python + FastAPI | 3.11+ / 0.100+ |
| AI Framework | LangChain + LangGraph | Latest |
| LLM Provider | Azure AI Foundry | Swappable via LangChain |
| Embeddings | Azure embedding model | Swappable to VoyageAI |
| Database | Supabase (Postgres + pgvector) | Latest |
| Auth | Supabase Auth | Latest |

## 3. Database Schema

### Tables

```sql
-- Profiles (extends Supabase auth.users — no password_hash needed)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  price NUMERIC DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Lessons
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Lesson chunks (for embeddings/vector search)
CREATE TABLE lesson_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding VECTOR(1536) -- dimension depends on embedding model; 1536 = OpenAI ada-002, adjust if using different Azure model
);

-- User progress
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

-- Chat sessions
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Quiz attempts
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  questions_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Indexes

```sql
CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_chunks_lesson ON lesson_chunks(lesson_id);
CREATE INDEX idx_chunks_embedding ON lesson_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_chat_session ON chat_messages(session_id);
```

## 4. API Design

### Backend (FastAPI) - AI Endpoints

| Method | Endpoint | Ticket | Description |
|--------|----------|--------|-------------|
| GET | `/health` | US-002 | Health check |
| POST | `/api/ingest/{lesson_id}` | US-004 | Chunk + embed a lesson |
| POST | `/api/search` | US-005 | Semantic search |
| POST | `/api/chat` | US-007 | AI tutor chat (single turn) |
| POST | `/api/chat/stream` | US-009 | AI tutor chat (streaming) |
| POST | `/api/quiz/generate/{lesson_id}` | US-010 | Generate quiz |

### Request/Response Examples

**POST /api/search**
```json
// Request
{ "query": "how do embeddings work", "top_k": 5 }

// Response
{
  "results": [
    {
      "lesson_id": "uuid",
      "lesson_title": "Introduction to Embeddings",
      "chunk_text": "Embeddings are dense vector representations...",
      "similarity_score": 0.92
    }
  ]
}
```

**POST /api/chat**
```json
// Request
{
  "session_id": "uuid",
  "lesson_id": "uuid",
  "message": "What is cosine similarity?"
}

// Response
{
  "response": "Cosine similarity measures the angle between...",
  "sources": ["chunk_id_1", "chunk_id_2"]
}
```

**POST /api/quiz/generate/{lesson_id}**
```json
// Response
{
  "questions": [
    {
      "question": "What does pgvector store?",
      "options": ["A: Text", "B: Vectors", "C: Images", "D: Audio"],
      "correct": "B",
      "explanation": "pgvector stores vector embeddings..."
    }
  ]
}
```

## 5. AI Pipeline Design

### Lesson Ingestion (US-004)

```
Lesson content (markdown)
    -> Clean/normalize text
    -> Chunk (RecursiveCharacterTextSplitter, size=500, overlap=50)
    -> Embed each chunk (Azure embedding model)
    -> Store in lesson_chunks table (pgvector)
```

### RAG Chat (US-007, US-008)

```
LangGraph State:
  - messages: list[Message]
  - context: list[str]
  - lesson_id: str

Nodes:
  1. retrieve: Query pgvector with user question -> top-K chunks
  2. generate: Pass chunks + chat history to LLM -> answer
  3. respond: Format and return response

Edges:
  retrieve -> generate -> respond
```

### Quiz Generator (US-010, US-011)

```
LangGraph State:
  - lesson_content: str
  - questions: list[Question]
  - quality_scores: list[float]
  - retry_count: int

Nodes:
  1. generate: Create questions from lesson content
  2. review: Score each question (relevance, clarity, difficulty)
  3. filter: Remove low-quality questions
  4. regenerate: Create replacements for filtered questions

Edges:
  generate -> review -> filter
  filter -> END (if all pass or retry_count >= 3)
  filter -> regenerate -> review (if questions filtered out)
```

## 6. Frontend Architecture

### Route Structure

```
app/
  layout.tsx              # Root layout (navbar, providers)
  page.tsx                # Landing page
  courses/
    page.tsx              # Course listing
    [id]/
      page.tsx            # Course detail
      [lessonId]/
        page.tsx          # Lesson viewer
  dashboard/
    page.tsx              # Student dashboard
  search/
    page.tsx              # Full search results
  auth/
    login/page.tsx
    signup/page.tsx
  admin/
    page.tsx              # Admin dashboard
    courses/page.tsx      # Manage courses
    lessons/page.tsx      # Manage lessons
    analytics/page.tsx    # Stats
```

### Key Components

| Component | Location | Description |
|-----------|----------|-------------|
| AIChatPanel | `components/ai-chat-panel.tsx` | Slide-out chat sidebar |
| SearchPalette | `components/search-palette.tsx` | Cmd+K search overlay |
| QuizModal | `components/quiz-modal.tsx` | Quiz overlay with transitions |
| LessonViewer | `components/lesson-viewer.tsx` | Markdown renderer |
| CourseCard | `components/course-card.tsx` | Course preview card |
| ProgressBar | `components/progress-bar.tsx` | Lesson completion indicator |

### State Management

- **Supabase client:** Auth state, user data, course data
- **React state:** UI state (chat open/closed, search open, quiz active)
- **Server components:** Course/lesson data fetching (RSC)
- **Client components:** Interactive elements (chat, search, quiz)

## 7. Environment Variables

### Backend (.env)
```
SUPABASE_URL=
SUPABASE_KEY=
AZURE_FOUNDRY_ENDPOINT=
AZURE_FOUNDRY_API_KEY=
AZURE_EMBEDDING_MODEL=
LLM_MODEL=
```

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 8. Security Considerations

- Supabase RLS (Row Level Security) on all user-facing tables
- API rate limiting on AI endpoints (prevent abuse)
- Input sanitization on search and chat inputs
- Admin routes protected by role check
- Environment variables never exposed to client (except NEXT_PUBLIC_*)
