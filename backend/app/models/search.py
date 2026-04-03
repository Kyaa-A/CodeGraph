from pydantic import BaseModel


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


class SearchResult(BaseModel):
    lesson_id: str
    lesson_title: str
    chunk_text: str
    similarity_score: float


class SearchResponse(BaseModel):
    results: list[SearchResult]
