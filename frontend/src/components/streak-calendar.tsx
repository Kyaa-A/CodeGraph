"use client";

import { useState, useMemo, useCallback } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { LOTTIE } from "@/lib/lottie-assets";
import { createClient } from "@/lib/supabase/client";

interface StreakCalendarProps {
  rawTimestamps: string[];
  frozenDates?: string[];
  freezeCount?: number;
  recoverCount?: number;
  interactive?: boolean;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toLocalDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function StreakCalendar({
  rawTimestamps,
  frozenDates: initialFrozen = [],
  freezeCount: initialFreezes = 0,
  recoverCount: initialRecovers = 0,
  interactive = false,
}: StreakCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date());
  const [frozenSet, setFrozenSet] = useState(() => new Set(initialFrozen));
  const [freezes, setFreezes] = useState(initialFreezes);
  const [recovers, setRecovers] = useState(initialRecovers);
  const [using, setUsing] = useState<string | null>(null);
  const [showItemPicker, setShowItemPicker] = useState<string | null>(null);

  const { activeSet, streak, streakDates } = useMemo(() => {
    const localDates = rawTimestamps.map((ts) => toLocalDateStr(new Date(ts)));
    const set = new Set(localDates);

    // Calculate streak (including frozen dates)
    let s = 0;
    const sDates = new Set<string>();
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = toLocalDateStr(d);
      if (set.has(dateStr) || frozenSet.has(dateStr)) {
        s++;
        sDates.add(dateStr);
      } else if (i > 0) {
        break;
      }
    }

    return { activeSet: set, streak: s, streakDates: sDates };
  }, [rawTimestamps, frozenSet]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = toLocalDateStr(new Date());

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const handleUseItem = useCallback(
    async (dateStr: string, itemType: "streak_freeze" | "streak_recover") => {
      setUsing(dateStr);
      setShowItemPicker(null);
      const supabase = createClient();

      try {
        const rpcName = itemType === "streak_freeze" ? "use_streak_freeze" : "use_streak_recover";
        const { data, error } = await supabase.rpc(rpcName, { target_date: dateStr });

        if (error) throw error;
        const result = data as { success: boolean; error?: string; remaining?: number };

        if (result.success) {
          setFrozenSet((prev) => new Set([...prev, dateStr]));
          if (itemType === "streak_freeze") {
            setFreezes(result.remaining ?? freezes - 1);
          } else {
            setRecovers(result.remaining ?? recovers - 1);
          }
        } else {
          console.error("Failed:", result.error);
        }
      } catch (err) {
        console.error("Error using item:", err);
      } finally {
        setUsing(null);
      }
    },
    [freezes, recovers]
  );

  const canUseItemOn = (dateStr: string): boolean => {
    if (!interactive) return false;
    if (activeSet.has(dateStr) || frozenSet.has(dateStr)) return false;
    if (dateStr >= todayStr) return false;
    if (freezes <= 0 && recovers <= 0) return false;
    // Within 30 days
    const diff = (new Date().getTime() - new Date(dateStr).getTime()) / 86400000;
    return diff <= 30;
  };

  return (
    <div>
      {/* Streak header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">
          <span className="mr-1.5">{streak > 0 ? "\uD83D\uDD25" : "\u2744\uFE0F"}</span>
          {streak} day streak
        </h3>

        {/* Item counts */}
        {interactive && (freezes > 0 || recovers > 0) && (
          <div className="flex items-center gap-2">
            {freezes > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-sky-50 border border-sky-200 rounded-lg" title="Streak Freezes — protect a missed day">
                <span className="text-xs">{"\u2744\uFE0F"}</span>
                <span className="text-[11px] font-bold text-sky-700">{freezes}</span>
              </div>
            )}
            {recovers > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded-lg" title="Streak Recovers — recover a broken streak day">
                <span className="text-xs">{"\uD83D\uDD04"}</span>
                <span className="text-[11px] font-bold text-purple-700">{recovers}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} aria-label="Previous month" className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-xs font-semibold text-slate-700">
          {MONTHS[month]} {year}
        </span>
        <button onClick={nextMonth} aria-label="Next month" className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-slate-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isActive = activeSet.has(dateStr);
          const isFrozen = frozenSet.has(dateStr);
          const isStreak = streakDates.has(dateStr);
          const isToday = dateStr === todayStr;
          const isUsing = using === dateStr;
          const canUse = canUseItemOn(dateStr);
          const isPast = dateStr < todayStr;
          const showPicker = showItemPicker === dateStr;

          return (
            <div key={dateStr} className="relative">
              <div
                onClick={() => {
                  if (canUse && !isUsing) {
                    setShowItemPicker(showPicker ? null : dateStr);
                  }
                }}
                className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-medium transition-all relative ${
                  isFrozen
                    ? "bg-gradient-to-br from-sky-100 to-sky-200 text-sky-700 ring-1 ring-sky-300"
                    : isActive
                      ? "bg-emerald-500 text-white"
                      : isToday
                        ? "bg-slate-100 text-slate-900 ring-1 ring-slate-300"
                        : canUse
                          ? "text-slate-400 hover:bg-sky-50 hover:ring-1 hover:ring-sky-200 cursor-pointer"
                          : isPast && !isActive
                            ? "text-slate-300"
                            : "text-slate-500 hover:bg-slate-50"
                }`}
                title={
                  isFrozen
                    ? `Streak protected ${"\u2744\uFE0F"}`
                    : isStreak
                      ? "Streak day!"
                      : canUse
                        ? "Click to use a streak item"
                        : dateStr
                }
              >
                {isUsing ? (
                  <div className="w-4 h-4 border-2 border-sky-300 border-t-sky-600 rounded-full animate-spin" />
                ) : isFrozen ? (
                  <div className="flex flex-col items-center">
                    <span className="text-sm leading-none">{"\u2744\uFE0F"}</span>
                    <span className="text-[8px] text-sky-600 font-bold">{day}</span>
                  </div>
                ) : isStreak && isActive ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <DotLottieReact
                      src={LOTTIE.streakFire}
                      loop
                      autoplay
                      className="w-8 h-8"
                    />
                  </div>
                ) : (
                  day
                )}
              </div>

              {/* Item picker popup */}
              {showPicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowItemPicker(null)} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-2 min-w-[140px]">
                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider px-2 pb-1 mb-1 border-b border-slate-100">
                      Use item
                    </p>
                    {freezes > 0 && (
                      <button
                        onClick={() => handleUseItem(dateStr, "streak_freeze")}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-sky-50 transition-colors"
                      >
                        <span>{"\u2744\uFE0F"}</span>
                        <span className="font-medium">Freeze</span>
                        <span className="text-[10px] text-slate-400 ml-auto">({freezes})</span>
                      </button>
                    )}
                    {recovers > 0 && (
                      <button
                        onClick={() => handleUseItem(dateStr, "streak_recover")}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-purple-50 transition-colors"
                      >
                        <span>{"\uD83D\uDD04"}</span>
                        <span className="font-medium">Recover</span>
                        <span className="text-[10px] text-slate-400 ml-auto">({recovers})</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-slate-400 flex-wrap">
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          Active
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-sky-100 to-sky-200 ring-1 ring-sky-300" />
          Frozen
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-slate-100 ring-1 ring-slate-300" />
          Today
        </div>
      </div>
    </div>
  );
}
