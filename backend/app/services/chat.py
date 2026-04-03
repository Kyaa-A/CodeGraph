from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

from app.core.config import settings
from app.services.search import semantic_search

# Initialize the LLM (OpenAI-compatible endpoint — works with Azure AI Foundry)
llm = ChatOpenAI(
    base_url=settings.LLM_BASE_URL,
    api_key=settings.LLM_API_KEY,
    model=settings.LLM_MODEL,
)

# RAG prompt — instructs the LLM to answer using only the provided context
RAG_PROMPT = ChatPromptTemplate.from_template(
    """You are an AI tutor for CodeGraph, an AI/ML course platform.
Answer the student's question based on the lesson context below.

Rules:
- Only use information from the provided context
- If the context doesn't contain the answer, say so honestly
- Keep answers clear, concise, and beginner-friendly
- Use code examples from the context when relevant

Context:
{context}

Question: {question}"""
)


def rag_chat(lesson_id: str, question: str) -> dict:
    """Retrieve relevant chunks for the lesson, then generate an answer."""

    # 1. Search for relevant chunks (filtered to this lesson's content)
    search_results = semantic_search(question, top_k=5)

    # Filter to only chunks from this specific lesson
    lesson_chunks = [r for r in search_results if r["lesson_id"] == lesson_id]

    # Fall back to all results if no chunks match this lesson
    if not lesson_chunks:
        lesson_chunks = search_results

    # 2. Build context string from retrieved chunks
    context = "\n\n---\n\n".join(chunk["chunk_text"] for chunk in lesson_chunks)

    # 3. Run the RAG chain: prompt → LLM → answer
    chain = RAG_PROMPT | llm
    response = chain.invoke({"context": context, "question": question})

    # 4. Return the answer + sources
    sources = [
        {"lesson_id": c["lesson_id"], "lesson_title": c["lesson_title"]}
        for c in lesson_chunks
    ]

    return {
        "response": response.content,
        "sources": sources,
    }
