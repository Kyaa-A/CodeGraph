from pydantic import BaseModel


class QuizChoice(BaseModel):
    label: str  # "A", "B", "C", "D"
    text: str


class QuizQuestion(BaseModel):
    question: str
    choices: list[QuizChoice]
    correct_answer: str  # the label, e.g. "B"
    explanation: str


class QuizResponse(BaseModel):
    lesson_id: str
    questions: list[QuizQuestion]
    total_questions: int
