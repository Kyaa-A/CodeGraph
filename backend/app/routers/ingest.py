from fastapi import APIRouter, HTTPException

from app.ingestion.service import ingest_lesson

router = APIRouter(prefix="/api", tags=["ingestion"])


@router.post("/ingest/{lesson_id}")
def ingest(lesson_id: str):
    try:
        result = ingest_lesson(lesson_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
