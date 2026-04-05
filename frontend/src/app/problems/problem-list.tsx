"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { Problem } from "@/lib/supabase/types";

const PAGE_SIZE = 50;

const difficultyColor: Record<string, string> = {
  easy: "text-emerald-600",
  medium: "text-amber-600",
  hard: "text-red-600",
};

export function ProblemList({
  problems,
  solvedMap,
}: {
  problems: Problem[];
  solvedMap: Record<string, { solved: boolean; attempts: number }>;
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const visible = problems.slice(0, visibleCount);
  const hasMore = visibleCount < problems.length;

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, problems.length));
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, problems.length]);

  // Back to top visibility
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [problems.length]);

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
        {/* Header */}
        <div className="grid grid-cols-[36px_1fr_90px_80px] sm:grid-cols-[36px_1fr_140px_90px_80px] px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
          <div></div>
          <div>Title</div>
          <div className="hidden sm:block">Tags</div>
          <div className="text-center">Difficulty</div>
          <div className="text-center">Status</div>
        </div>

        {/* Rows */}
        {visible.map((problem, index) => {
          const status = solvedMap[problem.id];
          const isSolved = status?.solved ?? false;
          const hasAttempted = (status?.attempts ?? 0) > 0;

          return (
            <Link
              key={problem.id}
              href={`/problems/${problem.id}`}
              className={`grid grid-cols-[36px_1fr_90px_80px] sm:grid-cols-[36px_1fr_140px_90px_80px] px-4 py-3 items-center transition-colors hover:bg-slate-50 border-b border-slate-50 last:border-0 group ${
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
            </Link>
          );
        })}

        {/* Empty state */}
        {problems.length === 0 && (
          <div className="px-4 py-16 text-center">
            <svg className="h-12 w-12 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No problems found</h3>
            <p className="text-sm text-slate-500">Check back soon for coding challenges!</p>
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {hasMore && (
        <div ref={loaderRef} className="flex items-center justify-center py-6 gap-2">
          <div className="h-5 w-5 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-400">
            Loading more problems... ({visible.length} of {problems.length})
          </span>
        </div>
      )}

      {/* Showing count */}
      {!hasMore && problems.length > 0 && (
        <div className="text-center py-4 text-xs text-slate-400">
          Showing all {problems.length} problems
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
