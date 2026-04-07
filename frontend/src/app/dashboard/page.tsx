import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import type { Course, Lesson, UserProgress } from "@/lib/supabase/types";
import { InventoryBag } from "./inventory-bag";
import { StreakHeatmap } from "./streak-heatmap";
import { xpForLevel } from "@/lib/xp";
import { EVENT_LABELS, XP_REWARDS } from "@/lib/constants";
import { AnimatedStatGrid } from "@/components/animated-stats";
import { LevelProgressRing } from "@/components/level-progress-ring";
import { DashboardStagger, DashboardSection } from "@/components/dashboard-sections";

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

  // All active date strings for heatmap
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

  const suggestedCourses = allCoursesWithProgress
    .filter((c) => c.completedLessons === 0 && c.totalLessons > 0)
    .slice(0, 3);

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
                <LevelProgressRing level={level} progress={xpProgress} />
                <div>
                  <p className="text-sm text-slate-400">Level {level}</p>
                  <p className="text-xl sm:text-2xl font-bold">{totalXp.toLocaleString()} XP</p>
                </div>
              </div>
              <AnimatedStatGrid
                lessons={totalLessonsCompleted}
                problems={problemsSolved}
                courses={coursesCompleted}
              />
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

        <DashboardStagger>
        <DashboardSection>
        {/* Activity Heatmap — GitHub style */}
        <div className="mb-8 rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Activity</h2>
            <span className="text-xs text-slate-400">Last 52 weeks</span>
          </div>
          <StreakHeatmap
            activeDates={allActivityDates}
            frozenDates={frozenDates}
            recoveredDates={recoveredDates}
          />
        </div>

        </DashboardSection>

        <DashboardSection>
        {/* Continue where you left off + Daily Challenge row */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {/* Continue */}
          {user && lastInProgressCourse && (
            <Link
              href={`/courses/${lastInProgressCourse.course.id}/${lastInProgressCourse.nextLessonId}`}
              className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group"
            >
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-emerald-600 mb-0.5">Continue Learning</p>
                <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-emerald-700">{lastInProgressCourse.course.title}</p>
                <p className="text-xs text-slate-500">{lastInProgressCourse.completedLessons}/{lastInProgressCourse.totalLessons} lessons</p>
              </div>
              <svg className="h-5 w-5 text-slate-300 group-hover:text-emerald-500 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}

          {/* Daily Challenge */}
          {dailyChallenge && (
            <Link
              href={`/problems/${dailyChallenge.id}`}
              className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-200 transition-all group"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-sm">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Daily Challenge</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    dailyChallenge.difficulty === "easy" ? "bg-emerald-100 text-emerald-700" :
                    dailyChallenge.difficulty === "medium" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>{dailyChallenge.difficulty}</span>
                </div>
                <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-amber-700">{dailyChallenge.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {dailyChallenge.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] text-slate-400">{tag}</span>
                  ))}
                </div>
              </div>
              <svg className="h-5 w-5 text-slate-300 group-hover:text-amber-500 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}

          {/* Last problem (show if no continue course to fill 2nd slot) */}
          {user && !lastInProgressCourse && lastProblemSubmission && (
            <Link
              href={`/problems/${lastProblemSubmission.problem_id}`}
              className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-blue-600 mb-0.5">Continue Solving</p>
                <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">Last Problem Attempted</p>
                <p className="text-xs text-slate-500">Pick up where you left off</p>
              </div>
              <svg className="h-5 w-5 text-slate-300 group-hover:text-blue-500 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        </DashboardSection>

        <DashboardSection>
        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Link
            href="/courses"
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-200 transition-all group text-center"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-slate-700">Courses</p>
          </Link>
          <Link
            href="/problems"
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-blue-200 transition-all group text-center"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-slate-700">Problems</p>
          </Link>
          <Link
            href="/docs"
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-purple-200 transition-all group text-center"
          >
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-slate-700">Docs</p>
          </Link>
          <Link
            href="/playground"
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-amber-200 transition-all group text-center"
          >
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-slate-700">Playground</p>
          </Link>
        </div>

        </DashboardSection>

        <DashboardSection>
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content — Enrolled Courses */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">My Courses</h2>
              <Link href="/courses" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                Browse all &rarr;
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
                            <span className="text-slate-300">&middot;</span>
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

            {/* Suggested Courses */}
            {suggestedCourses.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Recommended for You</h2>
                <div className="grid sm:grid-cols-3 gap-3">
                  {suggestedCourses.map(({ course, totalLessons }) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="rounded-xl bg-white border border-slate-200 p-4 hover:shadow-md hover:border-emerald-200 transition-all group"
                    >
                      <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-emerald-700 transition-colors mb-1">{course.title}</h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{course.description || "Start learning today"}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
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
                {XP_REWARDS.map((item) => (
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
        </DashboardSection>
        </DashboardStagger>
      </div>
    </div>
  );
}
