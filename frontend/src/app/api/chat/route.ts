import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY || "";
const CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions";

const SYSTEM_PROMPT = `You are CodeGraph Assistant — a helpful, concise AI chatbot embedded on the CodeGraph learning platform.

CodeGraph is a free platform where developers learn to code through:
- Interactive courses (Python, JavaScript, React, Next.js, LangChain, AI development)
- 1000+ LeetCode-style coding problems in 9 languages (Python, JavaScript, TypeScript, Java, C++, C, C#, Go, Rust)
- A browser-based code playground (13+ languages, no installation needed)
- Comprehensive documentation/wiki for 15+ programming languages
- XP system, levels, streaks, and a leaderboard for gamified learning

Key facts:
- 100% free for individual learners
- No installation required — everything runs in the browser
- Courses include hands-on code editors alongside lessons
- AI tutor available inside each lesson for personalized help
- Problems range from easy to hard with instant feedback

Guidelines:
- Be concise and friendly. Keep responses under 150 words unless the user asks for detail.
- Use markdown for formatting (bold, lists, code blocks).
- If asked about specific coding concepts, give a brief helpful answer and suggest checking the relevant docs section.
- If asked something completely unrelated to coding or the platform, politely redirect.
- Never make up features that don't exist.`;

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
        model: "llama-4-scout-17b-16e-instruct",
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
