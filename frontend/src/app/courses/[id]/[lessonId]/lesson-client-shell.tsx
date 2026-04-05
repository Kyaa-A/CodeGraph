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
import { AuthGate } from "@/components/auth-gate";
import { createClient } from "@/lib/supabase/client";

interface LessonClientShellProps {
  lessonId: string;
  courseId: string;
  lessonContent: string;
  starterCode: string;
  language: string;
  hasTests: boolean;
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
  hasTests,
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
  const [activeTab, setActiveTab] = useState<"lesson" | "code">("lesson");
  const [splitPosition, setSplitPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
      { user_id: user.id, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString() },
      { onConflict: "user_id,lesson_id" }
    );
    if (!error) setCompleted(true);
    setCompleting(false);
  }

  const completedSet = new Set(completedIds);

  return (
    <AuthGate>
      <div className="min-h-screen bg-[#fafafa] pt-20">
        {/* Top bar */}
        <div className="fixed top-[72px] left-0 right-0 z-30 bg-white/80 backdrop-blur-xl border-b border-black/5">
          <div className="flex items-center justify-between px-2 sm:px-4 h-12">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Hamburger only on mobile */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-black/5 transition-colors shrink-0"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <nav className="flex items-center gap-1.5 text-sm min-w-0">
                <Link href={`/courses/${courseId}`} className="text-muted-foreground hover:text-foreground transition-colors shrink-0 hidden sm:inline">
                  Course
                </Link>
                <span className="text-black/20 hidden sm:inline">/</span>
                <span className="font-medium truncate max-w-[150px] sm:max-w-[300px]">
                  {currentIndex + 1}. {lessons[currentIndex]?.title}
                </span>
              </nav>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {/* Lesson / Code toggle on mobile */}
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 lg:hidden">
                <button
                  onClick={() => setActiveTab("lesson")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    activeTab === "lesson" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                >
                  Lesson
                </button>
                <button
                  onClick={() => setActiveTab("code")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    activeTab === "code" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                >
                  Code
                </button>
              </div>

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
                <span className="hidden sm:inline">{completed ? "Completed" : completing ? "Saving..." : "Mark Complete"}</span>
              </Button>

              <div className="h-4 w-px bg-border" />

              {prevLesson && (
                <Link href={`/courses/${courseId}/${prevLesson.id}`}>
                  <Button variant="ghost" size="sm" className="rounded-lg text-xs gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Prev</span>
                  </Button>
                </Link>
              )}
              {nextLesson && (
                <Link href={`/courses/${courseId}/${nextLesson.id}`}>
                  <Button variant="ghost" size="sm" className="rounded-lg text-xs gap-1">
                    <span className="hidden sm:inline">Next</span>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </Link>
              )}

              <div className="h-4 w-px bg-border hidden sm:block" />

              <Button onClick={() => setQuizOpen(true)} variant="ghost" size="sm" className="rounded-lg text-xs gap-1 sm:gap-1.5 text-emerald-600">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Quiz</span>
              </Button>
              <Button onClick={() => setChatOpen(true)} variant="ghost" size="sm" className="rounded-lg text-xs gap-1 sm:gap-1.5 text-emerald-600">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="hidden sm:inline">AI Tutor</span>
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-black/5">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ===== MAIN LAYOUT ===== */}
        <div className="fixed top-[120px] left-0 right-0 bottom-0 flex">

          {/* ── Left Sidebar (persistent on desktop, overlay on mobile) ── */}
          {/* Desktop: always visible */}
          <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-slate-100 shrink-0 overflow-hidden">
            {/* Sidebar header */}
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <Link href={`/courses/${courseId}`} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors group">
                <svg className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Course
              </Link>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lessons</span>
                <span className="text-xs text-emerald-600 font-medium">{completedCount}/{lessons.length}</span>
              </div>
              {/* Mini progress bar */}
              <div className="h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* Lesson list */}
            <nav className="flex-1 overflow-y-auto py-2 px-2">
              {lessons.map((l, idx) => {
                const isActive = l.id === lessonId;
                const isDone = completedSet.has(l.id);
                return (
                  <Link key={l.id} href={`/courses/${courseId}/${l.id}`}>
                    <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5 transition-all text-sm ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 font-medium border-l-[3px] border-emerald-500 pl-[9px]"
                        : isDone
                          ? "text-slate-500 hover:bg-slate-50"
                          : "text-slate-700 hover:bg-slate-50"
                    }`}>
                      {/* Status indicator */}
                      <div className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isActive
                          ? "bg-emerald-500 text-white"
                          : isDone
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-slate-100 text-slate-400"
                      }`}>
                        {isDone && !isActive ? (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span className="truncate">{l.title}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && isMobile && (
            <>
              <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setSidebarOpen(false)} />
              <div className="fixed top-[120px] left-0 bottom-0 z-50 w-72 bg-white border-r border-slate-100 shadow-xl overflow-y-auto">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lessons</span>
                    <span className="text-xs text-emerald-600 font-medium">{completedCount}/{lessons.length}</span>
                  </div>
                </div>
                <nav className="py-2 px-2">
                  {lessons.map((l, idx) => {
                    const isActive = l.id === lessonId;
                    const isDone = completedSet.has(l.id);
                    return (
                      <Link key={l.id} href={`/courses/${courseId}/${l.id}`} onClick={() => setSidebarOpen(false)}>
                        <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5 transition-all text-sm ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 font-medium border-l-[3px] border-emerald-500 pl-[9px]"
                            : isDone
                              ? "text-slate-500 hover:bg-slate-50"
                              : "text-slate-700 hover:bg-slate-50"
                        }`}>
                          <div className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isActive ? "bg-emerald-500 text-white" : isDone ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                          }`}>
                            {isDone && !isActive ? (
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <span className="truncate">{l.title}</span>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </>
          )}

          {/* ── Content area (lesson + code editor) ── */}
          <div ref={containerRef} className="flex-1 min-w-0 flex flex-col lg:flex-row" style={{ userSelect: isDragging ? "none" : "auto" }}>

            {/* Mobile: Tab-based view */}
            {isMobile ? (
              activeTab === "lesson" ? (
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 sm:p-6 max-w-3xl">
                    <LessonViewer content={lessonContent} />
                    <Separator className="my-8" />
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
                          <Button variant="outline" size="sm" className="rounded-xl border-black/10">Back to course</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-w-0 p-2">
                  <CodeEditor initialCode={starterCode} initialLanguage={language} lessonId={lessonId} hasTests={hasTests} onComplete={() => setCompleted(true)} />
                </div>
              )
            ) : (
              /* Desktop: Split view */
              <>
                {/* Left: Lesson Content */}
                <div className="overflow-y-auto" style={{ width: `${splitPosition}%` }}>
                  <div className="p-6 max-w-3xl">
                    <LessonViewer content={lessonContent} />
                    <Separator className="my-8" />
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
                          <Button variant="outline" size="sm" className="rounded-xl border-black/10">Back to course</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Drag handle */}
                <div
                  className="w-1.5 bg-black/5 hover:bg-emerald-400/50 active:bg-emerald-500/50 cursor-col-resize transition-colors flex-shrink-0 relative group"
                  onMouseDown={() => setIsDragging(true)}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-black/20 group-hover:bg-emerald-500 transition-colors" />
                </div>

                {/* Right: Code Editor */}
                <div className="flex-1 min-w-0 p-3">
                  <CodeEditor initialCode={starterCode} initialLanguage={language} lessonId={lessonId} hasTests={hasTests} onComplete={() => setCompleted(true)} />
                </div>
              </>
            )}
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
    </AuthGate>
  );
}
