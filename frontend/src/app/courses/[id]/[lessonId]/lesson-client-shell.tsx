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
  const [splitPosition, setSplitPosition] = useState(50);
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
              {/* Mark Complete - hidden when lesson has tests (must pass tests) */}
              {hasTests ? (
                completed && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 px-2">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Completed
                  </span>
                )
              ) : (
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
              )}

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
            <CodeEditor
              initialCode={starterCode}
              initialLanguage={language}
              lessonId={lessonId}
              hasTests={hasTests}
              onComplete={() => setCompleted(true)}
            />
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
