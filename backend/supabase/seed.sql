-- Seed: 1 course with 5 lessons about LangChain & embeddings

INSERT INTO courses (id, title, description, is_free) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AI Fundamentals with LangChain', 'Learn embeddings, RAG pipelines, and LangGraph by building real AI features.', true);

INSERT INTO lessons (id, course_id, title, content, order_index) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'What Are Embeddings?',
    '# What Are Embeddings?

Embeddings are dense vector representations of text. Unlike keyword search, embeddings capture **semantic meaning** — words with similar meanings end up close together in vector space.

## Why Embeddings Matter

Traditional search relies on exact keyword matching. If a user searches for "how to fix a car" but your document says "automobile repair guide", keyword search fails. Embedding-based search understands these mean the same thing.

## How They Work

1. **Text goes in** — you pass a sentence, paragraph, or document to an embedding model
2. **Vector comes out** — the model returns a list of numbers (e.g., 1536 floats for OpenAI ada-002)
3. **Similar texts = similar vectors** — texts with similar meaning have vectors that point in similar directions

## Cosine Similarity

To compare two embeddings, we use **cosine similarity**. It measures the angle between two vectors:
- **1.0** = identical meaning
- **0.0** = completely unrelated
- **-1.0** = opposite meaning (rare in practice)

## Real-World Example

```python
from langchain.embeddings import AzureOpenAIEmbeddings

embeddings = AzureOpenAIEmbeddings(model="text-embedding-ada-002")
vector = embeddings.embed_query("What is machine learning?")
print(len(vector))  # 1536
```

Each number in that 1536-length list captures some aspect of the meaning. Individually they are meaningless, but together they form a rich semantic fingerprint.',
    1
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Text Chunking Strategies',
    '# Text Chunking Strategies

Before you can embed a document, you need to break it into smaller pieces called **chunks**. Why? Because embedding models have token limits, and smaller chunks produce more focused vectors.

## Why Chunk?

- Embedding models have **token limits** (e.g., 8191 tokens for ada-002)
- Smaller chunks = **more precise retrieval** (you get the exact paragraph, not a whole chapter)
- Too small = loses context; too large = dilutes meaning

## Common Strategies

### 1. Fixed-Size Chunking
Split every N characters. Simple but can break mid-sentence.

### 2. Recursive Character Splitting (Recommended)
LangChain''s `RecursiveCharacterTextSplitter` tries to split on natural boundaries:
1. First tries paragraph breaks (`\n\n`)
2. Then sentence breaks (`\n`)
3. Then spaces
4. Last resort: character-level split

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", " ", ""]
)
chunks = splitter.split_text(lesson_content)
```

### 3. Semantic Chunking
Groups sentences by semantic similarity. More expensive but produces the most meaningful chunks.

## Overlap

Always use **overlap** between chunks (e.g., 50 characters). This ensures that if a concept spans a chunk boundary, it appears in both chunks and can still be retrieved.

## Our Approach

For CodeGraph, we use `RecursiveCharacterTextSplitter` with `chunk_size=500` and `chunk_overlap=50`. This balances precision with context.',
    2
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Vector Storage with pgvector',
    '# Vector Storage with pgvector

Once you have embeddings, you need somewhere to store and search them. **pgvector** is a PostgreSQL extension that adds vector data types and similarity search.

## Why pgvector?

- Runs inside your **existing Postgres database** — no separate vector DB needed
- Supports **exact and approximate** nearest neighbor search
- Works with Supabase out of the box
- SQL-native: query vectors with regular SQL

## Setting Up

```sql
-- Enable the extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table with a vector column
CREATE TABLE lesson_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id),
    chunk_text TEXT NOT NULL,
    embedding VECTOR(1536)  -- 1536 dimensions for ada-002
);
```

## Storing Vectors

```python
from supabase import create_client

supabase = create_client(url, key)
supabase.table("lesson_chunks").insert({
    "lesson_id": lesson_id,
    "chunk_text": chunk,
    "embedding": vector.tolist()
}).execute()
```

## Searching Vectors

pgvector supports multiple distance functions:
- `<=>` — cosine distance (most common for text)
- `<->` — L2 (Euclidean) distance
- `<#>` — inner product

```sql
SELECT chunk_text, 1 - (embedding <=> query_embedding) AS similarity
FROM lesson_chunks
ORDER BY embedding <=> query_embedding
LIMIT 5;
```

## Indexing for Speed

Without an index, pgvector does exact (brute-force) search. For large datasets, create an **HNSW index**:

```sql
CREATE INDEX ON lesson_chunks
USING hnsw (embedding vector_cosine_ops);
```

HNSW (Hierarchical Navigable Small World) gives approximate results but is **much faster** for large datasets.',
    3
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'RAG Pipeline Basics',
    '# RAG Pipeline Basics

**RAG** stands for Retrieval-Augmented Generation. Instead of asking an LLM to answer from memory (which can hallucinate), you **retrieve relevant context first** and include it in the prompt.

## The Problem with Plain LLMs

If you ask ChatGPT "What does lesson 3 of CodeGraph cover?", it has no idea — that information isn''t in its training data. RAG solves this by fetching the answer from your own data.

## How RAG Works

```
User question
    → Embed the question
    → Search pgvector for similar chunks
    → Pass chunks + question to LLM
    → LLM generates answer using the chunks as context
```

## LangChain Implementation

```python
from langchain.chat_models import AzureChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnablePassthrough

# 1. Retriever: searches pgvector
retriever = vector_store.as_retriever(search_kwargs={"k": 5})

# 2. Prompt: includes retrieved context
prompt = ChatPromptTemplate.from_template("""
Answer the question based on the following context:

{context}

Question: {question}
""")

# 3. Chain: retriever → prompt → LLM
chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
)

answer = chain.invoke("What are embeddings?")
```

## Key Concepts

- **Retriever**: fetches relevant documents from your vector store
- **Context window**: the retrieved chunks become part of the LLM prompt
- **Grounding**: the LLM''s answer is grounded in your actual data, reducing hallucination

## Limitations

- Quality depends on your **chunking and embedding quality**
- If the answer spans multiple chunks, retrieval might miss pieces
- The LLM can still hallucinate if the context is ambiguous',
    4
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Introduction to LangGraph',
    '# Introduction to LangGraph

**LangGraph** is a framework for building stateful, multi-step AI workflows as graphs. While LangChain chains are linear (A → B → C), LangGraph supports **branching, loops, and conditional logic**.

## Why LangGraph?

LangChain chains are great for simple pipelines. But real AI applications need:
- **Conditional routing** — take different paths based on results
- **Loops** — retry or refine until quality is good enough
- **State management** — track conversation history across turns
- **Human-in-the-loop** — pause for human approval

## Core Concepts

### 1. State
A TypedDict that flows through the graph. Every node can read and update it.

```python
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages

class ChatState(TypedDict):
    messages: Annotated[list, add_messages]
    context: list[str]
    lesson_id: str
```

### 2. Nodes
Functions that take the state, do work, and return updates.

```python
def retrieve(state: ChatState) -> dict:
    question = state["messages"][-1].content
    chunks = search_pgvector(question, state["lesson_id"])
    return {"context": chunks}

def generate(state: ChatState) -> dict:
    response = llm.invoke(build_prompt(state))
    return {"messages": [response]}
```

### 3. Edges
Connections between nodes. Can be **direct** or **conditional**.

```python
from langgraph.graph import StateGraph

graph = StateGraph(ChatState)
graph.add_node("retrieve", retrieve)
graph.add_node("generate", generate)
graph.add_edge("retrieve", "generate")
graph.add_edge("generate", END)
```

### 4. Conditional Edges
Route to different nodes based on state.

```python
def should_retry(state):
    if state["quality_score"] < 0.7:
        return "regenerate"
    return "end"

graph.add_conditional_edges("review", should_retry)
```

## CodeGraph Usage

- **AI Tutor Chat**: retrieve → generate → respond (with conversation history)
- **Quiz Generator**: generate → review → conditionally regenerate (quality loop)',
    5
  );
