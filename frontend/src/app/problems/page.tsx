import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProblemCard } from "@/components/problem-card";
import type { Problem, Difficulty } from "@/lib/supabase/types";

export const metadata = {
  title: "Problems | CodeGraph",
  description: "Practice coding problems like LeetCode",
};

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: Promise<{ difficulty?: string; tag?: string }>;
}) {
  const { difficulty, tag } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("problems").select("*").order("created_at", { ascending: true });

  if (difficulty && ["easy", "medium", "hard"].includes(difficulty)) {
    query = query.eq("difficulty", difficulty);
  }
  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const { data: problems } = await query;
  const typedProblems = (problems ?? []) as Problem[];

  const allTags = [...new Set(typedProblems.flatMap((p) => p.tags))].sort();

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

  const solvedCount = [...solvedMap.values()].filter((v) => v.solved).length;
  const easyCount = typedProblems.filter((p) => p.difficulty === "easy").length;
  const mediumCount = typedProblems.filter((p) => p.difficulty === "medium").length;
  const hardCount = typedProblems.filter((p) => p.difficulty === "hard").length;

  const difficulties: { value: Difficulty | "all"; label: string; count: number; color: string }[] = [
    { value: "all", label: "All", count: typedProblems.length, color: "bg-slate-100 text-slate-700" },
    { value: "easy", label: "Easy", count: easyCount, color: "bg-emerald-100 text-emerald-700" },
    { value: "medium", label: "Medium", count: mediumCount, color: "bg-amber-100 text-amber-700" },
    { value: "hard", label: "Hard", count: hardCount, color: "bg-red-100 text-red-700" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h1 className="font-heading text-4xl font-bold tracking-tight">
              <span className="text-gradient">Problems</span>
            </h1>
            <p className="mt-2 text-muted-foreground text-lg">
              Sharpen your skills with coding challenges
            </p>
          </div>

          {user && (
            <div className="glass-card rounded-xl px-5 py-3 flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-heading font-bold text-emerald-600">{solvedCount}</p>
                <p className="text-xs text-muted-foreground">Solved</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                <p className="text-2xl font-heading font-bold">{typedProblems.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-6 mb-8">
          <div className="flex items-center gap-2">
            {difficulties.map((d) => (
              <Link
                key={d.value}
                href={d.value === "all" ? "/problems" : `/problems?difficulty=${d.value}${tag ? `&tag=${tag}` : ""}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  (d.value === "all" && !difficulty) || difficulty === d.value
                    ? `${d.color} ring-2 ring-offset-1 ring-slate-300`
                    : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                {d.label}
                <span className="opacity-60">{d.count}</span>
              </Link>
            ))}
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((t) => (
                <Link
                  key={t}
                  href={tag === t ? `/problems${difficulty ? `?difficulty=${difficulty}` : ""}` : `/problems?tag=${t}${difficulty ? `&difficulty=${difficulty}` : ""}`}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    tag === t
                      ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300"
                      : "bg-white text-slate-400 hover:text-slate-600 border border-slate-200"
                  }`}
                >
                  {t}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Problem list */}
        <div className="space-y-3">
          {typedProblems.map((problem) => {
            const status = solvedMap.get(problem.id);
            return (
              <ProblemCard
                key={problem.id}
                id={problem.id}
                title={problem.title}
                difficulty={problem.difficulty}
                tags={problem.tags}
                solved={status?.solved ?? false}
                attemptCount={status?.attempts ?? 0}
              />
            );
          })}
        </div>

        {typedProblems.length === 0 && (
          <div className="glass-card rounded-2xl p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2">No problems yet</h3>
            <p className="text-muted-foreground">Check back soon for coding challenges!</p>
          </div>
        )}
      </div>
    </div>
  );
}
