CREATE OR REPLACE FUNCTION search_lesson_chunks(
  query_embedding extensions.vector(1536),
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  lesson_id UUID,
  lesson_title TEXT,
  chunk_text TEXT,
  similarity_score FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    lc.lesson_id,
    l.title AS lesson_title,
    lc.chunk_text,
    1 - (lc.embedding <=> query_embedding) AS similarity_score
  FROM lesson_chunks lc
  JOIN lessons l ON l.id = lc.lesson_id
  ORDER BY lc.embedding <=> query_embedding
  LIMIT match_count;
$$;
