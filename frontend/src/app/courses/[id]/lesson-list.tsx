import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import type { Lesson, UserProgress } from "@/lib/supabase/types";

interface LessonListProps {
  courseId: string;
}

async function getLessonsWithProgress(courseId: string) {
  const supabase = await createClient();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let completedIds = new Set<string>();
  if (user) {
    const { data: progress } = await supabase
      .from("user_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .eq("completed", true);

    completedIds = new Set((progress ?? []).map((p: { lesson_id: string }) => p.lesson_id));
  }

  return { lessons: (lessons ?? []) as Lesson[], completedIds, isLoggedIn: !!user };
}

export async function LessonList({ courseId }: LessonListProps) {
  const { lessons, completedIds, isLoggedIn } = await getLessonsWithProgress(courseId);

  if (lessons.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="font-heading text-xl font-semibold mb-2">No lessons yet</h3>
        <p className="text-muted-foreground">This course doesn&apos;t have any lessons yet.</p>
      </div>
    );
  }

  const completedCount = lessons.filter((l) => completedIds.has(l.id)).length;
  const progressPercent = Math.round((completedCount / lessons.length) * 100);

  return (
    <div>
      {/* Header with progress summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="font-heading text-2xl font-bold">
            Course Lessons
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {lessons.length} lessons
            {isLoggedIn && completedCount > 0 && (
              <span className="text-emerald-600 font-medium"> &middot; {completedCount} completed</span>
            )}
          </p>
        </div>

        {isLoggedIn && completedCount > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="relative h-10 w-10">
              <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke="#10b981" strokeWidth="3"
                  strokeDasharray={`${progressPercent * 0.942} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-emerald-700">
                {progressPercent}%
              </span>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-emerald-800">{completedCount}/{lessons.length}</p>
              <p className="text-emerald-600 text-xs">completed</p>
            </div>
          </div>
        )}
      </div>

      {/* Lesson list */}
      <div className="space-y-3">
        {lessons.map((lesson: Lesson, index: number) => {
          const isCompleted = completedIds.has(lesson.id);

          return (
            <Link key={lesson.id} href={`/courses/${courseId}/${lesson.id}`}>
              <div className={`rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 group cursor-pointer border ${
                isCompleted
                  ? "bg-emerald-50/50 border-emerald-200/60"
                  : "glass-card"
              }`}>
                <div className="flex items-center gap-5">
                  {/* Lesson Number / Check */}
                  {isCompleted ? (
                    <div className="h-12 w-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/25">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-heading font-bold text-lg group-hover:from-emerald-500 group-hover:to-emerald-400 group-hover:text-white transition-all">
                      {index + 1}
                    </div>
                  )}

                  {/* Lesson Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold transition-colors truncate ${
                      isCompleted
                        ? "text-emerald-800"
                        : "text-foreground group-hover:text-emerald-600"
                    }`}>
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {isCompleted
                        ? "Completed"
                        : lesson.content
                          ? "Ready to start"
                          : "Content coming soon"}
                    </p>
                  </div>

                  {/* Action */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-xl transition-all shrink-0 ${
                      isCompleted
                        ? "text-emerald-600 hover:bg-emerald-100"
                        : "group-hover:bg-emerald-500 group-hover:text-white"
                    }`}
                  >
                    {isCompleted ? "Review" : "Start"}
                    <svg className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
