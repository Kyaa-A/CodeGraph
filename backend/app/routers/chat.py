from fastapi import APIRouter, HTTPException

from app.core.supabase import supabase
from app.models.chat import ChatRequest, ChatResponse, SessionResponse
from app.services.chat import rag_chat

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat/session", response_model=SessionResponse)
def create_session(lesson_id: str):
    """Create a new chat session for a lesson."""
    result = (
        supabase.table("chat_sessions")
        .insert({"lesson_id": lesson_id})
        .execute()
    )
    return {"session_id": result.data[0]["id"]}


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        result = rag_chat(request.session_id, request.lesson_id, request.message)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
