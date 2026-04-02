# CodeGraph

AI-powered course platform for developers. Built with LangChain, LangGraph, FastAPI, Next.js, and Supabase.

## Features

- **AI Tutor Chat** - Ask questions about lessons, get context-aware answers (RAG + LangGraph)
- **Smart Search** - Semantic search across all course content using embeddings
- **AI Quiz Generator** - Auto-generated quizzes with quality control (LangGraph agent)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js + Tailwind CSS + shadcn/ui + Framer Motion |
| AI Backend | Python + FastAPI + LangChain + LangGraph |
| LLM | Azure AI Foundry (swappable) |
| Database | Supabase (Postgres + pgvector + Auth) |

## Project Structure

```
CodeGraph/
  frontend/     # Next.js app
  backend/      # FastAPI + AI services
  docs/         # PRD, TDD, conventions
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Supabase account
- Azure AI Foundry access

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate    # Linux/Mac
# .venv\Scripts\activate     # Windows
pip install -r requirements.txt
cp .env.example .env         # Fill in your keys
uvicorn app.main:app --reload
```

API docs available at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # Fill in your keys
npm run dev
```

App available at `http://localhost:3000`

## Documentation

- [PRD](docs/PRD.md) - Product requirements and user stories
- [TDD](docs/TDD.md) - Technical design and architecture
- [Conventions](docs/CONVENTIONS.md) - Git, commit, and coding conventions
