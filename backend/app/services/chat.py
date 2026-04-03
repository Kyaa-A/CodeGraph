from typing import Annotated, TypedDict

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph import StateGraph, START, END

from app.core.config import settings
from app.core.supabase import supabase
from app.services.search import semantic_search

# Initialize the LLM
llm = ChatOpenAI(
    base_url=settings.LLM_BASE_URL,
    api_key=settings.LLM_API_KEY,
    model=settings.LLM_MODEL,
)

# RAG prompt with chat history support
RAG_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are an AI tutor for CodeGraph, an AI/ML course platform.
Answer the student's question based on the lesson context below.

Rules:
- Only use information from the provided context
- If the context doesn't contain the answer, say so honestly
- Keep answers clear, concise, and beginner-friendly
- Use code examples from the context when relevant

Context:
{context}""",
        ),
        MessagesPlaceholder("chat_history"),
        ("human", "{question}"),
    ]
)


# --- LangGraph State ---

class ChatState(TypedDict):
    lesson_id: str
    question: str
    chat_history: list  # previous messages
    context: str  # retrieved chunks
    response: str  # final answer
    sources: list[dict]


# --- Graph Nodes ---

def retrieve(state: ChatState) -> dict:
    """Search pgvector for relevant chunks."""
    results = semantic_search(state["question"], top_k=5)

    # Filter to this lesson's chunks
    lesson_chunks = [r for r in results if r["lesson_id"] == state["lesson_id"]]
    if not lesson_chunks:
        lesson_chunks = results

    context = "\n\n---\n\n".join(c["chunk_text"] for c in lesson_chunks)
    sources = [
        {"lesson_id": c["lesson_id"], "lesson_title": c["lesson_title"]}
        for c in lesson_chunks
    ]

    return {"context": context, "sources": sources}


def generate(state: ChatState) -> dict:
    """Generate an answer using the LLM with context and chat history."""
    chain = RAG_PROMPT | llm
    response = chain.invoke(
        {
            "context": state["context"],
            "chat_history": state["chat_history"],
            "question": state["question"],
        }
    )
    return {"response": response.content}


# --- Build the Graph ---

graph_builder = StateGraph(ChatState)
graph_builder.add_node("retrieve", retrieve)
graph_builder.add_node("generate", generate)
graph_builder.add_edge(START, "retrieve")
graph_builder.add_edge("retrieve", "generate")
graph_builder.add_edge("generate", END)

rag_graph = graph_builder.compile()


# --- Session Management ---

def load_chat_history(session_id: str) -> list:
    """Load previous messages from Supabase."""
    result = (
        supabase.table("chat_messages")
        .select("role, content")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )

    messages = []
    for msg in result.data:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        else:
            messages.append(AIMessage(content=msg["content"]))
    return messages


def save_messages(session_id: str, question: str, answer: str):
    """Save the user question and AI response to Supabase."""
    supabase.table("chat_messages").insert(
        [
            {"session_id": session_id, "role": "user", "content": question},
            {"session_id": session_id, "role": "assistant", "content": answer},
        ]
    ).execute()


def rag_chat(session_id: str, lesson_id: str, question: str) -> dict:
    """Run the RAG graph with conversation history."""

    # Load previous messages for this session
    chat_history = load_chat_history(session_id)

    # Run the graph
    result = rag_graph.invoke(
        {
            "lesson_id": lesson_id,
            "question": question,
            "chat_history": chat_history,
            "context": "",
            "response": "",
            "sources": [],
        }
    )

    # Save this exchange to the database
    save_messages(session_id, question, result["response"])

    return {
        "response": result["response"],
        "sources": result["sources"],
    }


async def rag_chat_stream(session_id: str, lesson_id: str, question: str):
    """Stream the RAG response token by token via SSE."""
    import json

    # Load chat history and retrieve context (non-streaming parts)
    chat_history = load_chat_history(session_id)
    search_results = semantic_search(question, top_k=5)

    lesson_chunks = [r for r in search_results if r["lesson_id"] == lesson_id]
    if not lesson_chunks:
        lesson_chunks = search_results

    context = "\n\n---\n\n".join(c["chunk_text"] for c in lesson_chunks)
    sources = [
        {"lesson_id": c["lesson_id"], "lesson_title": c["lesson_title"]}
        for c in lesson_chunks
    ]

    # Build the prompt
    messages = RAG_PROMPT.format_messages(
        context=context,
        chat_history=chat_history,
        question=question,
    )

    # Send sources first as an SSE event
    yield f"event: sources\ndata: {json.dumps(sources)}\n\n"

    # Stream tokens from the LLM
    full_response = ""
    async for chunk in llm.astream(messages):
        token = chunk.content
        if token:
            full_response += token
            yield f"event: token\ndata: {json.dumps(token)}\n\n"

    # Signal completion
    yield f"event: done\ndata: {json.dumps({'full_response': full_response})}\n\n"

    # Save to database after streaming completes
    save_messages(session_id, question, full_response)
