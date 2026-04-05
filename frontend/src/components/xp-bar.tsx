"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import type { XpEvent } from "@/lib/supabase/types";

function xpForLevel(level: number): number {
  return level * (level - 1) * 50;
}

function xpToNextLevel(level: number): number {
  return xpForLevel(level + 1) - xpForLevel(level);
}

const EVENT_LABELS: Record<string, string> = {
  problem_solve: "Problem Solved",
  lesson_complete: "Lesson Complete",
  daily_streak: "Daily Streak",
};

export function XpBar({ userId }: { userId: string }) {
  const [totalXp, setTotalXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [recentEvents, setRecentEvents] = useState<XpEvent[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchXpData = useCallback(async () => {
    const [profileRes, eventsRes] = await Promise.all([
      supabase.from("profiles").select("total_xp, level").eq("id", userId).single(),
      supabase
        .from("xp_events")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    if (profileRes.data) {
      setTotalXp(profileRes.data.total_xp);
      setLevel(profileRes.data.level);
    }
    if (eventsRes.data) {
      setRecentEvents(eventsRes.data as XpEvent[]);
    }
    setLoading(false);
  }, [supabase, userId]);

  useEffect(() => {
    fetchXpData();
  }, [fetchXpData]);

  // Listen for XP updates via custom event (fired after problem solve / lesson complete)
  useEffect(() => {
    const handler = () => fetchXpData();
    window.addEventListener("xp-updated", handler);
    return () => window.removeEventListener("xp-updated", handler);
  }, [fetchXpData]);

  if (loading) return null;

  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpToNextLevel(level);
  const progressXp = totalXp - currentLevelXp;
  const progressPct = nextLevelXp > 0 ? Math.min((progressXp / nextLevelXp) * 100, 100) : 100;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors group"
      >
        {/* Level badge */}
        <div className="relative h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
          <span className="text-[10px] font-bold text-white">{level}</span>
        </div>

        {/* Mini XP bar */}
        <div className="hidden sm:flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-slate-500 leading-none">
            {totalXp.toLocaleString()} XP
          </span>
          <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-72 rounded-xl border border-slate-200 bg-white shadow-xl shadow-black/10 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-5 py-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-lg font-bold">{level}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Level {level}</p>
                      <p className="text-xs text-emerald-100">{totalXp.toLocaleString()} total XP</p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-emerald-100 mb-1">
                    <span>{progressXp} / {nextLevelXp} XP</span>
                    <span>Level {level + 1}</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-white"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              {/* XP breakdown */}
              <div className="px-5 py-3 border-b border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  How to earn XP
                </p>
                <div className="space-y-1.5">
                  {[
                    { label: "Easy Problem", xp: 10, color: "text-emerald-600" },
                    { label: "Medium Problem", xp: 25, color: "text-amber-600" },
                    { label: "Hard Problem", xp: 50, color: "text-red-600" },
                    { label: "Complete Lesson", xp: 15, color: "text-blue-600" },
                    { label: "Daily Streak", xp: 5, color: "text-orange-600" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{item.label}</span>
                      <span className={`font-semibold ${item.color}`}>+{item.xp} XP</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <div className="px-5 py-3 max-h-48 overflow-y-auto">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Recent XP
                </p>
                {recentEvents.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3">
                    Solve problems to earn XP!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {recentEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span className="text-slate-600 truncate max-w-[160px]">
                            {EVENT_LABELS[event.event_type] || event.event_type}
                          </span>
                        </div>
                        <span className="font-semibold text-emerald-600 shrink-0">
                          +{event.xp_amount} XP
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
