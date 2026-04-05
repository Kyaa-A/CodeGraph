"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { LessonViewer } from "@/components/lesson-viewer";
import { Button } from "@/components/ui/button";

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
}: {
  content: string;
  lang: string;
  prevPage: { slug: string; title: string } | null;
  nextPage: { slug: string; title: string } | null;
}) {
  const headings = useMemo(() => extractHeadings(content), [content]);

  return (
    <div id="doc-scroll-area" className="flex-1 overflow-y-auto">
      <div className="flex">
      <div className="p-6 lg:p-8 max-w-3xl min-w-0 flex-1">
        <LessonViewer content={content} />

        <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between gap-4 pb-8">
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
