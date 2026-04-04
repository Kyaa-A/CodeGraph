"use client";

import { useState, useMemo } from "react";

interface StreakCalendarProps {
  /** Raw ISO timestamps from the server (e.g. "2026-04-04T10:30:00Z") */
  rawTimestamps: string[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function toLocalDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function StreakCalendar({ rawTimestamps }: StreakCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date());

  // Convert all timestamps to local date strings
  const { activeSet, streak, streakDates } = useMemo(() => {
    const localDates = rawTimestamps.map((ts) => toLocalDateStr(new Date(ts)));
    const set = new Set(localDates);

    // Calculate streak and collect streak dates
    let s = 0;
    const sDates = new Set<string>();
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = toLocalDateStr(d);
      if (set.has(dateStr)) {
        s++;
        sDates.add(dateStr);
      } else if (i > 0) {
        break;
      }
    }

    return { activeSet: set, streak: s, streakDates: sDates };
  }, [rawTimestamps]);

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

  return (
    <div>
      {/* Streak header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">
          <span className="mr-1.5">{streak > 0 ? "\uD83D\uDD25" : "\u2744\uFE0F"}</span>
          {streak} day streak
        </h3>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-xs font-semibold text-slate-700">
          {MONTHS[month]} {year}
        </span>
        <button onClick={nextMonth} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
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
          const isStreak = streakDates.has(dateStr);
          const isToday = dateStr === todayStr;

          return (
            <div
              key={dateStr}
              className={`aspect-square rounded-md flex items-center justify-center text-[11px] font-medium transition-colors relative ${
                isActive
                  ? "bg-emerald-500 text-white"
                  : isToday
                    ? "bg-slate-100 text-slate-900 ring-1 ring-slate-300"
                    : "text-slate-500 hover:bg-slate-50"
              }`}
              title={isStreak ? `Streak day!` : isActive ? `Active on ${dateStr}` : dateStr}
            >
              {isStreak ? (
                <span className="animate-pulse text-sm leading-none">🔥</span>
              ) : (
                day
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-slate-400">
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          Active
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-slate-100 ring-1 ring-slate-300" />
          Today
        </div>
      </div>
    </div>
  );
}
