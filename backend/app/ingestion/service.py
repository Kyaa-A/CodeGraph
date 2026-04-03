from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import AzureOpenAIEmbeddings

from app.core.config import settings
from app.core.supabase import supabase

# Initialize the embedding model
embeddings_model = AzureOpenAIEmbeddings(
    azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
    api_key=settings.AZURE_OPENAI_API_KEY,
    azure_deployment=settings.AZURE_EMBEDDING_DEPLOYMENT,
    api_version="2023-05-15",
)

# Chunking config
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", " ", ""],
)


def ingest_lesson(lesson_id: str) -> dict:
    """Chunk a lesson's content, embed each chunk, and store in lesson_chunks."""

    # 1. Fetch the lesson content from Supabase
    result = (
        supabase.table("lessons")
        .select("id, title, content")
        .eq("id", lesson_id)
        .single()
        .execute()
    )
    lesson = result.data

    # 2. Delete any existing chunks for this lesson (re-ingestion support)
    supabase.table("lesson_chunks").delete().eq("lesson_id", lesson_id).execute()

    # 3. Split the content into chunks
    chunks = text_splitter.split_text(lesson["content"])

    # 4. Embed all chunks in one batch call
    vectors = embeddings_model.embed_documents(chunks)

    # 5. Store chunks + embeddings in Supabase
    rows = [
        {
            "lesson_id": lesson_id,
            "chunk_text": chunk,
            "chunk_index": i,
            "embedding": vector,
        }
        for i, (chunk, vector) in enumerate(zip(chunks, vectors))
    ]
    supabase.table("lesson_chunks").insert(rows).execute()

    return {
        "lesson_id": lesson_id,
        "lesson_title": lesson["title"],
        "chunks_created": len(chunks),
    }
