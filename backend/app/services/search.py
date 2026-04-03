from app.core.supabase import supabase
from app.ingestion.service import embeddings_model


def semantic_search(query: str, top_k: int = 5) -> list[dict]:
    """Embed the query and find the most similar lesson chunks via pgvector."""

    # 1. Embed the user's query into a vector
    query_vector = embeddings_model.embed_query(query)

    # 2. Call Supabase RPC to do cosine similarity search
    result = supabase.rpc(
        "search_lesson_chunks",
        {"query_embedding": query_vector, "match_count": top_k},
    ).execute()

    return result.data
