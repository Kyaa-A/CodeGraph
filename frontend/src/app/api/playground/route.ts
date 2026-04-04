import { NextRequest, NextResponse } from "next/server";
import { WANDBOX_URL, COMPILER_MAP, MAX_CODE_LENGTH } from "@/lib/compiler-map";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP — 15 requests per minute for unauthenticated playground
    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anonymous";
    const { success } = rateLimit(`playground:${ip}`, 15, 60_000);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: "Missing code or language" },
        { status: 400 }
      );
    }

    if (typeof code !== "string" || code.length > MAX_CODE_LENGTH) {
      return NextResponse.json(
        { error: "Code exceeds maximum length" },
        { status: 400 }
      );
    }

    const compiler = COMPILER_MAP[language];
    if (!compiler) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 }
      );
    }

    let finalCode = code;
    if (language === "java") {
      finalCode = finalCode.replace(/public\s+class\s+/g, "class ");
    }

    const res = await fetch(WANDBOX_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: finalCode, compiler }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Execution error: ${text}` },
        { status: 502 }
      );
    }

    const result = await res.json();

    const stdout = result.program_output || "";
    const stderr = result.program_error || "";
    const compilerError = result.compiler_error || "";
    const exitCode = parseInt(result.status || "0", 10);
    const output = [stdout, stderr, compilerError].filter(Boolean).join("\n");

    return NextResponse.json({
      output: output || "(no output)",
      stderr,
      exitCode,
      language,
      compiler,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to execute code" },
      { status: 500 }
    );
  }
}
