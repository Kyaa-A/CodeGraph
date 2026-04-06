"use client";

import { useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface InventoryBagProps {
  freezeCount: number;
  recoverCount: number;
  activeTimestamps: string[];
  frozenDates: string[];
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const ITEMS = [
  {
    type: "streak_freeze" as const,
    name: "Streak Freeze",
    icon: "\u2744\uFE0F",
    desc: "Protect a missed day — keeps your streak alive",
    color: "from-sky-400 to-sky-500",
    bg: "bg-sky-50",
    border: "border-sky-200",
    badge: "bg-sky-500",
    rpc: "use_streak_freeze",
    maxDaysBack: 7,
  },
  {
    type: "streak_recover" as const,
    name: "Streak Recover",
    icon: "\uD83D\uDD04",
    desc: "Recover a broken streak day from the past",
    color: "from-purple-400 to-purple-500",
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "bg-purple-500",
    rpc: "use_streak_recover",
    maxDaysBack: 30,
  },
];

export function InventoryBag({
  freezeCount: initFreezes,
  recoverCount: initRecovers,
  activeTimestamps,
  frozenDates: initFrozen,
}: InventoryBagProps) {
  const [freezes, setFreezes] = useState(initFreezes);
  const [recovers, setRecovers] = useState(initRecovers);
  const [frozenSet, setFrozenSet] = useState(() => new Set(initFrozen));
  const [selectedItem, setSelectedItem] = useState<typeof ITEMS[number] | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [using, setUsing] = useState<string | null>(null);

  const activeSet = useMemo(() => {
    return new Set(activeTimestamps.map((ts) => toDateStr(new Date(ts))));
  }, [activeTimestamps]);

  const getCount = (type: string) =>
    type === "streak_freeze" ? freezes : recovers;

  const todayStr = toDateStr(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const canApply = useCallback(
    (dateStr: string) => {
      if (!selectedItem) return false;
      if (activeSet.has(dateStr) || frozenSet.has(dateStr)) return false;
      if (dateStr >= todayStr) return false;
      const diff = (Date.now() - new Date(dateStr).getTime()) / 86400000;
      return diff <= selectedItem.maxDaysBack;
    },
    [selectedItem, activeSet, frozenSet, todayStr]
  );

  const handleApply = useCallback(
    async (dateStr: string) => {
      if (!selectedItem || using) return;
      setUsing(dateStr);

      try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc(selectedItem.rpc, {
          target_date: dateStr,
        });
        if (error) throw error;
        const result = data as { success: boolean; remaining?: number; error?: string };

        if (result.success) {
          setFrozenSet((prev) => new Set([...prev, dateStr]));
          if (selectedItem.type === "streak_freeze") {
            setFreezes(result.remaining ?? freezes - 1);
          } else {
            setRecovers(result.remaining ?? recovers - 1);
          }
          // Close picker if no items left
          const remaining = result.remaining ?? 0;
          if (remaining <= 0) setSelectedItem(null);
        }
      } catch (err) {
        console.error("Failed to use item:", err);
      } finally {
        setUsing(null);
      }
    },
    [selectedItem, using, freezes, recovers]
  );

  if (freezes <= 0 && recovers <= 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h2 className="text-sm font-bold text-slate-900">Inventory</h2>
      </div>

      {/* Item cards */}
      <div className="grid grid-cols-2 gap-3">
        {ITEMS.map((item) => {
          const count = getCount(item.type);
          if (count <= 0) return null;
          const isSelected = selectedItem?.type === item.type;

          return (
            <button
              key={item.type}
              onClick={() =>
                setSelectedItem(isSelected ? null : item)
              }
              className={`relative rounded-xl border-2 p-4 text-center transition-all ${
                isSelected
                  ? `${item.border} ${item.bg} shadow-md scale-[1.02]`
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              {/* Item icon */}
              <div className={`h-12 w-12 mx-auto rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl shadow-sm mb-2`}>
                {item.icon}
              </div>

              {/* Quantity badge */}
              <div className={`absolute top-2 right-2 h-6 min-w-6 px-1.5 rounded-lg ${item.badge} text-white text-xs font-bold flex items-center justify-center shadow-sm`}>
                {count}
              </div>

              <p className="text-xs font-semibold text-slate-800">{item.name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                {item.desc}
              </p>

              {isSelected && (
                <div className="mt-2 text-[10px] font-medium text-emerald-600">
                  Select a day below
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Calendar picker — shows when an item is selected */}
      {selectedItem && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              aria-label="Previous month"
              className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs font-semibold text-slate-700">
              {MONTHS[month]} {year}
            </span>
            <button
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              aria-label="Next month"
              className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[9px] font-medium text-slate-400 py-0.5">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} className="aspect-square" />;

              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isActive = activeSet.has(dateStr);
              const isFrozen = frozenSet.has(dateStr);
              const isToday = dateStr === todayStr;
              const eligible = canApply(dateStr);
              const isUsing = using === dateStr;

              return (
                <button
                  key={dateStr}
                  disabled={!eligible || !!using}
                  onClick={() => eligible && handleApply(dateStr)}
                  className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-all ${
                    isUsing
                      ? "bg-sky-100 ring-1 ring-sky-300"
                      : isFrozen
                        ? "bg-gradient-to-br from-sky-100 to-sky-200 text-sky-700 ring-1 ring-sky-300"
                        : isActive
                          ? "bg-emerald-500 text-white"
                          : isToday
                            ? "bg-white text-slate-900 ring-1 ring-slate-300"
                            : eligible
                              ? `${selectedItem.bg} ${selectedItem.border} border cursor-pointer hover:scale-110 hover:shadow-sm text-slate-700`
                              : "text-slate-300"
                  }`}
                >
                  {isUsing ? (
                    <div className="w-3 h-3 border-2 border-sky-300 border-t-sky-600 rounded-full animate-spin" />
                  ) : isFrozen ? (
                    <span className="text-xs">{"\u2744\uFE0F"}</span>
                  ) : (
                    day
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-400 text-center mt-2">
            Click an eligible day to apply {selectedItem.name.toLowerCase()}
          </p>
        </div>
      )}
    </div>
  );
}
