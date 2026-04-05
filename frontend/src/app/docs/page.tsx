import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Documentation | CodeGraph",
  description: "Free programming documentation and tutorials",
};

const LANGUAGES = [
  {
    lang: "python",
    name: "Python",
    description: "Learn Python from basics to advanced. Variables, loops, functions, OOP, file handling, and more.",
    color: "bg-blue-500",
    icon: "🐍",
  },
  {
    lang: "javascript",
    name: "JavaScript",
    description: "Master JavaScript fundamentals. DOM, async/await, closures, ES6+, and modern web development.",
    color: "bg-yellow-500",
    icon: "⚡",
  },
  {
    lang: "java",
    name: "Java",
    description: "Complete Java guide. OOP, collections, generics, file I/O, threads, and data structures.",
    color: "bg-red-500",
    icon: "☕",
  },
  {
    lang: "sql",
    name: "SQL",
    description: "Database querying mastery. SELECT, JOINs, subqueries, indexes, transactions, and optimization.",
    color: "bg-cyan-500",
    icon: "🗄️",
  },
  {
    lang: "langchain",
    name: "LangChain",
    description: "Build AI applications. Chains, agents, RAG pipelines, embeddings, vector stores, and LangGraph.",
    color: "bg-purple-500",
    icon: "🤖",
  },
];

export default async function DocsPage() {
  const supabase = await createClient();

  const { data: counts } = await supabase
    .from("doc_topics")
    .select("lang");

  const langCounts = new Map<string, number>();
  for (const row of counts ?? []) {
    langCounts.set(row.lang, (langCounts.get(row.lang) || 0) + 1);
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Documentation</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Free, comprehensive programming references. Learn at your own pace — no account required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LANGUAGES.map((l) => {
            const pageCount = langCounts.get(l.lang) || 0;
            return (
              <Link
                key={l.lang}
                href={pageCount > 0 ? `/docs/${l.lang}` : "#"}
                className={`group block rounded-2xl border border-slate-200 p-6 transition-all hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 ${
                  pageCount === 0 ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-10 w-10 rounded-xl ${l.color} flex items-center justify-center text-lg`}>
                    {l.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {l.name}
                    </h2>
                    <span className="text-xs text-slate-400">
                      {pageCount > 0 ? `${pageCount} topics` : "Coming soon"}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{l.description}</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
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
