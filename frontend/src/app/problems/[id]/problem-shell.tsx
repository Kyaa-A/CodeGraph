"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { LOTTIE } from "@/lib/lottie-assets";
import { ProblemDescription } from "./problem-description";
import type { Problem, ProblemSubmission } from "@/lib/supabase/types";
import { awardProblemXp } from "@/lib/xp";
import confetti from "canvas-confetti";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const LANG_LOGOS: Record<string, string> = {
  python: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  javascript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  typescript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  java: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  cpp: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
  c: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
  csharp: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg",
  go: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg",
  rust: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg",
};

const LANGUAGE_OPTIONS = [
  { id: "python", name: "Python" },
  { id: "javascript", name: "JavaScript" },
  { id: "typescript", name: "TypeScript" },
  { id: "java", name: "Java" },
  { id: "cpp", name: "C++" },
  { id: "c", name: "C" },
  { id: "csharp", name: "C#" },
  { id: "go", name: "Go" },
  { id: "rust", name: "Rust" },
];

interface ProblemShellProps {
  problem: Problem;
  submissions: ProblemSubmission[];
  isAuthenticated: boolean;
  userId: string | null;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function ProblemShell({ problem, submissions: initialSubmissions, isAuthenticated, userId }: ProblemShellProps) {
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
  const [submitResult, setSubmitResult] = useState<{ passed: boolean; total: number; passedCount: number; solveTime?: number } | null>(null);
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [activePanel, setActivePanel] = useState<"output" | "tests">("tests");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "code">("description");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  const [copied, setCopied] = useState(false);

  function handleResetCode() {
    setCode(problem.starter_code[language] || "");
    setOutput("");
    setTestResults([]);
    setSubmitResult(null);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleLanguageChange(langId: string) {
    setLanguage(langId);
    setCode(problem.starter_code[langId] || "");
    setShowLanguages(false);
    setOutput("");
    setTestResults([]);
    setSubmitResult(null);
  }

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

  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput("");
    setActivePanel("output");
    // Auto-start timer on first run
    if (!timerRunning && timerSeconds === 0) {
      setTimerRunning(true);
    }
    try {
      // Use public endpoint so unauthenticated users can run code
      const res = await fetch("/api/playground", {
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
  }, [code, language, timerRunning, timerSeconds]);

  const handleSubmit = useCallback(async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
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
      const solveTime = data.passed && timerSeconds > 0 ? timerSeconds : undefined;
      setSubmitResult({
        passed: data.passed,
        total: data.totalTests,
        passedCount: data.passedTests,
        solveTime,
      });
      setOutput(data.output || "");
      // Stop timer and award XP on successful submission
      if (data.passed) {
        // Fire emerald confetti burst
        confetti({
          particleCount: 80,
          spread: 70,
          gravity: 1.2,
          ticks: 120,
          origin: { y: 0.6 },
          colors: ["#10B981", "#34D399", "#6EE7B7"],
        });
        setTimerRunning(false);
        if (userId) {
          awardProblemXp(userId, problem.id, problem.difficulty);
        }
      }
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
  }, [code, language, problem.id, problem.difficulty, isAuthenticated, timerSeconds, userId]);

  // Keyboard shortcuts: Ctrl+Enter = Run, Ctrl+Shift+Enter = Submit
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubmit();
        } else {
          handleRun();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRun, handleSubmit]);

  // Close language dropdown on Escape
  useEffect(() => {
    if (!showLanguages) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowLanguages(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showLanguages]);

  const currentLang = LANGUAGE_OPTIONS.find((l) => l.id === language);

  // Shared output/test panel
  const outputPanel = (
    <>
      <div className="flex border-b border-slate-700 shrink-0">
        <button
          onClick={() => setActivePanel("tests")}
          className={`px-4 py-2 text-xs font-medium ${
            activePanel === "tests" ? "text-emerald-400 border-b border-emerald-400" : "text-slate-500"
          }`}
        >
          Test Results
        </button>
        <button
          onClick={() => setActivePanel("output")}
          className={`px-4 py-2 text-xs font-medium ${
            activePanel === "output" ? "text-emerald-400 border-b border-emerald-400" : "text-slate-500"
          }`}
        >
          Output
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {activePanel === "tests" ? (
          <div className="space-y-1.5">
            {submitResult && (
              <div className={`rounded-lg px-3 py-2 mb-2 ${
                submitResult.passed
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-red-500/20 text-red-400"
              }`}>
                <div className="flex items-center gap-2">
                  {submitResult.passed && (
                    <DotLottieReact
                      src={LOTTIE.problemSuccess}
                      autoplay
                      className="w-10 h-10 shrink-0"
                    />
                  )}
                  <div>
                    <div className="text-sm font-semibold">
                      {submitResult.passed
                        ? "All Tests Passed!"
                        : `${submitResult.passedCount}/${submitResult.total} Tests Passed`}
                    </div>
                    {submitResult.passed && submitResult.solveTime && (
                      <div className="text-xs mt-0.5 text-emerald-400/70">
                        Solved in {formatTime(submitResult.solveTime)}
                      </div>
                    )}
                  </div>
                </div>
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
              <p className="text-xs text-slate-500">
                {isAuthenticated
                  ? "Submit your solution to see test results"
                  : "Sign in to submit solutions and see test results"}
              </p>
            )}
          </div>
        ) : (
          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
            {output || "Run your code to see output"}
          </pre>
        )}
      </div>
    </>
  );

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Top bar */}
      <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-2 sm:px-4 shrink-0 mt-[72px]">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/problems"
            className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <span className="text-xs sm:text-sm font-semibold text-slate-700 truncate max-w-[100px] sm:max-w-[200px]">
            {problem.title}
          </span>

          {/* Timer - hidden on small screens */}
          <div className="hidden sm:flex items-center gap-1.5 ml-3 pl-3 border-l border-slate-200">
            <button
              onClick={() => {
                if (timerRunning) {
                  setTimerRunning(false);
                } else {
                  setTimerRunning(true);
                }
              }}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              title={timerRunning ? "Pause timer" : "Start timer"}
            >
              {timerRunning ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
            <span className={`text-xs font-mono tabular-nums ${timerRunning ? "text-emerald-600" : "text-slate-400"}`}>
              {formatTime(timerSeconds)}
            </span>
            {timerSeconds > 0 && (
              <button
                onClick={() => { setTimerRunning(false); setTimerSeconds(0); }}
                className="text-slate-300 hover:text-slate-500 transition-colors"
                title="Reset timer"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language picker */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg text-xs gap-1 sm:gap-1.5 border-slate-200"
              onClick={() => setShowLanguages(!showLanguages)}
              aria-haspopup="listbox"
              aria-expanded={showLanguages}
              aria-label={`Language: ${currentLang?.name}. Click to change`}
            >
              {currentLang && <Image src={LANG_LOGOS[currentLang.id]} alt={currentLang.name} width={16} height={16} className="h-4 w-4" />}
              <span className="hidden sm:inline">{currentLang?.name}</span>
              <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
            {showLanguages && (
              <div role="listbox" aria-label="Select language" className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg border border-slate-200 shadow-xl z-50 py-1">
                {availableLanguages.map((l) => (
                  <button
                    key={l.id}
                    role="option"
                    aria-selected={l.id === language}
                    onClick={() => handleLanguageChange(l.id)}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 ${
                      l.id === language ? "bg-emerald-50 text-emerald-700" : "text-slate-600"
                    }`}
                  >
                    <Image src={LANG_LOGOS[l.id]} alt={l.name} width={16} height={16} className="h-4 w-4" />
                    {l.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleCopyLink}
            title="Copy problem link"
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {copied ? (
              <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            )}
          </button>

          <button
            onClick={handleResetCode}
            title="Reset to starter code"
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <Button
            variant="outline"
            size="sm"
            className="rounded-lg text-xs"
            onClick={handleRun}
            disabled={running || submitting}
            title="Ctrl+Enter"
          >
            {running ? "..." : "Run"}
          </Button>

          <Button
            size="sm"
            className="rounded-lg text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={handleSubmit}
            disabled={submitting || running}
            title="Ctrl+Shift+Enter"
          >
            {submitting ? "..." : "Submit"}
          </Button>
        </div>
      </div>

      {/* Mobile tab switcher */}
      {isMobile && (
        <div className="flex border-b border-slate-200 bg-white md:hidden">
          <button
            onClick={() => setActiveTab("description")}
            className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
              activeTab === "description" ? "text-emerald-600 border-b-2 border-emerald-500" : "text-slate-500"
            }`}
          >
            Problem
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
              activeTab === "code" ? "text-emerald-600 border-b-2 border-emerald-500" : "text-slate-500"
            }`}
          >
            Code
          </button>
        </div>
      )}

      {/* Split pane - tabs on mobile, side-by-side on md+ */}
      <div ref={containerRef} className="flex-1 flex flex-col md:flex-row overflow-hidden" style={{ userSelect: isDragging ? "none" : "auto" }}>
        {/* Left: Problem description */}
        <div
          className={`bg-white border-b md:border-b-0 md:border-r border-slate-200 overflow-hidden md:h-auto shrink-0 md:shrink ${
            isMobile ? (activeTab === "code" ? "hidden" : "flex-1") : ""
          }`}
          style={{ width: isMobile ? undefined : `${splitPosition}%` }}
        >
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

        {/* Drag handle - hidden on mobile */}
        <div
          className="hidden md:block w-1.5 bg-slate-100 hover:bg-emerald-300 cursor-col-resize transition-colors shrink-0 relative group"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" />
        </div>

        {/* Right: Editor + Output */}
        <div
          className={`flex flex-col overflow-hidden flex-1 ${
            isMobile && activeTab !== "code" ? "hidden" : ""
          }`}
          style={{ width: isMobile ? undefined : `${100 - splitPosition}%` }}
        >
          {/* Editor */}
          <div className="flex-1 min-h-[200px] md:min-h-0">
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
          <div className="h-36 md:h-48 border-t border-slate-700 bg-[#1e1e1e] flex flex-col shrink-0">
            {outputPanel}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Sign in to submit solutions and track your progress"
      />
    </div>
  );
}
