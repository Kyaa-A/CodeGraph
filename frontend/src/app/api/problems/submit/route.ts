import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { WANDBOX_URL, COMPILER_MAP, MAX_CODE_LENGTH } from "@/lib/compiler-map";
import { rateLimit } from "@/lib/rate-limit";

function buildTestCode(userCode: string, testCode: string, language: string): string {
  if (!testCode) return userCode;

  if (language === "java") {
    const mainRegex = /public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]\s*\w+\s*\)\s*\{[\s\S]*?\n\s*\}/;
    if (mainRegex.test(userCode)) {
      return userCode.replace(
        mainRegex,
        `public static void main(String[] args) {\n${testCode}\n    }`
      );
    }
    const lastBrace = userCode.lastIndexOf("}");
    if (lastBrace !== -1) {
      return (
        userCode.slice(0, lastBrace) +
        `\n    public static void main(String[] args) {\n${testCode}\n    }\n}`
      );
    }
    return userCode + "\n" + testCode;
  }

  return userCode + "\n\n" + testCode;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { success } = rateLimit(`submit:${user.id}`, 10, 60_000);
    if (!success) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait a moment." },
        { status: 429 }
      );
    }

    const { code, problemId, language } = await request.json();

    if (!code || !problemId || !language) {
      return NextResponse.json(
        { error: "Missing code, problemId, or language" },
        { status: 400 }
      );
    }

    if (typeof code !== "string" || code.length > MAX_CODE_LENGTH) {
      return NextResponse.json(
        { error: "Code exceeds maximum length" },
        { status: 400 }
      );
    }

    // Fetch problem's test_code
    const { data: problem, error: problemError } = await supabase
      .from("problems")
      .select("test_code")
      .eq("id", problemId)
      .single();

    if (problemError || !problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const testCode = (problem.test_code as Record<string, string>)[language];
    if (!testCode) {
      return NextResponse.json(
        { error: `No test cases for language: ${language}` },
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

    let finalCode = buildTestCode(code, testCode, language);

    if (language === "java") {
      finalCode = finalCode.replace(/public\s+class\s+/g, "class ");
    }

    const startTime = Date.now();

    const res = await fetch(WANDBOX_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: finalCode, compiler }),
      signal: AbortSignal.timeout(30_000),
    });

    const runtimeMs = Date.now() - startTime;

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

    const testResults: { name: string; passed: boolean; message: string }[] = [];
    for (const line of fullOutput.split("\n")) {
      if (line.startsWith("PASS: ")) {
        testResults.push({ name: line.slice(6), passed: true, message: "" });
      } else if (line.startsWith("FAIL: ")) {
        const parts = line.slice(6).split(" - ");
        testResults.push({
          name: parts[0],
          passed: false,
          message: parts.slice(1).join(" - "),
        });
      }
    }

    // Save submission
    await supabase.from("problem_submissions").insert({
      user_id: user.id,
      problem_id: problemId,
      language,
      code,
      passed,
      test_results: testResults,
      runtime_ms: runtimeMs,
    });

    return NextResponse.json({
      passed,
      output: fullOutput,
      testResults,
      totalTests: testResults.length,
      passedTests: testResults.filter((t) => t.passed).length,
      runtimeMs,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit solution" },
      { status: 500 }
    );
  }
}
