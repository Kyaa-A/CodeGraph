-- Problems table (LeetCode-style coding challenges)
CREATE TABLE IF NOT EXISTS problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topics TEXT[] DEFAULT '{}',
  starter_code JSONB DEFAULT '{}',
  test_code JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Problem submissions
CREATE TABLE IF NOT EXISTS problem_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  passed BOOLEAN DEFAULT false,
  results JSONB DEFAULT '[]',
  solve_time_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_problem_submissions_user_id ON problem_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_problem_submissions_problem_id ON problem_submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_problem_submissions_user_passed ON problem_submissions(user_id, passed);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
