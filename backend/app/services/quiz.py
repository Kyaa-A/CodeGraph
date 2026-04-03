import json
from typing import TypedDict

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, START, END

from app.core.config import settings
from app.core.supabase import supabase

# Initialize the LLM (same pattern as chat.py)
llm = ChatOpenAI(
    base_url=settings.LLM_BASE_URL,
    api_key=settings.LLM_API_KEY,
    model=settings.LLM_MODEL,
)

# --- Prompts ---

GENERATE_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are a quiz generator for an AI/ML course platform.
Given lesson content, create {num_questions} multiple-choice questions that test
understanding of the key concepts.

Rules:
- Each question must have exactly 4 choices (A, B, C, D)
- Only one correct answer per question
- Include a brief explanation for the correct answer
- Questions should range from recall to application level
- Do NOT create trick questions

Return ONLY valid JSON in this exact format (no markdown fences):
{{
  "questions": [
    {{
      "question": "What is ...?",
      "choices": [
        {{"label": "A", "text": "..."}},
        {{"label": "B", "text": "..."}},
        {{"label": "C", "text": "..."}},
        {{"label": "D", "text": "..."}}
      ],
      "correct_answer": "B",
      "explanation": "B is correct because ..."
    }}
  ]
}}""",
        ),
        ("human", "Lesson content:\n\n{lesson_content}"),
    ]
)

REVIEW_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are a quiz quality reviewer. Score each question on a scale of 0.0 to 1.0.

Criteria:
- Relevance: Is the question about the lesson content? (0.0-0.3)
- Clarity: Is the question unambiguous? (0.0-0.3)
- Difficulty: Is the difficulty appropriate for learners? (0.0-0.2)
- Answer quality: Are distractors plausible but clearly wrong? (0.0-0.2)

Return ONLY valid JSON (no markdown fences):
{{
  "scores": [
    {{"index": 0, "score": 0.85, "reason": "Clear and relevant"}},
    {{"index": 1, "score": 0.45, "reason": "Ambiguous wording"}}
  ]
}}""",
        ),
        (
            "human",
            "Lesson content:\n{lesson_content}\n\nQuestions to review:\n{questions_json}",
        ),
    ]
)

# Quality threshold: questions below this score get filtered out
QUALITY_THRESHOLD = 0.7

# Maximum retry attempts to prevent infinite loops
MAX_RETRIES = 3


# --- LangGraph State ---


class QuizState(TypedDict):
    lesson_id: str
    lesson_content: str
    questions: list[dict]
    quality_scores: list[dict]
    retry_count: int
    target_count: int  # how many questions we want


# --- Graph Nodes ---


def generate_questions(state: QuizState) -> dict:
    """Generate multiple-choice questions from lesson content."""
    # On first pass, generate target_count; on retries, only generate replacements
    current_count = len(state.get("questions") or [])
    needed = state["target_count"] - current_count
    if needed <= 0:
        return {}

    chain = GENERATE_PROMPT | llm
    response = chain.invoke(
        {
            "num_questions": needed,
            "lesson_content": state["lesson_content"],
        }
    )

    parsed = _parse_json(response.content)
    new_questions = parsed.get("questions", [])

    # Merge with existing passing questions (kept from previous filter step)
    existing = state.get("questions") or []
    return {"questions": existing + new_questions}


def review_questions(state: QuizState) -> dict:
    """Score each question for quality using the LLM as reviewer."""
    questions = state["questions"]
    if not questions:
        return {"quality_scores": []}

    chain = REVIEW_PROMPT | llm
    response = chain.invoke(
        {
            "lesson_content": state["lesson_content"],
            "questions_json": json.dumps(questions, indent=2),
        }
    )

    parsed = _parse_json(response.content)
    scores = parsed.get("scores", [])
    return {"quality_scores": scores}


def filter_questions(state: QuizState) -> dict:
    """Remove questions that scored below the quality threshold."""
    questions = state["questions"]
    scores = state["quality_scores"]

    # Build a score lookup by index
    score_map = {s["index"]: s["score"] for s in scores}

    passing = []
    for i, q in enumerate(questions):
        if score_map.get(i, 0) >= QUALITY_THRESHOLD:
            passing.append(q)

    return {
        "questions": passing,
        "quality_scores": [],  # reset scores after filtering
        "retry_count": state["retry_count"] + 1,
    }


# --- Conditional Edge ---


def should_regenerate(state: QuizState) -> str:
    """Decide whether to regenerate questions or finish.

    Triggers regeneration when filtered questions are fewer than
    the target AND we haven't exceeded the max retry limit.
    """
    if len(state["questions"]) >= state["target_count"]:
        return "end"
    if state["retry_count"] >= MAX_RETRIES:
        return "end"
    return "regenerate"


# --- Build the Graph ---

graph_builder = StateGraph(QuizState)
graph_builder.add_node("generate", generate_questions)
graph_builder.add_node("review", review_questions)
graph_builder.add_node("filter", filter_questions)

graph_builder.add_edge(START, "generate")
graph_builder.add_edge("generate", "review")
graph_builder.add_edge("review", "filter")
graph_builder.add_conditional_edges(
    "filter",
    should_regenerate,
    {
        "regenerate": "generate",
        "end": END,
    },
)

quiz_graph = graph_builder.compile()


# --- Public API ---


def generate_quiz(lesson_id: str, num_questions: int = 5) -> dict:
    """Generate a quiz for a lesson using the LangGraph pipeline.

    The pipeline generates questions, reviews them for quality,
    filters out low-scoring ones, and regenerates replacements
    up to MAX_RETRIES times.
    """
    # Fetch lesson content from Supabase
    result = (
        supabase.table("lessons")
        .select("id, title, content")
        .eq("id", lesson_id)
        .single()
        .execute()
    )

    if not result.data:
        raise ValueError(f"Lesson {lesson_id} not found")

    lesson = result.data
    lesson_content = f"# {lesson['title']}\n\n{lesson['content']}"

    # Clamp to 5-10 range
    num_questions = max(5, min(10, num_questions))

    # Run the quiz generation graph
    state = quiz_graph.invoke(
        {
            "lesson_id": lesson_id,
            "lesson_content": lesson_content,
            "questions": [],
            "quality_scores": [],
            "retry_count": 0,
            "target_count": num_questions,
        }
    )

    # Return only the final passing questions (capped at target)
    questions = state["questions"][:num_questions]

    return {
        "lesson_id": lesson_id,
        "questions": questions,
        "total_questions": len(questions),
    }


# --- Helpers ---


def _parse_json(text: str) -> dict:
    """Parse JSON from LLM response, stripping markdown fences if present."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        # Remove opening fence (```json or ```)
        first_newline = cleaned.index("\n")
        cleaned = cleaned[first_newline + 1 :]
    if cleaned.endswith("```"):
        cleaned = cleaned[: -len("```")]
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {}
