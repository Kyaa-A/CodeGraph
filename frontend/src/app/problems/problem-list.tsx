"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Problem } from "@/lib/supabase/types";

const PAGE_SIZE = 50;

const difficultyColor: Record<string, string> = {
  easy: "text-emerald-600",
  medium: "text-amber-600",
  hard: "text-red-600",
};

type StatusFilter = "all" | "solved" | "attempted" | "unsolved" | "bookmarked";
type DifficultyFilter = "all" | "easy" | "medium" | "hard";
type SortOption = "default" | "title" | "difficulty" | "status";

export function ProblemList({
  problems,
  solvedMap,
  isLoggedIn,
  sortedTags,
  initialBookmarks = [],
}: {
  problems: Problem[];
  solvedMap: Record<string, { solved: boolean; attempts: number }>;
  isLoggedIn?: boolean;
  sortedTags?: [string, number][];
  initialBookmarks?: string[];
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(initialBookmarks));
  const [togglingBookmark, setTogglingBookmark] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const toggleBookmark = useCallback(async (e: React.MouseEvent, problemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) return;
    setTogglingBookmark(problemId);
    // Optimistic update
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(problemId)) next.delete(problemId);
      else next.add(problemId);
      return next;
    });
    try {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId }),
      });
    } catch {
      // Revert on error
      setBookmarks((prev) => {
        const next = new Set(prev);
        if (next.has(problemId)) next.delete(problemId);
        else next.add(problemId);
        return next;
      });
    }
    setTogglingBookmark(null);
  }, [isLoggedIn]);

  const filtered = useMemo(() => {
    let result = problems;

    // Tag filter
    if (tagFilter) {
      result = result.filter((p) => p.tags.includes(tagFilter));
    }

    // Difficulty filter
    if (difficultyFilter !== "all") {
      result = result.filter((p) => p.difficulty === difficultyFilter);
    }

    // Status filter
    if (statusFilter === "bookmarked") {
      result = result.filter((p) => bookmarks.has(p.id));
    } else if (statusFilter !== "all") {
      result = result.filter((p) => {
        const s = solvedMap[p.id];
        if (statusFilter === "solved") return s?.solved;
        if (statusFilter === "attempted") return s && !s.solved && s.attempts > 0;
        if (statusFilter === "unsolved") return !s || (!s.solved && s.attempts === 0);
        return true;
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(lower) || p.tags.some((t) => t.toLowerCase().includes(lower))
      );
    }

    // Sort
    if (sortBy === "title") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "difficulty") {
      const order = { easy: 0, medium: 1, hard: 2 };
      result = [...result].sort((a, b) => (order[a.difficulty as keyof typeof order] ?? 1) - (order[b.difficulty as keyof typeof order] ?? 1));
    } else if (sortBy === "status") {
      result = [...result].sort((a, b) => {
        const aS = solvedMap[a.id];
        const bS = solvedMap[b.id];
        const aScore = aS?.solved ? 2 : aS?.attempts ? 1 : 0;
        const bScore = bS?.solved ? 2 : bS?.attempts ? 1 : 0;
        return aScore - bScore; // unsolved first
      });
    }

    return result;
  }, [problems, searchQuery, difficultyFilter, statusFilter, tagFilter, solvedMap, bookmarks, sortBy]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, filtered.length]);

  // Back to top visibility
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const pickRandom = useCallback(() => {
    // Prefer unsolved from current filtered set
    const unsolved = filtered.filter((p) => !solvedMap[p.id]?.solved);
    const pool = unsolved.length > 0 ? unsolved : filtered;
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    router.push(`/problems/${pick.id}`);
  }, [filtered, solvedMap, router]);

  // Reset visible count when filters or search change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [problems.length, searchQuery, statusFilter, difficultyFilter, tagFilter]);

  return (
    <>
      {/* Topic Tags */}
      {sortedTags && sortedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {sortedTags.map(([t, count]) => (
            <button
              key={t}
              onClick={() => setTagFilter(tagFilter === t ? null : t)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tagFilter === t
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              {t}
              <span className="text-[10px] opacity-50">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Difficulty + Status filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {([
            { value: "all" as DifficultyFilter, label: "All" },
            { value: "easy" as DifficultyFilter, label: "Easy" },
            { value: "medium" as DifficultyFilter, label: "Medium" },
            { value: "hard" as DifficultyFilter, label: "Hard" },
          ]).map((d) => (
            <button
              key={d.value}
              onClick={() => setDifficultyFilter(d.value)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                difficultyFilter === d.value
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {isLoggedIn && (
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {([
              { value: "all" as StatusFilter, label: "All" },
              { value: "solved" as StatusFilter, label: "Solved" },
              { value: "attempted" as StatusFilter, label: "Attempted" },
              { value: "unsolved" as StatusFilter, label: "Unsolved" },
              { value: "bookmarked" as StatusFilter, label: "Bookmarked" },
            ]).map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={`px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  statusFilter === s.value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems by title or tag..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
        >
          <option value="default">Default</option>
          <option value="title">Title A-Z</option>
          <option value="difficulty">Difficulty</option>
          {isLoggedIn && <option value="status">Unsolved First</option>}
        </select>
        <button
          onClick={pickRandom}
          title="Pick a random problem"
          className="px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors shrink-0"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
        {/* Header */}
        <div className="grid grid-cols-[36px_1fr_90px_80px_36px] sm:grid-cols-[36px_1fr_140px_90px_80px_36px] px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
          <div></div>
          <div>Title</div>
          <div className="hidden sm:block">Tags</div>
          <div className="text-center">Difficulty</div>
          <div className="text-center">Status</div>
          <div></div>
        </div>

        {/* Rows */}
        {visible.map((problem, index) => {
          const status = solvedMap[problem.id];
          const isSolved = status?.solved ?? false;
          const hasAttempted = (status?.attempts ?? 0) > 0;
          const isBookmarked = bookmarks.has(problem.id);

          return (
            <Link
              key={problem.id}
              href={`/problems/${problem.id}`}
              className={`grid grid-cols-[36px_1fr_90px_80px_36px] sm:grid-cols-[36px_1fr_140px_90px_80px_36px] px-4 py-3 items-center transition-colors hover:bg-slate-50 border-b border-slate-50 last:border-0 group ${
                index % 2 === 1 ? "bg-slate-50/40" : ""
              }`}
            >
              <span className="text-sm text-slate-400 font-mono">{index + 1}</span>
              <span className="text-sm font-medium text-slate-800 group-hover:text-emerald-600 transition-colors truncate pr-3">
                {problem.title}
              </span>
              <div className="hidden sm:flex items-center gap-1 overflow-hidden">
                {problem.tags.slice(0, 2).map((t) => (
                  <span key={t} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 truncate">
                    {t}
                  </span>
                ))}
                {problem.tags.length > 2 && (
                  <span className="text-[10px] text-slate-400">+{problem.tags.length - 2}</span>
                )}
              </div>
              <div className={`text-center text-sm font-medium ${difficultyColor[problem.difficulty]}`}>
                {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
              </div>
              <div className="flex justify-center">
                {isSolved ? (
                  <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : hasAttempted ? (
                  <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <span className="h-4 w-4 rounded-full border-2 border-slate-200" />
                )}
              </div>
              {isLoggedIn && (
                <button
                  onClick={(e) => toggleBookmark(e, problem.id)}
                  disabled={togglingBookmark === problem.id}
                  className="flex justify-center"
                  title={isBookmarked ? "Remove bookmark" : "Bookmark"}
                >
                  <svg
                    className={`h-4 w-4 transition-colors ${
                      isBookmarked ? "text-rose-500 fill-rose-500" : "text-slate-300 hover:text-rose-400"
                    }`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    fill={isBookmarked ? "currentColor" : "none"}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              )}
            </Link>
          );
        })}

        {/* Empty state — no problems in DB */}
        {problems.length === 0 && (
          <div className="px-4 py-16 text-center">
            <svg className="h-12 w-12 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No problems found</h3>
            <p className="text-sm text-slate-500">Check back soon for coding challenges!</p>
          </div>
        )}

        {/* Empty state — filters/search produced no results */}
        {problems.length > 0 && filtered.length === 0 && (
          <div className="px-4 py-12 text-center">
            <svg className="h-10 w-10 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-base font-semibold text-slate-700 mb-1">No matching problems</h3>
            <p className="text-sm text-slate-500">Try adjusting your filters or search query.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setDifficultyFilter("all");
                setStatusFilter("all");
                setTagFilter(null);
              }}
              className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {hasMore && (
        <div ref={loaderRef} className="flex items-center justify-center py-6 gap-2">
          <div className="h-5 w-5 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-400">
            Loading more problems... ({visible.length} of {filtered.length})
          </span>
        </div>
      )}

      {/* Showing count */}
      {!hasMore && filtered.length > 0 && (
        <div className="text-center py-4 text-xs text-slate-400">
          Showing all {filtered.length}{filtered.length !== problems.length ? ` of ${problems.length}` : ""} problems
        </div>
      )}

      {/* Back to Top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 h-10 w-10 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 flex items-center justify-center transition-all duration-300 hover:bg-emerald-700 hover:shadow-xl hover:scale-105 ${
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Back to top"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </>
  );
}
