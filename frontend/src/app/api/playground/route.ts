import { NextRequest, NextResponse } from "next/server";

const WANDBOX_URL = "https://wandbox.org/api/compile.json";

const COMPILER_MAP: Record<string, string> = {
  python: "cpython-3.12.7",
  javascript: "nodejs-20.17.0",
  typescript: "nodejs-20.17.0",
  java: "openjdk-jdk-22+36",
  c: "gcc-13.2.0-c",
  cpp: "gcc-13.2.0",
  csharp: "mono-6.12.0.199",
  go: "go-1.23.2",
  rust: "rust-1.82.0",
  ruby: "ruby-3.4.1",
  php: "php-8.3.12",
  swift: "swift-6.0.1",
  kotlin: "openjdk-jdk-22+36",
  sql: "sqlite-3.46.1",
};

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: "Missing code or language" },
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
