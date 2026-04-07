"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface SearchItem {
  lang: string;
  slug: string;
  title: string;
  section: string;
}

const LANG_NAMES: Record<string, string> = {
  python: "Python", javascript: "JavaScript", typescript: "TypeScript",
  react: "React", "html-css": "HTML & CSS", java: "Java", sql: "SQL",
  go: "Go", rust: "Rust", c: "C", cpp: "C++", csharp: "C#",
  php: "PHP", nodejs: "Node.js", langchain: "LangChain",
};

export function DocSearch({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = query.length >= 2
    ? items.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.section.toLowerCase().includes(q) ||
          item.lang.toLowerCase().includes(q) ||
          (LANG_NAMES[item.lang] || "").toLowerCase().includes(q)
        );
      }).slice(0, 12)
    : [];

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const navigate = useCallback(
    (item: SearchItem) => {
      setOpen(false);
      setQuery("");
      router.push(`/docs/${item.lang}/${item.slug}`);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIdx]) {
      navigate(results[selectedIdx]);
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search docs..."
          className="w-full pl-11 pr-20 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
        />
        <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 bg-white/10 border border-white/20 rounded-md text-[10px] text-slate-400 font-mono">
          ⌘K
        </kbd>
      </div>

      {/* Results dropdown */}
      {open && results.length > 0 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden max-h-[400px] overflow-y-auto">
            {results.map((item, i) => (
              <button
                key={`${item.lang}-${item.slug}`}
                onClick={() => navigate(item)}
                onMouseEnter={() => setSelectedIdx(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  i === selectedIdx ? "bg-emerald-50" : "hover:bg-slate-50"
                }`}
              >
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Image
                    src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${item.lang === "html-css" ? "html5/html5" : item.lang === "nodejs" ? "nodejs/nodejs" : item.lang === "cpp" ? "cplusplus/cplusplus" : item.lang === "csharp" ? "csharp/csharp" : item.lang === "langchain" ? "python/python" : `${item.lang}/${item.lang}`}-original.svg`}
                    alt={`${LANG_NAMES[item.lang] || item.lang} icon`}
                    width={16}
                    height={16}
                    className="h-4 w-4"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {LANG_NAMES[item.lang] || item.lang} · {item.section}
                  </p>
                </div>
                {i === selectedIdx && (
                  <kbd className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono shrink-0">↵</kbd>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {open && query.length >= 2 && results.length === 0 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-6 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700 mb-1">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-xs text-slate-400">Try a different keyword or browse by language below</p>
          </div>
        </>
      )}
    </div>
  );
}
