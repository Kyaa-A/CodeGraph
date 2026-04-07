"use client";

import { useMemo } from "react";

interface StreakHeatmapProps {
  activeDates: string[];
  frozenDates?: string[];
  recoveredDates?: string[];
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export function StreakHeatmap({ activeDates, frozenDates = [], recoveredDates = [] }: StreakHeatmapProps) {
  const { weeks, monthLabels } = useMemo(() => {
    // Count how many activities per day for intensity levels
    const dayCounts: Record<string, number> = {};
    for (const ds of activeDates) {
      dayCounts[ds] = (dayCounts[ds] || 0) + 1;
    }
    const frozenSet = new Set(frozenDates);
    const recoveredSet = new Set(recoveredDates);

    const today = new Date();
    const todayStr = toDateStr(today);

    // Go back ~52 weeks to fill the full width
    const start = new Date(today);
    start.setDate(start.getDate() - 364);
    // Align to Sunday
    start.setDate(start.getDate() - start.getDay());

    const weeks: { date: string; level: number; isToday: boolean; isFrozen: boolean; isRecovered: boolean }[][] = [];
    const monthLabels: { label: string; col: number }[] = [];
    let lastMonth = -1;

    const cursor = new Date(start);

    while (cursor <= today || weeks.length % 7 !== 0) {
      const week: typeof weeks[0] = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = toDateStr(cursor);
        const count = dayCounts[dateStr] || 0;
        const isFrozen = frozenSet.has(dateStr);
        const isRecovered = recoveredSet.has(dateStr);
        const isToday = dateStr === todayStr;
        const isFuture = cursor > today;

        // GitHub-style: 0 = empty, 1 = light, 2 = medium, 3 = medium-dark, 4 = dark
        let level = 0;
        if (isFuture) {
          level = -1;
        } else if (isFrozen || isRecovered) {
          level = 1;
        } else if (count >= 4) {
          level = 4;
        } else if (count >= 3) {
          level = 3;
        } else if (count >= 2) {
          level = 2;
        } else if (count >= 1) {
          level = 1;
        }

        week.push({ date: dateStr, level, isToday, isFrozen, isRecovered });

        // Track month labels on first occurrence
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
      if (weeks.length >= 53) break;
    }

    return { weeks, monthLabels };
  }, [activeDates, frozenDates, recoveredDates]);

  const cellColor = (level: number, isFrozen: boolean, isRecovered: boolean) => {
    if (level === -1) return "bg-transparent";
    if (isRecovered) return "bg-red-300";
    if (isFrozen) return "bg-sky-300";
    switch (level) {
      case 4: return "bg-emerald-700";
      case 3: return "bg-emerald-500";
      case 2: return "bg-emerald-400";
      case 1: return "bg-emerald-200";
      default: return "bg-slate-100";
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[720px]">
        {/* Month labels */}
        <div className="flex gap-[3px] mb-1.5 ml-8">
          {weeks.map((_, i) => {
            const label = monthLabels.find((m) => m.col === i);
            return (
              <div key={i} className="w-[13px] text-[10px] text-slate-500 font-medium whitespace-nowrap">
                {label?.label || ""}
              </div>
            );
          })}
        </div>

        <div className="flex gap-0">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-2 shrink-0">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="h-[13px] text-[10px] text-slate-400 font-medium flex items-center justify-end w-6">
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
                    className={`w-[13px] h-[13px] rounded-[2px] ${cellColor(day.level, day.isFrozen, day.isRecovered)} ${
                      day.isToday ? "ring-1 ring-slate-400 ring-offset-1" : ""
                    }`}
                    title={`${day.date}${day.level >= 1 && !day.isFrozen && !day.isRecovered ? ` - ${day.level} activities` : day.isFrozen ? " - Frozen" : day.isRecovered ? " - Recovered" : ""}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5 mt-2">
          <span className="text-[10px] text-slate-400 mr-0.5">Less</span>
          <div className="w-[10px] h-[10px] rounded-[2px] bg-slate-100" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-200" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-400" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-500" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-700" />
          <span className="text-[10px] text-slate-400 ml-0.5">More</span>
        </div>
      </div>
    </div>
  );
}
