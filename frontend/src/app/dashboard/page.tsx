import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import type { Course, Lesson, UserProgress } from "@/lib/supabase/types";
import { InventoryBag } from "./inventory-bag";
import { StreakHeatmap } from "./streak-heatmap";
import { xpForLevel } from "@/lib/xp";

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

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [coursesResult, lessonsResult, progressResult, submissionsResult, profileResult, xpEventsResult, freezesResult, loginEventsResult, dailyChallengeResult, docReadsResult] =
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
        ? supabase.from("profiles").select("name, total_xp, level, streak_freezes, streak_recovers").eq("id", user.id).single()
        : Promise.resolve({ data: null }),
      user
        ? supabase
            .from("xp_events")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10)
        : Promise.resolve({ data: null }),
      user
        ? supabase.from("streak_freezes").select("frozen_date, item_type").eq("user_id", user.id)
        : Promise.resolve({ data: null }),
      user
        ? supabase
            .from("xp_events")
            .select("created_at")
            .eq("user_id", user.id)
            .eq("event_type", "daily_login")
        : Promise.resolve({ data: null }),
      supabase.from("problems").select("id, title, difficulty, tags").limit(200),
      user
        ? supabase
            .from("xp_events")
            .select("created_at")
            .eq("user_id", user.id)
            .eq("event_type", "doc_read")
        : Promise.resolve({ data: null }),
    ]);

  const typedCourses = (coursesResult.data ?? []) as Course[];
  const typedLessons = (lessonsResult.data ?? []) as Lesson[];
  const userProgress = (progressResult.data ?? []) as UserProgress[];
  const submissions = (submissionsResult.data ?? []) as { problem_id: string; created_at: string }[];
  const profile = profileResult.data as { name: string | null; total_xp: number; level: number; streak_freezes: number; streak_recovers: number } | null;
  const streakFreezeRows = (freezesResult.data ?? []) as { frozen_date: string; item_type: string }[];
  const frozenDates = streakFreezeRows.filter((f) => f.item_type === "freeze").map((f) => f.frozen_date);
  const recoveredDates = streakFreezeRows.filter((f) => f.item_type === "recover").map((f) => f.frozen_date);
  const allProtectedDates = streakFreezeRows.map((f) => f.frozen_date);
  const freezeCount = profile?.streak_freezes ?? 0;
  const recoverCount = profile?.streak_recovers ?? 0;
  const loginDates = (loginEventsResult.data ?? []) as { created_at: string }[];
  const docReadDates = (docReadsResult.data ?? []) as { created_at: string }[];
  const xpEvents = (xpEventsResult.data ?? []) as {
    id: string;
    event_type: string;
    xp_amount: number;
    metadata: Record<string, string> | null;
    created_at: string;
  }[];

  const problemsSolved = new Set(submissions.map((s) => s.problem_id)).size;
  const completedLessonIds = new Set(userProgress.map((p) => p.lesson_id));

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

  // Streak calculation
  function calculateStreak(progress: UserProgress[], protectedDates: string[]): number {
    const completedDates = progress
      .filter((p) => p.completed_at)
      .map((p) => {
        const d = new Date(p.completed_at!);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      });
    const submissionDates = submissions.map((s) => {
      const d = new Date(s.created_at);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    });
    const dailyLoginDates = loginDates.map((e) => {
      const d = new Date(e.created_at);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    });
    const allActiveDates = new Set([...completedDates, ...submissionDates, ...dailyLoginDates]);
    const protectedSet = new Set(protectedDates);
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = fmt(d);
      if (allActiveDates.has(dateStr) || protectedSet.has(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }

  const currentStreak = calculateStreak(userProgress, allProtectedDates);
  const totalLessonsCompleted = userProgress.length;
  const totalXp = profile?.total_xp ?? 0;
  const level = profile?.level ?? 1;
  const xpForCurrent = xpForLevel(level);
  const xpForNext = xpForLevel(level + 1);
  const xpProgress = xpForNext > xpForCurrent ? ((totalXp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100 : 100;
  const displayName = profile?.name || user?.email?.split("@")[0] || "Learner";

  // Gather all active date strings for the heatmap
  const allActivityDates = [
    ...userProgress.filter((p) => p.completed_at).map((p) => p.completed_at!),
    ...submissions.map((s) => s.created_at),
    ...loginDates.map((e) => e.created_at),
    ...docReadDates.map((e) => e.created_at),
  ].map((ts) => {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  const lastInProgressCourse = enrolledCourses.find((c) => c.completedLessons < c.totalLessons && c.nextLessonId);
  const lastProblemSubmission = submissions.length > 0
    ? submissions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null;

  // Daily Challenge
  const allChallengeProblems = (dailyChallengeResult.data ?? []) as { id: string; title: string; difficulty: string; tags: string[] }[];
  const solvedIds = new Set(submissions.map((s) => s.problem_id));
  const unsolvedProblems = allChallengeProblems.filter((p) => !solvedIds.has(p.id));
  const challengePool = unsolvedProblems.length > 0 ? unsolvedProblems : allChallengeProblems;
  const today = new Date();
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const dailyChallenge = challengePool.length > 0 ? challengePool[dateSeed % challengePool.length] : null;

  const EVENT_LABELS: Record<string, string> = {
    problem_solve: "Problem Solved",
    lesson_complete: "Lesson Complete",
    daily_streak: "Daily Streak",
    daily_login: "Daily Login",
    doc_read: "Doc Read",
  };

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
    subtitle: EVENT_LABELS[e.event_type] || e.event_type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
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

  // Suggested courses (not yet started)
  const suggestedCourses = allCoursesWithProgress
    .filter((c) => c.completedLessons === 0 && c.totalLessons > 0)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-16 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.15),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(59,130,246,0.08),transparent)]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgb(148 163 184) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-6xl relative">
        {/* Hero Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-emerald-400 mb-1 tracking-wide">Welcome back</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {displayName}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {currentStreak > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl backdrop-blur-sm">
                  <svg className="h-5 w-5 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                  <span className="text-sm font-bold text-orange-300">{currentStreak} day streak</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {/* Level Card */}
          <div className="col-span-2 sm:col-span-1 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/20 p-5 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-colors" />
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-emerald-500/30 mb-3">
                {level}
              </div>
              <p className="text-2xl font-bold text-white">{totalXp.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-0.5">Total XP</p>
              <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(xpProgress, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{Math.round(xpProgress)}% to Level {level + 1}</p>
            </div>
          </div>

          {/* Problems Solved */}
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-5 backdrop-blur-sm hover:border-blue-500/30 transition-colors group">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
              <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-white">{problemsSolved}</p>
            <p className="text-xs text-slate-400 mt-0.5">Problems Solved</p>
          </div>

          {/* Lessons Completed */}
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-5 backdrop-blur-sm hover:border-purple-500/30 transition-colors group">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3 group-hover:bg-purple-500/20 transition-colors">
              <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-white">{totalLessonsCompleted}</p>
            <p className="text-xs text-slate-400 mt-0.5">Lessons Done</p>
          </div>

          {/* Courses */}
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-5 backdrop-blur-sm hover:border-amber-500/30 transition-colors group">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3 group-hover:bg-amber-500/20 transition-colors">
              <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-white">{coursesCompleted}</p>
            <p className="text-xs text-slate-400 mt-0.5">Courses Done</p>
          </div>
        </div>

        {/* Activity Heatmap + Daily Challenge Row */}
        <div className="grid lg:grid-cols-5 gap-4 mb-8">
          {/* Heatmap */}
          <div className="lg:col-span-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 p-5 sm:p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-300">Activity</h2>
              <span className="text-xs text-slate-500">Last 12 weeks</span>
            </div>
            <StreakHeatmap
              activeDates={allActivityDates}
              frozenDates={frozenDates}
              recoveredDates={recoveredDates}
            />
          </div>

          {/* Daily Challenge + Quick Actions */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Daily Challenge */}
            {dailyChallenge && (
              <Link
                href={`/problems/${dailyChallenge.id}`}
                className="flex-1 block rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 p-5 hover:border-amber-500/40 transition-all group relative overflow-hidden"
              >
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Daily Challenge</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      dailyChallenge.difficulty === "easy" ? "bg-emerald-500/20 text-emerald-400" :
                      dailyChallenge.difficulty === "medium" ? "bg-amber-500/20 text-amber-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>{dailyChallenge.difficulty}</span>
                  </div>
                  <p className="text-sm font-semibold text-white truncate group-hover:text-amber-200 transition-colors">
                    {dailyChallenge.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {dailyChallenge.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                </div>
              </Link>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/problems"
                className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 hover:border-blue-500/30 transition-all group"
              >
                <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2 group-hover:bg-blue-500/20 transition-colors">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-white">Problems</p>
                <p className="text-[10px] text-slate-500">1000+ challenges</p>
              </Link>
              <Link
                href="/docs"
                className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 hover:border-purple-500/30 transition-all group"
              >
                <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2 group-hover:bg-purple-500/20 transition-colors">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-white">Docs</p>
                <p className="text-[10px] text-slate-500">600+ pages</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Continue where you left off */}
        {user && (lastInProgressCourse || lastProblemSubmission) && (
          <div className="mb-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 p-5 sm:p-6 backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Continue where you left off</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {lastInProgressCourse && (
                <Link
                  href={`/courses/${lastInProgressCourse.course.id}/${lastInProgressCourse.nextLessonId}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all group"
                >
                  <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-emerald-300">{lastInProgressCourse.course.title}</p>
                    <p className="text-xs text-slate-500">{lastInProgressCourse.completedLessons}/{lastInProgressCourse.totalLessons} lessons</p>
                  </div>
                  <svg className="h-5 w-5 text-slate-600 group-hover:text-emerald-400 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
              {lastProblemSubmission && (
                <Link
                  href={`/problems/${lastProblemSubmission.problem_id}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all group"
                >
                  <div className="h-11 w-11 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-blue-300">Last Problem</p>
                    <p className="text-xs text-slate-500">Pick up where you left off</p>
                  </div>
                  <svg className="h-5 w-5 text-slate-600 group-hover:text-blue-400 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Main Grid: Courses + Sidebar */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Courses */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">My Courses</h2>
              <Link href="/courses" className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                Browse all &rarr;
              </Link>
            </div>

            {enrolledCourses.length > 0 ? (
              <div className="space-y-3">
                {enrolledCourses.map(({ course, totalLessons, completedLessons, nextLessonId }) => {
                  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                  const isComplete = pct === 100;

                  return (
                    <div
                      key={course.id}
                      className="group rounded-2xl bg-slate-800/50 border border-slate-700/50 p-5 hover:border-slate-600 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                          isComplete
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-slate-700/50 text-slate-400"
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

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white truncate">{course.title}</h3>
                            {isComplete && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full shrink-0">
                                Complete
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span>{completedLessons}/{totalLessons} lessons</span>
                            <span className="text-slate-700">&middot;</span>
                            <span className="font-medium text-emerald-400">{pct}%</span>
                          </div>
                          <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isComplete ? "bg-emerald-500" : "bg-gradient-to-r from-emerald-400 to-emerald-500"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        <div className="shrink-0">
                          {nextLessonId ? (
                            <Link href={`/courses/${course.id}/${nextLessonId}`}>
                              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl px-5 shadow-lg shadow-emerald-500/20">
                                Continue
                                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/courses/${course.id}`}>
                              <Button size="sm" variant="outline" className="rounded-xl px-5 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
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
              <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center bg-slate-800/30">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <svg className="h-7 w-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">No courses started yet</h3>
                <p className="text-sm text-slate-500 mb-5">
                  Explore our courses and start your coding journey
                </p>
                <Link href="/courses">
                  <Button className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl px-6 shadow-lg shadow-emerald-500/20">
                    Browse Courses
                  </Button>
                </Link>
              </div>
            )}

            {/* Suggested Courses */}
            {suggestedCourses.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-5 w-5 rounded bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-semibold text-slate-300">Recommended for You</h2>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {suggestedCourses.map(({ course, totalLessons }) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 hover:border-violet-500/30 transition-all group"
                    >
                      <h3 className="text-sm font-semibold text-white truncate group-hover:text-violet-300 transition-colors mb-1">{course.title}</h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">{course.description || "Start learning today"}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {totalLessons} lessons
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Inventory Bag */}
            {user && (freezeCount > 0 || recoverCount > 0) && (
              <InventoryBag
                freezeCount={freezeCount}
                recoverCount={recoverCount}
                activeTimestamps={[
                  ...submissions.map((s) => s.created_at),
                  ...userProgress.filter((p) => p.completed_at).map((p) => p.completed_at!),
                ]}
                frozenDates={frozenDates}
                recoveredDates={recoveredDates}
              />
            )}

            {/* Recent Activity */}
            <div>
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Recent Activity</h2>

              {recentActivity.length > 0 ? (
                <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 divide-y divide-slate-700/50 overflow-hidden">
                  {recentActivity.map((item) => (
                    <div key={item.id} className="p-4 flex items-start gap-3 hover:bg-slate-700/20 transition-colors">
                      <div className={`mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        item.type === "lesson"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
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
                        <p className="text-sm font-medium text-white truncate">{item.title}</p>
                        <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                      </div>
                      <span className="text-[10px] text-slate-600 shrink-0">{timeAgo(item.date)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 text-center">
                  <p className="text-sm text-slate-500">No activity yet. Start a course to track progress!</p>
                </div>
              )}
            </div>

            {/* How to Earn XP */}
            <div>
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Earn XP</h2>
              <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-4 space-y-2.5">
                {[
                  { label: "Easy problem", xp: 10, color: "text-emerald-400 bg-emerald-500/10" },
                  { label: "Medium problem", xp: 25, color: "text-amber-400 bg-amber-500/10" },
                  { label: "Hard problem", xp: 50, color: "text-red-400 bg-red-500/10" },
                  { label: "Complete lesson", xp: 15, color: "text-blue-400 bg-blue-500/10" },
                  { label: "Read docs page", xp: 5, color: "text-purple-400 bg-purple-500/10" },
                  { label: "Daily login", xp: 5, color: "text-orange-400 bg-orange-500/10" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">{item.label}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.color}`}>
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
