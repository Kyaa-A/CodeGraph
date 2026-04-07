"use client";

import { useMemo } from "react";

interface StreakHeatmapProps {
  /** ISO date strings of days with activity */
  activeDates: string[];
  /** ISO date strings of frozen streak days */
  frozenDates?: string[];
  /** ISO date strings of recovered streak days */
  recoveredDates?: string[];
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export function StreakHeatmap({ activeDates, frozenDates = [], recoveredDates = [] }: StreakHeatmapProps) {
  const { weeks, monthLabels } = useMemo(() => {
    const activeSet = new Set(activeDates);
    const frozenSet = new Set(frozenDates);
    const recoveredSet = new Set(recoveredDates);
    const today = new Date();
    // Go back 12 weeks (84 days)
    const start = new Date(today);
    start.setDate(start.getDate() - 83);
    // Align to Sunday
    start.setDate(start.getDate() - start.getDay());

    const weeks: { date: string; level: number; isToday: boolean; isFrozen: boolean; isRecovered: boolean }[][] = [];
    const monthLabels: { label: string; col: number }[] = [];
    let lastMonth = -1;

    const cursor = new Date(start);
    const todayStr = toDateStr(today);

    while (cursor <= today || weeks.length < 13) {
      const week: typeof weeks[0] = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = toDateStr(cursor);
        const isActive = activeSet.has(dateStr);
        const isFrozen = frozenSet.has(dateStr);
        const isRecovered = recoveredSet.has(dateStr);
        const isToday = dateStr === todayStr;
        const isFuture = cursor > today;

        let level = 0;
        if (isFuture) level = -1;
        else if (isActive) level = 2;
        else if (isFrozen || isRecovered) level = 1;

        week.push({ date: dateStr, level, isToday, isFrozen, isRecovered });

        // Track month labels
        if (cursor.getMonth() !== lastMonth && !isFuture) {
          lastMonth = cursor.getMonth();
          monthLabels.push({
            label: cursor.toLocaleDateString("en-US", { month: "short" }),
            col: weeks.length,
          });
        }

        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
      if (weeks.length >= 13) break;
    }

    return { weeks, monthLabels };
  }, [activeDates, frozenDates, recoveredDates]);

  const cellColor = (level: number, isFrozen: boolean, isRecovered: boolean) => {
    if (level === -1) return "bg-transparent";
    if (isRecovered) return "bg-red-400/60";
    if (isFrozen) return "bg-sky-400/60";
    if (level === 2) return "bg-emerald-500";
    return "bg-slate-700/30";
  };

  return (
    <div className="w-full">
      {/* Month labels */}
      <div className="flex gap-[3px] mb-1 ml-8">
        {weeks.map((_, i) => {
          const label = monthLabels.find((m) => m.col === i);
          return (
            <div key={i} className="w-[13px] text-[9px] text-slate-500 font-medium">
              {label?.label || ""}
            </div>
          );
        })}
      </div>

      <div className="flex gap-0">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] mr-1.5 shrink-0">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="h-[13px] text-[9px] text-slate-500 font-medium flex items-center justify-end w-6">
              {label}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={`w-[13px] h-[13px] rounded-[3px] transition-colors ${cellColor(day.level, day.isFrozen, day.isRecovered)} ${
                    day.isToday ? "ring-1 ring-emerald-400 ring-offset-1 ring-offset-slate-900" : ""
                  }`}
                  title={`${day.date}${day.level === 2 ? " - Active" : day.isFrozen ? " - Frozen" : day.isRecovered ? " - Recovered" : ""}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-2 ml-8">
        <span className="text-[9px] text-slate-500">Less</span>
        <div className="w-[10px] h-[10px] rounded-[2px] bg-slate-700/30" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-500/50" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-500" />
        <span className="text-[9px] text-slate-500">More</span>
        <div className="w-[10px] h-[10px] rounded-[2px] bg-sky-400/60 ml-2" />
        <span className="text-[9px] text-slate-500">Freeze</span>
      </div>
    </div>
  );
}
