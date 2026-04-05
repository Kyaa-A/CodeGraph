"use client";

import { useState } from "react";
import Link from "next/link";

interface SidebarSection {
  section: string;
  pages: { slug: string; title: string }[];
}

export function DocSidebar({
  lang,
  currentSlug,
  sections,
  langName,
}: {
  lang: string;
  currentSlug: string;
  sections: SidebarSection[];
  langName: string;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (section: string) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-slate-100 shrink-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <Link
          href="/docs"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors group"
        >
          <svg className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All Languages
        </Link>
        <h2 className="text-sm font-bold text-slate-900 mt-2">{langName} Documentation</h2>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {sections.map((s) => {
          const isCollapsed = collapsed[s.section] ?? false;

          return (
            <div key={s.section} className="mb-1">
              <button
                onClick={() => toggle(s.section)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
              >
                {s.section}
                <svg
                  className={`h-3.5 w-3.5 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {!isCollapsed && (
                <div className="space-y-0.5">
                  {s.pages.map((p) => {
                    const isActive = p.slug === currentSlug;
                    return (
                      <Link key={p.slug} href={`/docs/${lang}/${p.slug}`}>
                        <div
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 font-medium border-l-[3px] border-emerald-500 pl-[9px]"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          {p.title}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
