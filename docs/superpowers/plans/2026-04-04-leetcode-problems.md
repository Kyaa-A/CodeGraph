# LeetCode-Style Problems Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a standalone LeetCode-style coding problems section where users browse problems by difficulty/topic, solve in Monaco editor, submit against hidden tests, and track solve history. Admins can create/manage problems.

**Architecture:** New `problems` and `problem_submissions` tables in Supabase. A new `/api/problems/submit` API route handles test execution (reusing Wandbox + buildTestCode pattern from `/api/submit`). Frontend adds `/problems` listing, `/problems/[id]` solve page (split-screen: description left, editor right), and `/admin/problems` CRUD. The existing `<CodeEditor>` component is extended with a `mode` prop to support problem submissions alongside lesson submissions.

**Tech Stack:** Next.js 14+ (App Router), Supabase (Postgres + RLS), Monaco Editor, Wandbox API, Tailwind CSS, shadcn/ui, Framer Motion

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `src/app/problems/page.tsx` | Server component — problems listing with filters (difficulty, tags, status) |
| `src/app/problems/[id]/page.tsx` | Server component — fetches problem data, passes to client shell |
| `src/app/problems/[id]/problem-shell.tsx` | Client component — split-screen: description + editor with submit |
| `src/app/problems/[id]/problem-description.tsx` | Client component — renders problem statement, examples, constraints |
| `src/app/api/problems/submit/route.ts` | API route — server-side test execution for problems (Wandbox) |
| `src/app/admin/problems/page.tsx` | Client component — admin CRUD for problems |
| `src/components/problem-card.tsx` | Client component — problem list item card |

### Modified Files
| File | Changes |
|------|---------|
| `src/lib/supabase/types.ts` | Add `Problem`, `ProblemSubmission` types |
| `src/lib/supabase/middleware.ts` | Protect `/problems/[id]` routes (require auth) |
| `src/components/navbar.tsx` | Add "Problems" nav link |
| `src/app/dashboard/page.tsx` | Add problems stats (solved count) |
| `src/app/admin/page.tsx` | Add Problems stat card + quick action link |

### Database (Supabase Migrations)
| Migration | What |
|-----------|------|
| `create_problems_table` | `problems` table + `problem_submissions` table + RLS policies |
| `seed_problems` | Seed 20+ problems across difficulties and languages |

---

## Task 1: Database Schema — Problems and Submissions Tables

**Files:**
- Migration: `create_problems_table` (via Supabase MCP)
- Modify: `frontend/src/lib/supabase/types.ts`

- [ ] **Step 1: Create the problems table and problem_submissions table**

Run this migration via Supabase MCP `apply_migration`:

```sql
-- Problems table
CREATE TABLE problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags text[] NOT NULL DEFAULT '{}',
  starter_code jsonb NOT NULL DEFAULT '{}',
  test_code jsonb NOT NULL DEFAULT '{}',
  hints text[] NOT NULL DEFAULT '{}',
  examples jsonb NOT NULL DEFAULT '[]',
  constraints text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Problem submissions table
CREATE TABLE problem_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  problem_id uuid NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  language text NOT NULL,
  code text NOT NULL,
  passed boolean NOT NULL DEFAULT false,
  test_results jsonb,
  runtime_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_slug ON problems(slug);
CREATE INDEX idx_problem_submissions_user ON problem_submissions(user_id);
CREATE INDEX idx_problem_submissions_problem ON problem_submissions(problem_id);
CREATE INDEX idx_problem_submissions_user_problem ON problem_submissions(user_id, problem_id);

-- RLS
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_submissions ENABLE ROW LEVEL SECURITY;

-- Problems: public read, admin write
CREATE POLICY "Anyone can read problems" ON problems FOR SELECT USING (true);
CREATE POLICY "Admins can insert problems" ON problems FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update problems" ON problems FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete problems" ON problems FOR DELETE USING (public.is_admin());

-- Submissions: users own theirs, admins see all
CREATE POLICY "Users can read own submissions" ON problem_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submissions" ON problem_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can read all submissions" ON problem_submissions FOR SELECT USING (public.is_admin());
```

Schema design notes:
- `starter_code` is JSONB keyed by language: `{"python": "def twoSum(nums, target):\n    pass", "javascript": "function twoSum(nums, target) {\n\n}"}`
- `test_code` is JSONB keyed by language: `{"python": "# hidden tests...", "javascript": "// hidden tests..."}`
- `examples` is JSONB array: `[{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "Because nums[0] + nums[1] == 9"}]`
- `slug` provides URL-friendly identifiers
- `difficulty` is constrained to easy/medium/hard

- [ ] **Step 2: Add TypeScript types**

In `frontend/src/lib/supabase/types.ts`, add after `QuizAttempt`:

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/supabase/types.ts
git commit -m "[Frontend] Add Problem and ProblemSubmission types for LeetCode-style problems"
```

---

## Task 2: Problem Submit API Route

**Files:**
- Create: `frontend/src/app/api/problems/submit/route.ts`

- [ ] **Step 1: Create the problems submit API route**

Create `frontend/src/app/api/problems/submit/route.ts`:

```typescript
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

    const { code, problemId, language } = await request.json();

    if (!code || !problemId || !language) {
      return NextResponse.json(
        { error: "Missing code, problemId, or language" },
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
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds with new `/api/problems/submit` route listed.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/api/problems/submit/route.ts
git commit -m "[Frontend] Add problem submission API route with Wandbox test execution"
```

---

## Task 3: Problem Description Component

**Files:**
- Create: `frontend/src/app/problems/[id]/problem-description.tsx`

- [ ] **Step 1: Create the problem description component**

Create `frontend/src/app/problems/[id]/problem-description.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { Difficulty, ProblemSubmission } from "@/lib/supabase/types";

interface ProblemDescriptionProps {
  title: string;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  hints: string[];
  submissions: ProblemSubmission[];
}

const difficultyConfig: Record<Difficulty, { label: string; class: string }> = {
  easy: { label: "Easy", class: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  medium: { label: "Medium", class: "bg-amber-100 text-amber-700 border-amber-200" },
  hard: { label: "Hard", class: "bg-red-100 text-red-700 border-red-200" },
};

export function ProblemDescription({
  title,
  difficulty,
  tags,
  description,
  examples,
  constraints,
  hints,
  submissions,
}: ProblemDescriptionProps) {
  const [activeTab, setActiveTab] = useState<"description" | "submissions">("description");
  const [showHints, setShowHints] = useState<boolean[]>(hints.map(() => false));

  const diffConfig = difficultyConfig[difficulty];
  const solvedCount = submissions.filter((s) => s.passed).length;
  const totalAttempts = submissions.length;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Problem header */}
      <div className="p-6 border-b border-slate-200 shrink-0">
        <h1 className="font-heading text-xl font-bold text-slate-900 mb-3">{title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`text-xs font-semibold px-2.5 py-0.5 border ${diffConfig.class}`}>
            {diffConfig.label}
          </Badge>
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs text-slate-500 border-slate-200">
              {tag}
            </Badge>
          ))}
          {totalAttempts > 0 && (
            <span className="text-xs text-slate-400 ml-2">
              {solvedCount > 0 ? (
                <span className="text-emerald-600 font-medium">Solved</span>
              ) : (
                `${totalAttempts} attempt${totalAttempts > 1 ? "s" : ""}`
              )}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 shrink-0">
        <button
          onClick={() => setActiveTab("description")}
          className={`px-5 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "description"
              ? "text-amber-600 border-b-2 border-amber-500"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Description
        </button>
        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-5 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "submissions"
              ? "text-amber-600 border-b-2 border-amber-500"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Submissions ({totalAttempts})
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "description" ? (
          <div className="space-y-6">
            {/* Problem statement */}
            <div className="prose prose-slate prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, "<br/>") }} />
            </div>

            {/* Examples */}
            {examples.length > 0 && (
              <div className="space-y-4">
                {examples.map((ex, i) => (
                  <div key={i} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Example {i + 1}
                    </p>
                    <div className="space-y-2 font-mono text-sm">
                      <p>
                        <span className="text-slate-500">Input: </span>
                        <span className="text-slate-800">{ex.input}</span>
                      </p>
                      <p>
                        <span className="text-slate-500">Output: </span>
                        <span className="text-slate-800">{ex.output}</span>
                      </p>
                      {ex.explanation && (
                        <p className="text-slate-500 text-xs mt-2">
                          <span className="font-semibold">Explanation: </span>
                          {ex.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {constraints.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Constraints
                </p>
                <ul className="space-y-1.5">
                  {constraints.map((c, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-slate-300 mt-1 shrink-0">&bull;</span>
                      <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{c}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hints */}
            {hints.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Hints
                </p>
                <div className="space-y-2">
                  {hints.map((hint, i) => (
                    <div key={i}>
                      <button
                        onClick={() =>
                          setShowHints((prev) =>
                            prev.map((v, j) => (j === i ? !v : v))
                          )
                        }
                        className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1.5"
                      >
                        <svg
                          className={`h-3.5 w-3.5 transition-transform ${showHints[i] ? "rotate-90" : ""}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                        Hint {i + 1}
                      </button>
                      {showHints[i] && (
                        <p className="text-sm text-slate-600 mt-1 ml-5 p-3 rounded-lg bg-amber-50 border border-amber-100">
                          {hint}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Submissions tab */
          <div className="space-y-3">
            {submissions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No submissions yet</p>
            ) : (
              submissions.map((sub) => (
                <div
                  key={sub.id}
                  className={`rounded-xl border p-4 ${
                    sub.passed
                      ? "bg-emerald-50/50 border-emerald-200"
                      : "bg-red-50/50 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-semibold ${
                        sub.passed ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {sub.passed ? "Accepted" : "Wrong Answer"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(sub.created_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="capitalize">{sub.language}</span>
                    {sub.runtime_ms && <span>{sub.runtime_ms}ms</span>}
                    {sub.test_results && (
                      <span>
                        {sub.test_results.filter((t) => t.passed).length}/{sub.test_results.length} passed
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/problems/[id]/problem-description.tsx
git commit -m "[Frontend] Add ProblemDescription component with tabs, examples, hints, submissions"
```

---

## Task 4: Problem Shell — Split-Screen Solve Page

**Files:**
- Create: `frontend/src/app/problems/[id]/problem-shell.tsx`

- [ ] **Step 1: Create the problem shell component**

Create `frontend/src/app/problems/[id]/problem-shell.tsx`:

```tsx
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProblemDescription } from "./problem-description";
import type { Problem, ProblemSubmission, Difficulty } from "@/lib/supabase/types";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const LANGUAGE_OPTIONS = [
  { id: "python", name: "Python", icon: "🐍" },
  { id: "javascript", name: "JavaScript", icon: "🟨" },
  { id: "typescript", name: "TypeScript", icon: "🔷" },
  { id: "java", name: "Java", icon: "☕" },
  { id: "cpp", name: "C++", icon: "⚡" },
  { id: "go", name: "Go", icon: "🐹" },
  { id: "rust", name: "Rust", icon: "🦀" },
];

interface ProblemShellProps {
  problem: Problem;
  submissions: ProblemSubmission[];
}

export function ProblemShell({ problem, submissions: initialSubmissions }: ProblemShellProps) {
  // Pick initial language: first available in starter_code
  const availableLanguages = LANGUAGE_OPTIONS.filter((l) => problem.starter_code[l.id]);
  const defaultLang = availableLanguages[0]?.id || "python";

  const [language, setLanguage] = useState(defaultLang);
  const [code, setCode] = useState(problem.starter_code[defaultLang] || "");
  const [showLanguages, setShowLanguages] = useState(false);
  const [splitPosition, setSplitPosition] = useState(45);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [testResults, setTestResults] = useState<{ name: string; passed: boolean; message: string }[]>([]);
  const [submitResult, setSubmitResult] = useState<{ passed: boolean; total: number; passedCount: number } | null>(null);
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [activePanel, setActivePanel] = useState<"output" | "tests">("tests");
  const containerRef = useRef<HTMLDivElement>(null);

  function handleLanguageChange(langId: string) {
    setLanguage(langId);
    setCode(problem.starter_code[langId] || "");
    setShowLanguages(false);
    setOutput("");
    setTestResults([]);
    setSubmitResult(null);
  }

  // Drag logic
  const handleMouseDown = useCallback(() => setIsDragging(true), []);
  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPosition(Math.min(70, Math.max(25, pct)));
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  async function handleRun() {
    setRunning(true);
    setOutput("");
    setActivePanel("output");
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      setOutput(data.output || data.error || "(no output)");
    } catch {
      setOutput("Error: Failed to execute code");
    }
    setRunning(false);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setTestResults([]);
    setSubmitResult(null);
    setActivePanel("tests");
    try {
      const res = await fetch("/api/problems/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, problemId: problem.id, language }),
      });
      const data = await res.json();
      if (data.testResults) setTestResults(data.testResults);
      setSubmitResult({
        passed: data.passed,
        total: data.totalTests,
        passedCount: data.passedTests,
      });
      setOutput(data.output || "");
      // Refresh submissions list
      if (data.testResults) {
        const newSub: ProblemSubmission = {
          id: crypto.randomUUID(),
          user_id: "",
          problem_id: problem.id,
          language,
          code,
          passed: data.passed,
          test_results: data.testResults,
          runtime_ms: data.runtimeMs,
          created_at: new Date().toISOString(),
        };
        setSubmissions((prev) => [newSub, ...prev]);
      }
    } catch {
      setOutput("Error: Failed to submit solution");
    }
    setSubmitting(false);
  }

  const currentLang = LANGUAGE_OPTIONS.find((l) => l.id === language);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Top bar */}
      <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 shrink-0 mt-[72px]">
        <div className="flex items-center gap-3">
          <Link
            href="/problems"
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <span className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">
            {problem.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language picker */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg text-xs gap-1.5 border-slate-200"
              onClick={() => setShowLanguages(!showLanguages)}
            >
              <span>{currentLang?.icon}</span>
              {currentLang?.name}
              <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
            {showLanguages && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg border border-slate-200 shadow-xl z-50 py-1">
                {availableLanguages.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleLanguageChange(l.id)}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 ${
                      l.id === language ? "bg-amber-50 text-amber-700" : "text-slate-600"
                    }`}
                  >
                    <span>{l.icon}</span>
                    {l.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="rounded-lg text-xs"
            onClick={handleRun}
            disabled={running || submitting}
          >
            {running ? "Running..." : "Run"}
          </Button>

          <Button
            size="sm"
            className="rounded-lg text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={handleSubmit}
            disabled={submitting || running}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>

      {/* Split pane */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden" style={{ userSelect: isDragging ? "none" : "auto" }}>
        {/* Left: Problem description */}
        <div className="bg-white border-r border-slate-200 overflow-hidden" style={{ width: `${splitPosition}%` }}>
          <ProblemDescription
            title={problem.title}
            difficulty={problem.difficulty}
            tags={problem.tags}
            description={problem.description}
            examples={problem.examples}
            constraints={problem.constraints}
            hints={problem.hints}
            submissions={submissions}
          />
        </div>

        {/* Drag handle */}
        <div
          className="w-1.5 bg-slate-100 hover:bg-amber-300 cursor-col-resize transition-colors shrink-0 relative group"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-slate-300 group-hover:bg-amber-500 transition-colors" />
        </div>

        {/* Right: Editor + Output */}
        <div className="flex flex-col overflow-hidden" style={{ width: `${100 - splitPosition}%` }}>
          {/* Editor */}
          <div className="flex-1 min-h-0">
            <MonacoEditor
              language={language === "cpp" ? "cpp" : language}
              value={code}
              onChange={(v) => setCode(v || "")}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                wordWrap: "on",
                padding: { top: 16 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          {/* Output / Test Results */}
          <div className="h-48 border-t border-slate-700 bg-[#1e1e1e] flex flex-col shrink-0">
            {/* Panel tabs */}
            <div className="flex border-b border-slate-700 shrink-0">
              <button
                onClick={() => setActivePanel("tests")}
                className={`px-4 py-2 text-xs font-medium ${
                  activePanel === "tests" ? "text-amber-400 border-b border-amber-400" : "text-slate-500"
                }`}
              >
                Test Results
              </button>
              <button
                onClick={() => setActivePanel("output")}
                className={`px-4 py-2 text-xs font-medium ${
                  activePanel === "output" ? "text-amber-400 border-b border-amber-400" : "text-slate-500"
                }`}
              >
                Output
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {activePanel === "tests" ? (
                <div className="space-y-1.5">
                  {submitResult && (
                    <div className={`rounded-lg px-3 py-2 text-sm font-semibold mb-2 ${
                      submitResult.passed
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {submitResult.passed
                        ? "All Tests Passed!"
                        : `${submitResult.passedCount}/${submitResult.total} Tests Passed`}
                    </div>
                  )}
                  {testResults.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className={t.passed ? "text-emerald-400" : "text-red-400"}>
                        {t.passed ? "PASS" : "FAIL"}
                      </span>
                      <span className="text-slate-300">{t.name}</span>
                      {t.message && <span className="text-slate-500">- {t.message}</span>}
                    </div>
                  ))}
                  {testResults.length === 0 && !submitResult && (
                    <p className="text-xs text-slate-500">Submit your solution to see test results</p>
                  )}
                </div>
              ) : (
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                  {output || "Run your code to see output"}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/problems/[id]/problem-shell.tsx
git commit -m "[Frontend] Add ProblemShell split-screen component with Monaco editor and test execution"
```

---

## Task 5: Problem Solve Page — Server Component

**Files:**
- Create: `frontend/src/app/problems/[id]/page.tsx`

- [ ] **Step 1: Create the server component page**

Create `frontend/src/app/problems/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Problem, ProblemSubmission } from "@/lib/supabase/types";
import { ProblemShell } from "./problem-shell";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("problems")
    .select("title, difficulty")
    .eq("id", id)
    .single();

  return {
    title: data ? `${data.title} | CodeGraph Problems` : "Problem | CodeGraph",
    description: data ? `Solve ${data.title} - ${data.difficulty} difficulty` : "Coding problem",
  };
}

export default async function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: problem, error } = await supabase
    .from("problems")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !problem) {
    notFound();
  }

  const typedProblem = problem as Problem;

  // Fetch user's submissions for this problem
  const { data: { user } } = await supabase.auth.getUser();
  let submissions: ProblemSubmission[] = [];
  if (user) {
    const { data: subs } = await supabase
      .from("problem_submissions")
      .select("*")
      .eq("problem_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    submissions = (subs ?? []) as ProblemSubmission[];
  }

  // Strip test_code from client payload (hidden tests)
  const clientProblem: Problem = {
    ...typedProblem,
    test_code: {},
  };

  return <ProblemShell problem={clientProblem} submissions={submissions} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/problems/[id]/page.tsx
git commit -m "[Frontend] Add problem solve page server component"
```

---

## Task 6: Problem Card Component

**Files:**
- Create: `frontend/src/components/problem-card.tsx`

- [ ] **Step 1: Create the problem card component**

Create `frontend/src/components/problem-card.tsx`:

```tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Difficulty } from "@/lib/supabase/types";

interface ProblemCardProps {
  id: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  solved: boolean;
  attemptCount: number;
}

const difficultyConfig: Record<Difficulty, { label: string; class: string }> = {
  easy: { label: "Easy", class: "bg-emerald-100 text-emerald-700" },
  medium: { label: "Medium", class: "bg-amber-100 text-amber-700" },
  hard: { label: "Hard", class: "bg-red-100 text-red-700" },
};

export function ProblemCard({ id, title, difficulty, tags, solved, attemptCount }: ProblemCardProps) {
  const dc = difficultyConfig[difficulty];

  return (
    <Link href={`/problems/${id}`}>
      <div className={`glass-card rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 group cursor-pointer border ${
        solved ? "border-emerald-200/60 bg-emerald-50/30" : ""
      }`}>
        <div className="flex items-center gap-4">
          {/* Status icon */}
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
            solved
              ? "bg-emerald-500 text-white"
              : attemptCount > 0
                ? "bg-amber-100 text-amber-600"
                : "bg-slate-100 text-slate-400"
          }`}>
            {solved ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : attemptCount > 0 ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-amber-600 transition-colors truncate">
              {title}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <Badge className={`text-[10px] font-semibold px-2 py-0 border-0 ${dc.class}`}>
                {dc.label}
              </Badge>
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] text-slate-400 border-slate-200 px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <svg className="h-4 w-4 text-slate-300 group-hover:text-amber-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/problem-card.tsx
git commit -m "[Frontend] Add ProblemCard component with solved/attempted/untouched states"
```

---

## Task 7: Problems Listing Page

**Files:**
- Create: `frontend/src/app/problems/page.tsx`

- [ ] **Step 1: Create the problems listing page**

Create `frontend/src/app/problems/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { ProblemCard } from "@/components/problem-card";
import type { Problem, Difficulty } from "@/lib/supabase/types";

export const metadata = {
  title: "Problems | CodeGraph",
  description: "Practice coding problems like LeetCode",
};

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: Promise<{ difficulty?: string; tag?: string }>;
}) {
  const { difficulty, tag } = await searchParams;
  const supabase = await createClient();

  // Build query
  let query = supabase.from("problems").select("*").order("created_at", { ascending: true });

  if (difficulty && ["easy", "medium", "hard"].includes(difficulty)) {
    query = query.eq("difficulty", difficulty);
  }
  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const { data: problems } = await query;
  const typedProblems = (problems ?? []) as Problem[];

  // Get all unique tags
  const allTags = [...new Set(typedProblems.flatMap((p) => p.tags))].sort();

  // Fetch user's submission status
  const { data: { user } } = await supabase.auth.getUser();
  const solvedMap = new Map<string, { solved: boolean; attempts: number }>();

  if (user) {
    const { data: submissions } = await supabase
      .from("problem_submissions")
      .select("problem_id, passed")
      .eq("user_id", user.id);

    for (const sub of submissions ?? []) {
      const s = sub as { problem_id: string; passed: boolean };
      const existing = solvedMap.get(s.problem_id) ?? { solved: false, attempts: 0 };
      existing.attempts++;
      if (s.passed) existing.solved = true;
      solvedMap.set(s.problem_id, existing);
    }
  }

  const solvedCount = [...solvedMap.values()].filter((v) => v.solved).length;
  const easyCount = typedProblems.filter((p) => p.difficulty === "easy").length;
  const mediumCount = typedProblems.filter((p) => p.difficulty === "medium").length;
  const hardCount = typedProblems.filter((p) => p.difficulty === "hard").length;

  const difficulties: { value: Difficulty | "all"; label: string; count: number; color: string }[] = [
    { value: "all", label: "All", count: typedProblems.length, color: "bg-slate-100 text-slate-700" },
    { value: "easy", label: "Easy", count: easyCount, color: "bg-emerald-100 text-emerald-700" },
    { value: "medium", label: "Medium", count: mediumCount, color: "bg-amber-100 text-amber-700" },
    { value: "hard", label: "Hard", count: hardCount, color: "bg-red-100 text-red-700" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h1 className="font-heading text-4xl font-bold tracking-tight">
              <span className="text-gradient">Problems</span>
            </h1>
            <p className="mt-2 text-muted-foreground text-lg">
              Sharpen your skills with coding challenges
            </p>
          </div>

          {user && (
            <div className="glass-card rounded-xl px-5 py-3 flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-heading font-bold text-emerald-600">{solvedCount}</p>
                <p className="text-xs text-muted-foreground">Solved</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                <p className="text-2xl font-heading font-bold">{typedProblems.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-6 mb-8">
          {/* Difficulty filter */}
          <div className="flex items-center gap-2">
            {difficulties.map((d) => (
              <a
                key={d.value}
                href={d.value === "all" ? "/problems" : `/problems?difficulty=${d.value}${tag ? `&tag=${tag}` : ""}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  (d.value === "all" && !difficulty) || difficulty === d.value
                    ? `${d.color} ring-2 ring-offset-1 ring-slate-300`
                    : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                {d.label}
                <span className="opacity-60">{d.count}</span>
              </a>
            ))}
          </div>

          {/* Tag filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((t) => (
                <a
                  key={t}
                  href={tag === t ? `/problems${difficulty ? `?difficulty=${difficulty}` : ""}` : `/problems?tag=${t}${difficulty ? `&difficulty=${difficulty}` : ""}`}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    tag === t
                      ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300"
                      : "bg-white text-slate-400 hover:text-slate-600 border border-slate-200"
                  }`}
                >
                  {t}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Problem list */}
        <div className="space-y-3">
          {typedProblems.map((problem) => {
            const status = solvedMap.get(problem.id);
            return (
              <ProblemCard
                key={problem.id}
                id={problem.id}
                title={problem.title}
                difficulty={problem.difficulty}
                tags={problem.tags}
                solved={status?.solved ?? false}
                attemptCount={status?.attempts ?? 0}
              />
            );
          })}
        </div>

        {typedProblems.length === 0 && (
          <div className="glass-card rounded-2xl p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2">No problems yet</h3>
            <p className="text-muted-foreground">Check back soon for coding challenges!</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/problems/page.tsx
git commit -m "[Frontend] Add problems listing page with difficulty/tag filters and solve status"
```

---

## Task 8: Admin Problems CRUD Page

**Files:**
- Create: `frontend/src/app/admin/problems/page.tsx`

- [ ] **Step 1: Create admin problems page**

Create `frontend/src/app/admin/problems/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Problem, Difficulty } from "@/lib/supabase/types";

const difficultyColors: Record<Difficulty, string> = {
  easy: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-red-100 text-red-700",
};

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [tags, setTags] = useState("");
  const [hints, setHints] = useState("");
  const [constraintsText, setConstraintsText] = useState("");
  const [examplesJson, setExamplesJson] = useState('[{"input": "", "output": "", "explanation": ""}]');
  const [starterCodeJson, setStarterCodeJson] = useState('{"python": "def solution():\\n    pass", "javascript": "function solution() {\\n\\n}"}');
  const [testCodeJson, setTestCodeJson] = useState('{"python": "", "javascript": ""}');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  async function loadProblems() {
    setLoading(true);
    const { data } = await supabase
      .from("problems")
      .select("*")
      .order("created_at", { ascending: false });
    setProblems((data ?? []) as Problem[]);
    setLoading(false);
  }

  useEffect(() => {
    loadProblems();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    setSlug(
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
    );
  }, [title]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    let parsedExamples, parsedStarterCode, parsedTestCode;
    try {
      parsedExamples = JSON.parse(examplesJson);
      parsedStarterCode = JSON.parse(starterCodeJson);
      parsedTestCode = JSON.parse(testCodeJson);
    } catch {
      alert("Invalid JSON in examples, starter code, or test code fields");
      return;
    }

    const { error } = await supabase.from("problems").insert({
      title,
      slug,
      description,
      difficulty,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      hints: hints.split("\n").filter(Boolean),
      constraints: constraintsText.split("\n").filter(Boolean),
      examples: parsedExamples,
      starter_code: parsedStarterCode,
      test_code: parsedTestCode,
    });

    if (error) {
      alert(`Error: ${error.message}`);
      return;
    }

    setTitle("");
    setSlug("");
    setDescription("");
    setDifficulty("easy");
    setTags("");
    setHints("");
    setConstraintsText("");
    setExamplesJson('[{"input": "", "output": "", "explanation": ""}]');
    setStarterCodeJson('{"python": "def solution():\\n    pass", "javascript": "function solution() {\\n\\n}"}');
    setTestCodeJson('{"python": "", "javascript": ""}');
    setShowForm(false);
    loadProblems();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this problem? All submissions will also be deleted.")) return;
    await supabase.from("problems").delete().eq("id", id);
    loadProblems();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/10 via-white to-white pt-28 pb-16">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4 group"
            >
              <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Admin
            </Link>
            <h1 className="font-heading text-4xl font-bold tracking-tight">
              Manage Problems
            </h1>
            <p className="mt-2 text-muted-foreground text-lg">
              Create and manage coding challenges
            </p>
          </div>
          <Button
            className="btn-gold rounded-xl"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "New Problem"}
          </Button>
        </div>

        {/* Create Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <form
                onSubmit={handleCreate}
                className="glass-card rounded-2xl p-6 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Two Sum"
                      required
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug (auto-generated)</Label>
                    <Input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="two-sum"
                      required
                      className="rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="array, hash-table, two-pointers"
                      className="rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description (supports line breaks)</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Given an array of integers nums and an integer target..."
                    rows={5}
                    required
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Constraints (one per line)</Label>
                  <Textarea
                    value={constraintsText}
                    onChange={(e) => setConstraintsText(e.target.value)}
                    placeholder={"2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9"}
                    rows={3}
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Hints (one per line)</Label>
                  <Textarea
                    value={hints}
                    onChange={(e) => setHints(e.target.value)}
                    placeholder={"Try using a hash map\nWhat complement do you need for each number?"}
                    rows={2}
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Examples (JSON array)</Label>
                  <Textarea
                    value={examplesJson}
                    onChange={(e) => setExamplesJson(e.target.value)}
                    rows={4}
                    className="rounded-lg font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Starter Code (JSON: language -&gt; code)</Label>
                  <Textarea
                    value={starterCodeJson}
                    onChange={(e) => setStarterCodeJson(e.target.value)}
                    rows={4}
                    className="rounded-lg font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Test Code (JSON: language -&gt; hidden tests)</Label>
                  <Textarea
                    value={testCodeJson}
                    onChange={(e) => setTestCodeJson(e.target.value)}
                    rows={6}
                    className="rounded-lg font-mono text-xs"
                  />
                </div>

                <Button type="submit" className="btn-gold rounded-xl">
                  Create Problem
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <Separator className="mb-8" />

        {/* Problem List */}
        {loading ? (
          <p className="text-muted-foreground text-center py-12">Loading...</p>
        ) : problems.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            No problems yet. Create your first coding challenge!
          </p>
        ) : (
          <div className="space-y-3">
            {problems.map((problem) => (
              <motion.div
                key={problem.id}
                layout
                className="glass-card rounded-2xl p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <Badge className={`text-xs font-semibold px-2.5 py-0.5 border-0 shrink-0 ${difficultyColors[problem.difficulty]}`}>
                    {problem.difficulty}
                  </Badge>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{problem.title}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {problem.tags.map((t) => (
                        <span key={t} className="text-[10px] text-slate-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/problems/${problem.id}`}>
                    <Button variant="outline" size="sm" className="rounded-lg text-xs">
                      Preview
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs border-red-200 text-red-500 hover:bg-red-50"
                    onClick={() => handleDelete(problem.id)}
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/admin/problems/page.tsx
git commit -m "[Frontend] Add admin problems CRUD page"
```

---

## Task 9: Update Navbar, Middleware, Admin Dashboard, and User Dashboard

**Files:**
- Modify: `frontend/src/components/navbar.tsx`
- Modify: `frontend/src/lib/supabase/middleware.ts`
- Modify: `frontend/src/app/admin/page.tsx`
- Modify: `frontend/src/app/dashboard/page.tsx`

- [ ] **Step 1: Add "Problems" link to navbar**

In `frontend/src/components/navbar.tsx`, find the `navLinks` array (around line 169) and update it:

```typescript
  const navLinks = [
    { href: "/courses", label: "Courses", icon: Icons.courses },
    { href: "/problems", label: "Problems", icon: Icons.problems },
    ...(user
      ? [
          { href: "/dashboard", label: "Dashboard", icon: Icons.dashboard },
          ...(isAdmin
            ? [{ href: "/admin", label: "Admin", icon: Icons.admin }]
            : []),
        ]
      : []),
  ];
```

Also add a `problems` icon to the `Icons` object:

```typescript
  problems: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
```

- [ ] **Step 2: Protect /problems/[id] in middleware**

In `frontend/src/lib/supabase/middleware.ts`, update the `protectedPaths` section. The current code protects `/dashboard` and `/courses/[id]/[lessonId]`. Add `/problems/` to the regex or protectedPaths.

Change the `isProtectedRoute` logic (around line 38-44):

```typescript
  const protectedPaths = ["/dashboard"];
  const isProtectedRoute =
    protectedPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    ) ||
    /^\/courses\/[^/]+\/[^/]+/.test(request.nextUrl.pathname) ||
    /^\/problems\/[^/]+/.test(request.nextUrl.pathname);
```

This protects `/problems/[id]` (solve pages) but keeps `/problems` listing public.

- [ ] **Step 3: Add Problems stat and quick action to admin dashboard**

In `frontend/src/app/admin/page.tsx`, add a query for problem count and a stat card, plus update quick actions.

After the lessons count query, add:

```typescript
  const { count: problemCount } = await supabase
    .from("problems")
    .select("*", { count: "exact", head: true });
```

Add a "Problems" entry to the `stats` array:

```typescript
    {
      label: "Problems",
      value: problemCount ?? 0,
      href: "/admin/problems",
      icon: () => (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      color: "from-purple-500 to-purple-600"
    },
```

Change the stats grid to `md:grid-cols-4` to accommodate 4 cards.

Add a quick action for problems:

```typescript
            <Link href="/admin/problems">
              <div className="glass-card rounded-xl p-5 transition-all duration-200 hover:bg-purple-50/30 hover:border-purple-200 cursor-pointer flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Add Problem</p>
                  <p className="text-xs text-muted-foreground">Create coding challenge</p>
                </div>
              </div>
            </Link>
```

- [ ] **Step 4: Add problems stats to user dashboard**

In `frontend/src/app/dashboard/page.tsx`, after the user_progress query, add:

```typescript
  let problemsSolved = 0;
  if (user) {
    const { data: solvedProblems } = await supabase
      .from("problem_submissions")
      .select("problem_id")
      .eq("user_id", user.id)
      .eq("passed", true);

    problemsSolved = new Set((solvedProblems ?? []).map((s: { problem_id: string }) => s.problem_id)).size;
  }
```

Add a "Problems Solved" stat card to the stats grid (update to 5 items with `lg:grid-cols-5`):

```typescript
          {
            label: "Problems Solved",
            value: problemsSolved,
            icon: Icons.code,
            color: "text-blue-600 bg-blue-100",
          },
```

Add a `code` icon to the dashboard Icons:

```typescript
  code: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/navbar.tsx frontend/src/lib/supabase/middleware.ts frontend/src/app/admin/page.tsx frontend/src/app/dashboard/page.tsx
git commit -m "[Frontend] Wire up problems to navbar, middleware, admin dashboard, and user dashboard"
```

---

## Task 10: Seed 20 Problems

**Files:**
- Migration: `seed_problems` (via Supabase MCP)

- [ ] **Step 1: Seed problems via SQL**

Run this migration via Supabase MCP `execute_sql`. This seeds 20 problems across 3 difficulty levels with Python and JavaScript starter code and test code.

Each problem's test code follows the existing protocol:
- Print `PASS: test_name` or `FAIL: test_name - reason` for each test
- Print `ALL_TESTS_PASSED` at the end if all pass

**Problems to seed (20 total):**

| # | Title | Difficulty | Tags |
|---|-------|-----------|------|
| 1 | Two Sum | Easy | array, hash-table |
| 2 | Reverse String | Easy | string, two-pointers |
| 3 | FizzBuzz | Easy | math, string |
| 4 | Palindrome Number | Easy | math |
| 5 | Valid Parentheses | Easy | string, stack |
| 6 | Maximum Subarray | Easy | array, dynamic-programming |
| 7 | Merge Two Sorted Lists | Easy | linked-list |
| 8 | Best Time to Buy and Sell Stock | Medium | array, dynamic-programming |
| 9 | Group Anagrams | Medium | string, hash-table, sorting |
| 10 | Longest Substring Without Repeating Characters | Medium | string, sliding-window |
| 11 | Container With Most Water | Medium | array, two-pointers |
| 12 | 3Sum | Medium | array, two-pointers, sorting |
| 13 | Binary Search | Easy | array, binary-search |
| 14 | Climbing Stairs | Easy | math, dynamic-programming |
| 15 | Rotate Array | Medium | array |
| 16 | Valid Anagram | Easy | string, hash-table |
| 17 | Merge Intervals | Medium | array, sorting |
| 18 | Product of Array Except Self | Medium | array |
| 19 | Trapping Rain Water | Hard | array, two-pointers, stack |
| 20 | Median of Two Sorted Arrays | Hard | array, binary-search |

The INSERT statement should include complete `starter_code`, `test_code`, `examples`, `constraints`, and `hints` JSON for each problem in both Python and JavaScript.

This is a large SQL statement — insert each problem individually via `execute_sql` to avoid size limits.

- [ ] **Step 2: Verify seed data**

Run: `SELECT id, title, difficulty, tags FROM problems ORDER BY created_at;`
Expected: 20 rows with correct titles and difficulties.

- [ ] **Step 3: Commit** (no code change — DB only)

No files to commit for seeding, but verify the app works end-to-end:

Run: `pnpm build`
Expected: Build succeeds with `/problems` and `/problems/[id]` routes listed.

---

## Self-Review

**Spec coverage:**
- Browse problems by difficulty/topic: Task 7 (listing page with filters)
- Solve in Monaco editor: Task 4 (ProblemShell with MonacoEditor)
- Multi-language support: Task 4 (language picker from starter_code keys)
- Submit against hidden tests: Task 2 (API route) + Task 5 (strips test_code before sending to client)
- Track solve history: Task 3 (submissions tab) + Task 9 (dashboard stats)
- Admin create/manage: Task 8 (CRUD page)
- Separate from courses: All new tables, routes, and components are independent

**Placeholder scan:** No TBDs, TODOs, or "implement later" found. All code blocks are complete.

**Type consistency:** `Problem`, `ProblemSubmission`, `Difficulty` types used consistently across all tasks. `ProblemShellProps` matches what `page.tsx` provides. API route request/response shapes match what `ProblemShell` expects.
