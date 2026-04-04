export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  price: number;
  is_free: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string;
  order_index: number;
  starter_code: string;
  language: string;
  test_code: string;
  created_at: string;
}

export type UserRole = "admin" | "student";

export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  lesson_id: string;
  score: number;
  total_questions: number;
  questions_json: string;
  created_at: string;
}

export type Difficulty = "easy" | "medium" | "hard";

export interface Problem {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  starter_code: Record<string, string>;
  test_code: Record<string, string>;
  hints: string[];
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  created_at: string;
  updated_at: string;
}

export interface ProblemSubmission {
  id: string;
  user_id: string;
  problem_id: string;
  language: string;
  code: string;
  passed: boolean;
  test_results: { name: string; passed: boolean; message: string }[] | null;
  runtime_ms: number | null;
  created_at: string;
}
