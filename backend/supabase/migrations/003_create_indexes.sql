CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_chunks_lesson ON lesson_chunks(lesson_id);
CREATE INDEX idx_chunks_embedding ON lesson_chunks USING hnsw (embedding extensions.vector_cosine_ops);
CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_chat_session ON chat_messages(session_id);
