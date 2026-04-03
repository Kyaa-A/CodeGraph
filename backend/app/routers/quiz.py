from fastapi import APIRouter, HTTPException

from app.models.quiz import QuizResponse
from app.services.quiz import generate_quiz

router = APIRouter(prefix="/api", tags=["quiz"])


@router.post("/quiz/generate/{lesson_id}", response_model=QuizResponse)
def quiz_generate(lesson_id: str, num_questions: int = 5):
    """Generate a multiple-choice quiz for a lesson."""
    try:
        result = generate_quiz(lesson_id, num_questions)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
