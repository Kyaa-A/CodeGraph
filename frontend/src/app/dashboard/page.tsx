import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import type { Course, Lesson, UserProgress } from "@/lib/supabase/types";

export const metadata = {
  title: "Dashboard | CodeGraph",
  description: "Your learning dashboard",
};

interface CourseWithProgress {
  course: Course;
  totalLessons: number;
  completedLessons: number;
  nextLessonId: string | null;
}

function xpForLevel(level: number) {
  return level * (level - 1) * 50;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [coursesResult, lessonsResult, progressResult, submissionsResult, profileResult, xpEventsResult] =
    await Promise.all([
      supabase.from("courses").select("*").order("created_at", { ascending: false }),
      supabase.from("lessons").select("*").order("order_index", { ascending: true }),
      user
        ? supabase.from("user_progress").select("*").eq("user_id", user.id).eq("completed", true)
        : Promise.resolve({ data: null }),
      user
        ? supabase
            .from("problem_submissions")
            .select("problem_id, created_at")
            .eq("user_id", user.id)
            .eq("passed", true)
        : Promise.resolve({ data: null }),
      user
        ? supabase.from("profiles").select("name, total_xp, level").eq("id", user.id).single()
        : Promise.resolve({ data: null }),
      user
        ? supabase
            .from("xp_events")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10)
        : Promise.resolve({ data: null }),
    ]);

  const typedCourses = (coursesResult.data ?? []) as Course[];
  const typedLessons = (lessonsResult.data ?? []) as Lesson[];
  const userProgress = (progressResult.data ?? []) as UserProgress[];
  const submissions = (submissionsResult.data ?? []) as { problem_id: string; created_at: string }[];
  const profile = profileResult.data as { name: string | null; total_xp: number; level: number } | null;
  const xpEvents = (xpEventsResult.data ?? []) as {
    id: string;
    event_type: string;
    xp_amount: number;
    metadata: Record<string, string> | null;
    created_at: string;
  }[];

  const problemsSolved = new Set(submissions.map((s) => s.problem_id)).size;
  const completedLessonIds = new Set(userProgress.map((p) => p.lesson_id));

  // Build course progress — ONLY courses where user has started at least 1 lesson
  const allCoursesWithProgress: CourseWithProgress[] = typedCourses.map((course) => {
    const courseLessons = typedLessons.filter((l) => l.course_id === course.id);
    const completed = courseLessons.filter((l) => completedLessonIds.has(l.id)).length;
    const nextLesson = courseLessons.find((l) => !completedLessonIds.has(l.id));
    return {
      course,
      totalLessons: courseLessons.length,
      completedLessons: completed,
      nextLessonId: nextLesson?.id ?? null,
    };
  });

  const enrolledCourses = allCoursesWithProgress.filter((c) => c.completedLessons > 0);
  const coursesCompleted = enrolledCourses.filter(
    (c) => c.completedLessons === c.totalLessons && c.totalLessons > 0
  ).length;

  // Streak
  function calculateStreak(progress: UserProgress[]): number {
    const completedDates = progress
      .filter((p) => p.completed_at)
      .map((p) => {
        const d = new Date(p.completed_at!);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      });
    const uniqueDays = [...new Set(completedDates)].sort().reverse();
    if (uniqueDays.length === 0) return 0;

    const today = new Date();
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const todayStr = fmt(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = fmt(yesterday);

    if (uniqueDays[0] !== todayStr && uniqueDays[0] !== yesterdayStr) return 0;

    let streak = 1;
    let current = new Date(uniqueDays[0]);
    for (let i = 1; i < uniqueDays.length; i++) {
      const prev = new Date(current);
      prev.setDate(prev.getDate() - 1);
      if (uniqueDays[i] === fmt(prev)) {
        streak++;
        current = prev;
      } else break;
    }
    return streak;
  }

  const currentStreak = calculateStreak(userProgress);
  const totalLessonsCompleted = userProgress.length;
  const totalXp = profile?.total_xp ?? 0;
  const level = profile?.level ?? 1;
  const xpForCurrent = xpForLevel(level);
  const xpForNext = xpForLevel(level + 1);
  const xpProgress = xpForNext > xpForCurrent ? ((totalXp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100 : 100;
  const displayName = profile?.name || user?.email?.split("@")[0] || "Learner";

  // Recent activity — merge lesson completions + problem solves, sort by date
  const recentLessonActivity = userProgress
    .filter((p) => p.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
    .slice(0, 5)
    .map((p) => {
      const lesson = typedLessons.find((l) => l.id === p.lesson_id);
      const course = lesson ? typedCourses.find((c) => c.id === lesson.course_id) : null;
      return {
        id: p.id,
        type: "lesson" as const,
        title: lesson?.title ?? "Unknown lesson",
        subtitle: course?.title ?? "",
        href: lesson ? `/courses/${lesson.course_id}/${lesson.id}` : "#",
        date: p.completed_at!,
      };
    });

  const recentXpActivity = xpEvents.slice(0, 5).map((e) => ({
    id: e.id,
    type: "xp" as const,
    title: `+${e.xp_amount} XP`,
    subtitle: e.event_type === "problem_solve" ? "Problem solved" : e.event_type === "lesson_complete" ? "Lesson completed" : e.event_type,
    href: "#",
    date: e.created_at,
  }));

  const recentActivity = [...recentLessonActivity, ...recentXpActivity]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20">
      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-6xl">
        {/* Welcome Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-emerald-600 mb-1">Welcome back</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                {displayName}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {currentStreak > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full">
                  <svg className="h-4 w-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                  <span className="text-sm font-bold text-orange-700">{currentStreak} day streak</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Level + XP Card */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg shadow-emerald-500/30">
                  {level}
                </div>
                <div>
                  <p className="text-sm text-slate-400">Level {level}</p>
                  <p className="text-xl sm:text-2xl font-bold">{totalXp.toLocaleString()} XP</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
                <div>
                  <p className="text-2xl font-bold text-emerald-400">{totalLessonsCompleted}</p>
                  <p className="text-xs text-slate-400">Lessons</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">{problemsSolved}</p>
                  <p className="text-xs text-slate-400">Problems</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">{coursesCompleted}</p>
                  <p className="text-xs text-slate-400">Courses</p>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>{totalXp - xpForCurrent} / {xpForNext - xpForCurrent} XP to Level {level + 1}</span>
                <span>{Math.round(xpProgress)}%</span>
              </div>
              <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(xpProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content — Enrolled Courses */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">My Courses</h2>
              <Link href="/courses" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                Browse all →
              </Link>
            </div>

            {enrolledCourses.length > 0 ? (
              <div className="space-y-4">
                {enrolledCourses.map(({ course, totalLessons, completedLessons, nextLessonId }) => {
                  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                  const isComplete = pct === 100;

                  return (
                    <div
                      key={course.id}
                      className="group bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Course icon */}
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                          isComplete
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {isComplete ? (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          )}
                        </div>

                        {/* Course info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 truncate">{course.title}</h3>
                            {isComplete && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full shrink-0">
                                Complete
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span>{completedLessons}/{totalLessons} lessons</span>
                            <span className="text-slate-300">·</span>
                            <span className="font-medium text-emerald-600">{pct}%</span>
                          </div>
                          <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isComplete
                                  ? "bg-emerald-500"
                                  : "bg-gradient-to-r from-emerald-400 to-emerald-500"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {/* Action */}
                        <div className="shrink-0">
                          {nextLessonId ? (
                            <Link href={`/courses/${course.id}/${nextLessonId}`}>
                              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-5 shadow-sm">
                                Continue
                                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/courses/${course.id}`}>
                              <Button size="sm" variant="outline" className="rounded-xl px-5 border-slate-200 text-slate-600">
                                Review
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <svg className="h-7 w-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No courses started yet</h3>
                <p className="text-sm text-slate-500 mb-5">
                  Explore our courses and start your coding journey
                </p>
                <Link href="/courses">
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6">
                    Browse Courses
                  </Button>
                </Link>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/problems"
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition-all group"
              >
                <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Practice Problems</p>
                  <p className="text-xs text-slate-500">1000+ challenges</p>
                </div>
              </Link>
              <Link
                href="/docs"
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition-all group"
              >
                <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Documentation</p>
                  <p className="text-xs text-slate-500">600+ doc pages</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Sidebar — Recent Activity */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>

            {recentActivity.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
                {recentActivity.map((item) => (
                  <div key={item.id} className="p-4 flex items-start gap-3">
                    <div className={`mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.type === "lesson"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}>
                      {item.type === "lesson" ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                      <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{timeAgo(item.date)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                <p className="text-sm text-slate-500">No activity yet. Start a course to see your progress here!</p>
              </div>
            )}

            {/* XP Breakdown */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">How to Earn XP</h2>
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                {[
                  { label: "Easy problem", xp: 10, color: "bg-green-100 text-green-700" },
                  { label: "Medium problem", xp: 25, color: "bg-amber-100 text-amber-700" },
                  { label: "Hard problem", xp: 50, color: "bg-red-100 text-red-700" },
                  { label: "Complete lesson", xp: 15, color: "bg-blue-100 text-blue-700" },
                  { label: "Daily streak", xp: 5, color: "bg-orange-100 text-orange-700" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{item.label}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.color}`}>
                      +{item.xp} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
