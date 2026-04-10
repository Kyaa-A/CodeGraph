const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    return url.toString();
  }

  async get<T>(path: string, options?: FetchOptions): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const res = await fetch(this.buildUrl(path, params), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      ...fetchOptions,
    });
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  }

  async post<T>(
    path: string,
    body?: unknown,
    options?: FetchOptions
  ): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const res = await fetch(this.buildUrl(path, params), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      ...fetchOptions,
    });
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  }

  async stream(
    path: string,
    body: unknown,
    onEvent: (event: string, data: string) => void
  ): Promise<void> {
    const res = await fetch(this.buildUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      let currentEvent = "message";
      for (const line of lines) {
        if (line.startsWith("event: ")) {
          currentEvent = line.slice(7).trim();
        } else if (line.startsWith("data: ")) {
          const data = line.slice(6);
          onEvent(currentEvent, data);
        }
      }
    }
  }
}

export const api = new ApiClient(API_URL);

// ----- Typed API methods -----

export interface SearchResult {
  lesson_id: string;
  lesson_title: string;
  chunk_text: string;
  similarity_score: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatSource {
  lesson_id: string;
  lesson_title: string;
}

export async function createChatSession(
  lessonId: string
): Promise<{ session_id: string }> {
  return api.post("/api/chat/session", undefined, {
    params: { lesson_id: lessonId },
  });
}

export async function sendChatMessage(
  sessionId: string,
  lessonId: string,
  message: string
): Promise<{ response: string; sources: ChatSource[] }> {
  return api.post("/api/chat", {
    session_id: sessionId,
    lesson_id: lessonId,
    message,
  });
}

export async function searchLessons(
  query: string,
  topK: number = 5
): Promise<{ results: SearchResult[] }> {
  return api.post("/api/search", { query, top_k: topK });
}

export interface QuizChoice {
  label: string; // "A", "B", "C", "D"
  text: string;
}

export interface QuizQuestion {
  question: string;
  choices: QuizChoice[];
  correct_answer: string; // label, e.g. "B"
  explanation: string;
}

export interface QuizResponse {
  lesson_id: string;
  questions: QuizQuestion[];
  total_questions: number;
}

export async function generateQuiz(
  lessonId: string
): Promise<QuizResponse> {
  return api.post(`/api/quiz/generate/${lessonId}`);
}

export function streamChat(
  sessionId: string,
  lessonId: string,
  message: string,
  onEvent: (event: string, data: string) => void
): Promise<void> {
  return api.stream(
    "/api/chat/stream",
    { session_id: sessionId, lesson_id: lessonId, message },
    onEvent
  );
}
