import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Problem, Difficulty } from "@/lib/supabase/types";

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

  // Fetch all problems for tag counting, then filter
  const { data: allProblems } = await supabase
    .from("problems")
    .select("*")
    .order("created_at", { ascending: true });

  const allTyped = (allProblems ?? []) as Problem[];

  // Collect all tags with counts (from unfiltered set)
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
  if (search) {
    const lower = search.toLowerCase();
    filtered = filtered.filter((p) => p.title.toLowerCase().includes(lower));
  }

  // User submissions
  const { data: { user } } = await supabase.auth.getUser();
  const solvedMap = new Map<string, { solved: boolean; attempts: number }>();

  if (user) {
    const { data: submissions } = await supabase
      .from("problem_submissions")
      .select("problem_id, passed")
      .eq("user_id", user.id);

    for (const sub of submissions ?? []) {
      const s = sub as { problem_id: string; passed: boolean };
      const existing = solvedMap.get(s.problem_id) ?? { solved: false, attempts: 0 };
      existing.attempts++;
      if (s.passed) existing.solved = true;
      solvedMap.set(s.problem_id, existing);
    }
  }

  const totalCount = allTyped.length;
  const easyCount = allTyped.filter((p) => p.difficulty === "easy").length;
  const mediumCount = allTyped.filter((p) => p.difficulty === "medium").length;
  const hardCount = allTyped.filter((p) => p.difficulty === "hard").length;
  const solvedCount = [...solvedMap.values()].filter((v) => v.solved).length;

  const difficultyColor: Record<string, string> = {
    easy: "text-emerald-500",
    medium: "text-amber-500",
    hard: "text-red-500",
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">

        {/* Topic Tags */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
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
                    ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300"
                }`}
              >
                {t}
                <span className="text-[10px] opacity-50">{count}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Difficulty Tabs + Search + Stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            {([
              { value: "all", label: "All Topics", count: totalCount },
              { value: "easy", label: "Easy", count: easyCount },
              { value: "medium", label: "Medium", count: mediumCount },
              { value: "hard", label: "Hard", count: hardCount },
            ] as const).map((d) => (
              <Link
                key={d.value}
                href={
                  d.value === "all"
                    ? `/problems${tag ? `?tag=${tag}` : ""}${search ? `${tag ? "&" : "?"}search=${search}` : ""}`
                    : `/problems?difficulty=${d.value}${tag ? `&tag=${tag}` : ""}${search ? `&search=${search}` : ""}`
                }
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  (d.value === "all" && !difficulty) || difficulty === d.value
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                {d.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-slate-400">
                <span className="text-emerald-400 font-semibold">{solvedCount}</span>
                <span className="text-slate-500">/{totalCount} solved</span>
              </span>
            )}
            <form action="/problems" method="GET" className="relative">
              {difficulty && <input type="hidden" name="difficulty" value={difficulty} />}
              {tag && <input type="hidden" name="tag" value={tag} />}
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                name="search"
                defaultValue={search || ""}
                placeholder="Search questions..."
                className="w-56 pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
              />
            </form>
          </div>
        </div>

        {/* Problem Table */}
        <div className="bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[40px_1fr_100px_90px] sm:grid-cols-[40px_1fr_140px_100px_90px] px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-white/5">
            <div></div>
            <div>Title</div>
            <div className="hidden sm:block">Tags</div>
            <div className="text-center">Difficulty</div>
            <div className="text-center">Status</div>
          </div>

          {/* Problem Rows */}
          {filtered.map((problem, index) => {
            const status = solvedMap.get(problem.id);
            const isSolved = status?.solved ?? false;
            const hasAttempted = (status?.attempts ?? 0) > 0;
            const rowNum = index + 1;

            return (
              <Link
                key={problem.id}
                href={`/problems/${problem.id}`}
                className={`grid grid-cols-[40px_1fr_100px_90px] sm:grid-cols-[40px_1fr_140px_100px_90px] px-4 py-3.5 items-center transition-colors hover:bg-white/[0.04] border-b border-white/[0.03] last:border-0 group ${
                  index % 2 === 0 ? "" : "bg-white/[0.015]"
                }`}
              >
                {/* Number */}
                <div className="text-sm text-slate-500 font-mono">{rowNum}.</div>

                {/* Title */}
                <div className="min-w-0 pr-4">
                  <span className="text-sm font-medium text-slate-200 group-hover:text-emerald-400 transition-colors truncate block">
                    {problem.title}
                  </span>
                </div>

                {/* Tags (hidden on mobile) */}
                <div className="hidden sm:flex items-center gap-1 overflow-hidden">
                  {problem.tags.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/5 text-slate-500 truncate"
                    >
                      {t}
                    </span>
                  ))}
                  {problem.tags.length > 2 && (
                    <span className="text-[10px] text-slate-600">+{problem.tags.length - 2}</span>
                  )}
                </div>

                {/* Difficulty */}
                <div className={`text-center text-sm font-medium ${difficultyColor[problem.difficulty]}`}>
                  {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                </div>

                {/* Status */}
                <div className="flex justify-center">
                  {isSolved ? (
                    <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : hasAttempted ? (
                    <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <span className="h-5 w-5 rounded-full border border-white/10" />
                  )}
                </div>
              </Link>
            );
          })}

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="px-4 py-16 text-center">
              <svg className="h-12 w-12 mx-auto mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-300 mb-1">No problems found</h3>
              <p className="text-sm text-slate-500">
                {search ? `No results for "${search}". Try a different search.` : "Check back soon for coding challenges!"}
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filtered.length} of {totalCount} problems</span>
          {(difficulty || tag || search) && (
            <Link
              href="/problems"
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Clear all filters
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
