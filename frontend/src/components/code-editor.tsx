"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import type { editor } from "monaco-editor";
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

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

interface CodeEditorProps {
  initialCode?: string;
  initialLanguage?: string;
  lessonId?: string;
  hasTests?: boolean;
  onComplete?: () => void;
}

export function CodeEditor({
  initialCode,
  initialLanguage,
  lessonId,
  hasTests,
  onComplete,
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [language, setLanguage] = useState(initialLanguage || "python");
  const [code, setCode] = useState(
    initialCode || DEFAULT_CODE[initialLanguage || "python"] || DEFAULT_CODE.python
  );
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [showLanguages, setShowLanguages] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [submitResult, setSubmitResult] = useState<{
    passed: boolean;
    passedTests: number;
    totalTests: number;
  } | null>(null);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput("");
    setExitCode(null);
    setTestResults([]);
    setSubmitResult(null);

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

  const handleSubmit = useCallback(async () => {
    if (!lessonId) return;
    setSubmitting(true);
    setOutput("");
    setExitCode(null);
    setTestResults([]);
    setSubmitResult(null);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, lessonId }),
      });

      const data = await res.json();

      if (data.error) {
        setOutput(data.error);
        setExitCode(1);
      } else {
        setOutput(data.output || "");
        setTestResults(data.testResults || []);
        setSubmitResult({
          passed: data.passed,
          passedTests: data.passedTests,
          totalTests: data.totalTests,
        });
        setExitCode(data.passed ? 0 : 1);

        if (data.passed && onComplete) {
          onComplete();
        }
      }
    } catch {
      setOutput("Failed to submit code.");
      setExitCode(1);
    } finally {
      setSubmitting(false);
    }
  }, [code, lessonId, onComplete]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (code === DEFAULT_CODE[language] || code === "") {
      setCode(DEFAULT_CODE[newLang] || "");
    }
    setShowLanguages(false);
  };

  const handleShare = () => {
    const url = new URL(window.location.origin + "/playground");
    url.searchParams.set("lang", language);
    url.searchParams.set("code", code);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  const handleReset = () => {
    setCode(initialCode || DEFAULT_CODE[language] || "");
    setOutput("");
    setExitCode(null);
    setTestResults([]);
    setSubmitResult(null);
  };

  const handleFormat = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument")?.run();
    }
  }, []);

  // Keyboard shortcuts: Ctrl+Enter = Run, Ctrl+Shift+Enter = Submit
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey && hasTests) {
          handleSubmit();
        } else {
          handleRun();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRun, handleSubmit, hasTests]);

  const currentLang = LANGUAGES.find((l) => l.id === language);
  const isWorking = running || submitting;

  // Close language dropdown on Escape
  useEffect(() => {
    if (!showLanguages) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowLanguages(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showLanguages]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-2xl overflow-hidden border border-white/10">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowLanguages(!showLanguages)}
              aria-haspopup="listbox"
              aria-expanded={showLanguages}
              aria-label={`Language: ${currentLang?.name}. Click to change`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors"
            >
              <span>{currentLang?.icon}</span>
              <span>{currentLang?.name}</span>
              <svg
                className="h-3 w-3 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showLanguages && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLanguages(false)} />
                <div role="listbox" aria-label="Select language" className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-[#2d2d2d] border border-white/10 shadow-xl z-50 py-1 max-h-64 overflow-y-auto">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      role="option"
                      aria-selected={lang.id === language}
                      onClick={() => handleLanguageChange(lang.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                        lang.id === language
                          ? "bg-emerald-500/20 text-emerald-400"
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
            onClick={handleFormat}
            className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors hidden sm:inline-flex items-center gap-1"
            title="Format code (Alt+Shift+F)"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h14" />
            </svg>
            Format
          </button>
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors"
          >
            {shareCopied ? "Link copied!" : "Share"}
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors"
          >
            Reset
          </button>
          <Button
            onClick={handleRun}
            disabled={isWorking}
            size="sm"
            className="bg-white/10 hover:bg-white/15 text-gray-200 rounded-lg px-4 gap-2"
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
          {hasTests && (
            <Button
              onClick={handleSubmit}
              disabled={isWorking}
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 gap-2 shadow-lg shadow-emerald-500/20"
            >
              {submitting ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Checking...
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language === "cpp" ? "cpp" : language === "csharp" ? "csharp" : language}
          value={code}
          onChange={(value) => setCode(value || "")}
          onMount={(editor) => { editorRef.current = editor; }}
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

      {/* Output / Test Results Panel */}
      <div className="border-t border-white/10">
        <div className="flex items-center justify-between px-4 py-2 bg-[#252526]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {submitResult ? "Test Results" : "Output"}
            </span>
            {exitCode !== null && !submitResult && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  exitCode === 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                }`}
              >
                {exitCode === 0 ? "Success" : `Exit: ${exitCode}`}
              </span>
            )}
            {submitResult && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  submitResult.passed
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {submitResult.passed
                  ? "All Tests Passed!"
                  : `${submitResult.passedTests}/${submitResult.totalTests} Passed`}
              </span>
            )}
          </div>
          {(output || testResults.length > 0) && (
            <button
              onClick={() => {
                setOutput("");
                setExitCode(null);
                setTestResults([]);
                setSubmitResult(null);
              }}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="max-h-48 overflow-y-auto">
          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="px-4 py-2 space-y-1 border-b border-white/5">
              {testResults.map((test, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 text-sm py-1 px-2 rounded-lg ${
                    test.passed ? "bg-emerald-500/5" : "bg-red-500/5"
                  }`}
                >
                  <span className="flex-shrink-0 mt-0.5">
                    {test.passed ? (
                      <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </span>
                  <div>
                    <span className={`font-mono ${test.passed ? "text-emerald-300" : "text-red-300"}`}>
                      {test.name}
                    </span>
                    {test.message && (
                      <p className="text-xs text-gray-500 mt-0.5">{test.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Success celebration */}
          {submitResult?.passed && (
            <div className="px-4 py-3 bg-emerald-500/10 border-b border-emerald-500/20">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-300">Lesson Complete!</p>
                  <p className="text-xs text-emerald-400/70">All tests passed. Great work!</p>
                </div>
              </div>
            </div>
          )}

          {/* Raw output */}
          <div className="px-4 py-3 bg-[#1a1a1a]">
            {isWorking ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {submitting ? "Running tests..." : "Executing..."}
              </div>
            ) : output ? (
              <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                {/* Filter out test framework lines from display */}
                {output
                  .split("\n")
                  .filter((line) => !line.startsWith("PASS: ") && !line.startsWith("FAIL: ") && line !== "ALL_TESTS_PASSED")
                  .join("\n")
                  .trim() || "(tests only - no program output)"}
              </pre>
            ) : (
              <p className="text-sm text-gray-600 italic">
                {hasTests
                  ? 'Click "Run" to test your code, or "Submit" to check your answer'
                  : 'Click "Run" to execute your code'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
