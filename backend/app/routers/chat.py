from fastapi import APIRouter, HTTPException

from app.models.chat import ChatRequest, ChatResponse
from app.services.chat import rag_chat

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        result = rag_chat(request.lesson_id, request.message)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
