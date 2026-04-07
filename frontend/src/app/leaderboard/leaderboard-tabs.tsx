"use client";

import { useState } from "react";
import Link from "next/link";

type Period = "weekly" | "monthly" | "all";

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  level: number;
  totalXp: number;
  problemsSolved: number;
  isCurrentUser: boolean;
}

export function LeaderboardTabs({
  allTime,
  weekly,
  monthly,
  isLoggedIn,
}: {
  allTime: LeaderboardUser[];
  weekly: LeaderboardUser[];
  monthly: LeaderboardUser[];
  isLoggedIn: boolean;
}) {
  const [period, setPeriod] = useState<Period>("all");

  const users = period === "weekly" ? weekly : period === "monthly" ? monthly : allTime;

  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Leaderboard</h1>
          <p className="mt-1 text-slate-500">Top coders ranked by XP</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {([
            { value: "weekly" as Period, label: "This Week" },
            { value: "monthly" as Period, label: "This Month" },
            { value: "all" as Period, label: "All Time" },
          ]).map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                period === p.value
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      {users.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8 max-w-md mx-auto sm:max-w-none">
          {[users[1], users[0], users[2]].map((u, i) => {
            const podiumOrder = [2, 1, 3];
            const rank = podiumOrder[i];
            const colors = {
              1: "from-amber-400 to-amber-500",
              2: "from-slate-300 to-slate-400",
              3: "from-orange-300 to-orange-400",
            };
            const heights = { 1: "h-20 sm:h-28", 2: "h-14 sm:h-20", 3: "h-10 sm:h-16" };
            const medals = { 1: "bg-amber-400", 2: "bg-slate-400", 3: "bg-orange-400" };

            return (
              <div key={u.id} className="flex flex-col items-center">
                <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full ${medals[rank as 1|2|3]} flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-md mb-1.5 sm:mb-2`}>
                  {rank}
                </div>
                <p className={`text-xs sm:text-sm font-semibold text-slate-800 truncate max-w-full text-center ${u.isCurrentUser ? "text-emerald-600" : ""}`}>
                  {u.name}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-500">Lvl {u.level}</p>
                <p className="text-[10px] sm:text-xs font-semibold text-emerald-600 mb-1.5 sm:mb-2">{u.totalXp.toLocaleString()} XP</p>
                <div className={`w-full ${heights[rank as 1|2|3]} bg-gradient-to-t ${colors[rank as 1|2|3]} rounded-t-lg`} />
              </div>
            );
          })}
        </div>
      )}

      {/* Full Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-[32px_1fr_64px] sm:grid-cols-[48px_1fr_80px_80px_80px] px-3 sm:px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
          <div>#</div>
          <div>User</div>
          <div className="hidden sm:block text-center">Level</div>
          <div className="hidden sm:block text-center">Solved</div>
          <div className="text-right">XP</div>
        </div>

        {users.map((u) => (
          <div
            key={u.id}
            className={`grid grid-cols-[32px_1fr_64px] sm:grid-cols-[48px_1fr_80px_80px_80px] px-3 sm:px-4 py-3 items-center border-b border-slate-50 last:border-0 transition-colors ${
              u.isCurrentUser ? "bg-emerald-50/50" : u.rank % 2 === 0 ? "bg-slate-50/40" : ""
            }`}
          >
            <span className={`text-xs sm:text-sm font-mono ${u.rank <= 3 ? "font-bold text-amber-600" : "text-slate-400"}`}>
              {u.rank}
            </span>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shrink-0">
                {u.name[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className={`text-xs sm:text-sm font-medium truncate block ${u.isCurrentUser ? "text-emerald-700" : "text-slate-800"}`}>
                  {u.name}
                  {u.isCurrentUser && <span className="text-emerald-500 text-[10px] sm:text-xs ml-1">(you)</span>}
                </span>
                {/* Show level inline on mobile */}
                <span className="text-[10px] text-slate-400 sm:hidden">Lvl {u.level} &middot; {u.problemsSolved} solved</span>
              </div>
            </div>
            <div className="hidden sm:block text-center">
              <span className="inline-flex items-center justify-center h-6 w-8 rounded-md bg-slate-100 text-xs font-bold text-slate-700">
                {u.level}
              </span>
            </div>
            <div className="hidden sm:block text-center text-sm text-slate-600">{u.problemsSolved}</div>
            <div className="text-right text-xs sm:text-sm font-semibold text-emerald-600">{u.totalXp.toLocaleString()}</div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="px-4 py-16 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">No activity {period === "weekly" ? "this week" : "this month"}</p>
            <p className="text-xs text-slate-400">Solve problems or complete lessons to appear here!</p>
          </div>
        )}
      </div>

      {/* CTA */}
      {!isLoggedIn && (
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
    </>
  );
}
