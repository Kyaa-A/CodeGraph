# CodeGraph - Product Requirements Document

**Version:** 1.0
**Date:** 2026-04-02
**Author:** Asnari Pacalna

---

## 1. Product Overview

CodeGraph is an AI-enhanced course platform for developers. It teaches LangChain, LangGraph, embeddings, and Python by building a real, production-grade product. The platform features an AI tutor chat, semantic search, and AI-powered quiz generation.

## 2. Problem Statement

Developers learning AI/ML concepts (embeddings, RAG, LangGraph) lack a hands-on, project-based platform that combines learning with real AI-powered features. Existing course platforms are passive — CodeGraph is interactive and AI-driven.

## 3. Target Users

- Developers learning Python AI/ML tooling (LangChain, LangGraph)
- Students who want hands-on experience with embeddings and RAG
- Solo developer (admin) managing course content

## 4. Epics & User Stories

### Epic 1: Foundation (EP-001)

| Ticket | Type | Title |
|--------|------|-------|
| US-001 | User Story | Set up monorepo structure (frontend + backend) |
| US-002 | User Story | FastAPI boilerplate with Supabase connection |
| US-003 | User Story | Database schema setup with seed data |

### Epic 2: Embeddings & Search (EP-002)

| Ticket | Type | Title |
|--------|------|-------|
| US-004 | User Story | Lesson ingestion pipeline (chunk + embed + store) |
| US-005 | User Story | Smart search endpoint (semantic search via pgvector) |
| US-006 | User Story | Test search via FastAPI Swagger docs |

### Epic 3: AI Tutor Chat (EP-003)

| Ticket | Type | Title |
|--------|------|-------|
| US-007 | User Story | Basic RAG chain (retrieve chunks + generate answer) |
| US-008 | User Story | LangGraph conversation flow (stateful multi-turn chat) |
| US-009 | User Story | Streaming responses endpoint (SSE) |

### Epic 4: Quiz Generator (EP-004)

| Ticket | Type | Title |
|--------|------|-------|
| US-010 | User Story | Multi-step quiz generation agent with self-review |
| US-011 | User Story | Quiz validation and quality control loop |

### Epic 5: Frontend (EP-005)

| Ticket | Type | Title |
|--------|------|-------|
| US-012 | User Story | Next.js + shadcn/ui project setup |
| US-013 | User Story | Auth flow (Supabase login/signup) |
| US-014 | User Story | Course browsing and lesson viewer pages |
| US-015 | User Story | AI Tutor chat panel (slide-out sidebar with streaming) |
| US-016 | User Story | Smart search (Cmd+K command palette) |
| US-017 | User Story | Quiz mode UI (modal with transitions) |
| US-018 | User Story | Student dashboard (enrolled courses, progress) |
| US-019 | User Story | Admin panel (manage courses, lessons, analytics) |

## 5. User Story Details

### US-001: Set up monorepo structure
**As a** developer,
**I want** a clean monorepo with frontend and backend directories,
**So that** I can develop both layers in a single repo with clear separation.

**Acceptance Criteria:**
- [ ] `/frontend` directory created (Next.js setup is US-012)
- [ ] `/backend` directory created (FastAPI setup is US-002)
- [ ] `/docs` for project documentation
- [ ] README.md with setup instructions
- [ ] `.gitignore` for both Python and Node

### US-002: FastAPI boilerplate with Supabase connection
**As a** developer,
**I want** a working FastAPI server connected to Supabase,
**So that** I can build AI endpoints with database access.

**Acceptance Criteria:**
- [ ] FastAPI app running on localhost:8000
- [ ] Supabase client initialized with env vars
- [ ] Health check endpoint (`/health`)
- [ ] CORS configured for frontend origin
- [ ] Environment config via `.env`

### US-003: Database schema setup with seed data
**As a** developer,
**I want** all database tables created with sample data,
**So that** I have content to test AI features against.

**Acceptance Criteria:**
- [ ] All tables from schema created in Supabase
- [ ] pgvector extension enabled
- [ ] Seed script with sample course + lessons (markdown content)
- [ ] At least 1 course with 5 lessons seeded

### US-004: Lesson ingestion pipeline
**As a** developer,
**I want** lesson content chunked, embedded, and stored in pgvector,
**So that** AI features can retrieve relevant content via similarity search.

**Acceptance Criteria:**
- [ ] Text chunking logic (configurable chunk size/overlap)
- [ ] Azure embedding model integration via LangChain
- [ ] Chunks + embeddings stored in `lesson_chunks` table
- [ ] Ingestion endpoint or CLI command to process lessons

### US-005: Smart search endpoint
**As a** student,
**I want** to search lessons using natural language,
**So that** I can quickly find relevant content.

**Acceptance Criteria:**
- [ ] POST `/api/search` accepts a query string
- [ ] Returns top-K similar lesson chunks with lesson metadata
- [ ] Cosine similarity via pgvector
- [ ] Results include lesson title, chunk preview, similarity score

### US-006: Test search via Swagger
**As a** developer,
**I want** to test the search endpoint via Swagger UI,
**So that** I can validate it works before building frontend.

**Acceptance Criteria:**
- [ ] Search endpoint testable at localhost:8000/docs
- [ ] Returns meaningful results for sample queries
- [ ] Response time under 2 seconds

### US-007: Basic RAG chain
**As a** student,
**I want** to ask questions about a lesson and get AI answers,
**So that** I can learn more effectively.

**Acceptance Criteria:**
- [ ] POST `/api/chat` accepts question + lesson_id
- [ ] Retrieves relevant chunks from pgvector
- [ ] Generates answer using LLM with retrieved context
- [ ] Returns coherent, lesson-specific answer

### US-008: LangGraph conversation flow
**As a** student,
**I want** multi-turn conversations with the AI tutor,
**So that** I can ask follow-up questions naturally.

**Acceptance Criteria:**
- [ ] LangGraph manages conversation state
- [ ] Chat history maintained per session
- [ ] Context from previous messages included in retrieval
- [ ] Graph nodes: retrieve -> generate -> respond

### US-009: Streaming responses
**As a** student,
**I want** AI responses to stream in real-time,
**So that** the chat feels responsive.

**Acceptance Criteria:**
- [ ] SSE streaming endpoint for chat responses
- [ ] Tokens stream as they're generated
- [ ] Frontend-compatible event stream format

### US-010: Quiz generation agent
**As a** student,
**I want** AI-generated quizzes based on lesson content,
**So that** I can test my understanding.

**Acceptance Criteria:**
- [ ] POST `/api/quiz/generate/{lesson_id}` generates quiz for a lesson
- [ ] LangGraph multi-step: generate -> review -> regenerate if needed
- [ ] Returns 5-10 multiple choice questions
- [ ] Questions are relevant to lesson content

### US-011: Quiz validation loop
**As a** developer,
**I want** the quiz agent to self-review question quality,
**So that** generated quizzes are high quality.

**Acceptance Criteria:**
- [ ] Quality scoring node in LangGraph
- [ ] Conditional edge: score < threshold triggers regeneration
- [ ] Max retry limit to prevent infinite loops
- [ ] Final output includes only passing questions

### US-012: Next.js project setup
**As a** developer,
**I want** the frontend initialized with the design system,
**So that** I can build UI pages efficiently.

**Acceptance Criteria:**
- [ ] Next.js 14+ with App Router
- [ ] Tailwind CSS configured
- [ ] shadcn/ui installed with base components
- [ ] Framer Motion installed
- [ ] API client utility for backend calls

### US-013: Auth flow
**As a** student,
**I want** to sign up and log in,
**So that** my progress is saved.

**Acceptance Criteria:**
- [ ] `/auth/login` and `/auth/signup` pages
- [ ] Supabase Auth integration
- [ ] Protected routes (dashboard, lessons)
- [ ] Session persistence

### US-014: Course and lesson pages
**As a** student,
**I want** to browse courses and read lessons,
**So that** I can learn the material.

**Acceptance Criteria:**
- [ ] `/courses` page with course cards
- [ ] `/courses/[id]` with lesson list and enroll button
- [ ] `/courses/[id]/[lessonId]` with rendered markdown content
- [ ] Progress tracking (mark lesson complete)

### US-015: AI Tutor chat panel
**As a** student,
**I want** a chat panel on the lesson page,
**So that** I can ask the AI tutor questions while learning.

**Acceptance Criteria:**
- [ ] Slide-out right sidebar (Framer Motion animation)
- [ ] Real-time streaming messages
- [ ] Chat history per lesson session
- [ ] Clean message UI (user vs assistant bubbles)

### US-016: Smart search UI
**As a** student,
**I want** a Cmd+K search palette,
**So that** I can quickly find lessons.

**Acceptance Criteria:**
- [ ] Command palette overlay (Cmd+K / Ctrl+K)
- [ ] Natural language input
- [ ] Instant results with lesson previews
- [ ] Click result navigates to lesson

### US-017: Quiz mode UI
**As a** student,
**I want** to take quizzes in a modal overlay,
**So that** I can test myself without leaving the lesson.

**Acceptance Criteria:**
- [ ] Modal overlay on lesson page
- [ ] One question at a time with transitions
- [ ] Score displayed at end
- [ ] Quiz attempt saved to database

### US-018: Student dashboard
**As a** student,
**I want** a dashboard showing my progress,
**So that** I can track what I've completed.

**Acceptance Criteria:**
- [ ] `/dashboard` page
- [ ] Enrolled courses with progress bars
- [ ] Recent activity / completed lessons
- [ ] Quick links to continue learning

### US-019: Admin panel
**As an** admin,
**I want** to manage courses and lessons,
**So that** I can add and update content.

**Acceptance Criteria:**
- [ ] `/admin` with course management
- [ ] Markdown editor for lessons
- [ ] Analytics (signups, engagement stats)
- [ ] Protected by admin role

## 6. Out of Scope (v1)

- Payment processing
- Multi-language support
- Mobile app
- Social features (comments, forums)
- Certificate generation
