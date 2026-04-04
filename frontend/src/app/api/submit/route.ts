import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

function buildTestCode(userCode: string, testCode: string, language: string): string {
  if (!testCode) return userCode;

  if (language === "java") {
    // For Java: replace the main method body with test code
    // User writes methods, tests call those methods
    const mainRegex = /public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]\s*\w+\s*\)\s*\{[\s\S]*?\n\s*\}/;
    if (mainRegex.test(userCode)) {
      return userCode.replace(
        mainRegex,
        `public static void main(String[] args) {\n${testCode}\n    }`
      );
    }
    // Fallback: append inside the last closing brace
    const lastBrace = userCode.lastIndexOf("}");
    if (lastBrace !== -1) {
      return (
        userCode.slice(0, lastBrace) +
        `\n    public static void main(String[] args) {\n${testCode}\n    }\n}`
      );
    }
    return userCode + "\n" + testCode;
  }

  // For Python, JS, SQL, and all others: simply append
  return userCode + "\n\n" + testCode;
}

export async function POST(request: NextRequest) {
  try {
    const { code, lessonId } = await request.json();

    if (!code || !lessonId) {
      return NextResponse.json(
        { error: "Missing code or lessonId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch lesson's test_code and language
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("test_code, language")
      .eq("id", lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const language = lesson.language || "python";
    const testCode = lesson.test_code || "";

    if (!testCode) {
      return NextResponse.json(
        { error: "No test cases for this lesson" },
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

    // Build combined code (user code + hidden tests)
    let finalCode = buildTestCode(code, testCode, language);

    // Java: strip public class for Wandbox
    if (language === "java") {
      finalCode = finalCode.replace(/public\s+class\s+/g, "class ");
    }

    // Execute on Wandbox
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

    const fullOutput = [stdout, stderr, compilerError].filter(Boolean).join("\n");
    const passed = fullOutput.includes("ALL_TESTS_PASSED");

    // Parse individual test results
    const testResults: { name: string; passed: boolean; message: string }[] = [];
    for (const line of fullOutput.split("\n")) {
      if (line.startsWith("PASS: ")) {
        testResults.push({
          name: line.slice(6),
          passed: true,
          message: "",
        });
      } else if (line.startsWith("FAIL: ")) {
        const parts = line.slice(6).split(" - ");
        testResults.push({
          name: parts[0],
          passed: false,
          message: parts.slice(1).join(" - "),
        });
      }
    }

    // Auto-complete on pass
    if (passed) {
      await supabase.from("user_progress").upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" }
      );
    }

    return NextResponse.json({
      passed,
      output: fullOutput,
      testResults,
      totalTests: testResults.length,
      passedTests: testResults.filter((t) => t.passed).length,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit code" },
      { status: 500 }
    );
  }
}
