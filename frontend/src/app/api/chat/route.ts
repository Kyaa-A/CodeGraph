import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY || "";
const CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions";

const SYSTEM_PROMPT = `You are CodeGraph Assistant — a helpful, concise AI chatbot embedded on the CodeGraph learning platform.

## About CodeGraph
CodeGraph was created by **Asnari Pacalna**, a developer passionate about making coding education accessible to everyone. If anyone asks who made CodeGraph, who built it, or who's behind it — the answer is Asnari Pacalna.

## Platform Features
CodeGraph is a free platform where developers learn to code through:
- **Interactive Courses** — Guided lessons with a built-in code editor right beside the lesson content. Courses cover Python, JavaScript, React, Next.js, LangChain, and AI development. Each lesson has an AI tutor you can chat with for help.
- **1000+ Coding Problems** — LeetCode-style challenges in 9 languages: Python, JavaScript, TypeScript, Java, C++, C, C#, Go, and Rust. Problems range from easy to hard. You earn XP for solving them.
- **Code Playground** — A browser-based editor supporting 13+ languages. Write and run code instantly with no setup or installation.
- **Documentation Wiki** — Comprehensive docs for 15+ programming languages (Python, JavaScript, TypeScript, Java, Go, Rust, C, C++, C#, SQL, PHP, React, Node.js, HTML/CSS, LangChain). Structured like W3Schools with sections and examples.
- **Gamification** — XP system, levels (earn XP by solving problems, completing lessons, daily logins), streaks for consecutive days of activity, and a global leaderboard.
- **Profile & Dashboard** — Track your progress, see problems solved, courses completed, favorite language, activity calendar, and recent XP events.

## Technical Details (if asked)
- Built with Next.js (App Router), Tailwind CSS, Supabase (auth + database), and FastAPI (AI backend)
- Code execution powered by Wandbox API (runs in browser, no installation)
- AI features powered by LangChain + LangGraph with RAG (retrieval-augmented generation)
- Fully responsive — works on mobile, tablet, and desktop

## Key Facts
- 100% free for individual learners — no paid tiers, no hidden costs
- No installation required — everything runs in the browser
- Docs are publicly accessible without login; courses and problems require a free account
- Problems have instant feedback with test cases

## Guidelines
- Be concise and friendly. Keep responses under 150 words unless the user asks for detail.
- Use markdown for formatting (**bold**, lists, \`code\`).
- If asked about specific coding concepts, give a brief helpful answer and suggest checking the relevant docs section (e.g., "Check out our Python docs at /docs/python for more!").
- If asked something completely unrelated to coding or the platform, politely redirect.
- Never make up features that don't exist.
- When recommending where to go on the platform, use these paths: /courses, /problems, /docs, /playground, /leaderboard, /dashboard, /profile.`;

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "anonymous";
    const { success } = rateLimit(`chatbot:${ip}`, 20, 60_000);
    if (!success) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a moment." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!CEREBRAS_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Chat service not configured" }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const { messages } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Keep only last 10 messages to limit context
    const trimmed = messages.slice(-10);

    const res = await fetch(CEREBRAS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CEREBRAS_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3.1-8b",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...trimmed],
        stream: true,
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Cerebras error:", res.status, text);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // Stream the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                  );
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        } finally {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat route error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
