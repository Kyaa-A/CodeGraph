from pydantic import BaseModel


class ChatRequest(BaseModel):
    lesson_id: str
    message: str


class ChatSource(BaseModel):
    lesson_id: str
    lesson_title: str


class ChatResponse(BaseModel):
    response: str
    sources: list[ChatSource]
