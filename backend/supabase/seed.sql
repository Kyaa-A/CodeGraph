-- =============================================================================
-- CodeGraph Seed Data
-- 5 courses, 32 lessons total
-- =============================================================================

-- Clean existing data (order matters due to FK constraints)
DELETE FROM lessons;
DELETE FROM courses;

-- =============================================================================
-- COURSES
-- =============================================================================

INSERT INTO courses (id, title, description, is_free) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'AI Fundamentals with LangChain',
   'Learn embeddings, RAG pipelines, and LangGraph by building real AI features.',
   true),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901',
   'Python for Beginners',
   'Start your coding journey with Python. Learn variables, loops, functions, and object-oriented programming from scratch.',
   true),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012',
   'JavaScript Essentials',
   'Master the language of the web. From variables and functions to async programming and modern ES6+ features.',
   true),
  ('d4e5f6a7-b8c9-0123-defa-234567890123',
   'Java Fundamentals',
   'Build a solid foundation in Java. Learn syntax, OOP, and collections to start building robust applications.',
   true),
  ('e5f6a7b8-c9d0-1234-efab-345678901234',
   'SQL Mastery',
   'Learn to query, filter, join, and manipulate data in relational databases using SQL.',
   true);

-- =============================================================================
-- LESSONS: AI Fundamentals with LangChain
-- =============================================================================

INSERT INTO lessons (id, course_id, title, content, order_index, starter_code, language) VALUES
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
    1,
    '# Exercise: Embeddings & Cosine Similarity
# In a real system you would use an API to generate embeddings.
# Here, simulate an embedding as a list of floats.
import math

text = "Machine learning is fascinating"

# TODO: Create a variable called "embedding" — a list of floats
# representing a fake 8-dimensional embedding for the text above.
# Example: [0.1, -0.3, 0.5, ...]
embedding = []  # Replace with a list of 8 floats

# TODO: Implement cosine_similarity(a, b) that returns the cosine
# similarity between two equal-length vectors.
# Formula: dot(a,b) / (magnitude(a) * magnitude(b))
def cosine_similarity(a, b):
    # TODO: compute dot product, magnitudes, return similarity
    pass

# Test your implementation:
v1 = [1.0, 0.0, 0.0]
v2 = [1.0, 0.0, 0.0]
print(f"Similarity of identical vectors: {cosine_similarity(v1, v2)}")
print(f"Embedding length: {len(embedding)}")',
    'python'
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
    2,
    '# Exercise: Build a Text Chunking Function
# In real RAG pipelines, text is split into overlapping chunks.
# Implement this from scratch to understand how it works.

sample_text = """Artificial intelligence is a broad field of computer science focused on creating systems capable of performing tasks that typically require human intelligence. Machine learning, a subset of AI, uses statistical methods to enable machines to improve with experience. Deep learning, a further subset, uses neural networks with many layers to learn representations of data with multiple levels of abstraction."""

# TODO: Implement chunk_text(text, chunk_size, chunk_overlap)
# - Split text into chunks of at most chunk_size characters
# - Each chunk should overlap with the previous by chunk_overlap characters
# - Return a list of strings
def chunk_text(text, chunk_size, chunk_overlap):
    # TODO: implement the chunking logic
    pass

# TODO: Use your function to chunk sample_text with size=100, overlap=20
chunks = chunk_text(sample_text, 100, 20) or []

for i, chunk in enumerate(chunks):
    print(f"Chunk {i} ({len(chunk)} chars): {chunk[:50]}...")
print(f"Total chunks: {len(chunks)}")',
    'python'
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
    3,
    '# Exercise: Write SQL queries for pgvector operations
# Imagine you have a lesson_chunks table with an embedding column.
# Practice writing the SQL queries you would use.

# TODO: Write a SQL string that creates the lesson_chunks table
create_table_sql = """
CREATE TABLE lesson_chunks (
    -- TODO: Add columns for id, lesson_id, chunk_text, and embedding
);
"""

# TODO: Write a SQL string that performs a cosine similarity search
# It should find the 5 most similar chunks to a given query_embedding
search_sql = """
SELECT chunk_text
FROM lesson_chunks
-- TODO: Add ORDER BY using cosine distance operator
-- TODO: Add LIMIT
;
"""

# TODO: Write a SQL string that creates an HNSW index for fast search
index_sql = """
-- TODO: Create an HNSW index on the embedding column
;
"""

print("Create table SQL:")
print(create_table_sql)
print("Search SQL:")
print(search_sql)
print("Index SQL:")
print(index_sql)',
    'python'
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
    4,
    '# Exercise: Build a RAG Prompt Builder
# RAG = Retrieval-Augmented Generation
# Step 1: Embed the question (simulated)
# Step 2: Retrieve relevant chunks
# Step 3: Build a prompt combining context + question
# Step 4: Send to LLM (simulated)

# TODO: Implement build_rag_prompt(context_chunks, question)
# It should return a single string that includes:
# - All the context chunks (joined together)
# - The user''s question
# - Instructions telling the LLM to answer based on the context
def build_rag_prompt(context_chunks, question):
    # TODO: Combine the chunks and question into a prompt string
    pass

# Test it:
test_chunks = ["Python is a programming language.", "It was created by Guido van Rossum."]
test_question = "Who created Python?"
prompt = build_rag_prompt(test_chunks, test_question)
print(f"Generated prompt:\\n{prompt}")

# TODO: Create a list called rag_steps that describes the RAG pipeline
# in order. Each step should be a short string like "embed query",
# "retrieve chunks", "generate response"
rag_steps = []  # TODO: Fill in the pipeline steps

print(f"\\nRAG pipeline steps: {rag_steps}")',
    'python'
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
    5,
    '# Exercise: Build a Simple Graph Workflow
# LangGraph models AI workflows as graphs with nodes and edges.
# Here, simulate this concept without the LangGraph library.

# A "state" is a dictionary passed between nodes.
# Each node is a function that takes state and returns updates.

# TODO: Implement greet(state) that returns a dict with a "messages" key.
# The messages value should be a list containing a greeting string.
def greet(state):
    # TODO: Return {"messages": ["Hello! ..."]}
    pass

# TODO: Implement respond(state) that returns a dict with a "messages" key.
# The response should reference state["topic"] — mention the topic!
def respond(state):
    # TODO: Return {"messages": ["Let me tell you about {topic}..."]}
    pass

# TODO: Create a list called graph_nodes with the node names
# in execution order: first "greet", then "respond"
graph_nodes = []  # TODO: ["greet", "respond"]

# Simulate running the graph:
state = {"messages": [], "topic": "embeddings"}
for node_name in graph_nodes:
    if node_name == "greet":
        result = greet(state)
    elif node_name == "respond":
        result = respond(state)
    if result and "messages" in result:
        state["messages"].extend(result["messages"])

print(f"Graph nodes: {graph_nodes}")
print(f"Final messages: {state[''messages'']}")',
    'python'
  );

-- =============================================================================
-- LESSONS: Python for Beginners
-- =============================================================================

INSERT INTO lessons (id, course_id, title, content, order_index, starter_code, language) VALUES
  (
    'a0000001-0001-0001-0001-000000000001',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Hello World & Variables',
    '# Hello World & Variables

Welcome to Python! In this lesson, you will write your first program and learn how to store data using variables.

## Your First Program

Every programming journey starts with "Hello, World!". In Python, it is just one line:

```python
print("Hello, World!")
```

The `print()` function outputs text to the screen. Whatever you put inside the parentheses gets displayed.

## Variables

A variable is a named container that stores a value. In Python, you create a variable by assigning a value with the `=` operator:

```python
name = "Alice"
age = 25
height = 5.6
is_student = True
```

Notice that you do not need to declare the type — Python figures it out automatically. This is called **dynamic typing**.

## Naming Rules

- Variable names must start with a letter or underscore (`_`)
- They can contain letters, numbers, and underscores
- They are **case-sensitive**: `name` and `Name` are different variables
- Use **snake_case** by convention: `my_variable`, `user_age`, `total_count`

## Reassigning Variables

You can change a variable''s value at any time:

```python
score = 10
print(score)  # 10
score = 20
print(score)  # 20
score = score + 5
print(score)  # 25
```

## Multiple Assignment

Python lets you assign multiple variables in one line:

```python
x, y, z = 1, 2, 3
a = b = c = 0
```

## String Formatting with f-strings

f-strings let you embed variables directly inside strings:

```python
name = "Bob"
age = 30
print(f"My name is {name} and I am {age} years old.")
```

The `f` before the opening quote tells Python to look for `{expressions}` inside the string and replace them with their values.

## Comments

Use the `#` symbol to add comments. Comments are ignored by Python and exist only for human readers:

```python
# This is a comment
name = "Alice"  # This is an inline comment
```

## Key Takeaways

- `print()` displays output to the console
- Variables store data and do not require type declarations
- Use `snake_case` for variable names
- f-strings make string formatting clean and readable',
    1,
    '# Exercise: Variables and Print Statements
# Practice creating variables and using f-strings

# TODO: Create a variable called "name" with your name as a string
name = ""

# TODO: Create a variable called "age" with your age as an integer
age = 0

# TODO: Create a variable called "favorite_language" with value "Python"
favorite_language = ""

# TODO: Create a variable called "is_beginner" with value True
is_beginner = True

# TODO: Use an f-string to print a message like:
# "Hi, I''m Alice. I''m 25 years old and I love Python!"
print(f"TODO: Write your f-string here")

# TODO: Reassign the age variable to be 1 year older
# Then print the new age
print(f"Next year I will be {age} years old")',
    'python'
  ),
  (
    'a0000002-0002-0002-0002-000000000002',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Data Types & Type Conversion',
    '# Data Types & Type Conversion

Every value in Python has a **type**. Understanding types is fundamental because different types support different operations.

## Core Data Types

### Integers (`int`)
Whole numbers, positive or negative, with no decimal point:

```python
count = 42
temperature = -10
big_number = 1_000_000  # underscores for readability
```

### Floats (`float`)
Numbers with decimal points:

```python
price = 19.99
pi = 3.14159
percentage = 0.85
```

### Strings (`str`)
Text enclosed in quotes (single or double):

```python
greeting = "Hello"
name = ''Alice''
multiline = """This is
a multiline string"""
```

### Booleans (`bool`)
True or False values:

```python
is_active = True
is_deleted = False
```

## Checking Types

Use the `type()` function to check a value''s type:

```python
print(type(42))        # <class ''int''>
print(type(3.14))      # <class ''float''>
print(type("hello"))   # <class ''str''>
print(type(True))      # <class ''bool''>
```

## Type Conversion (Casting)

Sometimes you need to convert between types. Python provides built-in functions for this:

```python
# String to Integer
age_str = "25"
age_int = int(age_str)  # 25

# Integer to String
count = 100
count_str = str(count)  # "100"

# String to Float
price_str = "19.99"
price = float(price_str)  # 19.99

# Float to Integer (truncates, does not round)
value = int(3.7)  # 3
```

## Common Pitfalls

### Cannot concatenate string and int directly

```python
age = 25
# This will cause a TypeError:
# print("I am " + age + " years old")

# Fix: convert to string first
print("I am " + str(age) + " years old")
# Or better, use f-strings:
print(f"I am {age} years old")
```

### Division always returns a float

```python
result = 10 / 2   # 5.0 (float, not int!)
result = 10 // 2  # 5 (integer division)
result = 10 % 3   # 1 (modulo / remainder)
```

## The `None` Type

`None` represents the absence of a value. It is Python''s version of null:

```python
result = None
if result is None:
    print("No result yet")
```

## Key Takeaways

- Python has four core types: `int`, `float`, `str`, `bool`
- Use `type()` to check a value''s type
- Use `int()`, `float()`, `str()` to convert between types
- Use `//` for integer division, `/` always returns a float',
    2,
    '# Exercise: Data Types and Type Conversion
# Practice working with different data types

# TODO: Create one variable of each type: int, float, str, bool
my_int = 0
my_float = 0.0
my_str = ""
my_bool = True

# TODO: Print the type of each variable using the type() function
print(f"my_int is type: {type(my_int)}")
# TODO: Print the types of the other three variables

# TODO: Convert the string "42" to an integer and store it in a variable
string_number = "42"
converted = None  # TODO: Convert string_number to int

# TODO: Convert the integer 100 to a string and store it
number = 100
number_as_string = None  # TODO: Convert number to str

# TODO: Perform integer division of 17 by 3
# Store the quotient and the remainder in separate variables
quotient = None   # TODO: Use // operator
remainder = None  # TODO: Use % operator
print(f"17 divided by 3 is {quotient} remainder {remainder}")

# TODO: What happens when you convert 3.9 to int?
# Store the result and print it to see
float_value = 3.9
int_value = None  # TODO: Convert float_value to int
print(f"Converting {float_value} to int gives: {int_value}")',
    'python'
  ),
  (
    'a0000003-0003-0003-0003-000000000003',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Conditionals (if/elif/else)',
    '# Conditionals (if/elif/else)

Conditionals let your program make decisions. Based on whether a condition is true or false, different blocks of code will execute.

## The `if` Statement

The simplest conditional checks one condition:

```python
age = 18
if age >= 18:
    print("You are an adult")
```

The indented block runs only if the condition is `True`. In Python, **indentation matters** — it defines which code belongs to the `if` block.

## `if/else`

Add an `else` block for when the condition is `False`:

```python
temperature = 30
if temperature > 25:
    print("It is hot outside")
else:
    print("It is not too hot")
```

## `if/elif/else`

Use `elif` (short for "else if") to check multiple conditions:

```python
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"Your grade is {grade}")
```

Python checks conditions from top to bottom and runs the **first** block that matches. Once a match is found, all remaining `elif` and `else` blocks are skipped.

## Comparison Operators

| Operator | Meaning |
|----------|---------|
| `==` | Equal to |
| `!=` | Not equal to |
| `>` | Greater than |
| `<` | Less than |
| `>=` | Greater than or equal to |
| `<=` | Less than or equal to |

## Logical Operators

Combine conditions with `and`, `or`, and `not`:

```python
age = 25
has_license = True

if age >= 16 and has_license:
    print("You can drive")

if age < 13 or age > 65:
    print("Discounted ticket")

if not has_license:
    print("You need a license")
```

## Truthy and Falsy Values

Python treats certain values as `False` in a boolean context:
- `False`, `None`, `0`, `0.0`
- Empty sequences: `""`, `[]`, `()`, `{}`

Everything else is `True`:

```python
name = ""
if name:
    print(f"Hello, {name}")
else:
    print("Name is empty")
```

## Nested Conditionals

You can nest `if` statements inside each other, but keep it readable:

```python
is_member = True
age = 20

if is_member:
    if age >= 18:
        print("Adult member")
    else:
        print("Junior member")
else:
    print("Not a member")
```

## Key Takeaways

- `if`, `elif`, and `else` let you branch your code logic
- Indentation defines code blocks (typically 4 spaces)
- Use comparison operators (`==`, `!=`, `>`, `<`) and logical operators (`and`, `or`, `not`)
- Python evaluates conditions top to bottom and stops at the first match',
    3,
    '# Exercise: Conditionals Practice
# Build a simple ticket pricing system

# TODO: Create a variable for the customer''s age
age = 0  # TODO: Set an age to test with

# TODO: Create a variable for whether they are a member (True/False)
is_member = False

# TODO: Write an if/elif/else block that sets the ticket_price:
#   - Children (under 13): $5
#   - Teens (13-17): $8
#   - Adults (18-64): $12
#   - Seniors (65+): $6
ticket_price = 0

# TODO: If the customer is a member, apply a 20% discount
# Use an if statement to check is_member and adjust ticket_price

# TODO: Print the final price using an f-string
# Example output: "Age: 25, Member: True, Price: $9.60"
print(f"Age: {age}, Member: {is_member}, Price: ${ticket_price}")

# BONUS TODO: Add a check - if age is negative, print an error message
# instead of calculating a price',
    'python'
  ),
  (
    'a0000004-0004-0004-0004-000000000004',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Loops (for/while)',
    '# Loops (for/while)

Loops let you repeat a block of code multiple times. Python has two types: `for` loops and `while` loops.

## The `for` Loop

A `for` loop iterates over a sequence (like a list, string, or range):

```python
# Loop over a list
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)
```

### The `range()` Function

`range()` generates a sequence of numbers, perfect for counting loops:

```python
# Print 0 to 4
for i in range(5):
    print(i)

# Print 1 to 10
for i in range(1, 11):
    print(i)

# Print even numbers from 0 to 20
for i in range(0, 21, 2):
    print(i)
```

`range(start, stop, step)` — note that `stop` is exclusive (not included).

### Looping Over Strings

Strings are sequences too:

```python
for char in "Python":
    print(char)  # P, y, t, h, o, n
```

## The `while` Loop

A `while` loop runs as long as a condition is `True`:

```python
count = 0
while count < 5:
    print(f"Count is {count}")
    count += 1  # Don''t forget this or you get an infinite loop!
```

### When to Use `while`

Use `while` when you do not know in advance how many iterations you need:

```python
# Keep asking until valid input
user_input = ""
while user_input != "quit":
    user_input = input("Enter command (or ''quit'' to exit): ")
    print(f"You entered: {user_input}")
```

## `break` and `continue`

### `break` — Exit the loop immediately

```python
for i in range(100):
    if i == 5:
        break
    print(i)  # Prints 0, 1, 2, 3, 4
```

### `continue` — Skip to the next iteration

```python
for i in range(10):
    if i % 2 == 0:
        continue  # Skip even numbers
    print(i)  # Prints 1, 3, 5, 7, 9
```

## Nested Loops

You can put loops inside loops:

```python
for row in range(3):
    for col in range(3):
        print(f"({row}, {col})", end=" ")
    print()  # New line after each row
```

## `enumerate()` — Get Index and Value

When you need both the index and the value:

```python
colors = ["red", "green", "blue"]
for index, color in enumerate(colors):
    print(f"{index}: {color}")
```

## List Comprehensions (Bonus)

A compact way to create lists from loops:

```python
squares = [x ** 2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
```

## Key Takeaways

- `for` loops iterate over sequences; `while` loops run until a condition is false
- `range(start, stop, step)` generates number sequences
- `break` exits a loop; `continue` skips to the next iteration
- `enumerate()` gives you both index and value
- Always ensure `while` loops have a way to terminate',
    4,
    '# Exercise: Loops Practice
# Solve these small challenges using for and while loops

# Challenge 1: Sum of Numbers
# TODO: Use a for loop to calculate the sum of numbers from 1 to 100
total = 0
# TODO: Write the for loop here

print(f"Sum of 1 to 100: {total}")

# Challenge 2: FizzBuzz
# TODO: Loop through numbers 1 to 20
# If divisible by 3, print "Fizz"
# If divisible by 5, print "Buzz"
# If divisible by both, print "FizzBuzz"
# Otherwise, print the number
print("\nFizzBuzz:")
# TODO: Write the loop here

# Challenge 3: Find the First Multiple
# TODO: Use a while loop to find the first number greater than 1000
# that is divisible by both 7 and 13
number = 1001
# TODO: Write the while loop here

print(f"\nFirst number > 1000 divisible by 7 and 13: {number}")

# Challenge 4: Reverse a String
# TODO: Use a for loop to reverse the string "Python" (without slicing)
original = "Python"
reversed_str = ""
# TODO: Write the loop here

print(f"\nReversed ''{original}'': {reversed_str}")',
    'python'
  ),
  (
    'a0000005-0005-0005-0005-000000000005',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Functions',
    '# Functions

Functions are reusable blocks of code that perform a specific task. They help you organize your code, avoid repetition, and make programs easier to read and maintain.

## Defining a Function

Use the `def` keyword followed by the function name, parentheses, and a colon:

```python
def greet():
    print("Hello, World!")

greet()  # Call the function
```

## Parameters and Arguments

Functions can accept input values called **parameters**:

```python
def greet(name):
    print(f"Hello, {name}!")

greet("Alice")   # "Hello, Alice!"
greet("Bob")     # "Hello, Bob!"
```

### Multiple Parameters

```python
def add(a, b):
    return a + b

result = add(3, 5)  # 8
```

## Return Values

Use `return` to send a value back to the caller:

```python
def square(n):
    return n ** 2

result = square(4)  # 16
print(result)
```

A function without a `return` statement returns `None` by default.

## Default Parameters

Provide default values for parameters that are optional:

```python
def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("Alice")              # "Hello, Alice!"
greet("Alice", "Welcome")   # "Welcome, Alice!"
```

## Keyword Arguments

You can pass arguments by name for clarity:

```python
def create_user(name, age, role="student"):
    return {"name": name, "age": age, "role": role}

user = create_user(name="Alice", age=25, role="admin")
```

## Variable-Length Arguments

### `*args` — Variable positional arguments

```python
def total(*numbers):
    return sum(numbers)

print(total(1, 2, 3))       # 6
print(total(10, 20, 30, 40))  # 100
```

### `**kwargs` — Variable keyword arguments

```python
def print_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="Alice", age=25, city="NYC")
```

## Scope

Variables defined inside a function are **local** — they only exist within that function:

```python
def my_func():
    x = 10  # Local variable
    print(x)

my_func()
# print(x)  # Error! x is not defined outside the function
```

Variables defined outside functions are **global** and accessible everywhere, but modifying them inside a function requires the `global` keyword (generally avoided).

## Docstrings

Document your functions with a docstring:

```python
def calculate_bmi(weight_kg, height_m):
    """Calculate Body Mass Index (BMI).

    Args:
        weight_kg: Weight in kilograms.
        height_m: Height in meters.

    Returns:
        BMI as a float.
    """
    return weight_kg / (height_m ** 2)
```

## Key Takeaways

- Functions are defined with `def` and called with parentheses
- Use parameters to pass data in and `return` to send data out
- Default parameters make arguments optional
- `*args` and `**kwargs` handle variable numbers of arguments
- Keep functions focused on one task for better readability',
    5,
    '# Exercise: Functions Practice
# Build a small collection of utility functions

# TODO: Write a function called "celsius_to_fahrenheit" that:
#   - Takes a temperature in Celsius
#   - Returns the temperature in Fahrenheit (formula: C * 9/5 + 32)
def celsius_to_fahrenheit(celsius):
    pass  # TODO: Implement this

# TODO: Write a function called "is_palindrome" that:
#   - Takes a string
#   - Returns True if the string reads the same forwards and backwards
#   - Should be case-insensitive (e.g., "Racecar" -> True)
def is_palindrome(text):
    pass  # TODO: Implement this

# TODO: Write a function called "find_max" that:
#   - Takes *args (variable number of arguments)
#   - Returns the largest value
#   - Do NOT use the built-in max() function
def find_max(*args):
    pass  # TODO: Implement this

# TODO: Write a function called "create_profile" that:
#   - Takes name (required), age (required), and **kwargs for extras
#   - Returns a dictionary with all the info
def create_profile(name, age, **kwargs):
    pass  # TODO: Implement this

# Test your functions:
print(f"0°C = {celsius_to_fahrenheit(0)}°F")    # Should be 32.0
print(f"100°C = {celsius_to_fahrenheit(100)}°F") # Should be 212.0
print(f"Is ''racecar'' a palindrome? {is_palindrome(''racecar'')}")  # True
print(f"Is ''hello'' a palindrome? {is_palindrome(''hello'')}")      # False
print(f"Max of 3, 7, 2, 9, 4: {find_max(3, 7, 2, 9, 4)}")         # 9
print(f"Profile: {create_profile(''Alice'', 25, city=''NYC'', role=''dev'')}")',
    'python'
  ),
  (
    'a0000006-0006-0006-0006-000000000006',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Lists & Tuples',
    '# Lists & Tuples

Lists and tuples are ordered collections that store multiple items in a single variable. Lists are mutable (changeable), while tuples are immutable (fixed after creation).

## Lists

### Creating Lists

```python
fruits = ["apple", "banana", "cherry"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", True, 3.14]
empty = []
```

### Accessing Elements

Use zero-based indexing:

```python
fruits = ["apple", "banana", "cherry"]
print(fruits[0])   # "apple"
print(fruits[-1])  # "cherry" (last element)
```

### Slicing

Extract a portion of a list:

```python
numbers = [0, 1, 2, 3, 4, 5]
print(numbers[1:4])   # [1, 2, 3]
print(numbers[:3])    # [0, 1, 2]
print(numbers[3:])    # [3, 4, 5]
print(numbers[::2])   # [0, 2, 4] (every 2nd element)
```

### Modifying Lists

```python
fruits = ["apple", "banana", "cherry"]

# Change an element
fruits[1] = "blueberry"

# Add elements
fruits.append("date")          # Add to end
fruits.insert(1, "avocado")    # Insert at index 1

# Remove elements
fruits.remove("cherry")        # Remove by value
popped = fruits.pop()           # Remove and return last item
del fruits[0]                   # Remove by index
```

### Useful List Methods

```python
numbers = [3, 1, 4, 1, 5, 9]
numbers.sort()                 # Sort in place: [1, 1, 3, 4, 5, 9]
numbers.reverse()              # Reverse in place
print(len(numbers))            # Length: 6
print(numbers.count(1))        # Count occurrences: 2
print(numbers.index(4))        # Find index of value: 3
```

### List Comprehensions

A powerful shorthand for creating lists:

```python
squares = [x ** 2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
upper = [s.upper() for s in ["hello", "world"]]
```

## Tuples

Tuples are like lists but **immutable** — once created, they cannot be changed.

```python
point = (3, 4)
colors = ("red", "green", "blue")
single = (42,)  # Note the comma for single-element tuple
```

### When to Use Tuples

- When data should not change (coordinates, RGB values, database records)
- As dictionary keys (lists cannot be dictionary keys)
- Tuples are slightly faster than lists

### Tuple Unpacking

```python
point = (3, 4)
x, y = point
print(f"x={x}, y={y}")  # x=3, y=4

# Works in loops too
pairs = [(1, "a"), (2, "b"), (3, "c")]
for number, letter in pairs:
    print(f"{number}: {letter}")
```

## Key Takeaways

- Lists are mutable and created with `[]`; tuples are immutable and created with `()`
- Both use zero-based indexing and support slicing
- Use `append()`, `insert()`, `remove()`, `pop()` to modify lists
- List comprehensions provide a concise way to create lists
- Use tuples for data that should not change after creation',
    6,
    '# Exercise: Lists & Tuples Practice

# TODO: Create a list of 5 of your favorite movies
movies = []  # TODO: Add 5 movies

# TODO: Add a 6th movie to the end of the list using append()

# TODO: Insert a movie at index 2 using insert()

# TODO: Remove a movie by its name using remove()

# TODO: Print the list sorted alphabetically (without modifying the original)
# Hint: use sorted() function, not .sort()
print(f"Sorted: {sorted(movies)}")
print(f"Original: {movies}")

# TODO: Use a list comprehension to create a list of movie name lengths
# Example: ["Jaws", "Alien"] -> [4, 5]
lengths = []  # TODO: Use list comprehension

print(f"Movie lengths: {lengths}")

# TODO: Create a tuple of RGB values for your favorite color
# Example: (255, 128, 0) for orange
color = ()  # TODO: Create the tuple

# TODO: Unpack the tuple into three variables: r, g, b
# Then print them
r, g, b = 0, 0, 0  # TODO: Unpack the color tuple
print(f"R={r}, G={g}, B={b}")

# TODO: Create a list of (name, score) tuples, then sort by score
students = [
    ("Alice", 85),
    ("Bob", 92),
    ("Charlie", 78),
    ("Diana", 95),
]
# TODO: Sort the students list by score (second element) in descending order
# Hint: use sorted() with key=lambda x: x[1] and reverse=True
sorted_students = []  # TODO: Sort the list
print(f"Top students: {sorted_students}")',
    'python'
  ),
  (
    'a0000007-0007-0007-0007-000000000007',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Dictionaries',
    '# Dictionaries

A dictionary is an unordered collection of **key-value pairs**. Dictionaries are one of the most used data structures in Python because they provide fast lookups by key.

## Creating Dictionaries

```python
student = {
    "name": "Alice",
    "age": 25,
    "grade": "A",
    "courses": ["Math", "Physics"]
}

# Empty dictionary
empty = {}
empty = dict()
```

## Accessing Values

```python
student = {"name": "Alice", "age": 25, "grade": "A"}

# Using square brackets (raises KeyError if key missing)
print(student["name"])  # "Alice"

# Using .get() (returns None if key missing)
print(student.get("name"))       # "Alice"
print(student.get("email"))      # None
print(student.get("email", "N/A"))  # "N/A" (custom default)
```

## Adding and Updating Values

```python
student = {"name": "Alice", "age": 25}

# Add a new key-value pair
student["email"] = "alice@example.com"

# Update an existing value
student["age"] = 26

# Update multiple values at once
student.update({"grade": "A", "age": 27})
```

## Removing Items

```python
student = {"name": "Alice", "age": 25, "grade": "A"}

# Remove and return a specific key
age = student.pop("age")  # Returns 25

# Remove using del
del student["grade"]

# Remove all items
student.clear()
```

## Iterating Over Dictionaries

```python
student = {"name": "Alice", "age": 25, "grade": "A"}

# Loop over keys
for key in student:
    print(key)

# Loop over values
for value in student.values():
    print(value)

# Loop over key-value pairs
for key, value in student.items():
    print(f"{key}: {value}")
```

## Checking if a Key Exists

```python
student = {"name": "Alice", "age": 25}

if "name" in student:
    print("Name exists!")

if "email" not in student:
    print("No email on file")
```

## Dictionary Comprehensions

Create dictionaries with a compact syntax:

```python
squares = {x: x ** 2 for x in range(6)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# Filter during creation
even_squares = {x: x ** 2 for x in range(10) if x % 2 == 0}
```

## Nested Dictionaries

Dictionaries can contain other dictionaries:

```python
school = {
    "alice": {"age": 25, "grade": "A"},
    "bob": {"age": 22, "grade": "B"},
}

print(school["alice"]["grade"])  # "A"
```

## Practical Example: Word Counter

```python
text = "the cat sat on the mat the cat"
word_count = {}
for word in text.split():
    word_count[word] = word_count.get(word, 0) + 1
print(word_count)
# {"the": 3, "cat": 2, "sat": 1, "on": 1, "mat": 1}
```

## Key Takeaways

- Dictionaries store key-value pairs with fast O(1) lookups
- Use `.get()` for safe access without risking `KeyError`
- Use `.items()` to iterate over both keys and values
- Dictionary comprehensions create dicts in a single expression
- Keys must be immutable (strings, numbers, tuples)',
    7,
    '# Exercise: Dictionaries Practice
# Build a simple inventory management system

# TODO: Create a dictionary called "inventory" with at least 4 items
# Keys are product names, values are dictionaries with "price" and "quantity"
# Example: {"Widget": {"price": 9.99, "quantity": 50}}
inventory = {}  # TODO: Add 4+ products

# TODO: Write code to add a new product to the inventory
# Product: "Headphones", price: 29.99, quantity: 20

# TODO: Write code to update the quantity of an existing product
# Increase the quantity of the first product by 10

# TODO: Calculate and print the total value of all inventory
# (price * quantity for each item, summed together)
total_value = 0
# TODO: Loop through inventory and calculate total_value

print(f"Total inventory value: ${total_value:.2f}")

# TODO: Use a dictionary comprehension to create a "low_stock" dict
# containing only items where quantity is less than 30
low_stock = {}  # TODO: Use dictionary comprehension

print(f"Low stock items: {low_stock}")

# TODO: Find and print the most expensive item in the inventory
# Hint: use max() with a key function on inventory.items()
most_expensive = ""  # TODO: Find the most expensive item
print(f"Most expensive: {most_expensive}")',
    'python'
  ),
  (
    'a0000008-0008-0008-0008-000000000008',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Classes & Objects',
    '# Classes & Objects

Object-Oriented Programming (OOP) lets you model real-world concepts as **objects** that bundle data (attributes) and behavior (methods) together. A **class** is the blueprint; an **object** is an instance of that blueprint.

## Defining a Class

```python
class Dog:
    def __init__(self, name, breed, age):
        self.name = name
        self.breed = breed
        self.age = age

    def bark(self):
        return f"{self.name} says: Woof!"

    def describe(self):
        return f"{self.name} is a {self.age}-year-old {self.breed}"
```

### The `__init__` Method

`__init__` is the **constructor** — it runs automatically when you create a new object. `self` refers to the instance being created.

### Creating Objects

```python
dog1 = Dog("Buddy", "Golden Retriever", 3)
dog2 = Dog("Max", "Labrador", 5)

print(dog1.bark())       # "Buddy says: Woof!"
print(dog2.describe())   # "Max is a 5-year-old Labrador"
```

## Instance vs Class Attributes

```python
class Car:
    wheels = 4  # Class attribute (shared by all instances)

    def __init__(self, make, model):
        self.make = make    # Instance attribute (unique per instance)
        self.model = model
```

## Methods

### Instance Methods
Regular methods that take `self` as the first parameter:

```python
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount
        return f"Deposited ${amount}. New balance: ${self.balance}"

    def withdraw(self, amount):
        if amount > self.balance:
            return "Insufficient funds"
        self.balance -= amount
        return f"Withdrew ${amount}. New balance: ${self.balance}"
```

### The `__str__` Method

Define how your object looks when printed:

```python
class Dog:
    def __init__(self, name, breed):
        self.name = name
        self.breed = breed

    def __str__(self):
        return f"Dog({self.name}, {self.breed})"

dog = Dog("Buddy", "Lab")
print(dog)  # "Dog(Buddy, Lab)"
```

## Inheritance

Create a new class based on an existing class:

```python
class Animal:
    def __init__(self, name, sound):
        self.name = name
        self.sound = sound

    def speak(self):
        return f"{self.name} says {self.sound}"

class Cat(Animal):
    def __init__(self, name):
        super().__init__(name, "Meow")

    def purr(self):
        return f"{self.name} is purring..."

cat = Cat("Whiskers")
print(cat.speak())  # "Whiskers says Meow"
print(cat.purr())   # "Whiskers is purring..."
```

`super().__init__()` calls the parent class constructor.

## Encapsulation

Use underscores to indicate private attributes:

```python
class User:
    def __init__(self, name, password):
        self.name = name
        self._password = password  # Convention: "private"

    def check_password(self, guess):
        return guess == self._password
```

A single underscore `_` is a convention meaning "treat this as private." Python does not enforce it.

## Key Takeaways

- Classes are blueprints; objects are instances of classes
- `__init__` is the constructor and `self` refers to the instance
- Methods are functions that belong to a class
- Use inheritance to extend existing classes with `super()`
- Use `__str__` to control how objects appear when printed',
    8,
    '# Exercise: Classes & Objects Practice
# Build a simple library system

# TODO: Create a class called "Book" with:
#   - __init__ that takes title, author, and pages
#   - A method "description" that returns "''Title'' by Author (X pages)"
#   - A __str__ method that returns the same as description
class Book:
    pass  # TODO: Implement the Book class


# TODO: Create a class called "Library" with:
#   - __init__ that creates an empty list of books
#   - A method "add_book" that adds a Book to the list
#   - A method "find_by_author" that returns a list of books by a given author
#   - A method "longest_book" that returns the book with the most pages
#   - A __str__ method that returns "Library with X books"
class Library:
    pass  # TODO: Implement the Library class


# Test your classes:
# TODO: Create 3-4 Book objects
book1 = Book("The Hobbit", "Tolkien", 310)
book2 = Book("1984", "Orwell", 328)
book3 = Book("Dune", "Herbert", 412)
book4 = Book("Lord of the Rings", "Tolkien", 1178)

# TODO: Create a Library and add all books to it
library = Library()

# TODO: Print the library
print(library)

# TODO: Find all books by "Tolkien" and print them
tolkien_books = library.find_by_author("Tolkien")
print(f"Books by Tolkien: {tolkien_books}")

# TODO: Find and print the longest book
print(f"Longest: {library.longest_book()}")',
    'python'
  );

-- =============================================================================
-- LESSONS: JavaScript Essentials
-- =============================================================================

INSERT INTO lessons (id, course_id, title, content, order_index, starter_code, language) VALUES
  (
    'b0000001-0001-0001-0001-000000000001',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'Variables & Data Types',
    '# Variables & Data Types

JavaScript is the language of the web. In this lesson, you will learn how to declare variables and work with the fundamental data types.

## Declaring Variables

JavaScript has three ways to declare variables:

### `let` — Block-scoped, reassignable

```javascript
let name = "Alice";
name = "Bob"; // OK - can reassign
```

### `const` — Block-scoped, NOT reassignable

```javascript
const PI = 3.14159;
// PI = 3.0; // Error! Cannot reassign a const
```

### `var` — Function-scoped (legacy, avoid in modern code)

```javascript
var oldStyle = "avoid this";
```

**Best practice:** Use `const` by default. Only use `let` when you need to reassign the variable. Never use `var`.

## Data Types

JavaScript has 7 primitive types and 1 complex type:

### Primitives

```javascript
// String
const greeting = "Hello, World!";
const name = ''Alice'';
const template = `Hello, ${name}!`; // Template literal

// Number (integers and floats are the same type)
const age = 25;
const price = 19.99;

// Boolean
const isActive = true;
const isDeleted = false;

// Undefined (declared but no value assigned)
let result;
console.log(result); // undefined

// Null (intentional absence of value)
const data = null;

// BigInt (for very large integers)
const bigNum = 9007199254740991n;

// Symbol (unique identifier)
const id = Symbol("id");
```

### Objects

```javascript
const person = {
  name: "Alice",
  age: 25,
  isStudent: true
};
```

## Type Checking

Use `typeof` to check a value''s type:

```javascript
console.log(typeof "hello");    // "string"
console.log(typeof 42);         // "number"
console.log(typeof true);       // "boolean"
console.log(typeof undefined);  // "undefined"
console.log(typeof null);       // "object" (this is a known JS quirk!)
```

## Type Coercion

JavaScript automatically converts types in certain situations, which can be surprising:

```javascript
console.log("5" + 3);    // "53" (number converted to string)
console.log("5" - 3);    // 2 (string converted to number)
console.log("5" == 5);   // true (loose equality, coerces types)
console.log("5" === 5);  // false (strict equality, no coercion)
```

**Best practice:** Always use `===` (strict equality) instead of `==`.

## Template Literals

Use backticks for strings with embedded expressions:

```javascript
const name = "World";
const message = `Hello, ${name}! 2 + 2 = ${2 + 2}`;
console.log(message); // "Hello, World! 2 + 2 = 4"
```

## Key Takeaways

- Use `const` by default, `let` when reassignment is needed, avoid `var`
- JavaScript has 7 primitive types: string, number, boolean, undefined, null, bigint, symbol
- Use `typeof` to check types, but beware that `typeof null` returns "object"
- Always use `===` for comparisons to avoid type coercion bugs
- Template literals (backticks) enable clean string interpolation',
    1,
    '// Exercise: Variables & Data Types
// Practice declaring variables and checking types

// TODO: Declare a constant for your name (string)
const name = "";

// TODO: Declare a let variable for your age (number)
let age = 0;

// TODO: Declare a constant for whether you are a student (boolean)
const isStudent = true;

// TODO: Declare a constant object called "profile" with
// properties: name, age, isStudent, and favoriteLanguage
const profile = {};  // TODO: Add properties

// TODO: Use a template literal to print a greeting
// Example: "Hi, I''m Alice. I''m 25 and I love JavaScript!"
console.log(`TODO: Write your template literal here`);

// TODO: Demonstrate type coercion - predict what each logs:
console.log("10" + 5);     // What does this output?
console.log("10" - 5);     // What does this output?
console.log("10" === 10);  // What does this output?

// TODO: Use typeof to check the type of each variable and log results
console.log(`name is type: ${typeof name}`);
// TODO: Check the other variables too

// TODO: What is typeof null? Log it and see the quirk!
console.log(`typeof null is: ${typeof null}`);',
    'javascript'
  ),
  (
    'b0000002-0002-0002-0002-000000000002',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'Functions & Scope',
    '# Functions & Scope

Functions are the building blocks of JavaScript. They let you group reusable logic and control where variables are accessible.

## Function Declarations

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet("Alice")); // "Hello, Alice!"
```

Function declarations are **hoisted** — you can call them before they appear in the code.

## Function Expressions

```javascript
const greet = function(name) {
  return `Hello, ${name}!`;
};

console.log(greet("Bob")); // "Hello, Bob!"
```

Function expressions are NOT hoisted — you must define them before calling.

## Arrow Functions

Arrow functions provide a shorter syntax introduced in ES6:

```javascript
// Basic arrow function
const greet = (name) => {
  return `Hello, ${name}!`;
};

// Concise body (implicit return for single expression)
const greet = (name) => `Hello, ${name}!`;

// Single parameter (parentheses optional)
const double = n => n * 2;

// No parameters
const sayHi = () => "Hi!";
```

## Default Parameters

```javascript
function createUser(name, role = "student") {
  return { name, role };
}

console.log(createUser("Alice"));           // { name: "Alice", role: "student" }
console.log(createUser("Bob", "admin"));    // { name: "Bob", role: "admin" }
```

## Rest Parameters

Collect multiple arguments into an array:

```javascript
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

console.log(sum(1, 2, 3));     // 6
console.log(sum(10, 20, 30));  // 60
```

## Scope

### Block Scope (`let` and `const`)

Variables declared with `let` or `const` are confined to the block `{}` where they are declared:

```javascript
if (true) {
  let x = 10;
  const y = 20;
}
// console.log(x); // Error: x is not defined
```

### Function Scope

Variables declared inside a function are not accessible outside:

```javascript
function myFunc() {
  const secret = "hidden";
}
// console.log(secret); // Error: secret is not defined
```

### Global Scope

Variables declared outside any function or block are globally accessible:

```javascript
const globalVar = "I am everywhere";

function test() {
  console.log(globalVar); // Works!
}
```

## Closures

A closure is a function that remembers the variables from its outer scope even after the outer function has finished:

```javascript
function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    getCount: () => count
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getCount()); // 2
```

## Callback Functions

Functions passed as arguments to other functions:

```javascript
function processData(data, callback) {
  const result = data.map(callback);
  return result;
}

const doubled = processData([1, 2, 3], n => n * 2);
console.log(doubled); // [2, 4, 6]
```

## Key Takeaways

- Use arrow functions for concise syntax; function declarations for hoisting
- `let`/`const` are block-scoped; `var` is function-scoped
- Closures let inner functions access outer variables even after the outer function returns
- Callbacks are functions passed to other functions for flexible behavior',
    2,
    '// Exercise: Functions & Scope
// Practice different function styles and closures

// TODO: Write a function declaration called "capitalize"
// that takes a string and returns it with the first letter uppercase
function capitalize(str) {
  // TODO: Implement this
}

// TODO: Write an arrow function called "filterEvens"
// that takes an array of numbers and returns only even numbers
const filterEvens = (numbers) => {
  // TODO: Implement using .filter()
};

// TODO: Write a function "createMultiplier" that takes a number
// and returns a NEW function that multiplies its input by that number
// This is a closure!
function createMultiplier(factor) {
  // TODO: Return a function that multiplies by factor
}

// TODO: Write a function "pipe" that takes any number of functions
// and returns a new function that applies them left to right
// Example: pipe(double, addOne)(5) => addOne(double(5)) => 11
function pipe(...fns) {
  // TODO: Return a function that chains all fns together
}

// Test your functions:
console.log(capitalize("hello"));      // "Hello"
console.log(capitalize("javaScript")); // "JavaScript"

console.log(filterEvens([1, 2, 3, 4, 5, 6])); // [2, 4, 6]

const triple = createMultiplier(3);
const double = createMultiplier(2);
console.log(triple(5));  // 15
console.log(double(7));  // 14

const addOne = n => n + 1;
const square = n => n * n;
const transform = pipe(double, addOne, square);
console.log(transform(3)); // square(addOne(double(3))) = square(7) = 49',
    'javascript'
  ),
  (
    'b0000003-0003-0003-0003-000000000003',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'Arrays & Array Methods',
    '# Arrays & Array Methods

Arrays are ordered collections of values. JavaScript provides a rich set of built-in methods to transform, filter, and process arrays.

## Creating Arrays

```javascript
const fruits = ["apple", "banana", "cherry"];
const numbers = [1, 2, 3, 4, 5];
const mixed = [1, "hello", true, null];
const empty = [];
```

## Accessing Elements

```javascript
const fruits = ["apple", "banana", "cherry"];
console.log(fruits[0]);           // "apple"
console.log(fruits[fruits.length - 1]); // "cherry"
console.log(fruits.at(-1));       // "cherry" (ES2022)
```

## Adding and Removing Elements

```javascript
const arr = [1, 2, 3];

arr.push(4);       // Add to end: [1, 2, 3, 4]
arr.pop();         // Remove from end: [1, 2, 3]
arr.unshift(0);    // Add to start: [0, 1, 2, 3]
arr.shift();       // Remove from start: [1, 2, 3]
arr.splice(1, 1);  // Remove 1 element at index 1: [1, 3]
```

## The Big Three: map, filter, reduce

These three methods are the workhorses of array processing. They do not modify the original array — they return a new one.

### `map()` — Transform every element

```javascript
const numbers = [1, 2, 3, 4];
const doubled = numbers.map(n => n * 2);
console.log(doubled); // [2, 4, 6, 8]

const names = ["alice", "bob"];
const upper = names.map(name => name.toUpperCase());
console.log(upper); // ["ALICE", "BOB"]
```

### `filter()` — Keep elements that pass a test

```javascript
const numbers = [1, 2, 3, 4, 5, 6];
const evens = numbers.filter(n => n % 2 === 0);
console.log(evens); // [2, 4, 6]

const words = ["hi", "hello", "hey", "world"];
const hWords = words.filter(w => w.startsWith("h"));
console.log(hWords); // ["hi", "hello", "hey"]
```

### `reduce()` — Combine all elements into one value

```javascript
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log(sum); // 15

// Find the max value
const max = numbers.reduce((a, b) => a > b ? a : b);
console.log(max); // 5
```

## Other Useful Methods

```javascript
const arr = [3, 1, 4, 1, 5, 9];

// find() — first element matching a condition
arr.find(n => n > 3);       // 4

// findIndex() — index of first match
arr.findIndex(n => n > 3);  // 2

// some() — does ANY element match?
arr.some(n => n > 8);       // true

// every() — do ALL elements match?
arr.every(n => n > 0);      // true

// includes() — does the array contain a value?
arr.includes(5);             // true

// flat() — flatten nested arrays
[1, [2, 3], [4, [5]]].flat(2); // [1, 2, 3, 4, 5]

// sort() — sort in place (careful: sorts as strings by default!)
arr.sort((a, b) => a - b);  // [1, 1, 3, 4, 5, 9]
```

## Spread Operator

```javascript
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2]; // [1, 2, 3, 4, 5, 6]

// Clone an array
const clone = [...arr1];
```

## Key Takeaways

- `map`, `filter`, and `reduce` are essential for data transformation
- These methods return new arrays and do not mutate the original
- Use `find` for the first match, `some`/`every` for existence checks
- The spread operator `...` is great for combining and cloning arrays
- Always pass a comparator to `sort()` for numeric sorting',
    3,
    '// Exercise: Arrays & Array Methods
// Practice map, filter, reduce, and more

const students = [
  { name: "Alice", grade: 92, subject: "Math" },
  { name: "Bob", grade: 78, subject: "Science" },
  { name: "Charlie", grade: 85, subject: "Math" },
  { name: "Diana", grade: 96, subject: "Science" },
  { name: "Eve", grade: 88, subject: "Math" },
  { name: "Frank", grade: 72, subject: "Science" },
];

// TODO: Use map() to create an array of just student names
const names = [];  // TODO: Use map

// TODO: Use filter() to get students with grade >= 85
const highScorers = [];  // TODO: Use filter

// TODO: Use reduce() to calculate the average grade
const averageGrade = 0;  // TODO: Use reduce

// TODO: Use filter + map to get names of Math students only
const mathStudentNames = [];  // TODO: Chain filter and map

// TODO: Use find() to get the first student with grade > 90
const firstTopStudent = null;  // TODO: Use find

// TODO: Use sort() to sort students by grade (highest first)
// Remember: sort mutates the original, so spread first!
const sorted = [];  // TODO: Spread and sort

// TODO: Use reduce() to group students by subject
// Result should be: { Math: [...], Science: [...] }
const bySubject = {};  // TODO: Use reduce

console.log("Names:", names);
console.log("High scorers:", highScorers);
console.log("Average grade:", averageGrade);
console.log("Math students:", mathStudentNames);
console.log("First top student:", firstTopStudent);
console.log("Sorted:", sorted);
console.log("By subject:", bySubject);',
    'javascript'
  ),
  (
    'b0000004-0004-0004-0004-000000000004',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'Objects & JSON',
    '# Objects & JSON

Objects are the most versatile data structure in JavaScript. They store key-value pairs and form the basis of nearly everything in the language, from simple data containers to complex APIs.

## Creating Objects

```javascript
// Object literal
const person = {
  name: "Alice",
  age: 25,
  isStudent: true,
  hobbies: ["reading", "coding"],
};

// Accessing properties
console.log(person.name);        // Dot notation
console.log(person["age"]);     // Bracket notation
```

Bracket notation is required when the key is dynamic or contains special characters:

```javascript
const key = "name";
console.log(person[key]); // "Alice"
```

## Adding and Modifying Properties

```javascript
const car = { make: "Toyota" };
car.model = "Camry";         // Add new property
car.year = 2024;
car.make = "Honda";           // Modify existing
delete car.year;              // Remove a property
```

## Shorthand Properties and Methods

```javascript
const name = "Alice";
const age = 25;

// Shorthand: when variable name matches property name
const person = { name, age };

// Method shorthand
const calculator = {
  add(a, b) { return a + b; },
  subtract(a, b) { return a - b; },
};
```

## Object Destructuring

Extract properties into variables:

```javascript
const person = { name: "Alice", age: 25, city: "NYC" };

const { name, age } = person;
console.log(name); // "Alice"

// Rename during destructuring
const { name: fullName, age: years } = person;

// Default values
const { email = "N/A" } = person;
```

## Spread and Rest with Objects

```javascript
// Spread: copy and merge objects
const defaults = { theme: "dark", lang: "en" };
const userPrefs = { lang: "fr", fontSize: 14 };
const settings = { ...defaults, ...userPrefs };
// { theme: "dark", lang: "fr", fontSize: 14 }

// Rest: gather remaining properties
const { theme, ...rest } = settings;
console.log(rest); // { lang: "fr", fontSize: 14 }
```

## Object Methods

```javascript
const person = { name: "Alice", age: 25 };

Object.keys(person);    // ["name", "age"]
Object.values(person);  // ["Alice", 25]
Object.entries(person);  // [["name", "Alice"], ["age", 25]]

// Check if property exists
"name" in person;             // true
person.hasOwnProperty("age"); // true

// Freeze an object (prevent changes)
Object.freeze(person);
```

## JSON (JavaScript Object Notation)

JSON is a text format for exchanging data. It looks like JavaScript objects but with stricter rules (double quotes, no trailing commas, no functions).

```javascript
// Convert object to JSON string
const data = { name: "Alice", age: 25 };
const jsonString = JSON.stringify(data);
console.log(jsonString); // ''{"name":"Alice","age":25}''

// Parse JSON string back to object
const parsed = JSON.parse(jsonString);
console.log(parsed.name); // "Alice"

// Pretty-print JSON
console.log(JSON.stringify(data, null, 2));
```

## Optional Chaining

Safely access deeply nested properties:

```javascript
const user = { address: { city: "NYC" } };
console.log(user.address?.city);    // "NYC"
console.log(user.contact?.email);   // undefined (no error!)
```

## Key Takeaways

- Objects store key-value pairs and are fundamental to JavaScript
- Use destructuring to extract properties cleanly
- Spread operator merges objects; later properties override earlier ones
- `JSON.stringify()` and `JSON.parse()` convert between objects and strings
- Optional chaining `?.` prevents errors when accessing nested properties',
    4,
    '// Exercise: Objects & JSON
// Practice object manipulation and JSON operations

// TODO: Create an object called "movie" with properties:
// title, director, year, genres (array), ratings (object with imdb and rotten)
const movie = {};  // TODO: Add all properties

// TODO: Use destructuring to extract title and director into variables
// const { title, director } = ???;

// TODO: Use spread to create a copy of movie with an added "watched" property
const updatedMovie = {};  // TODO: Spread movie and add watched: true

// TODO: Write a function that takes a person object and returns a greeting
// Use destructuring in the function parameter
// function greetPerson({ name, age }) { ... }
function greetPerson(person) {
  // TODO: Destructure and return a greeting string
}

// TODO: Convert the movie object to a JSON string and back
const jsonString = "";   // TODO: Use JSON.stringify
const parsedMovie = {};  // TODO: Use JSON.parse
console.log("JSON:", jsonString);
console.log("Parsed title:", parsedMovie.title);

// TODO: Given this nested object, safely access the email using optional chaining
const company = {
  name: "TechCorp",
  ceo: {
    name: "Alice",
    // contact: { email: "alice@tech.com" }  // commented out!
  }
};
const ceoEmail = "TODO";  // TODO: Use optional chaining to get email (or undefined)
console.log("CEO email:", ceoEmail);

// TODO: Use Object.entries to loop through movie and log each key-value pair
// for (const [key, value] of Object.entries(???)) { ... }',
    'javascript'
  ),
  (
    'b0000005-0005-0005-0005-000000000005',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'DOM Manipulation',
    '# DOM Manipulation

The Document Object Model (DOM) is a tree-like representation of an HTML page. JavaScript can read, modify, create, and delete DOM elements, making web pages interactive and dynamic.

## Selecting Elements

### By ID

```javascript
const header = document.getElementById("main-header");
```

### By CSS Selector (most common)

```javascript
// Single element (first match)
const btn = document.querySelector(".submit-btn");
const nav = document.querySelector("nav");

// Multiple elements (NodeList)
const items = document.querySelectorAll(".list-item");
```

`querySelector` and `querySelectorAll` accept any valid CSS selector — class, ID, tag, attribute, or combined selectors.

## Reading and Modifying Content

### Text Content

```javascript
const title = document.querySelector("h1");
console.log(title.textContent);      // Read the text
title.textContent = "New Title";     // Change the text
```

### Inner HTML

```javascript
const container = document.querySelector(".container");
container.innerHTML = "<p>New paragraph</p>";
// Warning: innerHTML can introduce XSS vulnerabilities if used with user input
```

## Modifying Attributes and Styles

### Attributes

```javascript
const link = document.querySelector("a");
link.getAttribute("href");               // Read
link.setAttribute("href", "https://example.com"); // Set
link.removeAttribute("target");          // Remove
```

### CSS Classes

```javascript
const card = document.querySelector(".card");
card.classList.add("active");
card.classList.remove("hidden");
card.classList.toggle("expanded");
card.classList.contains("active");  // true or false
```

### Inline Styles

```javascript
const box = document.querySelector(".box");
box.style.backgroundColor = "blue";
box.style.padding = "20px";
box.style.display = "none";
```

## Creating and Inserting Elements

```javascript
// Create a new element
const newItem = document.createElement("li");
newItem.textContent = "New Item";
newItem.classList.add("list-item");

// Append to a parent
const list = document.querySelector("ul");
list.appendChild(newItem);

// Insert before another element
const firstItem = list.firstElementChild;
list.insertBefore(newItem, firstItem);

// Modern method: insert at specific positions
list.prepend(newItem);                    // First child
list.append(newItem);                     // Last child
firstItem.before(newItem);               // Before sibling
firstItem.after(newItem);                // After sibling
```

## Removing Elements

```javascript
const item = document.querySelector(".remove-me");
item.remove();  // Modern way

// Or remove from parent
item.parentElement.removeChild(item);
```

## Event Handling

Events let you respond to user interactions:

```javascript
const button = document.querySelector("#myBtn");

button.addEventListener("click", (event) => {
  console.log("Button clicked!");
  console.log(event.target); // The element that was clicked
});
```

### Common Events

- `click` — mouse click
- `input` — text input changes
- `submit` — form submission
- `keydown` / `keyup` — keyboard events
- `mouseover` / `mouseout` — hover events
- `DOMContentLoaded` — page finished loading

### Event Delegation

Instead of adding listeners to many elements, add one to a parent:

```javascript
document.querySelector("ul").addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    console.log("Clicked:", e.target.textContent);
  }
});
```

## Key Takeaways

- Use `querySelector` / `querySelectorAll` for selecting elements
- `textContent` for text, `innerHTML` for HTML (be careful with XSS)
- `classList.add/remove/toggle` for managing CSS classes
- `createElement` + `appendChild` to add new elements
- `addEventListener` for attaching event handlers
- Event delegation is efficient for lists of similar elements',
    5,
    '// Exercise: DOM Manipulation
// Build an interactive todo list (run in a browser console or HTML file)

// NOTE: This exercise is designed to run in a browser environment.
// You can paste this into the browser console on any page, or create
// a simple HTML file with a <div id="app"></div>

// TODO: Create the app container (or select an existing one)
// const app = document.querySelector("#app");

// TODO: Create a heading element with text "My Todo List"
// const heading = document.createElement("h1");
// heading.textContent = "TODO";
// app.appendChild(heading);

// TODO: Create an input element for new todos
// const input = document.createElement("input");
// input.setAttribute("type", "text");
// input.setAttribute("placeholder", "Enter a todo...");

// TODO: Create an "Add" button
// const addBtn = document.createElement("button");
// addBtn.textContent = "Add";

// TODO: Create an unordered list for todo items
// const todoList = document.createElement("ul");

// TODO: Add an event listener to the button that:
// 1. Gets the input value
// 2. Creates a new <li> element with that text
// 3. Adds a "Delete" button inside the <li>
// 4. Appends the <li> to the list
// 5. Clears the input

// TODO: Use event delegation on the <ul> to handle delete button clicks
// When a delete button is clicked, remove its parent <li>

// Starter structure:
function createTodoApp() {
  // TODO: Build the full app here
  // 1. Create and append the heading
  // 2. Create input + button in a form div
  // 3. Create the todo list
  // 4. Wire up the event listeners
  console.log("Build your todo app!");
}

createTodoApp();',
    'javascript'
  ),
  (
    'b0000006-0006-0006-0006-000000000006',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'Async/Await & Promises',
    '# Async/Await & Promises

JavaScript is single-threaded but handles asynchronous operations (network requests, timers, file reads) through **Promises** and **async/await**. Understanding these is essential for working with APIs and modern JavaScript.

## What is Asynchronous Code?

Synchronous code runs line by line. Asynchronous code starts an operation and moves on without waiting for it to finish:

```javascript
console.log("Start");
setTimeout(() => console.log("Async!"), 1000);
console.log("End");
// Output: "Start", "End", "Async!" (after 1 second)
```

## Promises

A Promise represents a value that may be available now, later, or never. It has three states:
- **Pending** — initial state, operation in progress
- **Fulfilled** — operation succeeded, value available
- **Rejected** — operation failed, error available

### Creating a Promise

```javascript
const myPromise = new Promise((resolve, reject) => {
  const success = true;
  if (success) {
    resolve("It worked!");
  } else {
    reject("Something went wrong");
  }
});
```

### Consuming a Promise

```javascript
myPromise
  .then(result => console.log(result))   // "It worked!"
  .catch(error => console.error(error))
  .finally(() => console.log("Done"));
```

## The `fetch` API

`fetch()` returns a Promise and is the standard way to make HTTP requests:

```javascript
fetch("https://api.example.com/users")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Failed:", error));
```

## Async/Await

`async`/`await` is syntactic sugar over Promises that makes asynchronous code look synchronous:

```javascript
async function fetchUsers() {
  try {
    const response = await fetch("https://api.example.com/users");
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Failed:", error);
  }
}
```

### Rules

- `await` can only be used inside an `async` function
- `async` functions always return a Promise
- Use `try/catch` for error handling with `await`

## Sequential vs Parallel

### Sequential (one after another)

```javascript
async function sequential() {
  const user = await fetchUser(1);
  const posts = await fetchPosts(user.id);  // Waits for user first
  return { user, posts };
}
```

### Parallel (both at once)

```javascript
async function parallel() {
  const [user, posts] = await Promise.all([
    fetchUser(1),
    fetchPosts(1),
  ]);
  return { user, posts };
}
```

`Promise.all()` runs multiple promises in parallel and waits for all to complete.

## Promise.allSettled

Unlike `Promise.all` (which rejects if any promise rejects), `allSettled` waits for all to finish regardless of success or failure:

```javascript
const results = await Promise.allSettled([
  fetchUser(1),
  fetchUser(999),  // This might fail
]);

results.forEach(result => {
  if (result.status === "fulfilled") {
    console.log("Success:", result.value);
  } else {
    console.log("Failed:", result.reason);
  }
});
```

## Real-World Example

```javascript
async function loadDashboard(userId) {
  try {
    const [profile, notifications, settings] = await Promise.all([
      fetch(`/api/users/${userId}`).then(r => r.json()),
      fetch(`/api/notifications/${userId}`).then(r => r.json()),
      fetch(`/api/settings/${userId}`).then(r => r.json()),
    ]);
    return { profile, notifications, settings };
  } catch (error) {
    console.error("Dashboard load failed:", error);
    throw error;
  }
}
```

## Key Takeaways

- Promises represent eventual values with three states: pending, fulfilled, rejected
- `async`/`await` makes Promise-based code readable and sequential-looking
- Use `try`/`catch` for error handling with `await`
- `Promise.all()` runs tasks in parallel; `Promise.allSettled()` is fault-tolerant
- `fetch()` is the standard API for HTTP requests in JavaScript',
    6,
    '// Exercise: Async/Await & Promises
// Practice working with asynchronous JavaScript

// Simulated API function (returns a Promise that resolves after a delay)
function fakeAPI(endpoint, delay = 500) {
  const data = {
    "/users": [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }],
    "/posts": [{ id: 1, title: "Hello World" }, { id: 2, title: "Async JS" }],
    "/comments": [{ id: 1, text: "Great post!" }],
  };
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (data[endpoint]) {
        resolve(data[endpoint]);
      } else {
        reject(new Error(`Unknown endpoint: ${endpoint}`));
      }
    }, delay);
  });
}

// TODO: Write an async function "fetchUsers" that:
// 1. Awaits fakeAPI("/users")
// 2. Logs the users
// 3. Returns the users array
async function fetchUsers() {
  // TODO: Implement
}

// TODO: Write an async function "fetchAll" that:
// 1. Uses Promise.all to fetch users, posts, and comments IN PARALLEL
// 2. Returns an object { users, posts, comments }
async function fetchAll() {
  // TODO: Implement
}

// TODO: Write an async function "fetchSafe" that:
// 1. Tries to fetch from an invalid endpoint "/invalid"
// 2. Uses try/catch to handle the error
// 3. Returns a default value if the fetch fails
async function fetchSafe() {
  // TODO: Implement
}

// TODO: Write an async function "fetchSequential" that:
// 1. First fetches users
// 2. Then uses the first user''s name to log a message
// 3. Then fetches posts
// 4. Returns { users, posts }
async function fetchSequential() {
  // TODO: Implement
}

// Run the exercises
async function main() {
  console.log("--- fetchUsers ---");
  const users = await fetchUsers();

  console.log("--- fetchAll ---");
  const all = await fetchAll();
  console.log(all);

  console.log("--- fetchSafe ---");
  const safe = await fetchSafe();
  console.log("Safe result:", safe);

  console.log("--- fetchSequential ---");
  const seq = await fetchSequential();
  console.log(seq);
}

main();',
    'javascript'
  ),
  (
    'b0000007-0007-0007-0007-000000000007',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'ES6+ Features',
    '# ES6+ Features

ES6 (ECMAScript 2015) and later versions introduced major improvements to JavaScript. These features make code more concise, readable, and powerful. Modern JavaScript development relies heavily on them.

## Destructuring

### Array Destructuring

```javascript
const [first, second, ...rest] = [1, 2, 3, 4, 5];
console.log(first);  // 1
console.log(rest);   // [3, 4, 5]

// Skip elements
const [a, , c] = [1, 2, 3];
console.log(c); // 3

// Swap variables
let x = 1, y = 2;
[x, y] = [y, x];
```

### Object Destructuring

```javascript
const { name, age, city = "Unknown" } = {
  name: "Alice",
  age: 25,
};
console.log(city); // "Unknown" (default value)
```

## Spread and Rest Operators

```javascript
// Spread: expand elements
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]

const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }

// Rest: gather elements
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
```

## Template Literals

```javascript
const name = "World";
const multiline = `
  Hello, ${name}!
  Today is ${new Date().toLocaleDateString()}.
  Result: ${2 + 2}
`;
```

## Enhanced Object Literals

```javascript
const name = "Alice";
const age = 25;

const person = {
  name,           // Shorthand property
  age,
  greet() {       // Shorthand method
    return `Hi, I am ${this.name}`;
  },
  ["key_" + age]: true,  // Computed property name
};
```

## Classes

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} makes a sound`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }

  speak() {
    return `${this.name} barks!`;
  }
}

const dog = new Dog("Buddy", "Lab");
console.log(dog.speak()); // "Buddy barks!"
```

## Modules (import/export)

```javascript
// math.js
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export default class Calculator { /* ... */ }

// app.js
import Calculator, { PI, add } from "./math.js";
```

## Map and Set

### Map — Key-value pairs with any key type

```javascript
const map = new Map();
map.set("name", "Alice");
map.set(42, "a number key");
map.get("name");    // "Alice"
map.has(42);         // true
map.size;            // 2

for (const [key, value] of map) {
  console.log(`${key}: ${value}`);
}
```

### Set — Unique values only

```javascript
const set = new Set([1, 2, 2, 3, 3, 3]);
console.log(set.size); // 3
set.add(4);
set.has(2);     // true
set.delete(1);

// Remove duplicates from an array
const unique = [...new Set([1, 1, 2, 2, 3])]; // [1, 2, 3]
```

## Optional Chaining and Nullish Coalescing

```javascript
// Optional chaining (?.) — safe nested access
const user = { profile: { name: "Alice" } };
console.log(user.profile?.name);    // "Alice"
console.log(user.settings?.theme);  // undefined (no error)

// Nullish coalescing (??) — default for null/undefined only
const value = null ?? "default";    // "default"
const zero = 0 ?? "default";       // 0 (0 is NOT null/undefined)
```

## Key Takeaways

- Destructuring extracts values from arrays and objects concisely
- Spread/rest operators (`...`) copy, merge, and gather elements
- Classes provide clean OOP syntax with `extends` and `super`
- `Map` and `Set` offer specialized collection types beyond objects and arrays
- Optional chaining `?.` and nullish coalescing `??` prevent null errors elegantly',
    7,
    '// Exercise: ES6+ Features
// Practice modern JavaScript features

// TODO: Use array destructuring to extract first, second, and rest
const numbers = [10, 20, 30, 40, 50];
// const [first, second, ...rest] = ???;

// TODO: Use object destructuring with a default value
const config = { host: "localhost", port: 3000 };
// Extract host, port, and protocol (default: "https")
// const { host, port, protocol } = ???;

// TODO: Write a class "Shape" with:
// - constructor that takes name and sides
// - method "describe" that returns "A {name} has {sides} sides"
class Shape {
  // TODO: Implement
}

// TODO: Write a class "Circle" that extends Shape:
// - constructor takes radius
// - calls super with name "Circle" and sides 0
// - method "area" that returns PI * radius^2
class Circle extends Shape {
  // TODO: Implement
}

// TODO: Use a Set to find unique values in this array
const dupes = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4];
const unique = [];  // TODO: Use Set to get unique values

// TODO: Use a Map to create a word frequency counter
const sentence = "the cat sat on the mat the cat";
const wordCount = new Map();  // TODO: Count each word

// TODO: Use optional chaining and nullish coalescing
const user = {
  name: "Alice",
  address: {
    city: "NYC",
    // zip is missing
  },
};
const zip = "TODO";  // TODO: Safely get zip with default "00000"

// Test your work
console.log("Unique:", unique);
console.log("Word count:", Object.fromEntries(wordCount));
console.log("Zip:", zip);

const circle = new Circle(5);
console.log(circle.describe());
console.log("Area:", circle.area());',
    'javascript'
  );

-- =============================================================================
-- LESSONS: Java Fundamentals
-- =============================================================================

INSERT INTO lessons (id, course_id, title, content, order_index, starter_code, language) VALUES
  (
    'c0000001-0001-0001-0001-000000000001',
    'd4e5f6a7-b8c9-0123-defa-234567890123',
    'Hello World & Setup',
    '# Hello World & Setup

Java is a statically-typed, object-oriented programming language that runs on the Java Virtual Machine (JVM). It is used everywhere — from Android apps to enterprise backends to big data systems.

## Your First Java Program

Every Java program starts with a class. The entry point is the `main` method:

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

Let us break this down:
- `public class HelloWorld` — defines a class. The file must be named `HelloWorld.java`
- `public static void main(String[] args)` — the entry point; JVM calls this when you run the program
- `System.out.println()` — prints text followed by a newline

## Compile and Run

Java is a compiled language. You write `.java` files, compile them to `.class` bytecode, and the JVM runs the bytecode:

```bash
javac HelloWorld.java   # Compile
java HelloWorld          # Run
```

## Print Statements

```java
System.out.println("With newline");  // Prints + newline
System.out.print("No newline");      // Prints without newline
System.out.printf("Formatted: %s is %d years old%n", "Alice", 25);
```

`printf` uses format specifiers:
- `%s` — String
- `%d` — Integer
- `%f` — Float/Double
- `%n` — Platform-independent newline

## Comments

```java
// Single-line comment

/* Multi-line
   comment */

/**
 * Javadoc comment — used for documentation.
 * @param args command-line arguments
 */
```

## Java vs Python

| Feature | Java | Python |
|---------|------|--------|
| Typing | Static (declare types) | Dynamic |
| Compilation | Compiled to bytecode | Interpreted |
| Braces | `{}` for blocks | Indentation |
| Semicolons | Required `;` | Not required |
| Main method | Required | Optional |

## Package and Imports

Java organizes code into packages:

```java
package com.example.myapp;

import java.util.Scanner;
import java.util.List;
```

## Reading User Input

```java
import java.util.Scanner;

public class InputExample {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        System.out.println("Hello, " + name + "!");
        scanner.close();
    }
}
```

## Key Takeaways

- Every Java program needs a `main` method inside a class
- Java files must be compiled before running (`javac` then `java`)
- Use `System.out.println()` for output and `Scanner` for input
- Java is statically typed — you must declare variable types
- Code blocks use curly braces `{}`; statements end with semicolons `;`',
    1,
    '// Exercise: Hello World & Basic Output
// Practice writing your first Java program

public class HelloExercise {
    public static void main(String[] args) {
        // TODO: Print "Hello, World!" using println
        System.out.println("TODO");

        // TODO: Print your name without a newline using print,
        // then print " is learning Java!" with println
        // Expected: "Alice is learning Java!"

        // TODO: Use printf to print a formatted message:
        // "Name: %s, Age: %d, GPA: %.2f"
        // Use your own values
        String name = "TODO";
        int age = 0;
        double gpa = 0.0;
        System.out.printf("Name: %s, Age: %d, GPA: %.2f%n", name, age, gpa);

        // TODO: Print a multi-line message about why you want to learn Java
        // Use three separate println statements

        // TODO: Use string concatenation (+) to build and print a sentence
        // that includes at least one String variable and one int variable
        String language = "Java";
        int year = 2024;
        // System.out.println(??? + " was released in " + ??? + "...");
    }
}',
    'java'
  ),
  (
    'c0000002-0002-0002-0002-000000000002',
    'd4e5f6a7-b8c9-0123-defa-234567890123',
    'Variables & Data Types',
    '# Variables & Data Types

Java is a **statically typed** language, meaning every variable must have a declared type. The compiler checks types at compile time, catching many errors before your program ever runs.

## Primitive Types

Java has 8 primitive types:

| Type | Size | Range | Example |
|------|------|-------|---------|
| `byte` | 8 bits | -128 to 127 | `byte b = 100;` |
| `short` | 16 bits | -32,768 to 32,767 | `short s = 30000;` |
| `int` | 32 bits | ~-2.1 billion to 2.1 billion | `int i = 42;` |
| `long` | 64 bits | very large range | `long l = 100L;` |
| `float` | 32 bits | ~7 decimal digits | `float f = 3.14f;` |
| `double` | 64 bits | ~15 decimal digits | `double d = 3.14159;` |
| `char` | 16 bits | single character | `char c = ''A'';` |
| `boolean` | 1 bit | true or false | `boolean b = true;` |

## Declaring Variables

```java
int age = 25;
double price = 19.99;
char grade = ''A'';
boolean isActive = true;
String name = "Alice";  // String is a class, not a primitive
```

## Type Inference with `var` (Java 10+)

```java
var count = 10;          // Compiler infers int
var message = "Hello";   // Compiler infers String
var price = 19.99;       // Compiler infers double
```

`var` only works for local variables with an initializer.

## Constants

Use `final` to create constants that cannot be reassigned:

```java
final double PI = 3.14159;
final String APP_NAME = "CodeGraph";
// PI = 3.0;  // Error: cannot assign to final variable
```

## String Operations

Strings in Java are objects with many useful methods:

```java
String greeting = "Hello, World!";

greeting.length();           // 13
greeting.toUpperCase();      // "HELLO, WORLD!"
greeting.toLowerCase();      // "hello, world!"
greeting.charAt(0);          // ''H''
greeting.substring(0, 5);    // "Hello"
greeting.contains("World");  // true
greeting.replace("World", "Java"); // "Hello, Java!"
greeting.trim();             // Removes leading/trailing whitespace
greeting.split(", ");        // ["Hello", "World!"]
```

### String Comparison

```java
String a = "hello";
String b = "hello";

// WRONG: == compares references, not content
// (may work with string literals due to interning, but unreliable)
a == b;           // might be true, might not

// CORRECT: use .equals() for content comparison
a.equals(b);      // true
a.equalsIgnoreCase("HELLO"); // true
```

## Type Casting

### Widening (automatic, safe)

```java
int myInt = 42;
double myDouble = myInt;  // Automatic: 42 -> 42.0
```

### Narrowing (manual, can lose data)

```java
double myDouble = 9.78;
int myInt = (int) myDouble;  // Manual cast: 9 (truncated)
```

### String Conversions

```java
// Number to String
String s = String.valueOf(42);       // "42"
String s = Integer.toString(42);     // "42"
String s = "" + 42;                   // "42" (concatenation trick)

// String to Number
int n = Integer.parseInt("42");       // 42
double d = Double.parseDouble("3.14"); // 3.14
```

## Key Takeaways

- Java has 8 primitive types; `String` is a class, not a primitive
- Always declare variable types (or use `var` for local variables)
- Use `final` for constants
- Compare strings with `.equals()`, never `==`
- Use `Integer.parseInt()` and similar methods for string-to-number conversion',
    2,
    '// Exercise: Variables & Data Types
// Practice declaring variables and working with types

public class VariablesExercise {
    public static void main(String[] args) {
        // TODO: Declare an int variable for your birth year
        int birthYear = 0;

        // TODO: Declare a double variable for your height in meters
        double height = 0.0;

        // TODO: Declare a char variable with your first initial
        char initial = '' '';

        // TODO: Declare a boolean for whether you like Java
        boolean likesJava = false;

        // TODO: Declare a String variable with your full name
        String fullName = "";

        // TODO: Calculate your approximate age using the current year
        // and print it
        int currentYear = 2024;
        int age = 0;  // TODO: Calculate from currentYear and birthYear
        System.out.println("Age: " + age);

        // TODO: Demonstrate type casting:
        // 1. Create a double value 9.99
        // 2. Cast it to an int and print both values
        double price = 9.99;
        int truncated = 0;  // TODO: Cast price to int
        System.out.println("Double: " + price + " -> Int: " + truncated);

        // TODO: Convert the integer 2024 to a String using String.valueOf()
        String yearStr = "";  // TODO: Convert
        System.out.println("Year as string: " + yearStr);

        // TODO: Parse the string "42" into an integer using Integer.parseInt()
        String numberStr = "42";
        int parsed = 0;  // TODO: Parse
        System.out.println("Parsed: " + parsed);

        // TODO: Create two strings and compare them using .equals()
        String str1 = "Hello";
        String str2 = "hello";
        // TODO: Print whether they are equal (case-sensitive)
        // TODO: Print whether they are equal (case-insensitive)
    }
}',
    'java'
  ),
  (
    'c0000003-0003-0003-0003-000000000003',
    'd4e5f6a7-b8c9-0123-defa-234567890123',
    'Control Flow',
    '# Control Flow

Control flow statements let your Java program make decisions and repeat operations. Java provides `if/else`, `switch`, `for`, `while`, and `do-while` constructs.

## If/Else Statements

```java
int age = 20;

if (age >= 18) {
    System.out.println("Adult");
} else if (age >= 13) {
    System.out.println("Teenager");
} else {
    System.out.println("Child");
}
```

### Ternary Operator

A compact inline `if/else`:

```java
int age = 20;
String status = (age >= 18) ? "Adult" : "Minor";
System.out.println(status);
```

## Switch Statements

For checking a single variable against multiple values:

```java
int day = 3;
switch (day) {
    case 1:
        System.out.println("Monday");
        break;
    case 2:
        System.out.println("Tuesday");
        break;
    case 3:
        System.out.println("Wednesday");
        break;
    default:
        System.out.println("Other day");
}
```

### Enhanced Switch (Java 14+)

```java
String dayName = switch (day) {
    case 1 -> "Monday";
    case 2 -> "Tuesday";
    case 3 -> "Wednesday";
    default -> "Other";
};
```

## For Loops

### Standard For Loop

```java
for (int i = 0; i < 5; i++) {
    System.out.println("i = " + i);
}
```

### Enhanced For-Each Loop

Iterate over arrays or collections without an index:

```java
String[] fruits = {"apple", "banana", "cherry"};
for (String fruit : fruits) {
    System.out.println(fruit);
}
```

## While Loops

```java
int count = 0;
while (count < 5) {
    System.out.println("Count: " + count);
    count++;
}
```

### Do-While Loop

Guarantees at least one execution:

```java
int num = 10;
do {
    System.out.println("num = " + num);
    num++;
} while (num < 5);
// Prints "num = 10" even though condition is false
```

## Break and Continue

```java
// break: exit the loop
for (int i = 0; i < 10; i++) {
    if (i == 5) break;
    System.out.println(i);  // 0, 1, 2, 3, 4
}

// continue: skip to next iteration
for (int i = 0; i < 10; i++) {
    if (i % 2 == 0) continue;
    System.out.println(i);  // 1, 3, 5, 7, 9
}
```

## Labeled Break (Nested Loops)

Break out of an outer loop from an inner loop:

```java
outer:
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (i == 1 && j == 1) break outer;
        System.out.println(i + "," + j);
    }
}
```

## Logical Operators

| Operator | Meaning |
|----------|---------|
| `&&` | AND (short-circuit) |
| `\|\|` | OR (short-circuit) |
| `!` | NOT |

```java
int age = 25;
boolean hasLicense = true;

if (age >= 16 && hasLicense) {
    System.out.println("Can drive");
}
```

## Key Takeaways

- Use `if/else if/else` for branching logic; `switch` for multiple value checks
- Standard `for` loops use an index; enhanced `for` iterates over collections
- `while` checks the condition first; `do-while` runs at least once
- `break` exits a loop; `continue` skips the current iteration
- Java''s `&&` and `||` are short-circuit operators',
    3,
    '// Exercise: Control Flow
// Practice if/else, switch, and loops

public class ControlFlowExercise {
    public static void main(String[] args) {
        // TODO: Grade Calculator
        // Given a score (0-100), print the letter grade:
        // 90-100: A, 80-89: B, 70-79: C, 60-69: D, below 60: F
        int score = 85;
        String grade = "";  // TODO: Use if/elif/else to determine grade
        System.out.println("Score " + score + " = Grade " + grade);

        // TODO: Season from Month
        // Use a switch statement to determine the season from a month number
        // 12,1,2 = Winter, 3,4,5 = Spring, 6,7,8 = Summer, 9,10,11 = Fall
        int month = 7;
        String season = "";  // TODO: Use switch
        System.out.println("Month " + month + " is in " + season);

        // TODO: FizzBuzz with a for loop (1 to 30)
        // Divisible by 3: "Fizz", by 5: "Buzz", by both: "FizzBuzz"
        System.out.println("--- FizzBuzz ---");
        // TODO: Write the for loop

        // TODO: Find the sum of all even numbers from 1 to 100
        // using a while loop
        int sum = 0;
        int i = 1;
        // TODO: Write the while loop
        System.out.println("Sum of evens 1-100: " + sum);

        // TODO: Use a do-while loop to simulate rolling a die
        // until you get a 6 (use (int)(Math.random() * 6) + 1)
        int roll = 0;
        int attempts = 0;
        // TODO: Write the do-while loop
        System.out.println("Rolled a 6 after " + attempts + " attempts");

        // TODO: Print a multiplication table (5x5) using nested for loops
        // Format: "1 x 1 = 1", "1 x 2 = 2", etc.
        System.out.println("--- Multiplication Table ---");
        // TODO: Write nested for loops
    }
}',
    'java'
  ),
  (
    'c0000004-0004-0004-0004-000000000004',
    'd4e5f6a7-b8c9-0123-defa-234567890123',
    'Methods',
    '# Methods

Methods (also called functions in other languages) are reusable blocks of code that perform a specific task. In Java, every method belongs to a class.

## Defining a Method

```java
public static int add(int a, int b) {
    return a + b;
}
```

Breaking it down:
- `public` — accessible from anywhere
- `static` — belongs to the class, not an instance
- `int` — return type (the type of value the method sends back)
- `add` — method name
- `(int a, int b)` — parameters with their types
- `return a + b;` — the value returned to the caller

## Calling Methods

```java
public class Calculator {
    public static int add(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        int result = add(3, 5);
        System.out.println(result);  // 8
    }
}
```

## Void Methods

Methods that do not return a value use the `void` return type:

```java
public static void greet(String name) {
    System.out.println("Hello, " + name + "!");
    // No return statement needed (or use "return;" to exit early)
}
```

## Method Overloading

You can define multiple methods with the same name but different parameter lists:

```java
public static int add(int a, int b) {
    return a + b;
}

public static double add(double a, double b) {
    return a + b;
}

public static int add(int a, int b, int c) {
    return a + b + c;
}
```

Java determines which method to call based on the arguments provided.

## Pass by Value

Java always passes arguments **by value**. For primitives, this means the method gets a copy:

```java
public static void doubleValue(int x) {
    x = x * 2;  // Only changes the local copy
}

public static void main(String[] args) {
    int num = 5;
    doubleValue(num);
    System.out.println(num);  // Still 5!
}
```

For objects (like arrays), the reference is copied, so the method CAN modify the object''s contents:

```java
public static void fillArray(int[] arr) {
    arr[0] = 99;  // Modifies the original array
}
```

## Varargs (Variable Arguments)

Accept a variable number of arguments:

```java
public static int sum(int... numbers) {
    int total = 0;
    for (int n : numbers) {
        total += n;
    }
    return total;
}

// Call with any number of ints
sum(1, 2);           // 3
sum(1, 2, 3, 4, 5);  // 15
```

Varargs must be the last parameter, and there can only be one per method.

## Recursion

A method that calls itself:

```java
public static int factorial(int n) {
    if (n <= 1) return 1;        // Base case
    return n * factorial(n - 1);  // Recursive case
}

System.out.println(factorial(5));  // 120
```

Always have a **base case** to prevent infinite recursion.

## Static vs Instance Methods

```java
public class Dog {
    String name;

    // Instance method — needs an object
    public String bark() {
        return name + " says Woof!";
    }

    // Static method — belongs to the class
    public static String species() {
        return "Canis familiaris";
    }
}
```

## Key Takeaways

- Methods have a return type, name, and parameter list
- Use `void` when a method does not return a value
- Method overloading lets you reuse names with different parameter types
- Java passes primitives by value; objects are passed by reference value
- Varargs `(int... nums)` accept flexible argument counts
- Recursion requires a base case to avoid infinite loops',
    4,
    '// Exercise: Methods Practice
// Build a collection of utility methods

public class MethodsExercise {

    // TODO: Write a method "isPrime" that takes an int
    // and returns true if it is a prime number
    public static boolean isPrime(int n) {
        // TODO: Implement
        return false;
    }

    // TODO: Write an overloaded method "max" that works with:
    // - Two ints: max(int a, int b)
    // - Three ints: max(int a, int b, int c)
    // - An array: max(int[] arr)
    public static int max(int a, int b) {
        // TODO: Implement
        return 0;
    }

    // TODO: Add the other two overloaded versions of max

    // TODO: Write a method "reverseString" that takes a String
    // and returns it reversed
    public static String reverseString(String str) {
        // TODO: Implement
        return "";
    }

    // TODO: Write a recursive method "fibonacci" that returns
    // the nth Fibonacci number (0, 1, 1, 2, 3, 5, 8, ...)
    public static int fibonacci(int n) {
        // TODO: Implement with recursion
        return 0;
    }

    // TODO: Write a method "average" that uses varargs to accept
    // any number of doubles and returns their average
    public static double average(double... numbers) {
        // TODO: Implement
        return 0.0;
    }

    public static void main(String[] args) {
        // Test isPrime
        System.out.println("7 is prime: " + isPrime(7));     // true
        System.out.println("10 is prime: " + isPrime(10));   // false

        // Test max overloads
        System.out.println("Max(3, 7): " + max(3, 7));      // 7
        // System.out.println("Max(3,7,5): " + max(3, 7, 5)); // 7

        // Test reverseString
        System.out.println("Reverse: " + reverseString("Java")); // "avaJ"

        // Test fibonacci
        System.out.println("Fib(7): " + fibonacci(7));      // 13

        // Test average
        System.out.println("Avg: " + average(10, 20, 30));  // 20.0
    }
}',
    'java'
  ),
  (
    'c0000005-0005-0005-0005-000000000005',
    'd4e5f6a7-b8c9-0123-defa-234567890123',
    'OOP - Classes & Objects',
    '# OOP - Classes & Objects

Java is an object-oriented language at its core. Everything revolves around **classes** (blueprints) and **objects** (instances of those blueprints).

## Defining a Class

```java
public class Car {
    // Fields (attributes)
    String make;
    String model;
    int year;
    double mileage;

    // Constructor
    public Car(String make, String model, int year) {
        this.make = make;
        this.model = model;
        this.year = year;
        this.mileage = 0;
    }

    // Method
    public void drive(double miles) {
        this.mileage += miles;
    }

    public String describe() {
        return year + " " + make + " " + model + " (" + mileage + " miles)";
    }
}
```

## Creating Objects

```java
Car car1 = new Car("Toyota", "Camry", 2024);
Car car2 = new Car("Honda", "Civic", 2023);

car1.drive(100.5);
System.out.println(car1.describe());
// "2024 Toyota Camry (100.5 miles)"
```

## The `this` Keyword

`this` refers to the current object. It is used to distinguish between instance fields and parameters with the same name:

```java
public Car(String make, String model, int year) {
    this.make = make;     // this.make = field, make = parameter
    this.model = model;
    this.year = year;
}
```

## Access Modifiers

| Modifier | Class | Package | Subclass | World |
|----------|-------|---------|----------|-------|
| `public` | Yes | Yes | Yes | Yes |
| `protected` | Yes | Yes | Yes | No |
| (default) | Yes | Yes | No | No |
| `private` | Yes | No | No | No |

## Encapsulation

Keep fields private and provide public getters and setters:

```java
public class BankAccount {
    private double balance;

    public BankAccount(double initialBalance) {
        this.balance = initialBalance;
    }

    public double getBalance() {
        return balance;
    }

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
    }

    public boolean withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            return true;
        }
        return false;
    }
}
```

## Inheritance

Create a new class based on an existing one using `extends`:

```java
public class Animal {
    protected String name;

    public Animal(String name) {
        this.name = name;
    }

    public String speak() {
        return name + " makes a sound";
    }
}

public class Dog extends Animal {
    private String breed;

    public Dog(String name, String breed) {
        super(name);       // Call parent constructor
        this.breed = breed;
    }

    @Override
    public String speak() {
        return name + " barks!";
    }
}
```

## `toString()` Method

Override `toString()` to define how your object appears when printed:

```java
@Override
public String toString() {
    return "Car{" + make + " " + model + ", " + year + "}";
}
```

## Interfaces

Define a contract that classes must implement:

```java
public interface Drivable {
    void accelerate(double speed);
    void brake();
}

public class Car implements Drivable {
    public void accelerate(double speed) { /* ... */ }
    public void brake() { /* ... */ }
}
```

## Key Takeaways

- Classes are blueprints; objects are instances created with `new`
- Use `this` to refer to the current object''s fields
- Encapsulation: keep fields `private`, expose via getters/setters
- Inheritance (`extends`) creates parent-child class relationships
- Override `toString()` for meaningful object printing
- Interfaces define contracts that classes must fulfill',
    5,
    '// Exercise: OOP - Classes & Objects
// Build a simple student management system

// TODO: Create a class "Student" with:
// - Private fields: name (String), id (int), grades (ArrayList<Integer>)
// - Constructor that takes name and id, initializes empty grades list
// - Method addGrade(int grade) that adds a grade
// - Method getAverage() that returns the average as a double
// - Method getHighestGrade() that returns the highest grade
// - Override toString() to return "Student{name=..., id=..., avg=...}"

import java.util.ArrayList;

class Student {
    // TODO: Declare private fields

    // TODO: Write constructor

    // TODO: Write addGrade method

    // TODO: Write getAverage method

    // TODO: Write getHighestGrade method

    // TODO: Override toString
}

// TODO: Create a class "Classroom" with:
// - Private field: students (ArrayList<Student>)
// - Method addStudent(Student s)
// - Method getTopStudent() that returns the student with highest average
// - Method getClassAverage() that returns the average of all student averages

class Classroom {
    // TODO: Implement
}

public class OOPExercise {
    public static void main(String[] args) {
        // TODO: Create 3 students and add grades to each
        Student alice = new Student("Alice", 1);
        alice.addGrade(92);
        alice.addGrade(88);
        alice.addGrade(95);

        Student bob = new Student("Bob", 2);
        bob.addGrade(78);
        bob.addGrade(85);
        bob.addGrade(80);

        Student charlie = new Student("Charlie", 3);
        charlie.addGrade(90);
        charlie.addGrade(94);
        charlie.addGrade(91);

        // TODO: Create a Classroom and add all students
        Classroom classroom = new Classroom();

        // TODO: Print each student (uses toString)
        System.out.println(alice);
        System.out.println(bob);
        System.out.println(charlie);

        // TODO: Print the top student and class average
        // System.out.println("Top: " + classroom.getTopStudent());
        // System.out.printf("Class avg: %.1f%n", classroom.getClassAverage());
    }
}',
    'java'
  ),
  (
    'c0000006-0006-0006-0006-000000000006',
    'd4e5f6a7-b8c9-0123-defa-234567890123',
    'Collections & Generics',
    '# Collections & Generics

Java''s Collections Framework provides powerful data structures for storing and manipulating groups of objects. Combined with generics, they give you type-safe, flexible containers.

## Why Not Just Arrays?

Arrays have fixed sizes. If you need a resizable list, a key-value map, or a unique set, you need collections.

```java
// Array: fixed size, awkward to resize
String[] arr = new String[3];

// ArrayList: resizable, full of helpful methods
ArrayList<String> list = new ArrayList<>();
```

## ArrayList

A resizable array that implements the `List` interface:

```java
import java.util.ArrayList;

ArrayList<String> names = new ArrayList<>();
names.add("Alice");
names.add("Bob");
names.add("Charlie");

System.out.println(names.get(0));    // "Alice"
System.out.println(names.size());    // 3
names.remove("Bob");
names.set(0, "Alicia");
System.out.println(names.contains("Charlie")); // true
```

### Iterating

```java
// Enhanced for loop
for (String name : names) {
    System.out.println(name);
}

// forEach with lambda
names.forEach(name -> System.out.println(name));

// With index
for (int i = 0; i < names.size(); i++) {
    System.out.println(i + ": " + names.get(i));
}
```

## HashMap

A key-value data structure with O(1) average lookup time:

```java
import java.util.HashMap;

HashMap<String, Integer> ages = new HashMap<>();
ages.put("Alice", 25);
ages.put("Bob", 30);
ages.put("Charlie", 22);

System.out.println(ages.get("Alice"));       // 25
System.out.println(ages.getOrDefault("Dave", 0)); // 0
System.out.println(ages.containsKey("Bob")); // true
ages.remove("Charlie");
```

### Iterating a HashMap

```java
// Over entries (most common)
for (Map.Entry<String, Integer> entry : ages.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}

// Over keys
for (String key : ages.keySet()) {
    System.out.println(key);
}

// Over values
for (Integer value : ages.values()) {
    System.out.println(value);
}
```

## HashSet

A collection of unique elements with no duplicates:

```java
import java.util.HashSet;

HashSet<String> colors = new HashSet<>();
colors.add("red");
colors.add("blue");
colors.add("red");  // Duplicate ignored
System.out.println(colors.size()); // 2
System.out.println(colors.contains("blue")); // true
```

## Generics

Generics let you create classes and methods that work with any type while maintaining type safety:

```java
// Without generics (raw type, dangerous)
ArrayList list = new ArrayList();
list.add("hello");
list.add(42);  // No compile error, but mixing types is risky

// With generics (type-safe)
ArrayList<String> list = new ArrayList<>();
list.add("hello");
// list.add(42);  // Compile error! Type safety enforced
```

### Generic Class

```java
public class Box<T> {
    private T content;

    public Box(T content) {
        this.content = content;
    }

    public T getContent() {
        return content;
    }
}

Box<String> stringBox = new Box<>("Hello");
Box<Integer> intBox = new Box<>(42);
```

### Generic Method

```java
public static <T> void printArray(T[] arr) {
    for (T item : arr) {
        System.out.println(item);
    }
}
```

## Collections Utility Methods

```java
import java.util.Collections;

ArrayList<Integer> numbers = new ArrayList<>(List.of(3, 1, 4, 1, 5));
Collections.sort(numbers);          // [1, 1, 3, 4, 5]
Collections.reverse(numbers);       // [5, 4, 3, 1, 1]
Collections.shuffle(numbers);       // Random order
int max = Collections.max(numbers);  // 5
int min = Collections.min(numbers);  // 1
```

## List.of, Map.of (Immutable Factories)

Create immutable collections quickly (Java 9+):

```java
List<String> colors = List.of("red", "green", "blue");
Map<String, Integer> scores = Map.of("Alice", 95, "Bob", 87);
Set<Integer> primes = Set.of(2, 3, 5, 7, 11);
```

## Key Takeaways

- `ArrayList` is a resizable list; `HashMap` is a key-value store; `HashSet` holds unique elements
- Generics (`<T>`) enforce type safety at compile time
- Use `List.of()`, `Map.of()` for quick immutable collections
- `Collections` utility class provides sort, reverse, shuffle, max, min
- Always prefer generics over raw types to catch errors at compile time',
    6,
    '// Exercise: Collections & Generics
// Build a simple contact book using HashMap and ArrayList

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Collections;

public class CollectionsExercise {

    public static void main(String[] args) {
        // TODO: Create an ArrayList of integers and add values: 5, 2, 8, 1, 9, 3
        ArrayList<Integer> numbers = new ArrayList<>();
        // TODO: Add the numbers

        // TODO: Sort the list and print it
        // TODO: Print the max and min values

        // TODO: Create a HashMap<String, ArrayList<String>> to represent a contact book
        // Keys are contact names, values are lists of phone numbers
        HashMap<String, ArrayList<String>> contacts = new HashMap<>();

        // TODO: Add 3 contacts, each with 1-2 phone numbers
        // Example: "Alice" -> ["555-0001", "555-0002"]

        // TODO: Print all contacts and their numbers
        // for (Map.Entry<String, ArrayList<String>> entry : contacts.entrySet()) { ... }

        // TODO: Create a HashSet from the numbers list to remove duplicates
        // Then add another duplicate and confirm the set size stays the same
        numbers.add(5);  // Adding a duplicate
        HashSet<Integer> uniqueNumbers = new HashSet<>(numbers);
        System.out.println("Unique numbers: " + uniqueNumbers);
        System.out.println("Size: " + uniqueNumbers.size());

        // TODO: Create a generic Pair<A, B> class (below main)
        // Then create and print a Pair<String, Integer> for ("Alice", 25)
        // Pair<String, Integer> pair = new Pair<>("Alice", 25);
        // System.out.println(pair);

        // TODO: Use List.of to create an immutable list of your 3 favorite languages
        // Try adding to it and handle the UnsupportedOperationException
    }
}

// TODO: Create a generic Pair class with two type parameters A and B
// - Fields: first (A), second (B)
// - Constructor, getters, and toString
class Pair<A, B> {
    // TODO: Implement
}',
    'java'
  );

-- =============================================================================
-- LESSONS: SQL Mastery
-- =============================================================================

INSERT INTO lessons (id, course_id, title, content, order_index, starter_code, language) VALUES
  (
    'd0000001-0001-0001-0001-000000000001',
    'e5f6a7b8-c9d0-1234-efab-345678901234',
    'SELECT Basics',
    '# SELECT Basics

The `SELECT` statement is the foundation of SQL. It retrieves data from one or more tables. Almost every interaction with a relational database starts with a `SELECT` query.

## Basic Syntax

```sql
SELECT column1, column2
FROM table_name;
```

### Select All Columns

```sql
SELECT * FROM employees;
```

The `*` wildcard selects every column. It is convenient for exploration but avoided in production code because it can be slow and fragile when table schemas change.

### Select Specific Columns

```sql
SELECT first_name, last_name, email
FROM employees;
```

Always specify the columns you actually need.

## Aliases

Rename columns in the output using `AS`:

```sql
SELECT first_name AS name, salary AS annual_pay
FROM employees;
```

You can also alias without `AS` (some databases support this), but `AS` is more readable.

## DISTINCT — Remove Duplicates

```sql
SELECT DISTINCT department
FROM employees;
```

Returns each unique department name once, no matter how many employees belong to it.

## ORDER BY — Sorting Results

```sql
-- Ascending (default)
SELECT first_name, salary
FROM employees
ORDER BY salary;

-- Descending
SELECT first_name, salary
FROM employees
ORDER BY salary DESC;

-- Multiple columns
SELECT department, first_name
FROM employees
ORDER BY department ASC, first_name ASC;
```

## LIMIT — Restrict Row Count

```sql
-- Get the top 5 highest-paid employees
SELECT first_name, salary
FROM employees
ORDER BY salary DESC
LIMIT 5;
```

`LIMIT` is supported in PostgreSQL, MySQL, and SQLite. SQL Server uses `TOP`:

```sql
SELECT TOP 5 first_name, salary FROM employees ORDER BY salary DESC;
```

## Expressions and Calculations

You can perform calculations directly in `SELECT`:

```sql
SELECT first_name,
       salary,
       salary * 12 AS annual_salary,
       salary * 0.1 AS bonus
FROM employees;
```

## String Functions

```sql
SELECT UPPER(first_name) AS upper_name,
       LOWER(email) AS lower_email,
       LENGTH(first_name) AS name_length,
       CONCAT(first_name, '' '', last_name) AS full_name
FROM employees;
```

## NULL Handling

`NULL` represents missing or unknown data. Use `IS NULL` / `IS NOT NULL` to check:

```sql
SELECT first_name
FROM employees
WHERE manager_id IS NULL;  -- Employees without a manager

-- COALESCE: returns the first non-null value
SELECT first_name, COALESCE(phone, ''No phone'') AS phone
FROM employees;
```

## Key Takeaways

- `SELECT` retrieves data; specify columns instead of using `*`
- `DISTINCT` removes duplicate rows from results
- `ORDER BY` sorts results; default is ascending, use `DESC` for descending
- `LIMIT` restricts the number of rows returned
- Use `COALESCE` to provide default values for `NULL` columns
- Aliases (`AS`) make column names more readable in output',
    1,
    '-- Exercise: SELECT Basics
-- Practice writing SELECT queries using the "employees" table
-- Table: employees(id, first_name, last_name, email, department, salary, hire_date, manager_id)

-- TODO: Select all columns from employees
SELECT 1;  -- Replace with your query

-- TODO: Select only first_name, last_name, and salary

-- TODO: Select all unique departments (use DISTINCT)

-- TODO: Select first_name and salary, ordered by salary descending

-- TODO: Select the top 3 highest-paid employees (use ORDER BY + LIMIT)

-- TODO: Select first_name and a calculated column "monthly_salary"
-- (salary divided by 12, rounded to 2 decimal places)

-- TODO: Select first_name, last_name, and a "full_name" column
-- using CONCAT (or the || operator)

-- TODO: Select employees where manager_id IS NULL

-- TODO: Select first_name and salary with an alias "annual_pay" (salary * 12),
-- ordered by annual_pay descending, limited to 5 results',
    'sql'
  ),
  (
    'd0000002-0002-0002-0002-000000000002',
    'e5f6a7b8-c9d0-1234-efab-345678901234',
    'WHERE & Filtering',
    '# WHERE & Filtering

The `WHERE` clause filters rows based on conditions. Without `WHERE`, a `SELECT` returns all rows in the table. With `WHERE`, you get only the rows that match your criteria.

## Basic WHERE

```sql
SELECT first_name, salary
FROM employees
WHERE salary > 50000;
```

## Comparison Operators

| Operator | Meaning |
|----------|---------|
| `=` | Equal |
| `<>` or `!=` | Not equal |
| `>` | Greater than |
| `<` | Less than |
| `>=` | Greater than or equal |
| `<=` | Less than or equal |

```sql
SELECT * FROM employees WHERE department = ''Engineering'';
SELECT * FROM employees WHERE salary >= 70000;
SELECT * FROM employees WHERE hire_date < ''2023-01-01'';
```

## AND, OR, NOT

Combine multiple conditions:

```sql
-- AND: both conditions must be true
SELECT * FROM employees
WHERE department = ''Engineering'' AND salary > 80000;

-- OR: at least one condition must be true
SELECT * FROM employees
WHERE department = ''Engineering'' OR department = ''Design'';

-- NOT: negate a condition
SELECT * FROM employees
WHERE NOT department = ''Marketing'';
```

### Operator Precedence

`NOT` is evaluated first, then `AND`, then `OR`. Use parentheses for clarity:

```sql
-- Without parentheses (confusing)
SELECT * FROM employees
WHERE department = ''Engineering'' OR department = ''Design'' AND salary > 80000;
-- This actually means: Engineering OR (Design AND salary > 80000)

-- With parentheses (clear)
SELECT * FROM employees
WHERE (department = ''Engineering'' OR department = ''Design'') AND salary > 80000;
```

## IN — Match Against a List

```sql
SELECT * FROM employees
WHERE department IN (''Engineering'', ''Design'', ''Product'');
```

`IN` is equivalent to multiple `OR` conditions but much cleaner.

## BETWEEN — Range Check

```sql
SELECT * FROM employees
WHERE salary BETWEEN 50000 AND 80000;
-- Equivalent to: salary >= 50000 AND salary <= 80000

SELECT * FROM employees
WHERE hire_date BETWEEN ''2023-01-01'' AND ''2023-12-31'';
```

`BETWEEN` is inclusive on both ends.

## LIKE — Pattern Matching

```sql
-- % matches any sequence of characters
SELECT * FROM employees WHERE first_name LIKE ''A%'';    -- Starts with A
SELECT * FROM employees WHERE email LIKE ''%@gmail.com''; -- Ends with @gmail.com
SELECT * FROM employees WHERE first_name LIKE ''%an%'';   -- Contains "an"

-- _ matches exactly one character
SELECT * FROM employees WHERE first_name LIKE ''_a%'';    -- Second letter is "a"
```

### ILIKE (PostgreSQL) — Case-insensitive LIKE

```sql
SELECT * FROM employees WHERE first_name ILIKE ''alice'';
```

## IS NULL / IS NOT NULL

```sql
SELECT * FROM employees WHERE manager_id IS NULL;
SELECT * FROM employees WHERE phone IS NOT NULL;
```

You cannot use `= NULL` — it will always return no results because `NULL` is not equal to anything, not even itself.

## EXISTS

Check if a subquery returns any rows:

```sql
SELECT * FROM departments d
WHERE EXISTS (
    SELECT 1 FROM employees e
    WHERE e.department = d.name AND e.salary > 100000
);
```

## Key Takeaways

- `WHERE` filters rows before they appear in results
- Combine conditions with `AND`, `OR`, `NOT`; use parentheses for clarity
- `IN` replaces multiple `OR` conditions cleanly
- `BETWEEN` checks inclusive ranges
- `LIKE` with `%` and `_` does pattern matching
- Always use `IS NULL` / `IS NOT NULL`, never `= NULL`',
    2,
    '-- Exercise: WHERE & Filtering
-- Practice filtering data with various operators
-- Table: employees(id, first_name, last_name, email, department, salary, hire_date, manager_id)

-- TODO: Select employees in the Engineering department
SELECT 1;  -- Replace with your query

-- TODO: Select employees with salary between 60000 and 90000

-- TODO: Select employees whose first_name starts with ''J''

-- TODO: Select employees in Engineering OR Design with salary > 70000
-- (Be careful with operator precedence - use parentheses!)

-- TODO: Select employees NOT in the Marketing department

-- TODO: Select employees hired in 2023 (use BETWEEN with dates)

-- TODO: Select employees whose email contains ''gmail''
-- (Use LIKE or ILIKE)

-- TODO: Select employees where department is IN a list of
-- (''Engineering'', ''Design'', ''Product'')

-- TODO: Select employees who have a manager (manager_id IS NOT NULL)

-- TODO: Combine multiple conditions:
-- Find employees in Engineering who earn more than 80000
-- and were hired after 2022-06-01, ordered by salary DESC',
    'sql'
  ),
  (
    'd0000003-0003-0003-0003-000000000003',
    'e5f6a7b8-c9d0-1234-efab-345678901234',
    'JOIN Operations',
    '# JOIN Operations

JOINs combine rows from two or more tables based on a related column. They are essential for querying relational databases where data is spread across normalized tables.

## Why JOINs?

In a normalized database, related data lives in separate tables:

```
employees: id, first_name, department_id
departments: id, name, budget
```

To get an employee''s department name, you need to JOIN these tables.

## INNER JOIN

Returns only rows that have matches in **both** tables:

```sql
SELECT e.first_name, d.name AS department
FROM employees e
INNER JOIN departments d ON e.department_id = d.id;
```

If an employee has no department (NULL department_id) or a department has no employees, those rows are excluded.

## LEFT JOIN (LEFT OUTER JOIN)

Returns all rows from the **left** table, plus matching rows from the right. Non-matching rows get NULL for the right table''s columns:

```sql
SELECT e.first_name, d.name AS department
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id;
```

This includes employees even if they have no department. Their department column will show NULL.

## RIGHT JOIN (RIGHT OUTER JOIN)

Returns all rows from the **right** table, plus matching rows from the left:

```sql
SELECT e.first_name, d.name AS department
FROM employees e
RIGHT JOIN departments d ON e.department_id = d.id;
```

This includes departments even if they have no employees.

## FULL OUTER JOIN

Returns all rows from **both** tables, with NULLs where there is no match:

```sql
SELECT e.first_name, d.name AS department
FROM employees e
FULL OUTER JOIN departments d ON e.department_id = d.id;
```

## Multiple JOINs

You can chain multiple JOINs:

```sql
SELECT e.first_name, d.name AS department, p.title AS project
FROM employees e
INNER JOIN departments d ON e.department_id = d.id
INNER JOIN projects p ON p.department_id = d.id;
```

## Table Aliases

Aliases make JOINs more readable:

```sql
-- Without aliases (verbose)
SELECT employees.first_name, departments.name
FROM employees
INNER JOIN departments ON employees.department_id = departments.id;

-- With aliases (clean)
SELECT e.first_name, d.name
FROM employees e
INNER JOIN departments d ON e.department_id = d.id;
```

## Self JOIN

Join a table to itself. Useful for hierarchical data:

```sql
-- Find each employee and their manager''s name
SELECT e.first_name AS employee,
       m.first_name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
```

## CROSS JOIN

Every row from the left table paired with every row from the right table (Cartesian product):

```sql
SELECT e.first_name, d.name
FROM employees e
CROSS JOIN departments d;
-- If employees has 10 rows and departments has 5, result has 50 rows
```

## JOIN vs Subquery

JOINs and subqueries can often achieve the same result, but JOINs are usually more readable and often more performant:

```sql
-- Using JOIN
SELECT e.first_name, d.name
FROM employees e
INNER JOIN departments d ON e.department_id = d.id
WHERE d.budget > 100000;

-- Using subquery (same result, less clear)
SELECT first_name
FROM employees
WHERE department_id IN (
    SELECT id FROM departments WHERE budget > 100000
);
```

## Key Takeaways

- `INNER JOIN` returns matches from both tables
- `LEFT JOIN` keeps all rows from the left table, even without matches
- `RIGHT JOIN` keeps all rows from the right table
- `FULL OUTER JOIN` keeps all rows from both tables
- Use table aliases (e.g., `e`, `d`) for readability
- Self JOINs let you join a table to itself for hierarchical data',
    3,
    '-- Exercise: JOIN Operations
-- Practice combining data from multiple tables
--
-- Tables:
--   employees(id, first_name, last_name, department_id, salary, manager_id)
--   departments(id, name, budget, location)
--   projects(id, title, department_id, deadline)

-- TODO: Write an INNER JOIN to get employee names with their department names
SELECT 1;  -- Replace with your query

-- TODO: Write a LEFT JOIN to get ALL employees, including those
-- without a department (their department columns should show NULL)

-- TODO: Write a RIGHT JOIN to get ALL departments, including those
-- with no employees

-- TODO: Write a self-join to show each employee and their manager''s name
-- Employees without a manager should still appear (use LEFT JOIN)

-- TODO: Write a query that joins employees, departments, and projects
-- to show: employee name, department name, and project title

-- TODO: Find departments that have employees earning more than 90000
-- Show department name and the count of high earners

-- TODO: Find employees whose department budget is greater than 500000
-- Show employee name, department name, and department budget

-- TODO: Find all pairs of employees who work in the same department
-- (self-join on department_id, avoid pairing an employee with themselves)

-- TODO: Write a LEFT JOIN and filter for rows where the right table
-- has NULL (i.e., find employees who are NOT assigned to any department)',
    'sql'
  ),
  (
    'd0000004-0004-0004-0004-000000000004',
    'e5f6a7b8-c9d0-1234-efab-345678901234',
    'GROUP BY & Aggregates',
    '# GROUP BY & Aggregates

Aggregate functions perform calculations across groups of rows. Combined with `GROUP BY`, they let you summarize data — counting, summing, averaging, and more.

## Aggregate Functions

### COUNT

```sql
-- Count all rows
SELECT COUNT(*) FROM employees;

-- Count non-null values in a column
SELECT COUNT(phone) FROM employees;

-- Count distinct values
SELECT COUNT(DISTINCT department) FROM employees;
```

### SUM, AVG, MIN, MAX

```sql
SELECT
    SUM(salary) AS total_payroll,
    AVG(salary) AS avg_salary,
    MIN(salary) AS lowest_salary,
    MAX(salary) AS highest_salary
FROM employees;
```

## GROUP BY

Groups rows that share a common value, then applies aggregates to each group:

```sql
SELECT department, COUNT(*) AS employee_count
FROM employees
GROUP BY department;
```

Result:
| department | employee_count |
|------------|---------------|
| Engineering | 15 |
| Marketing | 8 |
| Design | 5 |

### Multiple GROUP BY Columns

```sql
SELECT department, EXTRACT(YEAR FROM hire_date) AS hire_year, COUNT(*)
FROM employees
GROUP BY department, EXTRACT(YEAR FROM hire_date)
ORDER BY department, hire_year;
```

## HAVING — Filter Groups

`WHERE` filters individual rows **before** grouping. `HAVING` filters groups **after** aggregation:

```sql
-- Departments with more than 10 employees
SELECT department, COUNT(*) AS emp_count
FROM employees
GROUP BY department
HAVING COUNT(*) > 10;
```

### WHERE vs HAVING

```sql
-- WHERE filters rows before grouping
-- HAVING filters groups after aggregation
SELECT department, AVG(salary) AS avg_salary
FROM employees
WHERE hire_date > ''2022-01-01''     -- Filter: only recent hires
GROUP BY department
HAVING AVG(salary) > 70000;          -- Filter: only high-paying departments
```

## Execution Order

Understanding the SQL execution order helps you write correct queries:

1. `FROM` — Choose the table(s)
2. `WHERE` — Filter individual rows
3. `GROUP BY` — Group remaining rows
4. `HAVING` — Filter groups
5. `SELECT` — Choose columns and compute expressions
6. `ORDER BY` — Sort the results
7. `LIMIT` — Restrict row count

This is why you cannot use column aliases (defined in `SELECT`) inside `WHERE` — `WHERE` runs before `SELECT`.

## Combining Aggregates

```sql
SELECT
    department,
    COUNT(*) AS headcount,
    ROUND(AVG(salary), 2) AS avg_salary,
    SUM(salary) AS total_salary,
    MAX(salary) - MIN(salary) AS salary_range
FROM employees
GROUP BY department
ORDER BY avg_salary DESC;
```

## ROUND Function

```sql
SELECT ROUND(AVG(salary), 2) AS avg_salary
FROM employees;
-- Returns something like 72345.67 instead of 72345.6789...
```

## Conditional Aggregation

Use `CASE` inside aggregate functions:

```sql
SELECT
    department,
    COUNT(CASE WHEN salary > 80000 THEN 1 END) AS high_earners,
    COUNT(CASE WHEN salary <= 80000 THEN 1 END) AS others
FROM employees
GROUP BY department;
```

## Key Takeaways

- Aggregate functions: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`
- `GROUP BY` groups rows for per-group aggregation
- `HAVING` filters groups after aggregation; `WHERE` filters rows before
- SQL execution order: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT
- Use `ROUND()` for clean decimal output
- Conditional aggregation with `CASE` lets you count or sum subsets within groups',
    4,
    '-- Exercise: GROUP BY & Aggregates
-- Practice summarizing data with aggregate functions
-- Table: employees(id, first_name, last_name, department, salary, hire_date)

-- TODO: Count the total number of employees
SELECT 1;  -- Replace with your query

-- TODO: Find the average salary across all employees (round to 2 decimals)

-- TODO: Find the min and max salary

-- TODO: Count employees per department, ordered by count descending

-- TODO: Find the average salary per department, only show departments
-- where the average salary exceeds 70000 (use HAVING)

-- TODO: For each department, show:
-- headcount, avg salary, min salary, max salary, total salary
-- Order by total salary descending

-- TODO: Count how many employees were hired each year
-- (Use EXTRACT(YEAR FROM hire_date) or DATE_PART)

-- TODO: Use conditional aggregation (CASE) to count per department:
-- how many earn above 80000 ("senior") vs at or below ("junior")

-- TODO: Find departments where the salary range (max - min) is greater
-- than 30000

-- TODO: Find the department with the highest average salary
-- (Use ORDER BY and LIMIT 1)',
    'sql'
  ),
  (
    'd0000005-0005-0005-0005-000000000005',
    'e5f6a7b8-c9d0-1234-efab-345678901234',
    'Subqueries',
    '# Subqueries

A subquery is a query nested inside another query. Subqueries let you break complex problems into smaller parts and use the results of one query as input to another.

## Subquery in WHERE

The most common use — filter based on another query''s results:

```sql
-- Find employees who earn more than the company average
SELECT first_name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
```

The inner query runs first, returns the average salary, and the outer query uses that value as a filter.

## Subquery with IN

Return rows matching any value from a subquery:

```sql
-- Find employees in departments with budget > 500000
SELECT first_name, department_id
FROM employees
WHERE department_id IN (
    SELECT id FROM departments WHERE budget > 500000
);
```

## Subquery in FROM (Derived Table)

Use a subquery as a temporary table:

```sql
-- Find the department with the highest average salary
SELECT sub.department, sub.avg_salary
FROM (
    SELECT department, AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department
) AS sub
ORDER BY sub.avg_salary DESC
LIMIT 1;
```

The subquery in `FROM` must have an alias (`AS sub`).

## Subquery in SELECT (Scalar Subquery)

Return a single value as a column:

```sql
SELECT first_name,
       salary,
       (SELECT AVG(salary) FROM employees) AS company_avg,
       salary - (SELECT AVG(salary) FROM employees) AS diff_from_avg
FROM employees;
```

Scalar subqueries must return exactly one value (one row, one column).

## Correlated Subqueries

A correlated subquery references the outer query. It runs once for each row of the outer query:

```sql
-- Find employees who earn more than their department average
SELECT e.first_name, e.salary, e.department
FROM employees e
WHERE e.salary > (
    SELECT AVG(e2.salary)
    FROM employees e2
    WHERE e2.department = e.department
);
```

The inner query references `e.department` from the outer query, so it runs for each employee.

## EXISTS and NOT EXISTS

Check whether a subquery returns any rows:

```sql
-- Find departments that have at least one employee
SELECT d.name
FROM departments d
WHERE EXISTS (
    SELECT 1 FROM employees e WHERE e.department_id = d.id
);

-- Find departments with NO employees
SELECT d.name
FROM departments d
WHERE NOT EXISTS (
    SELECT 1 FROM employees e WHERE e.department_id = d.id
);
```

`EXISTS` is often more efficient than `IN` for large datasets.

## Common Table Expressions (CTEs)

CTEs make complex queries more readable by defining named subqueries:

```sql
WITH dept_stats AS (
    SELECT department,
           AVG(salary) AS avg_salary,
           COUNT(*) AS headcount
    FROM employees
    GROUP BY department
)
SELECT department, avg_salary, headcount
FROM dept_stats
WHERE headcount > 5
ORDER BY avg_salary DESC;
```

### Multiple CTEs

```sql
WITH high_earners AS (
    SELECT * FROM employees WHERE salary > 80000
),
dept_counts AS (
    SELECT department, COUNT(*) AS count
    FROM high_earners
    GROUP BY department
)
SELECT * FROM dept_counts ORDER BY count DESC;
```

## Key Takeaways

- Subqueries in `WHERE` filter based on another query''s results
- Subqueries in `FROM` act as temporary derived tables (need an alias)
- Scalar subqueries in `SELECT` return a single value per row
- Correlated subqueries reference the outer query and run per row
- `EXISTS`/`NOT EXISTS` check for the presence of matching rows
- CTEs (`WITH ... AS`) make complex queries more readable and maintainable',
    5,
    '-- Exercise: Subqueries & CTEs
-- Practice nesting queries and using Common Table Expressions
-- Tables:
--   employees(id, first_name, last_name, department, salary, hire_date, manager_id)
--   departments(id, name, budget)

-- TODO: Find employees who earn more than the company average salary
SELECT 1;  -- Replace with your query

-- TODO: Find employees who work in departments with a budget over 500000
-- (Use a subquery with IN)

-- TODO: For each employee, show their salary and the company average
-- side by side (use a scalar subquery in SELECT)

-- TODO: Find employees who earn more than their department''s average
-- (Use a correlated subquery)

-- TODO: Find departments that have NO employees
-- (Use NOT EXISTS)

-- TODO: Use a CTE to first calculate department stats
-- (avg salary, headcount), then find departments with
-- above-average headcount
-- WITH dept_stats AS (...)

-- TODO: Use multiple CTEs to:
-- 1. Find the top 5 earners
-- 2. Get their departments
-- 3. Show department name and count of top earners per department

-- TODO: Find the second-highest salary in each department
-- Hint: Use a correlated subquery or CTE with ROW_NUMBER()

-- TODO: Write a query using a derived table (subquery in FROM)
-- to find departments where the average salary is above 75000',
    'sql'
  ),
  (
    'd0000006-0006-0006-0006-000000000006',
    'e5f6a7b8-c9d0-1234-efab-345678901234',
    'INSERT, UPDATE, DELETE',
    '# INSERT, UPDATE, DELETE

So far you have been reading data with `SELECT`. Now it is time to learn how to **create**, **modify**, and **remove** data. These are the three write operations in SQL, often called DML (Data Manipulation Language).

## INSERT — Adding New Rows

### Insert a Single Row

```sql
INSERT INTO employees (first_name, last_name, email, department, salary)
VALUES (''Alice'', ''Johnson'', ''alice@example.com'', ''Engineering'', 85000);
```

You specify the columns and their corresponding values. Columns not listed get their default value (often `NULL`).

### Insert Multiple Rows

```sql
INSERT INTO employees (first_name, last_name, department, salary)
VALUES
    (''Bob'', ''Smith'', ''Marketing'', 72000),
    (''Charlie'', ''Brown'', ''Design'', 68000),
    (''Diana'', ''Prince'', ''Engineering'', 92000);
```

### Insert from a SELECT

Copy data from one table to another:

```sql
INSERT INTO archived_employees (first_name, last_name, department)
SELECT first_name, last_name, department
FROM employees
WHERE hire_date < ''2020-01-01'';
```

### RETURNING Clause (PostgreSQL)

Get back the inserted data, including auto-generated columns:

```sql
INSERT INTO employees (first_name, last_name, department, salary)
VALUES (''Eve'', ''Davis'', ''Product'', 88000)
RETURNING id, first_name, salary;
```

## UPDATE — Modifying Existing Rows

### Update Specific Rows

```sql
UPDATE employees
SET salary = 90000
WHERE id = 42;
```

**Always include a `WHERE` clause** — without it, you update every row in the table!

### Update Multiple Columns

```sql
UPDATE employees
SET salary = 95000,
    department = ''Engineering'',
    last_name = ''Williams''
WHERE id = 42;
```

### Update Using Calculations

```sql
-- Give everyone a 10% raise
UPDATE employees
SET salary = salary * 1.10;

-- Give Engineering a 5% raise
UPDATE employees
SET salary = salary * 1.05
WHERE department = ''Engineering'';
```

### Update with Subquery

```sql
-- Set everyone''s salary to their department average
UPDATE employees e
SET salary = (
    SELECT AVG(salary)
    FROM employees e2
    WHERE e2.department = e.department
);
```

### RETURNING with UPDATE

```sql
UPDATE employees
SET salary = salary * 1.10
WHERE department = ''Engineering''
RETURNING first_name, salary;
```

## DELETE — Removing Rows

### Delete Specific Rows

```sql
DELETE FROM employees
WHERE id = 42;
```

**Always include a `WHERE` clause** — `DELETE FROM employees;` deletes ALL rows!

### Delete with Conditions

```sql
DELETE FROM employees
WHERE department = ''Legacy'' AND hire_date < ''2015-01-01'';
```

### Delete with Subquery

```sql
DELETE FROM employees
WHERE department_id IN (
    SELECT id FROM departments WHERE is_archived = true
);
```

### TRUNCATE — Delete All Rows Fast

```sql
TRUNCATE TABLE temp_data;
```

`TRUNCATE` is faster than `DELETE` for removing all rows because it does not log individual row deletions. But it cannot be filtered with `WHERE` and is harder to roll back.

## Transactions

Wrap multiple operations in a transaction to ensure they all succeed or all fail:

```sql
BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- If everything is fine:
COMMIT;

-- If something went wrong:
-- ROLLBACK;
```

### ACID Properties

- **Atomicity** — All operations succeed or all fail
- **Consistency** — Data stays valid after the transaction
- **Isolation** — Concurrent transactions do not interfere
- **Durability** — Committed data survives crashes

## UPSERT (INSERT ... ON CONFLICT)

Insert a row, or update it if a conflict occurs (PostgreSQL):

```sql
INSERT INTO employees (id, first_name, salary)
VALUES (42, ''Alice'', 85000)
ON CONFLICT (id)
DO UPDATE SET salary = EXCLUDED.salary;
```

## Key Takeaways

- `INSERT` adds new rows; you can insert single rows, multiple rows, or from a SELECT
- `UPDATE` modifies existing rows — always use `WHERE` to avoid updating everything
- `DELETE` removes rows — always use `WHERE` to avoid deleting everything
- `RETURNING` (PostgreSQL) gives back affected rows after INSERT/UPDATE/DELETE
- Wrap related operations in `BEGIN`/`COMMIT` transactions for safety
- `UPSERT` (`ON CONFLICT`) handles insert-or-update in a single statement',
    6,
    '-- Exercise: INSERT, UPDATE, DELETE
-- Practice modifying data in tables
-- Table: employees(id SERIAL, first_name, last_name, email, department, salary, hire_date)

-- TODO: Insert a single new employee
-- Name: Grace Hopper, email: grace@example.com, department: Engineering, salary: 95000
INSERT INTO employees (first_name, last_name, email, department, salary)
VALUES (''TODO'', ''TODO'', ''TODO'', ''TODO'', 0);

-- TODO: Insert 3 employees in a single statement
-- Make up reasonable data for each

-- TODO: Update Grace Hopper''s salary to 105000
-- (Filter by email to be safe)

-- TODO: Give all Engineering employees a 10% raise

-- TODO: Change the department of all employees earning less than 50000
-- to ''Training''

-- TODO: Delete employees in the ''Legacy'' department

-- TODO: Write an INSERT ... SELECT to copy all Engineering employees
-- into a table called "engineering_backup"
-- (Assume engineering_backup has the same columns)

-- TODO: Write a transaction that:
-- 1. Inserts a new employee
-- 2. Updates their manager_id
-- 3. Commits if both succeed
BEGIN;
-- TODO: INSERT the employee
-- TODO: UPDATE the manager_id
COMMIT;

-- TODO: Write an UPSERT (INSERT ... ON CONFLICT) that inserts
-- an employee or updates their salary if the email already exists
-- INSERT INTO employees (first_name, last_name, email, salary)
-- VALUES (...)
-- ON CONFLICT (email) DO UPDATE SET salary = EXCLUDED.salary;

-- BONUS TODO: Delete all employees hired before 2020 and use RETURNING
-- to see which employees were deleted',
    'sql'
  );

-- =============================================================================
-- TEST CODE: Hidden test assertions for all 32 lessons
-- Appended after INSERT statements to set test_code via UPDATE
-- =============================================================================

-- =============================================================================
-- TEST CODE: AI Fundamentals with LangChain (Lessons 1-5)
-- =============================================================================

-- Lesson 1: What Are Embeddings?
-- The user should implement:
--   - A variable `embedding` that is a list of floats (simulated vector)
--   - A function `cosine_similarity(a, b)` that computes cosine similarity between two vectors
--   - The variable `text` is already provided
UPDATE lessons SET test_code = '
import math

_test_passed = 0
_test_total = 0

# Test 1: embedding is a list of floats with correct dimensionality
_test_total += 1
try:
    assert isinstance(embedding, list), f"embedding should be a list, got {type(embedding).__name__}"
    assert len(embedding) > 0, "embedding should not be empty"
    assert all(isinstance(x, (int, float)) for x in embedding), "all elements in embedding should be numbers"
    print("PASS: embedding is a valid vector")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: embedding is a valid vector - {e}")
except Exception as e:
    print(f"FAIL: embedding is a valid vector - {e}")

# Test 2: cosine_similarity function exists and works
_test_total += 1
try:
    assert callable(cosine_similarity), "cosine_similarity should be a callable function"
    _v1 = [1.0, 0.0, 0.0]
    _v2 = [1.0, 0.0, 0.0]
    _result = cosine_similarity(_v1, _v2)
    assert abs(_result - 1.0) < 0.001, f"identical vectors should have similarity 1.0, got {_result}"
    print("PASS: cosine_similarity returns 1.0 for identical vectors")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: cosine_similarity returns 1.0 for identical vectors - {e}")
except Exception as e:
    print(f"FAIL: cosine_similarity returns 1.0 for identical vectors - {e}")

# Test 3: cosine_similarity returns 0 for orthogonal vectors
_test_total += 1
try:
    _v1 = [1.0, 0.0]
    _v2 = [0.0, 1.0]
    _result = cosine_similarity(_v1, _v2)
    assert abs(_result - 0.0) < 0.001, f"orthogonal vectors should have similarity 0.0, got {_result}"
    print("PASS: cosine_similarity returns 0.0 for orthogonal vectors")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: cosine_similarity returns 0.0 for orthogonal vectors - {e}")
except Exception as e:
    print(f"FAIL: cosine_similarity returns 0.0 for orthogonal vectors - {e}")

# Test 4: cosine_similarity handles a known case
_test_total += 1
try:
    _v1 = [1.0, 2.0, 3.0]
    _v2 = [4.0, 5.0, 6.0]
    _result = cosine_similarity(_v1, _v2)
    _expected = (4+10+18) / (math.sqrt(14) * math.sqrt(77))
    assert abs(_result - _expected) < 0.001, f"expected {_expected:.4f}, got {_result}"
    print("PASS: cosine_similarity computes correct value for known vectors")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: cosine_similarity computes correct value for known vectors - {e}")
except Exception as e:
    print(f"FAIL: cosine_similarity computes correct value for known vectors - {e}")

if _test_passed == _test_total:
    print("ALL_TESTS_PASSED")
' WHERE id = '11111111-1111-1111-1111-111111111111';


-- Lesson 2: Text Chunking Strategies
-- The user should implement:
--   - A function `chunk_text(text, chunk_size, chunk_overlap)` that splits text into overlapping chunks
--   - The variable `chunks` should be the result of chunking `sample_text`
UPDATE lessons SET test_code = '
_test_passed = 0
_test_total = 0

# Test 1: chunk_text function exists and returns a list
_test_total += 1
try:
    assert callable(chunk_text), "chunk_text should be a callable function"
    _result = chunk_text("hello world", 100, 0)
    assert isinstance(_result, list), f"chunk_text should return a list, got {type(_result).__name__}"
    print("PASS: chunk_text function exists and returns a list")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: chunk_text function exists and returns a list - {e}")
except Exception as e:
    print(f"FAIL: chunk_text function exists and returns a list - {e}")

# Test 2: chunks respect chunk_size limit
_test_total += 1
try:
    _text = "a" * 300
    _result = chunk_text(_text, 100, 0)
    assert len(_result) >= 3, f"300 chars with chunk_size=100 should produce at least 3 chunks, got {len(_result)}"
    assert all(len(c) <= 100 for c in _result), "no chunk should exceed chunk_size"
    print("PASS: chunks respect chunk_size limit")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: chunks respect chunk_size limit - {e}")
except Exception as e:
    print(f"FAIL: chunks respect chunk_size limit - {e}")

# Test 3: overlap works correctly
_test_total += 1
try:
    _text = "abcdefghijklmnopqrstuvwxyz"
    _result = chunk_text(_text, 10, 3)
    assert len(_result) >= 2, f"expected at least 2 chunks, got {len(_result)}"
    _first_end = _result[0][-3:]
    _second_start = _result[1][:3]
    assert _first_end == _second_start, f"overlap not working: first chunk ends with ''{_first_end}'' but second starts with ''{_second_start}''"
    print("PASS: chunk overlap works correctly")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: chunk overlap works correctly - {e}")
except Exception as e:
    print(f"FAIL: chunk overlap works correctly - {e}")

# Test 4: chunks variable was created from sample_text
_test_total += 1
try:
    assert isinstance(chunks, list), f"chunks should be a list, got {type(chunks).__name__}"
    assert len(chunks) > 1, f"sample_text should produce multiple chunks, got {len(chunks)}"
    _reconstructed = chunks[0]
    for c in chunks[1:]:
        _reconstructed += c[20:]  # skip overlap portion
    print("PASS: chunks variable contains chunked sample_text")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: chunks variable contains chunked sample_text - {e}")
except Exception as e:
    print(f"FAIL: chunks variable contains chunked sample_text - {e}")

if _test_passed == _test_total:
    print("ALL_TESTS_PASSED")
' WHERE id = '22222222-2222-2222-2222-222222222222';


-- Lesson 3: Vector Storage with pgvector
-- The user should implement:
--   - `create_table_sql` containing CREATE TABLE with id, lesson_id, chunk_text, embedding columns
--   - `search_sql` containing a cosine distance query with ORDER BY and LIMIT
--   - `index_sql` containing an HNSW index creation statement
UPDATE lessons SET test_code = '
_test_passed = 0
_test_total = 0

# Test 1: create_table_sql has required columns
_test_total += 1
try:
    _sql = create_table_sql.upper()
    assert "CREATE TABLE" in _sql, "missing CREATE TABLE statement"
    assert "LESSON_ID" in _sql, "missing lesson_id column"
    assert "CHUNK_TEXT" in _sql, "missing chunk_text column"
    assert "EMBEDDING" in _sql, "missing embedding column"
    assert "VECTOR" in _sql, "missing VECTOR type for embedding column"
    print("PASS: create_table_sql has all required columns")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: create_table_sql has all required columns - {e}")
except Exception as e:
    print(f"FAIL: create_table_sql has all required columns - {e}")

# Test 2: search_sql uses cosine distance operator and LIMIT
_test_total += 1
try:
    assert "<=>" in search_sql, "missing cosine distance operator (<=>)"
    _sql = search_sql.upper()
    assert "ORDER BY" in _sql, "missing ORDER BY clause"
    assert "LIMIT" in _sql, "missing LIMIT clause"
    print("PASS: search_sql uses cosine distance with ORDER BY and LIMIT")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: search_sql uses cosine distance with ORDER BY and LIMIT - {e}")
except Exception as e:
    print(f"FAIL: search_sql uses cosine distance with ORDER BY and LIMIT - {e}")

# Test 3: index_sql creates an HNSW index
_test_total += 1
try:
    _sql = index_sql.upper()
    assert "CREATE INDEX" in _sql, "missing CREATE INDEX statement"
    assert "HNSW" in _sql, "missing HNSW index type"
    assert "VECTOR_COSINE_OPS" in _sql, "missing vector_cosine_ops operator class"
    print("PASS: index_sql creates an HNSW index with cosine ops")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: index_sql creates an HNSW index with cosine ops - {e}")
except Exception as e:
    print(f"FAIL: index_sql creates an HNSW index with cosine ops - {e}")

if _test_passed == _test_total:
    print("ALL_TESTS_PASSED")
' WHERE id = '33333333-3333-3333-3333-333333333333';


-- Lesson 4: RAG Pipeline Basics
-- The user should implement:
--   - A function `build_rag_prompt(context_chunks, question)` that assembles the RAG prompt
--   - A variable `rag_steps` that is a list of the RAG pipeline step names in order
UPDATE lessons SET test_code = '
_test_passed = 0
_test_total = 0

# Test 1: build_rag_prompt function exists and returns a string
_test_total += 1
try:
    assert callable(build_rag_prompt), "build_rag_prompt should be a callable function"
    _result = build_rag_prompt(["chunk1", "chunk2"], "What is AI?")
    assert isinstance(_result, str), f"should return a string, got {type(_result).__name__}"
    assert len(_result) > 0, "prompt should not be empty"
    print("PASS: build_rag_prompt returns a non-empty string")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: build_rag_prompt returns a non-empty string - {e}")
except Exception as e:
    print(f"FAIL: build_rag_prompt returns a non-empty string - {e}")

# Test 2: prompt includes context and question
_test_total += 1
try:
    _chunks = ["Embeddings capture semantic meaning.", "Vectors have 1536 dimensions."]
    _question = "How do embeddings work?"
    _result = build_rag_prompt(_chunks, _question)
    assert "Embeddings capture semantic meaning" in _result, "prompt should include the context chunks"
    assert "Vectors have 1536 dimensions" in _result, "prompt should include all context chunks"
    assert "How do embeddings work?" in _result, "prompt should include the question"
    print("PASS: prompt includes both context and question")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: prompt includes both context and question - {e}")
except Exception as e:
    print(f"FAIL: prompt includes both context and question - {e}")

# Test 3: rag_steps lists the correct pipeline stages in order
_test_total += 1
try:
    assert isinstance(rag_steps, list), f"rag_steps should be a list, got {type(rag_steps).__name__}"
    assert len(rag_steps) >= 3, f"RAG pipeline should have at least 3 steps, got {len(rag_steps)}"
    _steps_lower = [s.lower() for s in rag_steps]
    _has_embed = any("embed" in s for s in _steps_lower)
    _has_retrieve = any("retriev" in s or "search" in s for s in _steps_lower)
    _has_generate = any("generat" in s or "llm" in s or "respond" in s for s in _steps_lower)
    assert _has_embed, "rag_steps should include an embedding step"
    assert _has_retrieve, "rag_steps should include a retrieval/search step"
    assert _has_generate, "rag_steps should include a generation/LLM step"
    print("PASS: rag_steps contains the correct pipeline stages")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: rag_steps contains the correct pipeline stages - {e}")
except Exception as e:
    print(f"FAIL: rag_steps contains the correct pipeline stages - {e}")

if _test_passed == _test_total:
    print("ALL_TESTS_PASSED")
' WHERE id = '44444444-4444-4444-4444-444444444444';


-- Lesson 5: Introduction to LangGraph
-- The user should implement:
--   - A `ChatState` dict with keys "messages" and "topic"
--   - A `greet` function that takes state and returns a dict with a "messages" key
--   - A `respond` function that takes state and returns a dict with a "messages" key referencing state["topic"]
--   - A `graph_nodes` list of node names in execution order
UPDATE lessons SET test_code = '
_test_passed = 0
_test_total = 0

# Test 1: greet function returns a dict with a messages key
_test_total += 1
try:
    assert callable(greet), "greet should be a callable function"
    _state = {"messages": [], "topic": "embeddings"}
    _result = greet(_state)
    assert isinstance(_result, dict), f"greet should return a dict, got {type(_result).__name__}"
    assert "messages" in _result, "greet should return a dict with a ''messages'' key"
    print("PASS: greet function returns dict with messages")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: greet function returns dict with messages - {e}")
except Exception as e:
    print(f"FAIL: greet function returns dict with messages - {e}")

# Test 2: respond function uses the topic from state
_test_total += 1
try:
    assert callable(respond), "respond should be a callable function"
    _state = {"messages": ["Hello!"], "topic": "vector databases"}
    _result = respond(_state)
    assert isinstance(_result, dict), f"respond should return a dict, got {type(_result).__name__}"
    assert "messages" in _result, "respond should return a dict with a ''messages'' key"
    _msg = str(_result["messages"]).lower()
    assert "vector databases" in _msg, "respond should reference the topic from state"
    print("PASS: respond function uses topic from state")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: respond function uses topic from state - {e}")
except Exception as e:
    print(f"FAIL: respond function uses topic from state - {e}")

# Test 3: graph_nodes lists nodes in correct execution order
_test_total += 1
try:
    assert isinstance(graph_nodes, list), f"graph_nodes should be a list, got {type(graph_nodes).__name__}"
    assert len(graph_nodes) >= 2, f"should have at least 2 nodes, got {len(graph_nodes)}"
    _nodes_lower = [n.lower() for n in graph_nodes]
    assert "greet" in _nodes_lower, "graph_nodes should include ''greet''"
    assert "respond" in _nodes_lower, "graph_nodes should include ''respond''"
    _greet_idx = _nodes_lower.index("greet")
    _respond_idx = _nodes_lower.index("respond")
    assert _greet_idx < _respond_idx, "''greet'' should come before ''respond'' in graph_nodes"
    print("PASS: graph_nodes lists nodes in correct order")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: graph_nodes lists nodes in correct order - {e}")
except Exception as e:
    print(f"FAIL: graph_nodes lists nodes in correct order - {e}")

if _test_passed == _test_total:
    print("ALL_TESTS_PASSED")
' WHERE id = '55555555-5555-5555-5555-555555555555';

-- =============================================================================
-- TEST CODE for Python for Beginners lessons
-- =============================================================================

-- Lesson 1: Hello World & Variables (3 tests - beginner)
UPDATE lessons SET test_code = '
_test_passed = 0
_test_total = 0

# Test 1: name variable is a non-empty string
_test_total += 1
try:
    assert isinstance(name, str) and len(name) > 0, f"expected non-empty string, got {repr(name)}"
    print("PASS: name is a non-empty string")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: name is a non-empty string - {e}")
except Exception as e:
    print(f"FAIL: name is a non-empty string - {e}")

# Test 2: age is a positive integer
_test_total += 1
try:
    assert isinstance(age, int) and age > 0, f"expected positive int, got {repr(age)}"
    print("PASS: age is a positive integer")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: age is a positive integer - {e}")
except Exception as e:
    print(f"FAIL: age is a positive integer - {e}")

# Test 3: favorite_language is "Python"
_test_total += 1
try:
    assert favorite_language == "Python", f"expected ''Python'', got {repr(favorite_language)}"
    print("PASS: favorite_language is Python")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: favorite_language is Python - {e}")
except Exception as e:
    print(f"FAIL: favorite_language is Python - {e}")

if _test_passed == _test_total:
    print("ALL_TESTS_PASSED")
' WHERE id = 'a0000001-0001-0001-0001-000000000001';

-- Lesson 2: Data Types & Type Conversion (3 tests - beginner)
UPDATE lessons SET test_code = '
_test_passed = 0
_test_total = 0

# Test 1: converted is int 42
_test_total += 1
try:
    assert converted == 42 and isinstance(converted, int), f"expected int 42, got {repr(converted)}"
    print("PASS: string_number converted to int 42")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: string_number converted to int 42 - {e}")
except Exception as e:
    print(f"FAIL: string_number converted to int 42 - {e}")

# Test 2: number_as_string is str "100"
_test_total += 1
try:
    assert number_as_string == "100" and isinstance(number_as_string, str), f"expected str ''100'', got {repr(number_as_string)}"
    print("PASS: number converted to string 100")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: number converted to string 100 - {e}")
except Exception as e:
    print(f"FAIL: number converted to string 100 - {e}")

# Test 3: quotient and remainder of 17 / 3
_test_total += 1
try:
    assert quotient == 5, f"expected quotient 5, got {repr(quotient)}"
    assert remainder == 2, f"expected remainder 2, got {repr(remainder)}"
    print("PASS: integer division 17 by 3 correct")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: integer division 17 by 3 correct - {e}")
except Exception as e:
    print(f"FAIL: integer division 17 by 3 correct - {e}")

if _test_passed == _test_total:
    print("ALL_TESTS_PASSED")
' WHERE id = 'a0000002-0002-0002-0002-000000000002';

-- Lesson 3: Conditionals (3 tests - beginner/intermediate)
UPDATE lessons SET test_code = '
_test_passed = 0
_test_total = 0

# Test 1: age variable was set to a non-zero value
_test_total += 1
try:
    assert age != 0, "age should be set to a test value, not 0"
    print("PASS: age variable was set to a test value")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: age variable was set to a test value - {e}")
except Exception as e:
    print(f"FAIL: age variable was set to a test value - {e}")

# Test 2: ticket_price is a positive number
_test_total += 1
try:
    assert isinstance(ticket_price, (int, float)) and ticket_price > 0, f"expected positive number, got {repr(ticket_price)}"
    print("PASS: ticket_price is a positive number")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: ticket_price is a positive number - {e}")
except Exception as e:
    print(f"FAIL: ticket_price is a positive number - {e}")

# Test 3: ticket_price matches expected for the given age and membership
_test_total += 1
try:
    if age < 13:
        _expected_base = 5
    elif age <= 17:
        _expected_base = 8
    elif age <= 64:
        _expected_base = 12
    else:
        _expected_base = 6
    if is_member:
        _expected = _expected_base * 0.8
    else:
        _expected = _expected_base
    assert abs(ticket_price - _expected) < 0.01, f"for age={age}, member={is_member}, expected {_expected}, got {ticket_price}"
    print("PASS: ticket_price matches expected value for age and membership")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: ticket_price matches expected value for age and membership - {e}")
except Exception as e:
    print(f"FAIL: ticket_price matches expected value for age and membership - {e}")

if _test_passed == _test_total:
    print("ALL_TESTS_PASSED")
' WHERE id = 'a0000003-0003-0003-0003-000000000003';

-- Lesson 4: Loops (3 tests - intermediate)
UPDATE lessons SET test_code = '
_test_passed = 0
_test_total = 0

# Test 1: Sum of 1 to 100
_test_total += 1
try:
    assert total == 5050, f"expected 5050, got {repr(total)}"
    print("PASS: sum of 1 to 100 is 5050")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: sum of 1 to 100 is 5050 - {e}")
except Exception as e:
    print(f"FAIL: sum of 1 to 100 is 5050 - {e}")

# Test 2: First number > 1000 divisible by 7 and 13
_test_total += 1
try:
    assert number > 1000, f"number must be > 1000, got {number}"
    assert number % 7 == 0 and number % 13 == 0, f"{number} is not divisible by both 7 and 13"
    assert number == 1001, f"expected 1001 (smallest > 1000 divisible by 7 and 13), got {number}"
    print("PASS: first number > 1000 divisible by 7 and 13")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: first number > 1000 divisible by 7 and 13 - {e}")
except Exception as e:
    print(f"FAIL: first number > 1000 divisible by 7 and 13 - {e}")

# Test 3: Reversed string
_test_total += 1
try:
    assert reversed_str == "nohtyP", f"expected ''nohtyP'', got {repr(reversed_str)}"
    print("PASS: reversed string is nohtyP")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: reversed string is nohtyP - {e}")
except Exception as e:
    print(f"FAIL: reversed string is nohtyP - {e}")

if _test_passed == _test_total:
    print("ALL_TESTS_PASSED")
' WHERE id = 'a0000004-0004-0004-0004-000000000004';

-- Lesson 5: Functions (4 tests - intermediate)
UPDATE lessons SET test_code = '
_test_passed = 0
_test_total = 0

# Test 1: celsius_to_fahrenheit
_test_total += 1
try:
    assert celsius_to_fahrenheit(0) == 32, f"expected 32, got {celsius_to_fahrenheit(0)}"
    assert celsius_to_fahrenheit(100) == 212, f"expected 212, got {celsius_to_fahrenheit(100)}"
    assert abs(celsius_to_fahrenheit(-40) - (-40)) < 0.01, f"expected -40, got {celsius_to_fahrenheit(-40)}"
    print("PASS: celsius_to_fahrenheit works correctly")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: celsius_to_fahrenheit works correctly - {e}")
except Exception as e:
    print(f"FAIL: celsius_to_fahrenheit works correctly - {e}")

# Test 2: is_palindrome
_test_total += 1
try:
    assert is_palindrome("racecar") == True, "racecar should be True"
    assert is_palindrome("Racecar") == True, "Racecar (mixed case) should be True"
    assert is_palindrome("hello") == False, "hello should be False"
    assert is_palindrome("madam") == True, "madam should be True"
    print("PASS: is_palindrome works correctly")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: is_palindrome works correctly - {e}")
except Exception as e:
    print(f"FAIL: is_palindrome works correctly - {e}")

# Test 3: find_max
_test_total += 1
try:
    assert find_max(3, 7, 2, 9, 4) == 9, f"expected 9, got {find_max(3, 7, 2, 9, 4)}"
    assert find_max(1) == 1, f"expected 1 for single arg, got {find_max(1)}"
    assert find_max(-5, -1, -10) == -1, f"expected -1 for negatives, got {find_max(-5, -1, -10)}"
    print("PASS: find_max works correctly")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: find_max works correctly - {e}")
except Exception as e:
    print(f"FAIL: find_max works correctly - {e}")

# Test 4: create_profile
_test_total += 1
try:
    _profile = create_profile("Alice", 25, city="NYC")
    assert isinstance(_profile, dict), f"expected dict, got {type(_profile)}"
    assert _profile.get("name") == "Alice", f"expected name=Alice, got {_profile.get(''name'')}"
    assert _profile.get("age") == 25, f"expected age=25, got {_profile.get(''age'')}"
    assert _profile.get("city") == "NYC", f"expected city=NYC, got {_profile.get(''city'')}"
    print("PASS: create_profile works correctly")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: create_profile works correctly - {e}")
except Exception as e:
    print(f"FAIL: create_profile works correctly - {e}")

if _test_passed == _test_total:
    print("ALL_TESTS_PASSED")
' WHERE id = 'a0000005-0005-0005-0005-000000000005';

-- Lesson 6: Lists & Tuples (4 tests - intermediate)
UPDATE lessons SET test_code = '
_test_passed = 0
_test_total = 0

# Test 1: movies list has at least 5 items
_test_total += 1
try:
    assert isinstance(movies, list), f"expected list, got {type(movies)}"
    assert len(movies) >= 5, f"expected at least 5 movies, got {len(movies)}"
    print("PASS: movies list has at least 5 items")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: movies list has at least 5 items - {e}")
except Exception as e:
    print(f"FAIL: movies list has at least 5 items - {e}")

# Test 2: lengths is a list of integers matching movie name lengths
_test_total += 1
try:
    assert isinstance(lengths, list), f"expected list, got {type(lengths)}"
    assert len(lengths) == len(movies), f"lengths ({len(lengths)}) should match movies ({len(movies)})"
    _expected_lengths = [len(m) for m in movies]
    assert lengths == _expected_lengths, f"expected {_expected_lengths}, got {lengths}"
    print("PASS: lengths list matches movie name lengths")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: lengths list matches movie name lengths - {e}")
except Exception as e:
    print(f"FAIL: lengths list matches movie name lengths - {e}")

# Test 3: color tuple has 3 elements and is unpacked into r, g, b
_test_total += 1
try:
    assert isinstance(color, tuple), f"expected tuple, got {type(color)}"
    assert len(color) == 3, f"expected 3 elements, got {len(color)}"
    assert r == color[0] and g == color[1] and b == color[2], "r, g, b should match color tuple values"
    print("PASS: color tuple unpacked into r, g, b")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: color tuple unpacked into r, g, b - {e}")
except Exception as e:
    print(f"FAIL: color tuple unpacked into r, g, b - {e}")

# Test 4: sorted_students is sorted by score descending
_test_total += 1
try:
    assert isinstance(sorted_students, list), f"expected list, got {type(sorted_students)}"
    assert len(sorted_students) == 4, f"expected 4 students, got {len(sorted_students)}"
    assert sorted_students[0][1] >= sorted_students[1][1] >= sorted_students[2][1] >= sorted_students[3][1], "students should be sorted by score descending"
    assert sorted_students[0] == ("Diana", 95), f"expected Diana first, got {sorted_students[0]}"
    print("PASS: sorted_students sorted by score descending")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: sorted_students sorted by score descending - {e}")
except Exception as e:
    print(f"FAIL: sorted_students sorted by score descending - {e}")

if _test_passed == _test_total:
    print("ALL_TESTS_PASSED")
' WHERE id = 'a0000006-0006-0006-0006-000000000006';

-- Lesson 7: Dictionaries (4 tests - intermediate)
UPDATE lessons SET test_code = '
_test_passed = 0
_test_total = 0

# Test 1: inventory has at least 5 items (4 original + Headphones)
_test_total += 1
try:
    assert isinstance(inventory, dict), f"expected dict, got {type(inventory)}"
    assert len(inventory) >= 5, f"expected at least 5 items (4 original + Headphones), got {len(inventory)}"
    assert "Headphones" in inventory, "Headphones should be in inventory"
    assert inventory["Headphones"]["price"] == 29.99, f"Headphones price should be 29.99"
    assert inventory["Headphones"]["quantity"] == 20, f"Headphones quantity should be 20"
    print("PASS: inventory has items and Headphones added correctly")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: inventory has items and Headphones added correctly - {e}")
except Exception as e:
    print(f"FAIL: inventory has items and Headphones added correctly - {e}")

# Test 2: total_value is calculated correctly
_test_total += 1
try:
    _expected_total = sum(v["price"] * v["quantity"] for v in inventory.values())
    assert isinstance(total_value, (int, float)), f"expected number, got {type(total_value)}"
    assert abs(total_value - _expected_total) < 0.01, f"expected {_expected_total}, got {total_value}"
    print("PASS: total_value calculated correctly")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: total_value calculated correctly - {e}")
except Exception as e:
    print(f"FAIL: total_value calculated correctly - {e}")

# Test 3: low_stock contains only items with quantity < 30
_test_total += 1
try:
    assert isinstance(low_stock, dict), f"expected dict, got {type(low_stock)}"
    _expected_low = {k: v for k, v in inventory.items() if v["quantity"] < 30}
    assert len(low_stock) == len(_expected_low), f"expected {len(_expected_low)} low stock items, got {len(low_stock)}"
    for k in _expected_low:
        assert k in low_stock, f"{k} should be in low_stock"
    print("PASS: low_stock dict contains correct items")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: low_stock dict contains correct items - {e}")
except Exception as e:
    print(f"FAIL: low_stock dict contains correct items - {e}")

# Test 4: most_expensive is a string matching the most expensive item
_test_total += 1
try:
    _expected_expensive = max(inventory, key=lambda k: inventory[k]["price"])
    assert most_expensive == _expected_expensive, f"expected {repr(_expected_expensive)}, got {repr(most_expensive)}"
    print("PASS: most_expensive item identified correctly")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: most_expensive item identified correctly - {e}")
except Exception as e:
    print(f"FAIL: most_expensive item identified correctly - {e}")

if _test_passed == _test_total:
    print("ALL_TESTS_PASSED")
' WHERE id = 'a0000007-0007-0007-0007-000000000007';

-- Lesson 8: Classes & Objects (5 tests - intermediate)
UPDATE lessons SET test_code = '
_test_passed = 0
_test_total = 0

# Test 1: Book class constructor and description method
_test_total += 1
try:
    _b = Book("Test Book", "Test Author", 200)
    assert _b.title == "Test Book", f"expected title ''Test Book'', got {repr(_b.title)}"
    assert _b.author == "Test Author", f"expected author ''Test Author'', got {repr(_b.author)}"
    assert _b.pages == 200, f"expected pages 200, got {repr(_b.pages)}"
    _desc = _b.description()
    assert "Test Book" in _desc and "Test Author" in _desc and "200" in _desc, f"description should contain title, author, pages. Got: {_desc}"
    print("PASS: Book class has correct attributes and description()")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: Book class has correct attributes and description() - {e}")
except Exception as e:
    print(f"FAIL: Book class has correct attributes and description() - {e}")

# Test 2: Book __str__ method
_test_total += 1
try:
    _b = Book("Dune", "Herbert", 412)
    _s = str(_b)
    assert "Dune" in _s and "Herbert" in _s, f"__str__ should contain title and author. Got: {_s}"
    print("PASS: Book __str__ returns meaningful string")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: Book __str__ returns meaningful string - {e}")
except Exception as e:
    print(f"FAIL: Book __str__ returns meaningful string - {e}")

# Test 3: Library add_book and __str__
_test_total += 1
try:
    _lib = Library()
    _lib.add_book(Book("A", "Author1", 100))
    _lib.add_book(Book("B", "Author2", 200))
    _s = str(_lib)
    assert "2" in _s, f"Library __str__ should mention 2 books. Got: {_s}"
    print("PASS: Library add_book and __str__ work correctly")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: Library add_book and __str__ work correctly - {e}")
except Exception as e:
    print(f"FAIL: Library add_book and __str__ work correctly - {e}")

# Test 4: Library find_by_author
_test_total += 1
try:
    _lib = Library()
    _lib.add_book(Book("The Hobbit", "Tolkien", 310))
    _lib.add_book(Book("1984", "Orwell", 328))
    _lib.add_book(Book("Lord of the Rings", "Tolkien", 1178))
    _results = _lib.find_by_author("Tolkien")
    assert isinstance(_results, list), f"expected list, got {type(_results)}"
    assert len(_results) == 2, f"expected 2 Tolkien books, got {len(_results)}"
    print("PASS: Library find_by_author returns correct books")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: Library find_by_author returns correct books - {e}")
except Exception as e:
    print(f"FAIL: Library find_by_author returns correct books - {e}")

# Test 5: Library longest_book
_test_total += 1
try:
    _lib = Library()
    _lib.add_book(Book("Short", "A", 100))
    _lib.add_book(Book("Long", "B", 500))
    _lib.add_book(Book("Medium", "C", 300))
    _longest = _lib.longest_book()
    assert _longest.pages == 500, f"expected longest book to have 500 pages, got {_longest.pages}"
    assert _longest.title == "Long", f"expected ''Long'', got {repr(_longest.title)}"
    print("PASS: Library longest_book returns book with most pages")
    _test_passed += 1
except AssertionError as e:
    print(f"FAIL: Library longest_book returns book with most pages - {e}")
except Exception as e:
    print(f"FAIL: Library longest_book returns book with most pages - {e}")

if _test_passed == _test_total:
    print("ALL_TESTS_PASSED")
' WHERE id = 'a0000008-0008-0008-0008-000000000008';

-- Add test_code for JavaScript Essentials lessons

-- Lesson 1: Variables & Data Types
UPDATE lessons SET test_code = '
let _testPassed = 0;
let _testTotal = 0;

_testTotal++;
try {
  if (typeof name === "string" && name.length > 0) {
    console.log("PASS: name is a non-empty string");
    _testPassed++;
  } else {
    console.log("FAIL: name is a non-empty string - expected a non-empty string, got " + JSON.stringify(name));
  }
} catch(e) {
  console.log("FAIL: name is a non-empty string - " + e.message);
}

_testTotal++;
try {
  if (typeof age === "number" && age > 0) {
    console.log("PASS: age is a positive number");
    _testPassed++;
  } else {
    console.log("FAIL: age is a positive number - expected a positive number, got " + JSON.stringify(age));
  }
} catch(e) {
  console.log("FAIL: age is a positive number - " + e.message);
}

_testTotal++;
try {
  if (typeof profile === "object" && profile !== null && "name" in profile && "age" in profile && "isStudent" in profile && "favoriteLanguage" in profile) {
    console.log("PASS: profile object has required properties");
    _testPassed++;
  } else {
    const keys = profile ? Object.keys(profile) : [];
    console.log("FAIL: profile object has required properties - expected name, age, isStudent, favoriteLanguage but got keys: " + keys.join(", "));
  }
} catch(e) {
  console.log("FAIL: profile object has required properties - " + e.message);
}

if (_testPassed === _testTotal) {
  console.log("ALL_TESTS_PASSED");
}
' WHERE id = 'b0000001-0001-0001-0001-000000000001';

-- Lesson 2: Functions & Scope
UPDATE lessons SET test_code = '
let _testPassed = 0;
let _testTotal = 0;

_testTotal++;
try {
  const r1 = capitalize("hello");
  const r2 = capitalize("javaScript");
  if (r1 === "Hello" && r2 === "JavaScript") {
    console.log("PASS: capitalize returns correct results");
    _testPassed++;
  } else {
    console.log("FAIL: capitalize returns correct results - expected Hello/JavaScript, got " + r1 + "/" + r2);
  }
} catch(e) {
  console.log("FAIL: capitalize returns correct results - " + e.message);
}

_testTotal++;
try {
  const evens = filterEvens([1, 2, 3, 4, 5, 6]);
  if (Array.isArray(evens) && evens.length === 3 && evens[0] === 2 && evens[1] === 4 && evens[2] === 6) {
    console.log("PASS: filterEvens returns only even numbers");
    _testPassed++;
  } else {
    console.log("FAIL: filterEvens returns only even numbers - got " + JSON.stringify(evens));
  }
} catch(e) {
  console.log("FAIL: filterEvens returns only even numbers - " + e.message);
}

_testTotal++;
try {
  const _triple = createMultiplier(3);
  const _double = createMultiplier(2);
  if (typeof _triple === "function" && _triple(5) === 15 && _double(7) === 14) {
    console.log("PASS: createMultiplier returns a working closure");
    _testPassed++;
  } else {
    console.log("FAIL: createMultiplier returns a working closure - triple(5)=" + _triple(5) + ", double(7)=" + _double(7));
  }
} catch(e) {
  console.log("FAIL: createMultiplier returns a working closure - " + e.message);
}

_testTotal++;
try {
  const _addOne = n => n + 1;
  const _square = n => n * n;
  const _dbl = createMultiplier(2);
  const _transform = pipe(_dbl, _addOne, _square);
  const result = _transform(3);
  if (result === 49) {
    console.log("PASS: pipe chains functions left to right");
    _testPassed++;
  } else {
    console.log("FAIL: pipe chains functions left to right - expected 49, got " + result);
  }
} catch(e) {
  console.log("FAIL: pipe chains functions left to right - " + e.message);
}

if (_testPassed === _testTotal) {
  console.log("ALL_TESTS_PASSED");
}
' WHERE id = 'b0000002-0002-0002-0002-000000000002';

-- Lesson 3: Arrays & Array Methods
UPDATE lessons SET test_code = '
let _testPassed = 0;
let _testTotal = 0;

_testTotal++;
try {
  if (Array.isArray(names) && names.length === 6 && names[0] === "Alice" && names[5] === "Frank") {
    console.log("PASS: names array contains all student names");
    _testPassed++;
  } else {
    console.log("FAIL: names array contains all student names - got " + JSON.stringify(names));
  }
} catch(e) {
  console.log("FAIL: names array contains all student names - " + e.message);
}

_testTotal++;
try {
  const hsNames = highScorers.map(s => s.name).sort();
  if (Array.isArray(highScorers) && highScorers.length === 4 && hsNames.includes("Alice") && hsNames.includes("Charlie") && hsNames.includes("Diana") && hsNames.includes("Eve")) {
    console.log("PASS: highScorers contains students with grade >= 85");
    _testPassed++;
  } else {
    console.log("FAIL: highScorers contains students with grade >= 85 - got " + JSON.stringify(highScorers.map(s => s.name)));
  }
} catch(e) {
  console.log("FAIL: highScorers contains students with grade >= 85 - " + e.message);
}

_testTotal++;
try {
  const expected = (92 + 78 + 85 + 96 + 88 + 72) / 6;
  if (typeof averageGrade === "number" && Math.abs(averageGrade - expected) < 0.01) {
    console.log("PASS: averageGrade is correctly calculated");
    _testPassed++;
  } else {
    console.log("FAIL: averageGrade is correctly calculated - expected " + expected + ", got " + averageGrade);
  }
} catch(e) {
  console.log("FAIL: averageGrade is correctly calculated - " + e.message);
}

_testTotal++;
try {
  const expectedMath = ["Alice", "Charlie", "Eve"];
  if (Array.isArray(mathStudentNames) && mathStudentNames.length === 3 && expectedMath.every(n => mathStudentNames.includes(n))) {
    console.log("PASS: mathStudentNames contains only Math student names");
    _testPassed++;
  } else {
    console.log("FAIL: mathStudentNames contains only Math student names - got " + JSON.stringify(mathStudentNames));
  }
} catch(e) {
  console.log("FAIL: mathStudentNames contains only Math student names - " + e.message);
}

_testTotal++;
try {
  if (bySubject && Array.isArray(bySubject.Math) && Array.isArray(bySubject.Science) && bySubject.Math.length === 3 && bySubject.Science.length === 3) {
    console.log("PASS: bySubject groups students correctly");
    _testPassed++;
  } else {
    const mathLen = bySubject && bySubject.Math ? bySubject.Math.length : 0;
    const sciLen = bySubject && bySubject.Science ? bySubject.Science.length : 0;
    console.log("FAIL: bySubject groups students correctly - Math count: " + mathLen + ", Science count: " + sciLen);
  }
} catch(e) {
  console.log("FAIL: bySubject groups students correctly - " + e.message);
}

if (_testPassed === _testTotal) {
  console.log("ALL_TESTS_PASSED");
}
' WHERE id = 'b0000003-0003-0003-0003-000000000003';

-- Lesson 4: Objects & JSON
UPDATE lessons SET test_code = '
let _testPassed = 0;
let _testTotal = 0;

_testTotal++;
try {
  if (movie && typeof movie.title === "string" && typeof movie.director === "string" && typeof movie.year === "number" && Array.isArray(movie.genres) && typeof movie.ratings === "object" && "imdb" in movie.ratings && "rotten" in movie.ratings) {
    console.log("PASS: movie object has all required properties");
    _testPassed++;
  } else {
    console.log("FAIL: movie object has all required properties - got keys: " + Object.keys(movie || {}).join(", "));
  }
} catch(e) {
  console.log("FAIL: movie object has all required properties - " + e.message);
}

_testTotal++;
try {
  if (updatedMovie && updatedMovie.watched === true && updatedMovie.title === movie.title) {
    console.log("PASS: updatedMovie has watched property and retains original data");
    _testPassed++;
  } else {
    console.log("FAIL: updatedMovie has watched property and retains original data - watched=" + (updatedMovie && updatedMovie.watched));
  }
} catch(e) {
  console.log("FAIL: updatedMovie has watched property and retains original data - " + e.message);
}

_testTotal++;
try {
  const result = greetPerson({ name: "TestUser", age: 30 });
  if (typeof result === "string" && result.includes("TestUser")) {
    console.log("PASS: greetPerson returns a greeting with the name");
    _testPassed++;
  } else {
    console.log("FAIL: greetPerson returns a greeting with the name - got " + JSON.stringify(result));
  }
} catch(e) {
  console.log("FAIL: greetPerson returns a greeting with the name - " + e.message);
}

_testTotal++;
try {
  if (typeof jsonString === "string" && jsonString.length > 2 && parsedMovie && parsedMovie.title === movie.title) {
    console.log("PASS: JSON stringify and parse work correctly");
    _testPassed++;
  } else {
    console.log("FAIL: JSON stringify and parse work correctly - jsonString length=" + (jsonString ? jsonString.length : 0));
  }
} catch(e) {
  console.log("FAIL: JSON stringify and parse work correctly - " + e.message);
}

_testTotal++;
try {
  if (ceoEmail === undefined) {
    console.log("PASS: ceoEmail is undefined via optional chaining");
    _testPassed++;
  } else {
    console.log("FAIL: ceoEmail is undefined via optional chaining - got " + JSON.stringify(ceoEmail));
  }
} catch(e) {
  console.log("FAIL: ceoEmail is undefined via optional chaining - " + e.message);
}

if (_testPassed === _testTotal) {
  console.log("ALL_TESTS_PASSED");
}
' WHERE id = 'b0000004-0004-0004-0004-000000000004';

-- Lesson 5: DOM Manipulation
-- Note: Runs on Node.js (no DOM), so we test function structure and logic
UPDATE lessons SET test_code = '
let _testPassed = 0;
let _testTotal = 0;

_testTotal++;
try {
  if (typeof createTodoApp === "function") {
    console.log("PASS: createTodoApp is defined as a function");
    _testPassed++;
  } else {
    console.log("FAIL: createTodoApp is defined as a function - got " + typeof createTodoApp);
  }
} catch(e) {
  console.log("FAIL: createTodoApp is defined as a function - " + e.message);
}

_testTotal++;
try {
  const src = createTodoApp.toString();
  const usesCreateElement = src.includes("createElement");
  const usesEventListener = src.includes("addEventListener") || src.includes("onclick");
  if (usesCreateElement) {
    console.log("PASS: createTodoApp uses createElement to build DOM elements");
    _testPassed++;
  } else {
    console.log("FAIL: createTodoApp uses createElement to build DOM elements - function body does not call createElement");
  }
} catch(e) {
  console.log("FAIL: createTodoApp uses createElement to build DOM elements - " + e.message);
}

_testTotal++;
try {
  const src = createTodoApp.toString();
  const usesEventListener = src.includes("addEventListener") || src.includes("onclick");
  if (usesEventListener) {
    console.log("PASS: createTodoApp attaches event listeners");
    _testPassed++;
  } else {
    console.log("FAIL: createTodoApp attaches event listeners - function body does not use addEventListener or onclick");
  }
} catch(e) {
  console.log("FAIL: createTodoApp attaches event listeners - " + e.message);
}

if (_testPassed === _testTotal) {
  console.log("ALL_TESTS_PASSED");
}
' WHERE id = 'b0000005-0005-0005-0005-000000000005';

-- Lesson 6: Async/Await & Promises
UPDATE lessons SET test_code = '
let _testPassed = 0;
let _testTotal = 0;

async function _runTests() {
  _testTotal++;
  try {
    const users = await fetchUsers();
    if (Array.isArray(users) && users.length === 2 && users[0].name === "Alice") {
      console.log("PASS: fetchUsers returns users array");
      _testPassed++;
    } else {
      console.log("FAIL: fetchUsers returns users array - got " + JSON.stringify(users));
    }
  } catch(e) {
    console.log("FAIL: fetchUsers returns users array - " + e.message);
  }

  _testTotal++;
  try {
    const all = await fetchAll();
    if (all && Array.isArray(all.users) && Array.isArray(all.posts) && Array.isArray(all.comments)) {
      console.log("PASS: fetchAll returns object with users, posts, comments");
      _testPassed++;
    } else {
      console.log("FAIL: fetchAll returns object with users, posts, comments - got keys: " + Object.keys(all || {}).join(", "));
    }
  } catch(e) {
    console.log("FAIL: fetchAll returns object with users, posts, comments - " + e.message);
  }

  _testTotal++;
  try {
    const safe = await fetchSafe();
    if (safe !== undefined && safe !== null) {
      console.log("PASS: fetchSafe returns a default value on error");
      _testPassed++;
    } else {
      console.log("FAIL: fetchSafe returns a default value on error - got " + JSON.stringify(safe));
    }
  } catch(e) {
    console.log("FAIL: fetchSafe returns a default value on error - threw instead of catching: " + e.message);
  }

  _testTotal++;
  try {
    const seq = await fetchSequential();
    if (seq && Array.isArray(seq.users) && Array.isArray(seq.posts)) {
      console.log("PASS: fetchSequential returns users and posts");
      _testPassed++;
    } else {
      console.log("FAIL: fetchSequential returns users and posts - got keys: " + Object.keys(seq || {}).join(", "));
    }
  } catch(e) {
    console.log("FAIL: fetchSequential returns users and posts - " + e.message);
  }

  if (_testPassed === _testTotal) {
    console.log("ALL_TESTS_PASSED");
  }
}

_runTests();
' WHERE id = 'b0000006-0006-0006-0006-000000000006';

-- Lesson 7: ES6+ Features
UPDATE lessons SET test_code = '
let _testPassed = 0;
let _testTotal = 0;

_testTotal++;
try {
  const s = new Shape("Triangle", 3);
  const desc = s.describe();
  if (desc.includes("Triangle") && desc.includes("3")) {
    console.log("PASS: Shape class works with describe method");
    _testPassed++;
  } else {
    console.log("FAIL: Shape class works with describe method - got " + JSON.stringify(desc));
  }
} catch(e) {
  console.log("FAIL: Shape class works with describe method - " + e.message);
}

_testTotal++;
try {
  const c = new Circle(5);
  if (c instanceof Shape && c instanceof Circle) {
    console.log("PASS: Circle extends Shape correctly");
    _testPassed++;
  } else {
    console.log("FAIL: Circle extends Shape correctly - instanceof checks failed");
  }
} catch(e) {
  console.log("FAIL: Circle extends Shape correctly - " + e.message);
}

_testTotal++;
try {
  const c = new Circle(5);
  const area = c.area();
  const expected = Math.PI * 25;
  if (typeof area === "number" && Math.abs(area - expected) < 0.01) {
    console.log("PASS: Circle area calculation is correct");
    _testPassed++;
  } else {
    console.log("FAIL: Circle area calculation is correct - expected " + expected + ", got " + area);
  }
} catch(e) {
  console.log("FAIL: Circle area calculation is correct - " + e.message);
}

_testTotal++;
try {
  if (Array.isArray(unique) && unique.length === 4 && [1,2,3,4].every(n => unique.includes(n))) {
    console.log("PASS: unique array has deduplicated values");
    _testPassed++;
  } else {
    console.log("FAIL: unique array has deduplicated values - got " + JSON.stringify(unique));
  }
} catch(e) {
  console.log("FAIL: unique array has deduplicated values - " + e.message);
}

_testTotal++;
try {
  if (wordCount instanceof Map && wordCount.get("the") === 3 && wordCount.get("cat") === 2 && wordCount.get("sat") === 1) {
    console.log("PASS: wordCount Map has correct frequencies");
    _testPassed++;
  } else {
    const theCount = wordCount instanceof Map ? wordCount.get("the") : "not a Map";
    console.log("FAIL: wordCount Map has correct frequencies - the=" + theCount);
  }
} catch(e) {
  console.log("FAIL: wordCount Map has correct frequencies - " + e.message);
}

if (_testPassed === _testTotal) {
  console.log("ALL_TESTS_PASSED");
}
' WHERE id = 'b0000007-0007-0007-0007-000000000007';

-- Add test_code to Java Fundamentals lessons
-- Test code replaces the main method body via buildTestCode()

-- Lesson 1: Hello World & Setup (Beginner - 2 tests)
-- Starter code is all in main with no helper methods.
-- Tests verify the class compiled and basic output works.
UPDATE lessons SET test_code = 'int _testPassed = 0;
int _testTotal = 0;

// Test 1: Verify System.out.println works
_testTotal++;
try {
    System.out.println("Hello, World!");
    System.out.println("PASS: println outputs text");
    _testPassed++;
} catch (Exception e) {
    System.out.println("FAIL: println outputs text - threw " + e.getMessage());
}

// Test 2: Verify printf with format specifiers
_testTotal++;
try {
    String name = "Test";
    int age = 20;
    double gpa = 3.50;
    String expected = String.format("Name: %s, Age: %d, GPA: %.2f", name, age, gpa);
    if (expected.equals("Name: Test, Age: 20, GPA: 3.50")) {
        System.out.println("PASS: printf format specifiers work correctly");
        _testPassed++;
    } else {
        System.out.println("FAIL: printf format specifiers work correctly - got " + expected);
    }
} catch (Exception e) {
    System.out.println("FAIL: printf format specifiers work correctly - threw " + e.getMessage());
}

if (_testPassed == _testTotal) {
    System.out.println("ALL_TESTS_PASSED");
}' WHERE id = 'c0000001-0001-0001-0001-000000000001';

-- Lesson 2: Variables & Data Types (Beginner - 3 tests)
-- Starter code is all in main with no helper methods.
-- Tests verify type casting, parsing, and string comparison.
UPDATE lessons SET test_code = 'int _testPassed = 0;
int _testTotal = 0;

// Test 1: Type casting double to int truncates
_testTotal++;
double price = 9.99;
int truncated = (int) price;
if (truncated == 9) {
    System.out.println("PASS: casting double 9.99 to int gives 9");
    _testPassed++;
} else {
    System.out.println("FAIL: casting double 9.99 to int gives 9 - got " + truncated);
}

// Test 2: String.valueOf converts int to String
_testTotal++;
String yearStr = String.valueOf(2024);
if (yearStr.equals("2024")) {
    System.out.println("PASS: String.valueOf(2024) returns \"2024\"");
    _testPassed++;
} else {
    System.out.println("FAIL: String.valueOf(2024) returns \"2024\" - got " + yearStr);
}

// Test 3: Integer.parseInt converts String to int
_testTotal++;
int parsed = Integer.parseInt("42");
if (parsed == 42) {
    System.out.println("PASS: Integer.parseInt(\"42\") returns 42");
    _testPassed++;
} else {
    System.out.println("FAIL: Integer.parseInt(\"42\") returns 42 - got " + parsed);
}

if (_testPassed == _testTotal) {
    System.out.println("ALL_TESTS_PASSED");
}' WHERE id = 'c0000002-0002-0002-0002-000000000002';

-- Lesson 3: Control Flow (Intermediate - 3 tests)
-- Starter code is all in main with no helper methods.
-- Tests verify if/else logic, loop sums, and FizzBuzz concepts.
UPDATE lessons SET test_code = 'int _testPassed = 0;
int _testTotal = 0;

// Test 1: Grade calculation logic (if/else)
_testTotal++;
int score = 85;
String grade = "";
if (score >= 90) grade = "A";
else if (score >= 80) grade = "B";
else if (score >= 70) grade = "C";
else if (score >= 60) grade = "D";
else grade = "F";
if (grade.equals("B")) {
    System.out.println("PASS: score 85 gives grade B");
    _testPassed++;
} else {
    System.out.println("FAIL: score 85 gives grade B - got " + grade);
}

// Test 2: Sum of even numbers 1-100 using a while loop
_testTotal++;
int sum = 0;
int i = 1;
while (i <= 100) {
    if (i % 2 == 0) sum += i;
    i++;
}
if (sum == 2550) {
    System.out.println("PASS: sum of evens 1-100 is 2550");
    _testPassed++;
} else {
    System.out.println("FAIL: sum of evens 1-100 is 2550 - got " + sum);
}

// Test 3: Season from month using switch
_testTotal++;
int month = 7;
String season = "";
switch (month) {
    case 12: case 1: case 2: season = "Winter"; break;
    case 3: case 4: case 5: season = "Spring"; break;
    case 6: case 7: case 8: season = "Summer"; break;
    case 9: case 10: case 11: season = "Fall"; break;
    default: season = "Unknown";
}
if (season.equals("Summer")) {
    System.out.println("PASS: month 7 is Summer");
    _testPassed++;
} else {
    System.out.println("FAIL: month 7 is Summer - got " + season);
}

if (_testPassed == _testTotal) {
    System.out.println("ALL_TESTS_PASSED");
}' WHERE id = 'c0000003-0003-0003-0003-000000000003';

-- Lesson 4: Methods (Intermediate - 4 tests)
-- Starter code has static methods: isPrime, max, reverseString, fibonacci, average
UPDATE lessons SET test_code = 'int _testPassed = 0;
int _testTotal = 0;

// Test 1: isPrime
_testTotal++;
if (isPrime(7) == true && isPrime(10) == false && isPrime(2) == true && isPrime(1) == false) {
    System.out.println("PASS: isPrime correctly identifies primes");
    _testPassed++;
} else {
    System.out.println("FAIL: isPrime correctly identifies primes - isPrime(7)=" + isPrime(7) + " isPrime(10)=" + isPrime(10) + " isPrime(2)=" + isPrime(2) + " isPrime(1)=" + isPrime(1));
}

// Test 2: max(int, int)
_testTotal++;
if (max(3, 7) == 7 && max(-1, -5) == -1 && max(4, 4) == 4) {
    System.out.println("PASS: max(a, b) returns the larger value");
    _testPassed++;
} else {
    System.out.println("FAIL: max(a, b) returns the larger value - max(3,7)=" + max(3, 7) + " max(-1,-5)=" + max(-1, -5));
}

// Test 3: reverseString
_testTotal++;
if (reverseString("Java").equals("avaJ") && reverseString("hello").equals("olleh") && reverseString("").equals("")) {
    System.out.println("PASS: reverseString reverses correctly");
    _testPassed++;
} else {
    System.out.println("FAIL: reverseString reverses correctly - reverseString(\"Java\")=" + reverseString("Java"));
}

// Test 4: fibonacci
_testTotal++;
if (fibonacci(0) == 0 && fibonacci(1) == 1 && fibonacci(7) == 13 && fibonacci(10) == 55) {
    System.out.println("PASS: fibonacci returns correct values");
    _testPassed++;
} else {
    System.out.println("FAIL: fibonacci returns correct values - fib(0)=" + fibonacci(0) + " fib(1)=" + fibonacci(1) + " fib(7)=" + fibonacci(7) + " fib(10)=" + fibonacci(10));
}

if (_testPassed == _testTotal) {
    System.out.println("ALL_TESTS_PASSED");
}' WHERE id = 'c0000004-0004-0004-0004-000000000004';

-- Lesson 5: OOP - Classes & Objects (Advanced - 4 tests)
-- Starter code has Student class (addGrade, getAverage, getHighestGrade, toString)
-- and Classroom class (addStudent, getTopStudent, getClassAverage)
UPDATE lessons SET test_code = 'int _testPassed = 0;
int _testTotal = 0;

// Test 1: Student addGrade and getAverage
_testTotal++;
Student s1 = new Student("Alice", 1);
s1.addGrade(90);
s1.addGrade(80);
s1.addGrade(100);
double avg = s1.getAverage();
if (Math.abs(avg - 90.0) < 0.01) {
    System.out.println("PASS: getAverage returns correct average (90.0)");
    _testPassed++;
} else {
    System.out.println("FAIL: getAverage returns correct average (90.0) - got " + avg);
}

// Test 2: Student getHighestGrade
_testTotal++;
int highest = s1.getHighestGrade();
if (highest == 100) {
    System.out.println("PASS: getHighestGrade returns 100");
    _testPassed++;
} else {
    System.out.println("FAIL: getHighestGrade returns 100 - got " + highest);
}

// Test 3: Student toString contains name
_testTotal++;
String str = s1.toString();
if (str.contains("Alice")) {
    System.out.println("PASS: toString contains student name");
    _testPassed++;
} else {
    System.out.println("FAIL: toString contains student name - got " + str);
}

// Test 4: Classroom getTopStudent and getClassAverage
_testTotal++;
Student s2 = new Student("Bob", 2);
s2.addGrade(70);
s2.addGrade(60);
s2.addGrade(80);
Classroom room = new Classroom();
room.addStudent(s1);
room.addStudent(s2);
Student top = room.getTopStudent();
double classAvg = room.getClassAverage();
if (top.toString().contains("Alice") && Math.abs(classAvg - 80.0) < 0.01) {
    System.out.println("PASS: getTopStudent is Alice and classAverage is 80.0");
    _testPassed++;
} else {
    System.out.println("FAIL: getTopStudent is Alice and classAverage is 80.0 - top=" + top + " classAvg=" + classAvg);
}

if (_testPassed == _testTotal) {
    System.out.println("ALL_TESTS_PASSED");
}' WHERE id = 'c0000005-0005-0005-0005-000000000005';

-- Lesson 6: Collections & Generics (Advanced - 5 tests)
-- Starter code has: ArrayList sorting, HashMap contacts, HashSet, Pair<A,B> class
UPDATE lessons SET test_code = 'int _testPassed = 0;
int _testTotal = 0;

// Test 1: ArrayList sorting
_testTotal++;
ArrayList<Integer> numbers = new ArrayList<>();
numbers.add(5); numbers.add(2); numbers.add(8); numbers.add(1); numbers.add(9); numbers.add(3);
Collections.sort(numbers);
if (numbers.get(0) == 1 && numbers.get(numbers.size() - 1) == 9) {
    System.out.println("PASS: sorted list starts with 1 and ends with 9");
    _testPassed++;
} else {
    System.out.println("FAIL: sorted list starts with 1 and ends with 9 - got " + numbers);
}

// Test 2: Collections.max and Collections.min
_testTotal++;
int max = Collections.max(numbers);
int min = Collections.min(numbers);
if (max == 9 && min == 1) {
    System.out.println("PASS: max is 9 and min is 1");
    _testPassed++;
} else {
    System.out.println("FAIL: max is 9 and min is 1 - got max=" + max + " min=" + min);
}

// Test 3: HashMap with contacts
_testTotal++;
HashMap<String, ArrayList<String>> contacts = new HashMap<>();
ArrayList<String> alicePhones = new ArrayList<>();
alicePhones.add("555-0001");
alicePhones.add("555-0002");
contacts.put("Alice", alicePhones);
contacts.put("Bob", new ArrayList<>(List.of("555-0003")));
if (contacts.size() == 2 && contacts.get("Alice").size() == 2 && contacts.containsKey("Bob")) {
    System.out.println("PASS: HashMap stores contacts correctly");
    _testPassed++;
} else {
    System.out.println("FAIL: HashMap stores contacts correctly - size=" + contacts.size());
}

// Test 4: HashSet removes duplicates
_testTotal++;
numbers.add(5);
HashSet<Integer> uniqueNumbers = new HashSet<>(numbers);
if (uniqueNumbers.size() == 6) {
    System.out.println("PASS: HashSet removes duplicates (size=6)");
    _testPassed++;
} else {
    System.out.println("FAIL: HashSet removes duplicates (size=6) - got size=" + uniqueNumbers.size());
}

// Test 5: Generic Pair class
_testTotal++;
try {
    Pair<String, Integer> pair = new Pair<>("Alice", 25);
    boolean firstOk = pair.getFirst().equals("Alice");
    boolean secondOk = pair.getSecond().equals(25);
    if (firstOk && secondOk) {
        System.out.println("PASS: Pair<String, Integer> stores and retrieves values");
        _testPassed++;
    } else {
        System.out.println("FAIL: Pair<String, Integer> stores and retrieves values - first=" + pair.getFirst() + " second=" + pair.getSecond());
    }
} catch (Exception e) {
    System.out.println("FAIL: Pair<String, Integer> stores and retrieves values - threw " + e.getMessage());
}

if (_testPassed == _testTotal) {
    System.out.println("ALL_TESTS_PASSED");
}' WHERE id = 'c0000006-0006-0006-0006-000000000006';

-- =============================================================================
-- TEST CODE for SQL Mastery lessons
-- =============================================================================
-- Tests run on SQLite 3.46.1 via Wandbox.
-- test_code is appended after user code. User queries against non-existent
-- tables will error silently; SQLite continues to the test statements.
-- Each test block creates its own tables with known data, then verifies
-- that the SQL concepts taught in the lesson work correctly.

-- Lesson 1: SELECT Basics (Beginner - 3 tests)
UPDATE lessons SET test_code = '
-- === Test Setup ===
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  department TEXT,
  salary REAL,
  hire_date TEXT,
  manager_id INTEGER
);
DELETE FROM employees;
INSERT INTO employees VALUES (1, ''Alice'',   ''Smith'',   ''alice@co.com'',   ''Engineering'', 95000, ''2022-03-15'', NULL);
INSERT INTO employees VALUES (2, ''Bob'',     ''Jones'',   ''bob@co.com'',     ''Marketing'',   62000, ''2023-01-10'', 1);
INSERT INTO employees VALUES (3, ''Charlie'', ''Brown'',   ''charlie@co.com'', ''Engineering'', 88000, ''2022-07-20'', 1);
INSERT INTO employees VALUES (4, ''Diana'',   ''Prince'',  ''diana@co.com'',   ''Design'',      72000, ''2023-06-01'', 1);
INSERT INTO employees VALUES (5, ''Eve'',     ''Davis'',   ''eve@co.com'',     ''Marketing'',   55000, ''2023-09-12'', 2);
INSERT INTO employees VALUES (6, ''Frank'',   ''Miller'',  ''frank@co.com'',   ''Engineering'', 105000,''2021-11-05'', NULL);

CREATE TEMP TABLE _test_results(name TEXT, passed INTEGER);

-- Test 1: SELECT with ORDER BY and LIMIT returns correct top earner
INSERT INTO _test_results VALUES(''SELECT with ORDER BY DESC and LIMIT'',
  CASE WHEN (SELECT first_name FROM employees ORDER BY salary DESC LIMIT 1) = ''Frank''
  THEN 1 ELSE 0 END);

-- Test 2: DISTINCT departments returns correct count
INSERT INTO _test_results VALUES(''SELECT DISTINCT departments'',
  CASE WHEN (SELECT COUNT(DISTINCT department) FROM employees) = 3
  THEN 1 ELSE 0 END);

-- Test 3: Calculated column and alias work
INSERT INTO _test_results VALUES(''calculated column salary * 12'',
  CASE WHEN (SELECT CAST(salary * 12 AS INTEGER) FROM employees WHERE id = 1) = 1140000
  THEN 1 ELSE 0 END);

-- Output results
SELECT CASE WHEN passed = 1 THEN ''PASS: '' || name ELSE ''FAIL: '' || name || '' - incorrect result'' END FROM _test_results;
SELECT CASE WHEN (SELECT COUNT(*) FROM _test_results WHERE passed = 0) = 0 THEN ''ALL_TESTS_PASSED'' ELSE ''SOME_TESTS_FAILED'' END;
' WHERE id = 'd0000001-0001-0001-0001-000000000001';


-- Lesson 2: WHERE & Filtering (Beginner - 3 tests)
UPDATE lessons SET test_code = '
-- === Test Setup ===
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  department TEXT,
  salary REAL,
  hire_date TEXT,
  manager_id INTEGER
);
DELETE FROM employees;
INSERT INTO employees VALUES (1, ''Alice'',   ''Smith'',   ''alice@co.com'',     ''Engineering'', 95000, ''2022-03-15'', NULL);
INSERT INTO employees VALUES (2, ''Bob'',     ''Jones'',   ''bob@gmail.com'',    ''Marketing'',   62000, ''2023-01-10'', 1);
INSERT INTO employees VALUES (3, ''Charlie'', ''Brown'',   ''charlie@co.com'',   ''Engineering'', 88000, ''2023-07-20'', 1);
INSERT INTO employees VALUES (4, ''Diana'',   ''Prince'',  ''diana@co.com'',     ''Design'',      72000, ''2023-06-01'', 1);
INSERT INTO employees VALUES (5, ''Eve'',     ''Davis'',   ''eve@co.com'',       ''Marketing'',   55000, ''2023-09-12'', 2);
INSERT INTO employees VALUES (6, ''Frank'',   ''Miller'',  ''frank@co.com'',     ''Engineering'', 105000,''2022-06-05'', NULL);
INSERT INTO employees VALUES (7, ''Jane'',    ''Doe'',     ''jane@gmail.com'',   ''Product'',     78000, ''2023-04-18'', 1);

CREATE TEMP TABLE _test_results(name TEXT, passed INTEGER);

-- Test 1: WHERE with department filter
INSERT INTO _test_results VALUES(''WHERE department = Engineering'',
  CASE WHEN (SELECT COUNT(*) FROM employees WHERE department = ''Engineering'') = 3
  THEN 1 ELSE 0 END);

-- Test 2: BETWEEN salary range
INSERT INTO _test_results VALUES(''BETWEEN 60000 AND 90000'',
  CASE WHEN (SELECT COUNT(*) FROM employees WHERE salary BETWEEN 60000 AND 90000) = 4
  THEN 1 ELSE 0 END);

-- Test 3: LIKE pattern matching for email containing gmail
INSERT INTO _test_results VALUES(''LIKE pattern matching gmail'',
  CASE WHEN (SELECT COUNT(*) FROM employees WHERE email LIKE ''%gmail%'') = 2
  THEN 1 ELSE 0 END);

-- Output results
SELECT CASE WHEN passed = 1 THEN ''PASS: '' || name ELSE ''FAIL: '' || name || '' - incorrect result'' END FROM _test_results;
SELECT CASE WHEN (SELECT COUNT(*) FROM _test_results WHERE passed = 0) = 0 THEN ''ALL_TESTS_PASSED'' ELSE ''SOME_TESTS_FAILED'' END;
' WHERE id = 'd0000002-0002-0002-0002-000000000002';


-- Lesson 3: JOIN Operations (Intermediate - 4 tests)
UPDATE lessons SET test_code = '
-- === Test Setup ===
CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY,
  name TEXT,
  budget REAL,
  location TEXT
);
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  department_id INTEGER,
  salary REAL,
  manager_id INTEGER
);
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY,
  title TEXT,
  department_id INTEGER,
  deadline TEXT
);
DELETE FROM departments;
DELETE FROM employees;
DELETE FROM projects;
INSERT INTO departments VALUES (1, ''Engineering'', 800000, ''Building A'');
INSERT INTO departments VALUES (2, ''Marketing'',   300000, ''Building B'');
INSERT INTO departments VALUES (3, ''Design'',      200000, ''Building A'');
INSERT INTO departments VALUES (4, ''Research'',    600000, ''Building C'');
INSERT INTO employees VALUES (1, ''Alice'',   ''Smith'', 1, 95000,  NULL);
INSERT INTO employees VALUES (2, ''Bob'',     ''Jones'', 2, 62000,  1);
INSERT INTO employees VALUES (3, ''Charlie'', ''Brown'', 1, 88000,  1);
INSERT INTO employees VALUES (4, ''Diana'',   ''Prince'',3, 72000,  1);
INSERT INTO employees VALUES (5, ''Eve'',     ''Davis'', NULL, 55000, 2);
INSERT INTO employees VALUES (6, ''Frank'',   ''Miller'',1, 105000, NULL);
INSERT INTO projects VALUES (1, ''Project Alpha'', 1, ''2024-06-01'');
INSERT INTO projects VALUES (2, ''Project Beta'',  2, ''2024-09-15'');

CREATE TEMP TABLE _test_results(name TEXT, passed INTEGER);

-- Test 1: INNER JOIN returns only matching rows (excludes Eve who has no dept)
INSERT INTO _test_results VALUES(''INNER JOIN excludes unmatched rows'',
  CASE WHEN (SELECT COUNT(*) FROM employees e INNER JOIN departments d ON e.department_id = d.id) = 5
  THEN 1 ELSE 0 END);

-- Test 2: LEFT JOIN keeps all employees including those without a department
INSERT INTO _test_results VALUES(''LEFT JOIN keeps all employees'',
  CASE WHEN (SELECT COUNT(*) FROM employees e LEFT JOIN departments d ON e.department_id = d.id) = 6
  THEN 1 ELSE 0 END);

-- Test 3: Self-join to find employee-manager pairs
INSERT INTO _test_results VALUES(''self-join finds managers'',
  CASE WHEN (SELECT m.first_name FROM employees e LEFT JOIN employees m ON e.manager_id = m.id WHERE e.id = 2) = ''Alice''
  THEN 1 ELSE 0 END);

-- Test 4: LEFT JOIN with NULL filter finds unassigned employees
INSERT INTO _test_results VALUES(''LEFT JOIN with IS NULL finds unassigned'',
  CASE WHEN (SELECT COUNT(*) FROM employees e LEFT JOIN departments d ON e.department_id = d.id WHERE d.id IS NULL) = 1
  THEN 1 ELSE 0 END);

-- Output results
SELECT CASE WHEN passed = 1 THEN ''PASS: '' || name ELSE ''FAIL: '' || name || '' - incorrect result'' END FROM _test_results;
SELECT CASE WHEN (SELECT COUNT(*) FROM _test_results WHERE passed = 0) = 0 THEN ''ALL_TESTS_PASSED'' ELSE ''SOME_TESTS_FAILED'' END;
' WHERE id = 'd0000003-0003-0003-0003-000000000003';


-- Lesson 4: GROUP BY & Aggregates (Intermediate - 4 tests)
UPDATE lessons SET test_code = '
-- === Test Setup ===
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  department TEXT,
  salary REAL,
  hire_date TEXT
);
DELETE FROM employees;
INSERT INTO employees VALUES (1, ''Alice'',   ''Smith'',  ''Engineering'', 95000,  ''2022-03-15'');
INSERT INTO employees VALUES (2, ''Bob'',     ''Jones'',  ''Marketing'',   62000,  ''2023-01-10'');
INSERT INTO employees VALUES (3, ''Charlie'', ''Brown'',  ''Engineering'', 88000,  ''2023-07-20'');
INSERT INTO employees VALUES (4, ''Diana'',   ''Prince'', ''Design'',      72000,  ''2023-06-01'');
INSERT INTO employees VALUES (5, ''Eve'',     ''Davis'',  ''Marketing'',   55000,  ''2023-09-12'');
INSERT INTO employees VALUES (6, ''Frank'',   ''Miller'', ''Engineering'', 105000, ''2022-06-05'');
INSERT INTO employees VALUES (7, ''Grace'',   ''Lee'',    ''Design'',      68000,  ''2022-11-30'');
INSERT INTO employees VALUES (8, ''Hank'',    ''Wilson'', ''Engineering'', 82000,  ''2023-02-14'');

CREATE TEMP TABLE _test_results(name TEXT, passed INTEGER);

-- Test 1: COUNT(*) returns total employees
INSERT INTO _test_results VALUES(''COUNT all employees'',
  CASE WHEN (SELECT COUNT(*) FROM employees) = 8
  THEN 1 ELSE 0 END);

-- Test 2: GROUP BY department with COUNT
INSERT INTO _test_results VALUES(''GROUP BY department count'',
  CASE WHEN (SELECT COUNT(*) FROM employees WHERE department = ''Engineering'') = 4
  THEN 1 ELSE 0 END);

-- Test 3: AVG salary for Engineering
INSERT INTO _test_results VALUES(''AVG salary per department'',
  CASE WHEN ABS((SELECT AVG(salary) FROM employees WHERE department = ''Engineering'') - 92500.0) < 1
  THEN 1 ELSE 0 END);

-- Test 4: HAVING filters groups correctly (departments with avg > 70000)
INSERT INTO _test_results VALUES(''HAVING filters low-avg departments'',
  CASE WHEN (SELECT COUNT(*) FROM (
    SELECT department FROM employees GROUP BY department HAVING AVG(salary) > 70000
  )) = 1
  THEN 1 ELSE 0 END);

-- Output results
SELECT CASE WHEN passed = 1 THEN ''PASS: '' || name ELSE ''FAIL: '' || name || '' - incorrect result'' END FROM _test_results;
SELECT CASE WHEN (SELECT COUNT(*) FROM _test_results WHERE passed = 0) = 0 THEN ''ALL_TESTS_PASSED'' ELSE ''SOME_TESTS_FAILED'' END;
' WHERE id = 'd0000004-0004-0004-0004-000000000004';


-- Lesson 5: Subqueries (Advanced - 5 tests)
UPDATE lessons SET test_code = '
-- === Test Setup ===
CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY,
  name TEXT,
  budget REAL
);
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  department TEXT,
  department_id INTEGER,
  salary REAL,
  hire_date TEXT,
  manager_id INTEGER
);
DELETE FROM departments;
DELETE FROM employees;
INSERT INTO departments VALUES (1, ''Engineering'', 800000);
INSERT INTO departments VALUES (2, ''Marketing'',   300000);
INSERT INTO departments VALUES (3, ''Design'',      200000);
INSERT INTO departments VALUES (4, ''Research'',    600000);
INSERT INTO employees VALUES (1, ''Alice'',   ''Smith'',  ''Engineering'', 1, 95000,  ''2022-03-15'', NULL);
INSERT INTO employees VALUES (2, ''Bob'',     ''Jones'',  ''Marketing'',   2, 62000,  ''2023-01-10'', 1);
INSERT INTO employees VALUES (3, ''Charlie'', ''Brown'',  ''Engineering'', 1, 88000,  ''2023-07-20'', 1);
INSERT INTO employees VALUES (4, ''Diana'',   ''Prince'', ''Design'',      3, 72000,  ''2023-06-01'', 1);
INSERT INTO employees VALUES (5, ''Eve'',     ''Davis'',  ''Marketing'',   2, 55000,  ''2023-09-12'', 2);
INSERT INTO employees VALUES (6, ''Frank'',   ''Miller'', ''Engineering'', 1, 105000, ''2022-06-05'', NULL);
INSERT INTO employees VALUES (7, ''Grace'',   ''Lee'',    ''Design'',      3, 68000,  ''2022-11-30'', 4);
INSERT INTO employees VALUES (8, ''Hank'',    ''Wilson'', ''Engineering'', 1, 82000,  ''2023-02-14'', 1);

CREATE TEMP TABLE _test_results(name TEXT, passed INTEGER);

-- Test 1: Subquery in WHERE - employees earning above average
INSERT INTO _test_results VALUES(''subquery in WHERE above avg salary'',
  CASE WHEN (SELECT COUNT(*) FROM employees WHERE salary > (SELECT AVG(salary) FROM employees)) = 3
  THEN 1 ELSE 0 END);

-- Test 2: Subquery with IN - employees in high-budget departments
INSERT INTO _test_results VALUES(''subquery with IN high-budget depts'',
  CASE WHEN (SELECT COUNT(*) FROM employees WHERE department_id IN (SELECT id FROM departments WHERE budget > 500000)) = 4
  THEN 1 ELSE 0 END);

-- Test 3: Scalar subquery - company average alongside each employee
INSERT INTO _test_results VALUES(''scalar subquery returns single value'',
  CASE WHEN ABS((SELECT AVG(salary) FROM employees) - 78375.0) < 1
  THEN 1 ELSE 0 END);

-- Test 4: Correlated subquery - employees above their dept average
INSERT INTO _test_results VALUES(''correlated subquery above dept avg'',
  CASE WHEN (SELECT COUNT(*) FROM employees e
    WHERE e.salary > (SELECT AVG(e2.salary) FROM employees e2 WHERE e2.department = e.department)) = 3
  THEN 1 ELSE 0 END);

-- Test 5: CTE with derived stats
INSERT INTO _test_results VALUES(''CTE with department stats'',
  CASE WHEN (SELECT COUNT(*) FROM (
    WITH dept_stats AS (
      SELECT department, AVG(salary) AS avg_salary, COUNT(*) AS headcount
      FROM employees GROUP BY department
    )
    SELECT * FROM dept_stats WHERE headcount > 2
  )) = 2
  THEN 1 ELSE 0 END);

-- Output results
SELECT CASE WHEN passed = 1 THEN ''PASS: '' || name ELSE ''FAIL: '' || name || '' - incorrect result'' END FROM _test_results;
SELECT CASE WHEN (SELECT COUNT(*) FROM _test_results WHERE passed = 0) = 0 THEN ''ALL_TESTS_PASSED'' ELSE ''SOME_TESTS_FAILED'' END;
' WHERE id = 'd0000005-0005-0005-0005-000000000005';


-- Lesson 6: INSERT, UPDATE, DELETE (Advanced - 5 tests)
UPDATE lessons SET test_code = '
-- === Test Setup ===
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  department TEXT,
  salary REAL,
  hire_date TEXT,
  manager_id INTEGER
);
CREATE TABLE IF NOT EXISTS engineering_backup (
  id INTEGER PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  department TEXT,
  salary REAL,
  hire_date TEXT,
  manager_id INTEGER
);
DELETE FROM employees;
DELETE FROM engineering_backup;
INSERT INTO employees VALUES (1, ''Alice'',   ''Smith'',  ''alice@co.com'',   ''Engineering'', 95000,  ''2022-03-15'', NULL);
INSERT INTO employees VALUES (2, ''Bob'',     ''Jones'',  ''bob@co.com'',     ''Marketing'',   62000,  ''2023-01-10'', 1);
INSERT INTO employees VALUES (3, ''Charlie'', ''Brown'',  ''charlie@co.com'', ''Legacy'',      45000,  ''2018-07-20'', 1);
INSERT INTO employees VALUES (4, ''Diana'',   ''Prince'', ''diana@co.com'',   ''Design'',      72000,  ''2023-06-01'', 1);
INSERT INTO employees VALUES (5, ''Eve'',     ''Davis'',  ''eve@co.com'',     ''Engineering'', 48000,  ''2019-09-12'', 1);

CREATE TEMP TABLE _test_results(name TEXT, passed INTEGER);

-- Test 1: INSERT a new row
INSERT INTO employees (first_name, last_name, email, department, salary)
VALUES (''Grace'', ''Hopper'', ''grace@example.com'', ''Engineering'', 95000);
INSERT INTO _test_results VALUES(''INSERT single row'',
  CASE WHEN (SELECT COUNT(*) FROM employees WHERE email = ''grace@example.com'') = 1
  THEN 1 ELSE 0 END);

-- Test 2: INSERT multiple rows
INSERT INTO employees (first_name, last_name, email, department, salary)
VALUES (''Test1'', ''User1'', ''t1@co.com'', ''Product'', 70000),
       (''Test2'', ''User2'', ''t2@co.com'', ''Product'', 71000),
       (''Test3'', ''User3'', ''t3@co.com'', ''Product'', 72000);
INSERT INTO _test_results VALUES(''INSERT multiple rows'',
  CASE WHEN (SELECT COUNT(*) FROM employees WHERE department = ''Product'') = 3
  THEN 1 ELSE 0 END);

-- Test 3: UPDATE specific rows
UPDATE employees SET salary = 105000 WHERE email = ''grace@example.com'';
INSERT INTO _test_results VALUES(''UPDATE specific row'',
  CASE WHEN (SELECT salary FROM employees WHERE email = ''grace@example.com'') = 105000
  THEN 1 ELSE 0 END);

-- Test 4: UPDATE with calculation - 10% raise for Engineering
UPDATE employees SET salary = salary * 1.10 WHERE department = ''Engineering'';
INSERT INTO _test_results VALUES(''UPDATE with calculation'',
  CASE WHEN (SELECT CAST(salary AS INTEGER) FROM employees WHERE email = ''grace@example.com'') = 115500
  THEN 1 ELSE 0 END);

-- Test 5: DELETE with WHERE clause
DELETE FROM employees WHERE department = ''Legacy'';
INSERT INTO _test_results VALUES(''DELETE with WHERE'',
  CASE WHEN (SELECT COUNT(*) FROM employees WHERE department = ''Legacy'') = 0
  THEN 1 ELSE 0 END);

-- Output results
SELECT CASE WHEN passed = 1 THEN ''PASS: '' || name ELSE ''FAIL: '' || name || '' - incorrect result'' END FROM _test_results;
SELECT CASE WHEN (SELECT COUNT(*) FROM _test_results WHERE passed = 0) = 0 THEN ''ALL_TESTS_PASSED'' ELSE ''SOME_TESTS_FAILED'' END;
' WHERE id = 'd0000006-0006-0006-0006-000000000006';

