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

/* ── SVG icons for non-language topics ── */
const TOPIC_ICONS: Record<string, React.ReactNode> = {
  "ai-models": (
    <svg className="h-full w-full text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  ),
  "prompt-engineering": (
    <svg className="h-full w-full text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  "claude-code": (
    <svg className="h-full w-full text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  "ai-coding-tools": (
    <svg className="h-full w-full text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  ),
  plugins: (
    <svg className="h-full w-full text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
    </svg>
  ),
  mcp: (
    <svg className="h-full w-full text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
    </svg>
  ),
  "ai-cli": (
    <svg className="h-full w-full text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3M3 20.25V3.75A2.25 2.25 0 015.25 1.5h13.5A2.25 2.25 0 0121 3.75v16.5A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 20.25z" />
    </svg>
  ),
};

function LangLogo({ lang, className = "h-full w-full" }: { lang: string; className?: string }) {
  if (TOPIC_ICONS[lang]) {
    return <div className={className}>{TOPIC_ICONS[lang]}</div>;
  }
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
  {
    title: "AI Models & Prompting",
    description: "Understand and use large language models effectively",
    languages: [
      { lang: "ai-models", name: "AI Models", description: "LLMs, model comparison, APIs, tool use" },
      { lang: "prompt-engineering", name: "Prompt Engineering", description: "Chain of thought, few-shot, output formatting" },
    ],
  },
  {
    title: "AI Coding Tools",
    description: "Tools that write, review, and debug code with you",
    languages: [
      { lang: "claude-code", name: "Claude Code", description: "The AI coding CLI — setup, workflows, plugins" },
      { lang: "ai-coding-tools", name: "AI Coding Tools", description: "Cursor, Copilot, Windsurf, and more" },
      { lang: "plugins", name: "Plugins & Extensions", description: "Superpowers, open-source plugins, building your own" },
    ],
  },
  {
    title: "Infrastructure & Automation",
    description: "Connect AI tools to your systems and workflows",
    languages: [
      { lang: "mcp", name: "MCPs", description: "Model Context Protocol — servers, tools, resources" },
      { lang: "ai-cli", name: "CLI & Automation", description: "Terminal AI workflows, scripting, CI/CD" },
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
      <div className="bg-gradient-to-br from-emerald-50 via-slate-50 to-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-14 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 border border-emerald-200 rounded-full text-emerald-700 text-sm font-medium mb-6">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {totalPages}+ pages across {langCounts.size} topics
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Learn to Code & Build with AI
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto mb-6">
            Free programming references, AI tool guides, and developer resources. No account required.
          </p>

          {/* Search */}
          <div className="mb-8">
            <DocSearch items={topics} />
          </div>

          {/* Popular quick links */}
          <div className="flex flex-wrap justify-center gap-2">
            {["python", "javascript", "claude-code", "mcp", "sql", "ai-models"].map((lang) => {
              const count = langCounts.get(lang) || 0;
              if (count === 0) return null;
              const name = CATEGORIES.flatMap((c) => c.languages).find((l) => l.lang === lang)?.name ?? lang;
              return (
                <Link
                  key={lang}
                  href={`/docs/${lang}/${langFirstSlug.get(lang)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-sm"
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
