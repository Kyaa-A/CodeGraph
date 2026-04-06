import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AuthGate } from "@/components/auth-gate";
import type { Problem, Difficulty } from "@/lib/supabase/types";
import { StreakCalendar } from "@/components/streak-calendar";
import { ProblemList } from "./problem-list";

export const metadata = {
  title: "Problems | CodeGraph",
  description: "Practice coding problems like LeetCode",
};

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: Promise<{ difficulty?: string; tag?: string; search?: string }>;
}) {
  const { difficulty, tag, search } = await searchParams;
  const supabase = await createClient();

  const { data: allProblems } = await supabase
    .from("problems")
    .select("id, title, slug, difficulty, tags")
    .order("created_at", { ascending: true });

  const allTyped = (allProblems ?? []) as Problem[];

  // Tag counts from full set
  const tagCounts = new Map<string, number>();
  for (const p of allTyped) {
    for (const t of p.tags) {
      tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
    }
  }
  const sortedTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);

  // Apply filters
  let filtered = allTyped;
  if (difficulty && ["easy", "medium", "hard"].includes(difficulty)) {
    filtered = filtered.filter((p) => p.difficulty === difficulty);
  }
  if (tag) {
    filtered = filtered.filter((p) => p.tags.includes(tag));
  }
  // Search is now handled client-side in ProblemList for instant results

  // User submissions
  const { data: { user } } = await supabase.auth.getUser();
  const solvedMap = new Map<string, { solved: boolean; attempts: number }>();
  let submissionDates: string[] = [];
  let frozenDates: string[] = [];
  let recoveredDates: string[] = [];
  let freezeCount = 0;
  let recoverCount = 0;

  if (user) {
    const [submissionsRes, freezesRes, profileRes] = await Promise.all([
      supabase
        .from("problem_submissions")
        .select("problem_id, passed, created_at")
        .eq("user_id", user.id),
      supabase
        .from("streak_freezes")
        .select("frozen_date, item_type")
        .eq("user_id", user.id),
      supabase
        .from("profiles")
        .select("streak_freezes, streak_recovers")
        .eq("id", user.id)
        .single(),
    ]);

    const submissions = submissionsRes.data ?? [];
    const freezeRows = (freezesRes.data ?? []) as { frozen_date: string; item_type: string }[];
    frozenDates = freezeRows.filter((f) => f.item_type === "freeze").map((f) => f.frozen_date);
    recoveredDates = freezeRows.filter((f) => f.item_type === "recover").map((f) => f.frozen_date);
    freezeCount = profileRes.data?.streak_freezes ?? 0;
    recoverCount = profileRes.data?.streak_recovers ?? 0;

    for (const sub of submissions) {
      const s = sub as { problem_id: string; passed: boolean; created_at: string };
      const existing = solvedMap.get(s.problem_id) ?? { solved: false, attempts: 0 };
      existing.attempts++;
      if (s.passed) existing.solved = true;
      solvedMap.set(s.problem_id, existing);
    }

    submissionDates = submissions.map((s: { created_at: string }) => s.created_at);
  }

  const totalCount = allTyped.length;
  const easyCount = allTyped.filter((p) => p.difficulty === "easy").length;
  const mediumCount = allTyped.filter((p) => p.difficulty === "medium").length;
  const hardCount = allTyped.filter((p) => p.difficulty === "hard").length;
  const solvedCount = [...solvedMap.values()].filter((v) => v.solved).length;

  return (
    <AuthGate>
    <div className="min-h-screen bg-white pt-20 sm:pt-24 pb-12 sm:pb-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex gap-6">

          {/* ===== MAIN CONTENT ===== */}
          <div className="flex-1 min-w-0">

            {/* Topic Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {sortedTags.map(([t, count]) => (
                <Link
                  key={t}
                  href={
                    tag === t
                      ? `/problems${difficulty ? `?difficulty=${difficulty}` : ""}${search ? `${difficulty ? "&" : "?"}search=${search}` : ""}`
                      : `/problems?tag=${t}${difficulty ? `&difficulty=${difficulty}` : ""}${search ? `&search=${search}` : ""}`
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    tag === t
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  {t}
                  <span className="text-[10px] opacity-50">{count}</span>
                </Link>
              ))}
            </div>

            {/* Filter Tabs + Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto scrollbar-none">
                {([
                  { value: "all", label: "All" },
                  { value: "easy", label: "Easy" },
                  { value: "medium", label: "Medium" },
                  { value: "hard", label: "Hard" },
                ] as const).map((d) => (
                  <Link
                    key={d.value}
                    href={
                      d.value === "all"
                        ? `/problems${tag ? `?tag=${tag}` : ""}${search ? `${tag ? "&" : "?"}search=${search}` : ""}`
                        : `/problems?difficulty=${d.value}${tag ? `&tag=${tag}` : ""}${search ? `&search=${search}` : ""}`
                    }
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                      (d.value === "all" && !difficulty) || difficulty === d.value
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {d.label}
                  </Link>
                ))}
              </div>

            </div>

            {/* Problem Table with infinite scroll */}
            <ProblemList
              problems={filtered}
              solvedMap={Object.fromEntries(solvedMap)}
              initialSearch={search}
            />

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>{filtered.length} of {totalCount} problems</span>
              {(difficulty || tag || search) && (
                <Link href="/problems" className="text-emerald-600 hover:text-emerald-700 transition-colors">
                  Clear all filters
                </Link>
              )}
            </div>
          </div>

          {/* ===== RIGHT SIDEBAR ===== */}
          <div className="hidden lg:block w-[280px] shrink-0 space-y-5">

            {/* Progress Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Your Progress</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xl font-bold text-emerald-600">{user ? solvedCount : 0}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Solved</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-amber-600">{user ? [...solvedMap.values()].filter(v => !v.solved && v.attempts > 0).length : 0}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Attempting</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-800">{totalCount}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Total</div>
                </div>
              </div>

              {/* Difficulty breakdown bar */}
              {user && solvedCount > 0 && (
                <div className="mt-4 space-y-2">
                  {([
                    { label: "Easy", solved: [...solvedMap.entries()].filter(([id]) => allTyped.find(p => p.id === id)?.difficulty === "easy").filter(([,v]) => v.solved).length, total: easyCount, color: "bg-emerald-500" },
                    { label: "Medium", solved: [...solvedMap.entries()].filter(([id]) => allTyped.find(p => p.id === id)?.difficulty === "medium").filter(([,v]) => v.solved).length, total: mediumCount, color: "bg-amber-500" },
                    { label: "Hard", solved: [...solvedMap.entries()].filter(([id]) => allTyped.find(p => p.id === id)?.difficulty === "hard").filter(([,v]) => v.solved).length, total: hardCount, color: "bg-red-500" },
                  ]).map((d) => (
                    <div key={d.label}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-500">{d.label}</span>
                        <span className="text-slate-700 font-medium">{d.solved}/{d.total}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${d.color}`} style={{ width: d.total > 0 ? `${(d.solved / d.total) * 100}%` : "0%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!user && (
                <Link href="/auth/signup" className="flex items-center justify-center mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  Sign in to track progress
                  <svg className="ml-1 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>

            {/* Calendar Streak */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <StreakCalendar
                rawTimestamps={submissionDates}
                frozenDates={frozenDates}
                recoveredDates={recoveredDates}
                freezeCount={freezeCount}
                recoverCount={recoverCount}
                interactive={!!user}
              />
              {!user && (
                <p className="text-[11px] text-slate-400 text-center mt-3">Sign in to track your streak</p>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/courses" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Courses</div>
                    <div className="text-[11px] text-slate-400">Learn with tutorials</div>
                  </div>
                  <svg className="h-4 w-4 text-slate-300 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/playground" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Playground</div>
                    <div className="text-[11px] text-slate-400">Code in 13+ languages</div>
                  </div>
                  <svg className="h-4 w-4 text-slate-300 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AuthGate>
  );
}
