import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StreakCalendar } from "../problems/streak-calendar";

export const metadata = {
  title: "Profile | CodeGraph",
  description: "Your CodeGraph profile and stats",
};

function xpForLevel(level: number): number {
  return level * (level - 1) * 50;
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/profile");

  const [profileRes, submissionsRes, progressRes, xpRes, coursesRes, lessonsRes] = await Promise.all([
    supabase.from("profiles").select("name, avatar_url, total_xp, level, created_at").eq("id", user.id).single(),
    supabase.from("problem_submissions").select("problem_id, passed, language, created_at").eq("user_id", user.id),
    supabase.from("user_progress").select("lesson_id, completed, completed_at").eq("user_id", user.id).eq("completed", true),
    supabase.from("xp_events").select("event_type, xp_amount, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("courses").select("id, title"),
    supabase.from("lessons").select("id, course_id"),
  ]);

  const profile = profileRes.data;
  const submissions = submissionsRes.data ?? [];
  const progress = progressRes.data ?? [];
  const xpEvents = xpRes.data ?? [];
  const courses = coursesRes.data ?? [];
  const lessons = lessonsRes.data ?? [];

  // Stats
  const solvedSet = new Set<string>();
  const langCounts = new Map<string, number>();
  for (const sub of submissions) {
    if (sub.passed) {
      solvedSet.add(sub.problem_id);
      langCounts.set(sub.language, (langCounts.get(sub.language) || 0) + 1);
    }
  }
  const totalSolved = solvedSet.size;
  const favoriteLang = [...langCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const lessonsCompleted = progress.length;

  // Course completion
  const lessonsByCourse = new Map<string, number>();
  for (const l of lessons) {
    lessonsByCourse.set(l.course_id, (lessonsByCourse.get(l.course_id) || 0) + 1);
  }
  const completedLessonIds = new Set(progress.map((p) => p.lesson_id));
  let coursesCompleted = 0;
  for (const course of courses) {
    const total = lessonsByCourse.get(course.id) || 0;
    if (total === 0) continue;
    const done = lessons.filter((l) => l.course_id === course.id && completedLessonIds.has(l.id)).length;
    if (done >= total) coursesCompleted++;
  }

  // Streak timestamps (submissions + lesson completions)
  const allTimestamps = [
    ...submissions.map((s) => s.created_at),
    ...progress.filter((p) => p.completed_at).map((p) => p.completed_at!),
  ];

  // XP
  const level = profile?.level ?? 1;
  const totalXp = profile?.total_xp ?? 0;
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1) - xpForLevel(level);
  const progressXp = totalXp - currentLevelXp;
  const progressPct = nextLevelXp > 0 ? Math.min((progressXp / nextLevelXp) * 100, 100) : 100;

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  const EVENT_LABELS: Record<string, string> = {
    problem_solve: "Problem Solved",
    lesson_complete: "Lesson Complete",
    daily_streak: "Daily Streak",
    daily_login: "Daily Login",
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">

        {/* Profile Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {(profile?.name || user.email || "U")[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {profile?.name || user.email?.split("@")[0]}
              </h1>
              <p className="text-slate-400 text-sm">Member since {memberSince}</p>
            </div>
            <div className="ml-auto hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-emerald-400">{level}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Level {level}</p>
                  <p className="text-xs text-slate-400">{totalXp.toLocaleString()} XP</p>
                </div>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>{progressXp} / {nextLevelXp} XP to Level {level + 1}</span>
              <span>{Math.round(progressPct)}%</span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Problems Solved", value: totalSolved, color: "text-emerald-600" },
            { label: "Lessons Done", value: lessonsCompleted, color: "text-blue-600" },
            { label: "Courses Completed", value: coursesCompleted, color: "text-purple-600" },
            { label: "Favorite Language", value: favoriteLang.charAt(0).toUpperCase() + favoriteLang.slice(1), color: "text-amber-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Activity Calendar */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Activity Calendar</h2>
            <StreakCalendar rawTimestamps={allTimestamps} />
          </div>

          {/* Recent XP */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Recent XP</h2>
            {xpEvents.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                Start solving problems to earn XP!
              </p>
            ) : (
              <div className="space-y-3">
                {xpEvents.map((event, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <div>
                        <p className="text-sm text-slate-700">
                          {EVENT_LABELS[event.event_type] || event.event_type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(event.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">+{event.xp_amount} XP</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Language Breakdown */}
          {langCounts.size > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Languages Used</h2>
              <div className="space-y-3">
                {[...langCounts.entries()]
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([lang, count]) => {
                    const pct = totalSolved > 0 ? (count / totalSolved) * 100 : 0;
                    return (
                      <div key={lang}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-700 font-medium capitalize">{lang}</span>
                          <span className="text-slate-500">{count} solved</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href="/problems"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
              >
                <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <svg className="h-4.5 w-4.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Solve Problems</p>
                  <p className="text-[11px] text-slate-400">Practice coding challenges</p>
                </div>
              </Link>
              <Link
                href="/courses"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
              >
                <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg className="h-4.5 w-4.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Browse Courses</p>
                  <p className="text-[11px] text-slate-400">Learn with guided lessons</p>
                </div>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
              >
                <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center">
                  <svg className="h-4.5 w-4.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Dashboard</p>
                  <p className="text-[11px] text-slate-400">View your learning progress</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
