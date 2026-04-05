import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const revalidate = 300; // cache 5 min

export const metadata = {
  title: "Leaderboard | CodeGraph",
  description: "Top coders on CodeGraph ranked by XP and problems solved",
};

function xpForLevel(level: number): number {
  return level * (level - 1) * 50;
}

export default async function LeaderboardPage() {
  const supabase = await createClient();

  // Top users by XP
  const { data: topUsers } = await supabase
    .from("profiles")
    .select("id, name, total_xp, level")
    .order("total_xp", { ascending: false })
    .limit(50);

  // Get problem solve counts for these users
  const userIds = (topUsers ?? []).map((u) => u.id);
  const { data: submissions } = userIds.length > 0
    ? await supabase
        .from("problem_submissions")
        .select("user_id, problem_id, passed")
        .in("user_id", userIds)
        .eq("passed", true)
    : { data: [] };

  // Count unique solved problems per user
  const solvedCounts = new Map<string, Set<string>>();
  for (const sub of submissions ?? []) {
    if (!solvedCounts.has(sub.user_id)) solvedCounts.set(sub.user_id, new Set());
    solvedCounts.get(sub.user_id)!.add(sub.problem_id);
  }

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const users = (topUsers ?? []).map((u, i) => ({
    rank: i + 1,
    id: u.id,
    name: u.name || "Anonymous",
    level: u.level,
    totalXp: u.total_xp,
    problemsSolved: solvedCounts.get(u.id)?.size ?? 0,
    isCurrentUser: u.id === currentUser?.id,
  }));

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Leaderboard</h1>
          <p className="mt-1 text-slate-500">Top coders ranked by XP</p>
        </div>

        {/* Top 3 Podium */}
        {users.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[users[1], users[0], users[2]].map((u, i) => {
              const podiumOrder = [2, 1, 3];
              const rank = podiumOrder[i];
              const colors = {
                1: "from-amber-400 to-amber-500",
                2: "from-slate-300 to-slate-400",
                3: "from-orange-300 to-orange-400",
              };
              const heights = { 1: "h-28", 2: "h-20", 3: "h-16" };
              const medals = { 1: "bg-amber-400", 2: "bg-slate-400", 3: "bg-orange-400" };

              return (
                <div key={u.id} className="flex flex-col items-center">
                  <div className={`h-12 w-12 rounded-full ${medals[rank as 1|2|3]} flex items-center justify-center text-white font-bold text-lg shadow-md mb-2`}>
                    {rank}
                  </div>
                  <p className={`text-sm font-semibold text-slate-800 truncate max-w-full text-center ${u.isCurrentUser ? "text-emerald-600" : ""}`}>
                    {u.name}
                  </p>
                  <p className="text-xs text-slate-500">Lvl {u.level}</p>
                  <p className="text-xs font-semibold text-emerald-600 mb-2">{u.totalXp.toLocaleString()} XP</p>
                  <div className={`w-full ${heights[rank as 1|2|3]} bg-gradient-to-t ${colors[rank as 1|2|3]} rounded-t-lg`} />
                </div>
              );
            })}
          </div>
        )}

        {/* Full Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[48px_1fr_80px_80px_80px] px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
            <div>#</div>
            <div>User</div>
            <div className="text-center">Level</div>
            <div className="text-center">Solved</div>
            <div className="text-right">XP</div>
          </div>

          {/* Rows */}
          {users.map((u) => (
            <div
              key={u.id}
              className={`grid grid-cols-[48px_1fr_80px_80px_80px] px-4 py-3 items-center border-b border-slate-50 last:border-0 transition-colors ${
                u.isCurrentUser ? "bg-emerald-50/50" : u.rank % 2 === 0 ? "bg-slate-50/40" : ""
              }`}
            >
              <span className={`text-sm font-mono ${u.rank <= 3 ? "font-bold text-amber-600" : "text-slate-400"}`}>
                {u.rank}
              </span>
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {u.name[0].toUpperCase()}
                </div>
                <span className={`text-sm font-medium truncate ${u.isCurrentUser ? "text-emerald-700" : "text-slate-800"}`}>
                  {u.name}
                  {u.isCurrentUser && <span className="text-emerald-500 text-xs ml-1.5">(you)</span>}
                </span>
              </div>
              <div className="text-center">
                <span className="inline-flex items-center justify-center h-6 w-8 rounded-md bg-slate-100 text-xs font-bold text-slate-700">
                  {u.level}
                </span>
              </div>
              <div className="text-center text-sm text-slate-600">{u.problemsSolved}</div>
              <div className="text-right text-sm font-semibold text-emerald-600">{u.totalXp.toLocaleString()}</div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="px-4 py-16 text-center">
              <p className="text-slate-500">No users yet. Be the first!</p>
            </div>
          )}
        </div>

        {/* CTA */}
        {!currentUser && (
          <div className="text-center mt-8">
            <p className="text-sm text-slate-500 mb-3">Join the leaderboard by creating an account</p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Get Started Free
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
