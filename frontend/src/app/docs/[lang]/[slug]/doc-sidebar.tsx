"use client";

import { useState } from "react";
import Link from "next/link";

interface SidebarSection {
  section: string;
  pages: { slug: string; title: string; isRead?: boolean }[];
}

function SidebarContent({
  lang,
  currentSlug,
  sections,
  langName,
  expanded,
  toggle,
  onNavigate,
}: {
  lang: string;
  currentSlug: string;
  sections: SidebarSection[];
  langName: string;
  expanded: Record<string, boolean>;
  toggle: (section: string) => void;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <Link
          href="/docs"
          onClick={onNavigate}
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
          const isOpen = expanded[s.section] ?? false;

          return (
            <div key={s.section} className="mb-1">
              <button
                onClick={() => toggle(s.section)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
              >
                {s.section}
                <svg
                  className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-90" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {isOpen && (
                <div className="space-y-0.5">
                  {s.pages.map((p) => {
                    const isActive = p.slug === currentSlug;
                    return (
                      <Link key={p.slug} href={`/docs/${lang}/${p.slug}`} onClick={onNavigate}>
                        <div
                          className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 font-medium border-l-[3px] border-emerald-500 pl-[9px]"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <span className="truncate flex-1">{p.title}</span>
                          {p.isRead && (
                            <svg className="h-3.5 w-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
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
    </>
  );
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
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const s of sections) {
      const containsCurrent = s.pages.some((p) => p.slug === currentSlug);
      initial[s.section] = containsCurrent;
    }
    return initial;
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = (section: string) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-slate-100 shrink-0 overflow-hidden">
        <SidebarContent
          lang={lang}
          currentSlug={currentSlug}
          sections={sections}
          langName={langName}
          expanded={expanded}
          toggle={toggle}
        />
      </aside>

      {/* Mobile menu button - shown in breadcrumb area */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-50 h-12 w-12 rounded-full bg-slate-900 text-white shadow-lg flex items-center justify-center hover:bg-slate-800 transition-colors"
        aria-label="Open navigation"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] bg-white flex flex-col shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SidebarContent
              lang={lang}
              currentSlug={currentSlug}
              sections={sections}
              langName={langName}
              expanded={expanded}
              toggle={toggle}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  );
}
