import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { WANDBOX_URL, COMPILER_MAP, MAX_CODE_LENGTH } from "@/lib/compiler-map";
import { rateLimit } from "@/lib/rate-limit";
import { buildTestCode } from "@/lib/build-test-code";

export async function POST(request: NextRequest) {
  try {
    const { code, lessonId } = await request.json();

    if (!code || !lessonId) {
      return NextResponse.json(
        { error: "Missing code or lessonId" },
        { status: 400 }
      );
    }

    if (typeof code !== "string" || code.length > MAX_CODE_LENGTH) {
      return NextResponse.json(
        { error: "Code exceeds maximum length" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { success } = rateLimit(`lesson-submit:${user.id}`, 20, 60_000);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
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
