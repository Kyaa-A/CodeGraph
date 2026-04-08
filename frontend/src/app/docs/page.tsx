import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { DocSearch } from "./doc-search";

export const revalidate = 600; // cache for 10 minutes

export const metadata = {
  title: "Documentation | CodeGraph",
  description: "Free programming documentation and tutorials for 18+ languages",
};

/* ── Language logos from CDN ── */
const LOGO_URLS: Record<string, string> = {
  python: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  javascript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  typescript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  react: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  "html-css": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  java: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  sql: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  go: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg",
  rust: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg",
  c: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
  cpp: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
  csharp: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg",
  php: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
  nodejs: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  langchain: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  kotlin: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg",
  ruby: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg",
  swift: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg",
};

function LangLogo({ lang, className = "h-full w-full" }: { lang: string; className?: string }) {
  const url = LOGO_URLS[lang];
  if (!url) return null;
  return <Image src={url} alt={lang} width={32} height={32} className={className} />;
}

/* ── Language data grouped by category ── */
const CATEGORIES = [
  {
    title: "Web Development",
    description: "Build websites and web applications",
    languages: [
      { lang: "html-css", name: "HTML & CSS", description: "Semantic HTML, Flexbox, Grid, responsive design" },
      { lang: "javascript", name: "JavaScript", description: "DOM, async/await, closures, ES6+" },
      { lang: "typescript", name: "TypeScript", description: "Interfaces, generics, utility types" },
      { lang: "react", name: "React", description: "Components, hooks, state, Next.js" },
      { lang: "nodejs", name: "Node.js", description: "Express, REST APIs, streams" },
      { lang: "php", name: "PHP", description: "Server-side web, OOP, PDO" },
    ],
  },
  {
    title: "Programming Languages",
    description: "Core languages for software development",
    languages: [
      { lang: "python", name: "Python", description: "Variables, OOP, file handling, advanced" },
      { lang: "java", name: "Java", description: "OOP, collections, generics, threads" },
      { lang: "c", name: "C", description: "Pointers, memory, structs, file I/O" },
      { lang: "cpp", name: "C++", description: "Classes, templates, STL, smart pointers" },
      { lang: "csharp", name: "C#", description: "LINQ, generics, async, .NET" },
      { lang: "go", name: "Go", description: "Goroutines, channels, interfaces" },
      { lang: "rust", name: "Rust", description: "Ownership, borrowing, lifetimes, traits" },
      { lang: "kotlin", name: "Kotlin", description: "Null safety, coroutines, data classes, extensions" },
      { lang: "ruby", name: "Ruby", description: "Blocks, procs, metaprogramming, Rails" },
      { lang: "swift", name: "Swift", description: "Optionals, protocols, closures, SwiftUI" },
    ],
  },
  {
    title: "Data & AI",
    description: "Databases, data science, and AI frameworks",
    languages: [
      { lang: "sql", name: "SQL", description: "JOINs, subqueries, indexes, optimization" },
      { lang: "langchain", name: "LangChain", description: "Chains, agents, RAG, embeddings" },
    ],
  },
];

export default async function DocsPage() {
  const supabase = await createClient();

  const { data: allTopics } = await supabase
    .from("doc_topics")
    .select("lang, slug, title, section")
    .order("order_index", { ascending: true });

  const topics = (allTopics ?? []) as { lang: string; slug: string; title: string; section: string }[];

  const langCounts = new Map<string, number>();
  const langFirstSlug = new Map<string, string>();
  for (const row of topics) {
    langCounts.set(row.lang, (langCounts.get(row.lang) || 0) + 1);
    if (!langFirstSlug.has(row.lang)) langFirstSlug.set(row.lang, row.slug);
  }

  const totalPages = Array.from(langCounts.values()).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-6">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {totalPages}+ pages across {langCounts.size} languages
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Learn to Code
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-6">
            Free, comprehensive programming references. No account required.
          </p>

          {/* Search */}
          <div className="mb-8">
            <DocSearch items={topics} />
          </div>

          {/* Popular quick links */}
          <div className="flex flex-wrap justify-center gap-2">
            {["python", "javascript", "java", "sql", "react", "typescript"].map((lang) => {
              const count = langCounts.get(lang) || 0;
              if (count === 0) return null;
              const name = CATEGORIES.flatMap((c) => c.languages).find((l) => l.lang === lang)?.name ?? lang;
              return (
                <Link
                  key={lang}
                  href={`/docs/${lang}/${langFirstSlug.get(lang)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <div className="h-5 w-5 shrink-0 overflow-hidden rounded-sm"><LangLogo lang={lang} /></div>
                  {name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-16 space-y-12">
        {CATEGORIES.map((cat) => (
          <section key={cat.title}>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900">{cat.title}</h2>
              <p className="text-sm text-slate-500">{cat.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {cat.languages.map((l) => {
                const pageCount = langCounts.get(l.lang) || 0;
                const available = pageCount > 0;

                return (
                  <Link
                    key={l.lang}
                    href={available ? `/docs/${l.lang}/${langFirstSlug.get(l.lang)}` : "#"}
                    className={`group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                      available
                        ? "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1"
                        : "bg-slate-50 border-slate-100 opacity-50 pointer-events-none"
                    }`}
                  >
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md"><LangLogo lang={l.lang} /></div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors text-sm">
                        {l.name}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">{l.description}</p>
                      <span className="text-xs text-slate-400 mt-0.5 block">
                        {available ? `${pageCount} topics` : "Coming soon"}
                      </span>
                    </div>
                    {available && (
                      <svg className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 shrink-0 ml-auto transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {/* Bottom CTA */}
        <div className="text-center pt-4 pb-8">
          <p className="text-sm text-slate-400">
            Want interactive lessons with a code editor?{" "}
            <Link href="/courses" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Check out our courses →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
