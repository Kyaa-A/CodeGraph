from pydantic import BaseModel


class ChatRequest(BaseModel):
    session_id: str
    lesson_id: str
    message: str


class ChatSource(BaseModel):
    lesson_id: str
    lesson_title: str


class ChatResponse(BaseModel):
    response: str
    sources: list[ChatSource]


class SessionResponse(BaseModel):
    session_id: str
