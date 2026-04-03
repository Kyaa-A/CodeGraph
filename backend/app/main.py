from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.supabase import supabase
from app.routers import ingest, search, chat, quiz

app = FastAPI(title="CodeGraph API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest.router)
app.include_router(search.router)
app.include_router(chat.router)
app.include_router(quiz.router)


@app.get("/health")
def health_check():
    return {"status": "healthy", "supabase_connected": supabase is not None}
