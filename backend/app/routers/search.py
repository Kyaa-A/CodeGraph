from fastapi import APIRouter, HTTPException

from app.models.search import SearchRequest, SearchResponse
from app.services.search import semantic_search

router = APIRouter(prefix="/api", tags=["search"])


@router.post("/search", response_model=SearchResponse)
def search(request: SearchRequest):
    try:
        results = semantic_search(request.query, request.top_k)
        return SearchResponse(
            results=[
                {
                    "lesson_id": r["lesson_id"],
                    "lesson_title": r["lesson_title"],
                    "chunk_text": r["chunk_text"],
                    "similarity_score": round(r["similarity_score"], 4),
                }
                for r in results
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
