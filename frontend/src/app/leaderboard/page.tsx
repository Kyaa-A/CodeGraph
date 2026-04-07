import { createClient } from "@/lib/supabase/server";
import { LeaderboardTabs } from "./leaderboard-tabs";

export const revalidate = 300; // cache 5 min

export const metadata = {
  title: "Leaderboard | CodeGraph",
  description: "Top coders on CodeGraph ranked by XP and problems solved",
};

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  level: number;
  totalXp: number;
  problemsSolved: number;
  isCurrentUser: boolean;
}

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Fetch all-time top users
  const { data: topUsers } = await supabase
    .from("profiles")
    .select("id, name, total_xp, level")
    .order("total_xp", { ascending: false })
    .limit(50);

  const allUserIds = (topUsers ?? []).map((u) => u.id);

  // Fetch XP events and submissions for time-filtered views
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [allSubsRes, weeklyXpRes, monthlyXpRes] = await Promise.all([
    allUserIds.length > 0
      ? supabase.from("problem_submissions").select("user_id, problem_id, passed, created_at").in("user_id", allUserIds).eq("passed", true)
      : Promise.resolve({ data: [] }),
    supabase.from("xp_events").select("user_id, xp_amount, created_at").gte("created_at", weekAgo),
    supabase.from("xp_events").select("user_id, xp_amount, created_at").gte("created_at", monthAgo),
  ]);

  const allSubs = allSubsRes.data ?? [];

  // All-time solved counts
  const allSolvedCounts = new Map<string, Set<string>>();
  for (const sub of allSubs) {
    if (!allSolvedCounts.has(sub.user_id)) allSolvedCounts.set(sub.user_id, new Set());
    allSolvedCounts.get(sub.user_id)!.add(sub.problem_id);
  }

  const allTime: LeaderboardUser[] = (topUsers ?? []).map((u, i) => ({
    rank: i + 1,
    id: u.id,
    name: u.name || "Anonymous",
    level: u.level,
    totalXp: u.total_xp,
    problemsSolved: allSolvedCounts.get(u.id)?.size ?? 0,
    isCurrentUser: u.id === currentUser?.id,
  }));

  // Helper to build time-filtered leaderboard
  function buildTimedLeaderboard(
    xpRows: { user_id: string; xp_amount: number; created_at: string }[],
    since: string
  ): LeaderboardUser[] {
    const xpByUser = new Map<string, number>();
    for (const row of xpRows) {
      xpByUser.set(row.user_id, (xpByUser.get(row.user_id) || 0) + row.xp_amount);
    }

    const sorted = [...xpByUser.entries()].sort((a, b) => b[1] - a[1]).slice(0, 50);
    if (sorted.length === 0) return [];

    // Build profile lookup from allTime users + fetch any missing
    const profileMap = new Map((topUsers ?? []).map((u) => [u.id, { name: u.name, level: u.level }]));

    // Count solved in period
    const periodSolved = new Map<string, Set<string>>();
    for (const sub of allSubs) {
      if (sub.created_at >= since) {
        if (!periodSolved.has(sub.user_id)) periodSolved.set(sub.user_id, new Set());
        periodSolved.get(sub.user_id)!.add(sub.problem_id);
      }
    }

    return sorted.map(([id, xp], i) => ({
      rank: i + 1,
      id,
      name: profileMap.get(id)?.name || "Anonymous",
      level: profileMap.get(id)?.level || 1,
      totalXp: xp,
      problemsSolved: periodSolved.get(id)?.size ?? 0,
      isCurrentUser: id === currentUser?.id,
    }));
  }

  const weekly = buildTimedLeaderboard(weeklyXpRes.data ?? [], weekAgo);
  const monthly = buildTimedLeaderboard(monthlyXpRes.data ?? [], monthAgo);

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <LeaderboardTabs
          allTime={allTime}
          weekly={weekly}
          monthly={monthly}
          isLoggedIn={!!currentUser}
        />
      </div>
    </div>
  );
}
