"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { LessonViewer } from "@/components/lesson-viewer";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  const lines = markdown.split("\n");
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/\*\*/g, "").replace(/`/g, "").trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      items.push({ id, text, level });
    }
  }
  return items;
}

function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const scrollContainer = document.getElementById("doc-scroll-area");
    if (!scrollContainer || items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { root: scrollContainer, rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav className="hidden xl:block w-56 shrink-0 sticky top-0 self-start pt-6 pr-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">On this page</p>
      <ul className="space-y-1 border-l border-slate-100">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`block text-[13px] leading-snug py-1 transition-colors ${
                item.level === 1 ? "pl-3" : item.level === 2 ? "pl-5" : "pl-7"
              } ${
                activeId === item.id
                  ? "text-emerald-600 border-l-2 border-emerald-500 -ml-px font-medium"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function DocViewer({
  content,
  lang,
  prevPage,
  nextPage,
  docTopicId,
  isRead: initialIsRead,
  isAuthenticated,
  readProgress,
}: {
  content: string;
  lang: string;
  prevPage: { slug: string; title: string } | null;
  nextPage: { slug: string; title: string } | null;
  docTopicId?: string;
  isRead?: boolean;
  isAuthenticated?: boolean;
  readProgress?: { read: number; total: number };
}) {
  const headings = useMemo(() => extractHeadings(content), [content]);
  const [isRead, setIsRead] = useState(initialIsRead ?? false);
  const [marking, setMarking] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const scrollArea = document.getElementById("doc-scroll-area");
    if (!scrollArea) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollArea;
      const pct = scrollHeight - clientHeight > 0
        ? (scrollTop / (scrollHeight - clientHeight)) * 100
        : 100;
      setScrollProgress(Math.min(pct, 100));
    };
    scrollArea.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollArea.removeEventListener("scroll", handleScroll);
  }, []);

  const markAsRead = useCallback(async () => {
    if (!docTopicId || isRead || marking) return;
    setMarking(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("mark_doc_read", { p_doc_topic_id: docTopicId });
      if (error) throw error;
      const result = data as { success: boolean; xp_awarded: number; already_read?: boolean };
      if (result.success) {
        setIsRead(true);
        if (result.xp_awarded > 0) {
          setXpAwarded(true);
          window.dispatchEvent(new Event("xp-updated"));
          setTimeout(() => setXpAwarded(false), 3000);
        }
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    } finally {
      setMarking(false);
    }
  }, [docTopicId, isRead, marking]);

  return (
    <div id="doc-scroll-area" className="flex-1 overflow-y-auto relative">
      {/* Scroll reading progress bar */}
      <div className="sticky top-0 left-0 right-0 z-10 h-0.5 bg-slate-100">
        <div
          className="h-full bg-emerald-500 transition-[width] duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <div className="flex">
      <div className="p-6 lg:p-8 max-w-3xl min-w-0 flex-1">
        <LessonViewer content={content} docLang={lang} />

        {/* Mark as Read + Progress */}
        {isAuthenticated && docTopicId && (
          <div className="mt-10 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {isRead ? (
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {isRead ? "Page completed" : "Finished reading?"}
                  </p>
                  {readProgress && (
                    <p className="text-xs text-slate-400">
                      {readProgress.read + (isRead && !initialIsRead ? 1 : 0)}/{readProgress.total} pages read
                    </p>
                  )}
                </div>
              </div>

              {!isRead ? (
                <Button
                  size="sm"
                  onClick={markAsRead}
                  disabled={marking}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shrink-0"
                >
                  {marking ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  Mark as Read · +5 XP
                </Button>
              ) : (
                <span className="text-xs font-medium text-emerald-600 shrink-0">
                  {xpAwarded ? "+5 XP earned!" : "Completed"}
                </span>
              )}
            </div>

            {/* Progress bar */}
            {readProgress && readProgress.total > 0 && (
              <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((readProgress.read + (isRead && !initialIsRead ? 1 : 0)) / readProgress.total) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4 pb-8">
          {prevPage ? (
            <Link href={`/docs/${lang}/${prevPage.slug}`}>
              <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:bg-slate-50 gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                {prevPage.title}
              </Button>
            </Link>
          ) : (
            <div />
          )}
          {nextPage ? (
            <Link href={`/docs/${lang}/${nextPage.slug}`}>
              <Button size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                {nextPage.title}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          ) : (
            <Link href="/docs">
              <Button variant="outline" size="sm" className="rounded-xl border-slate-200">
                Back to docs
              </Button>
            </Link>
          )}
        </div>
      </div>
      <TableOfContents items={headings} />
      </div>
    </div>
  );
}
