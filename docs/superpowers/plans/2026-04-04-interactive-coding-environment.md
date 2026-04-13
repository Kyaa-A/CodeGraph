# Interactive Coding Environment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform CodeGraph from a read-only lesson platform into an interactive coding academy with a split-screen editor, multi-language code execution, and comprehensive programming courses.

**Architecture:** The lesson page gets a resizable split-screen layout — lesson content on the left, Monaco Editor + output panel on the right. Code execution uses the Piston API (free public endpoint at `https://emkc.org/api/v2/piston`) which supports 50+ languages with zero setup. Each lesson stores optional starter code and language hint. New seed data provides courses for Python, JavaScript, Java, and SQL.

**Tech Stack:** `@monaco-editor/react` for the code editor, Piston API for execution, Next.js API route as proxy, Supabase for course/lesson storage.

---

### Task 1: Install Monaco Editor dependency

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Install @monaco-editor/react**

```bash
cd frontend && pnpm add @monaco-editor/react
```

- [ ] **Step 2: Verify install**

```bash
pnpm list @monaco-editor/react
```

Expected: Shows `@monaco-editor/react` with version

- [ ] **Step 3: Commit**

```bash
git add frontend/package.json frontend/pnpm-lock.yaml
git commit -m "feat: add Monaco Editor dependency"
```

---

### Task 2: Add code execution proxy API route

We proxy through a Next.js API route to avoid CORS issues and to control rate limiting in the future.

**Files:**
- Create: `frontend/src/app/api/execute/route.ts`

- [ ] **Step 1: Create the API route**

```typescript
// frontend/src/app/api/execute/route.ts
import { NextRequest, NextResponse } from "next/server";

const PISTON_URL = "https://emkc.org/api/v2/piston";

// Language version mapping for Piston API
const LANGUAGE_VERSIONS: Record<string, string> = {
  python: "3.10.0",
  javascript: "18.15.0",
  typescript: "5.0.3",
  java: "15.0.2",
  c: "10.2.0",
  cpp: "10.2.0",
  csharp: "6.12.0",
  go: "1.16.2",
  rust: "1.68.2",
  ruby: "3.0.1",
  php: "8.2.3",
  swift: "5.3.3",
  kotlin: "1.8.20",
  sql: "3.36.0",
};

// Piston uses different names for some languages
const PISTON_LANGUAGE_MAP: Record<string, string> = {
  cpp: "c++",
  csharp: "csharp",
  sql: "sqlite3",
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

    const version = LANGUAGE_VERSIONS[language];
    if (!version) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 }
      );
    }

    const pistonLang = PISTON_LANGUAGE_MAP[language] || language;

    const res = await fetch(`${PISTON_URL}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: pistonLang,
        version,
        files: [{ content: code }],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Piston API error: ${text}` },
        { status: 502 }
      );
    }

    const result = await res.json();

    return NextResponse.json({
      output: result.run?.output || "",
      stderr: result.run?.stderr || "",
      exitCode: result.run?.code ?? 0,
      language,
      version,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to execute code" },
      { status: 500 }
    );
  }
}

// GET endpoint to list supported languages
export async function GET() {
  const languages = Object.entries(LANGUAGE_VERSIONS).map(([id, version]) => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    version,
  }));
  return NextResponse.json({ languages });
}
```

- [ ] **Step 2: Verify route compiles**

```bash
cd frontend && pnpm build 2>&1 | tail -20
```

Expected: Build succeeds, `/api/execute` appears as a dynamic route

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/api/execute/route.ts
git commit -m "feat: add code execution proxy API route via Piston"
```

---

### Task 3: Build the CodeEditor component

**Files:**
- Create: `frontend/src/components/code-editor.tsx`

- [ ] **Step 1: Create the CodeEditor component**

```tsx
// frontend/src/components/code-editor.tsx
"use client";

import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";

const LANGUAGES = [
  { id: "python", name: "Python", icon: "🐍" },
  { id: "javascript", name: "JavaScript", icon: "🟨" },
  { id: "typescript", name: "TypeScript", icon: "🔷" },
  { id: "java", name: "Java", icon: "☕" },
  { id: "c", name: "C", icon: "⚙️" },
  { id: "cpp", name: "C++", icon: "⚙️" },
  { id: "csharp", name: "C#", icon: "🟪" },
  { id: "go", name: "Go", icon: "🐹" },
  { id: "rust", name: "Rust", icon: "🦀" },
  { id: "ruby", name: "Ruby", icon: "💎" },
  { id: "php", name: "PHP", icon: "🐘" },
  { id: "kotlin", name: "Kotlin", icon: "🟣" },
  { id: "sql", name: "SQL", icon: "🗃️" },
];

const DEFAULT_CODE: Record<string, string> = {
  python: '# Write your Python code here\nprint("Hello, World!")\n',
  javascript: '// Write your JavaScript code here\nconsole.log("Hello, World!");\n',
  typescript: '// Write your TypeScript code here\nconst greeting: string = "Hello, World!";\nconsole.log(greeting);\n',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n',
  csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}\n',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}\n',
  rust: 'fn main() {\n    println!("Hello, World!");\n}\n',
  ruby: '# Write your Ruby code here\nputs "Hello, World!"\n',
  php: '<?php\n// Write your PHP code here\necho "Hello, World!\\n";\n',
  kotlin: 'fun main() {\n    println("Hello, World!")\n}\n',
  sql: '-- Write your SQL here\nSELECT "Hello, World!" AS greeting;\n',
};

interface CodeEditorProps {
  initialCode?: string;
  initialLanguage?: string;
}

export function CodeEditor({ initialCode, initialLanguage }: CodeEditorProps) {
  const [language, setLanguage] = useState(initialLanguage || "python");
  const [code, setCode] = useState(initialCode || DEFAULT_CODE[initialLanguage || "python"] || DEFAULT_CODE.python);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [showLanguages, setShowLanguages] = useState(false);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput("");
    setExitCode(null);

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await res.json();

      if (data.error) {
        setOutput(data.error);
        setExitCode(1);
      } else {
        const combined = [data.output, data.stderr].filter(Boolean).join("\n");
        setOutput(combined || "(no output)");
        setExitCode(data.exitCode);
      }
    } catch {
      setOutput("Failed to connect to execution server.");
      setExitCode(1);
    } finally {
      setRunning(false);
    }
  }, [code, language]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    // Only reset code if user hasn't modified it from default
    if (code === DEFAULT_CODE[language] || code === "") {
      setCode(DEFAULT_CODE[newLang] || "");
    }
    setShowLanguages(false);
  };

  const handleReset = () => {
    setCode(initialCode || DEFAULT_CODE[language] || "");
    setOutput("");
    setExitCode(null);
  };

  const currentLang = LANGUAGES.find((l) => l.id === language);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-2xl overflow-hidden border border-white/10">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/10">
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguages(!showLanguages)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors"
            >
              <span>{currentLang?.icon}</span>
              <span>{currentLang?.name}</span>
              <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showLanguages && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLanguages(false)} />
                <div className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-[#2d2d2d] border border-white/10 shadow-xl z-50 py-1 max-h-64 overflow-y-auto">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageChange(lang.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                        lang.id === language
                          ? "bg-amber-500/20 text-amber-400"
                          : "text-gray-300 hover:bg-white/5"
                      }`}
                    >
                      <span>{lang.icon}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors"
          >
            Reset
          </button>
          <Button
            onClick={handleRun}
            disabled={running}
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 gap-2 shadow-lg shadow-emerald-500/20"
          >
            {running ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Running...
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Run
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language === "cpp" ? "cpp" : language === "csharp" ? "csharp" : language}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineHeight: 22,
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            tabSize: 4,
            renderLineHighlight: "line",
            cursorBlinking: "smooth",
            smoothScrolling: true,
            contextmenu: false,
          }}
        />
      </div>

      {/* Output Panel */}
      <div className="border-t border-white/10">
        <div className="flex items-center justify-between px-4 py-2 bg-[#252526]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Output</span>
            {exitCode !== null && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                exitCode === 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
              }`}>
                {exitCode === 0 ? "Success" : `Exit: ${exitCode}`}
              </span>
            )}
          </div>
          {output && (
            <button
              onClick={() => { setOutput(""); setExitCode(null); }}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="h-32 overflow-y-auto px-4 py-3 bg-[#1a1a1a]">
          {running ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Executing...
            </div>
          ) : output ? (
            <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">{output}</pre>
          ) : (
            <p className="text-sm text-gray-600 italic">Click "Run" to execute your code</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd frontend && pnpm build 2>&1 | tail -10
```

Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/code-editor.tsx
git commit -m "feat: add CodeEditor component with Monaco Editor and Piston execution"
```

---

### Task 4: Add starter_code and language columns to lessons table

**Files:**
- Create: `backend/supabase/migrations/005_add_lesson_code_fields.sql`
- Modify: `frontend/src/lib/supabase/types.ts`

- [ ] **Step 1: Create the migration**

```sql
-- backend/supabase/migrations/005_add_lesson_code_fields.sql
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS starter_code TEXT DEFAULT '';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS language TEXT DEFAULT '';
```

- [ ] **Step 2: Run the migration against Supabase**

Use the Supabase MCP tool `apply_migration` with name `add_lesson_code_fields` and the SQL above. Or run via Supabase dashboard SQL editor.

- [ ] **Step 3: Update frontend types**

In `frontend/src/lib/supabase/types.ts`, update the `Lesson` interface:

```typescript
export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string;
  order_index: number;
  starter_code: string;
  language: string;
  created_at: string;
}
```

- [ ] **Step 4: Commit**

```bash
git add backend/supabase/migrations/005_add_lesson_code_fields.sql frontend/src/lib/supabase/types.ts
git commit -m "feat: add starter_code and language fields to lessons table"
```

---

### Task 5: Redesign lesson page with split-screen layout

Replace the current single-column lesson page with a split-screen: lesson content on the left, code editor on the right.

**Files:**
- Modify: `frontend/src/app/courses/[id]/[lessonId]/page.tsx`

- [ ] **Step 1: Rewrite the lesson page**

Replace the entire return statement in `frontend/src/app/courses/[id]/[lessonId]/page.tsx` with the split-screen layout. The server component still fetches all data (lesson, adjacent lessons, progress). The key change is the layout — instead of content + sidebar, it's now content-left + editor-right with a collapsible sidebar.

```tsx
// frontend/src/app/courses/[id]/[lessonId]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LessonViewer } from "@/components/lesson-viewer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LessonClientShell } from "./lesson-client-shell";
import type { Lesson } from "@/lib/supabase/types";

export const metadata = {
  title: "Lesson | CodeGraph",
  description: "Course lesson content",
};

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  const supabase = await createClient();

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (error || !lesson) {
    notFound();
  }

  const typedLesson = lesson as Lesson;

  // Get adjacent lessons for navigation
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, title, order_index")
    .eq("course_id", id)
    .order("order_index", { ascending: true });

  const lessons = (allLessons ?? []) as Pick<Lesson, "id" | "title" | "order_index">[];
  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  // Fetch real completion data
  const { data: { user } } = await supabase.auth.getUser();
  let completedLessonIds = new Set<string>();
  if (user) {
    const { data: progress } = await supabase
      .from("user_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .eq("completed", true)
      .in("lesson_id", lessons.map((l) => l.id));
    if (progress) {
      completedLessonIds = new Set(progress.map((p: { lesson_id: string }) => p.lesson_id));
    }
  }
  const completedCount = completedLessonIds.size;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  // Serialize completedLessonIds for client component
  const completedIds = Array.from(completedLessonIds);

  return (
    <LessonClientShell
      lessonId={lessonId}
      courseId={id}
      lessonContent={typedLesson.content}
      starterCode={typedLesson.starter_code || ""}
      language={typedLesson.language || "python"}
      lessons={lessons}
      currentIndex={currentIndex}
      prevLesson={prevLesson}
      nextLesson={nextLesson}
      completedIds={completedIds}
      completedCount={completedCount}
      progressPercent={progressPercent}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/courses/[id]/[lessonId]/page.tsx
git commit -m "feat: pass lesson data to client shell for split-screen layout"
```

---

### Task 6: Rewrite LessonClientShell with split-screen layout

The client shell becomes the main layout component with resizable split-screen.

**Files:**
- Modify: `frontend/src/app/courses/[id]/[lessonId]/lesson-client-shell.tsx`

- [ ] **Step 1: Rewrite lesson-client-shell.tsx**

```tsx
// frontend/src/app/courses/[id]/[lessonId]/lesson-client-shell.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LessonViewer } from "@/components/lesson-viewer";
import { CodeEditor } from "@/components/code-editor";
import { AIChatPanel } from "@/components/ai-chat-panel";
import { QuizModal } from "@/components/quiz-modal";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";

interface LessonClientShellProps {
  lessonId: string;
  courseId: string;
  lessonContent: string;
  starterCode: string;
  language: string;
  lessons: { id: string; title: string; order_index: number }[];
  currentIndex: number;
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
  completedIds: string[];
  completedCount: number;
  progressPercent: number;
}

export function LessonClientShell({
  lessonId,
  courseId,
  lessonContent,
  starterCode,
  language,
  lessons,
  currentIndex,
  prevLesson,
  nextLesson,
  completedIds,
  completedCount,
  progressPercent,
}: LessonClientShellProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completed, setCompleted] = useState(completedIds.includes(lessonId));
  const [completing, setCompleting] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Handle split-screen resize
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pos = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPosition(Math.min(Math.max(pos, 25), 75));
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  async function handleMarkComplete() {
    setCompleting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCompleting(false); return; }

    const { error } = await supabase.from("user_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" }
    );

    if (!error) setCompleted(true);
    setCompleting(false);
  }

  const completedSet = new Set(completedIds);

  return (
    <>
      <div className="min-h-screen bg-[#fafafa] pt-20">
        {/* Top bar */}
        <div className="fixed top-[72px] left-0 right-0 z-30 bg-white/80 backdrop-blur-xl border-b border-black/5">
          <div className="flex items-center justify-between px-4 h-12">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <nav className="flex items-center gap-1.5 text-sm">
                <Link href={`/courses/${courseId}`} className="text-muted-foreground hover:text-foreground transition-colors">
                  Course
                </Link>
                <span className="text-black/20">/</span>
                <span className="font-medium truncate max-w-[300px]">
                  {currentIndex + 1}. {lessons[currentIndex]?.title}
                </span>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              {/* Mark Complete */}
              <Button
                onClick={handleMarkComplete}
                disabled={completed || completing}
                variant="ghost"
                size="sm"
                className={`rounded-lg text-xs gap-1.5 ${completed ? "text-emerald-600" : "text-muted-foreground"}`}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {completed ? "Completed" : completing ? "Saving..." : "Mark Complete"}
              </Button>

              <div className="h-4 w-px bg-border" />

              {/* Nav buttons */}
              {prevLesson && (
                <Link href={`/courses/${courseId}/${prevLesson.id}`}>
                  <Button variant="ghost" size="sm" className="rounded-lg text-xs gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Prev
                  </Button>
                </Link>
              )}
              {nextLesson && (
                <Link href={`/courses/${courseId}/${nextLesson.id}`}>
                  <Button variant="ghost" size="sm" className="rounded-lg text-xs gap-1">
                    Next
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </Link>
              )}

              <div className="h-4 w-px bg-border" />

              <Button
                onClick={() => setQuizOpen(true)}
                variant="ghost"
                size="sm"
                className="rounded-lg text-xs gap-1.5 text-amber-600"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Quiz
              </Button>
              <Button
                onClick={() => setChatOpen(true)}
                variant="ghost"
                size="sm"
                className="rounded-lg text-xs gap-1.5 text-amber-600"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                AI Tutor
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-black/5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Sidebar overlay */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setSidebarOpen(false)} />
            <div className="fixed top-[120px] left-0 bottom-0 z-50 w-72 bg-white border-r border-black/5 shadow-xl overflow-y-auto p-4">
              <h3 className="font-heading font-semibold mb-3 text-sm">
                Lessons ({completedCount}/{lessons.length})
              </h3>
              <div className="space-y-1">
                {lessons.map((l, idx) => (
                  <Link key={l.id} href={`/courses/${courseId}/${l.id}`} onClick={() => setSidebarOpen(false)}>
                    <div className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-colors ${
                      l.id === lessonId
                        ? "bg-amber-500/10 border border-amber-500/20"
                        : "hover:bg-black/5"
                    }`}>
                      <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                        l.id === lessonId
                          ? "bg-amber-500 text-white"
                          : completedSet.has(l.id)
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-500"
                      }`}>
                        {completedSet.has(l.id) && l.id !== lessonId ? (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span className={`text-sm truncate ${l.id === lessonId ? "font-semibold" : ""}`}>
                        {l.title}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Split-screen content */}
        <div ref={containerRef} className="fixed top-[120px] left-0 right-0 bottom-0 flex" style={{ userSelect: isDragging ? "none" : "auto" }}>
          {/* Left: Lesson Content */}
          <div className="overflow-y-auto" style={{ width: `${splitPosition}%` }}>
            <div className="p-6 max-w-3xl">
              <LessonViewer content={lessonContent} />

              <Separator className="my-8" />

              {/* Bottom navigation */}
              <div className="flex items-center justify-between gap-4 flex-wrap pb-8">
                {prevLesson ? (
                  <Link href={`/courses/${courseId}/${prevLesson.id}`}>
                    <Button variant="outline" size="sm" className="rounded-xl border-black/10 hover:bg-black/5">
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      {prevLesson.title}
                    </Button>
                  </Link>
                ) : <div />}
                {nextLesson ? (
                  <Link href={`/courses/${courseId}/${nextLesson.id}`}>
                    <Button size="sm" className="btn-gold rounded-xl">
                      {nextLesson.title}
                      <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/courses/${courseId}`}>
                    <Button variant="outline" size="sm" className="rounded-xl border-black/10">
                      Back to course
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Drag handle */}
          <div
            className="w-1.5 bg-black/5 hover:bg-amber-400/50 active:bg-amber-500/50 cursor-col-resize transition-colors flex-shrink-0 relative group"
            onMouseDown={() => setIsDragging(true)}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-black/20 group-hover:bg-amber-500 transition-colors" />
          </div>

          {/* Right: Code Editor */}
          <div className="flex-1 min-w-0 p-3">
            <CodeEditor initialCode={starterCode} initialLanguage={language} />
          </div>
        </div>
      </div>

      {/* AI Chat Sheet */}
      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
        <SheetContent className="w-full sm:max-w-md p-0 border-l-0 bg-transparent" side="right">
          <div className="h-full p-4">
            <AIChatPanel lessonId={lessonId} courseId={courseId} />
          </div>
        </SheetContent>
      </Sheet>

      <QuizModal open={quizOpen} onOpenChange={setQuizOpen} lessonId={lessonId} />
    </>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && pnpm build 2>&1 | tail -10
```

Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/courses/[id]/[lessonId]/lesson-client-shell.tsx
git commit -m "feat: split-screen lesson layout with resizable editor panel"
```

---

### Task 7: Seed comprehensive programming courses

**Files:**
- Modify: `backend/supabase/seed.sql` (replace entirely with expanded seed)

- [ ] **Step 1: Create the expanded seed file**

Replace `backend/supabase/seed.sql` with comprehensive courses. Each course has 5-8 lessons with real educational content and `starter_code`/`language` fields. Courses to include:

1. **AI Fundamentals with LangChain** (existing — keep and add starter_code)
2. **Python for Beginners** — variables, data types, loops, functions, lists, dicts, file I/O, OOP basics
3. **JavaScript Essentials** — variables, DOM, functions, arrays, objects, async/await, fetch API, ES6+
4. **Java Fundamentals** — hello world, types, OOP, collections, exceptions, file I/O
5. **SQL Mastery** — SELECT, WHERE, JOIN, GROUP BY, subqueries, CREATE/INSERT/UPDATE

Each lesson should have:
- `content`: Full markdown lesson (300-800 words with code examples)
- `starter_code`: A coding exercise for the student to complete
- `language`: The language for the code editor

This is a large file. Write it with real, educational content — not placeholder text.

- [ ] **Step 2: Run the seed against Supabase**

First clear existing seed data, then re-seed:

```sql
DELETE FROM lesson_chunks;
DELETE FROM lessons;
DELETE FROM courses;
```

Then run the new seed.sql via Supabase SQL editor or MCP.

- [ ] **Step 3: Re-ingest embeddings for AI course lessons**

```bash
cd backend && source .venv/bin/activate
# Ingest each lesson that needs AI features
python -c "
import httpx, asyncio
async def ingest():
    async with httpx.AsyncClient() as c:
        # Get all lessons from AI course
        r = await c.post('http://localhost:8000/api/ingest/a1b2c3d4-e5f6-7890-abcd-ef1234567890')
        print(r.json())
asyncio.run(ingest())
"
```

- [ ] **Step 4: Commit**

```bash
git add backend/supabase/seed.sql
git commit -m "feat: seed comprehensive courses for Python, JavaScript, Java, SQL"
```

---

### Task 8: Verify end-to-end flow

- [ ] **Step 1: Start both servers**

Terminal 1:
```bash
cd ~/Project/CodeGraph/backend && source .venv/bin/activate && uvicorn app.main:app --reload
```

Terminal 2:
```bash
cd ~/Project/CodeGraph/frontend && pnpm dev
```

- [ ] **Step 2: Test the courses page**

Navigate to `http://localhost:3000/courses` — should show 5 courses.

- [ ] **Step 3: Test split-screen lesson page**

Click into any course → click a lesson. Should see:
- Left: lesson content (markdown rendered)
- Right: code editor with starter code pre-loaded
- Drag handle between them to resize
- Language selector in editor toolbar

- [ ] **Step 4: Test code execution**

Write code in the editor → click "Run" → should see output in the output panel below the editor.

Test multiple languages:
- Python: `print("hello")`
- JavaScript: `console.log("hello")`
- Java: full class with main method

- [ ] **Step 5: Test remaining features**

- Mark Complete button in top bar
- Quiz button → generates quiz
- AI Tutor button → opens chat panel
- Lesson sidebar (hamburger menu)
- Previous/Next navigation
- Progress bar updates after marking complete

- [ ] **Step 6: Final build check**

```bash
cd frontend && pnpm build
```

Expected: Clean build with no errors

- [ ] **Step 7: Commit any fixes**

```bash
git add -A
git commit -m "fix: end-to-end verification fixes"
```
