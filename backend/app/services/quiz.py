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


# --- LangGraph State ---


class QuizState(TypedDict):
    lesson_id: str
    lesson_content: str
    questions: list[dict]
    target_count: int  # how many questions we want


# --- Graph Nodes ---


def generate_questions(state: QuizState) -> dict:
    """Generate multiple-choice questions from lesson content."""
    chain = GENERATE_PROMPT | llm
    response = chain.invoke(
        {
            "num_questions": state["target_count"],
            "lesson_content": state["lesson_content"],
        }
    )

    parsed = _parse_json(response.content)
    questions = parsed.get("questions", [])
    return {"questions": questions}


# --- Build the Graph ---

graph_builder = StateGraph(QuizState)
graph_builder.add_node("generate", generate_questions)

graph_builder.add_edge(START, "generate")
graph_builder.add_edge("generate", END)

quiz_graph = graph_builder.compile()


# --- Public API ---


def generate_quiz(lesson_id: str, num_questions: int = 5) -> dict:
    """Generate a quiz for a lesson using the LangGraph pipeline."""
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
            "target_count": num_questions,
        }
    )

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
