import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocSidebar } from "./doc-sidebar";
import { DocViewer } from "./doc-viewer";
import type { DocTopic } from "@/lib/supabase/types";

const LANG_NAMES: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  react: "React",
  "html-css": "HTML & CSS",
  java: "Java",
  sql: "SQL",
  go: "Go",
  rust: "Rust",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  php: "PHP",
  nodejs: "Node.js",
  langchain: "LangChain",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("doc_topics")
    .select("title")
    .eq("lang", lang)
    .eq("slug", slug)
    .single();

  return {
    title: page ? `${page.title} - ${LANG_NAMES[lang] || lang} | CodeGraph Docs` : "Docs | CodeGraph",
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const supabase = await createClient();

  const { data: allPages } = await supabase
    .from("doc_topics")
    .select("slug, title, section, order_index, content")
    .eq("lang", lang)
    .order("order_index", { ascending: true });

  if (!allPages || allPages.length === 0) {
    notFound();
  }

  const typed = allPages as DocTopic[];

  const currentPage = typed.find((p) => p.slug === slug);
  if (!currentPage) {
    notFound();
  }

  const sectionMap = new Map<string, { slug: string; title: string }[]>();
  for (const p of typed) {
    if (!sectionMap.has(p.section)) {
      sectionMap.set(p.section, []);
    }
    sectionMap.get(p.section)!.push({ slug: p.slug, title: p.title });
  }
  const sections = [...sectionMap.entries()].map(([section, pages]) => ({
    section,
    pages,
  }));

  const currentIdx = typed.findIndex((p) => p.slug === slug);
  const prevPage = currentIdx > 0 ? { slug: typed[currentIdx - 1].slug, title: typed[currentIdx - 1].title } : null;
  const nextPage = currentIdx < typed.length - 1 ? { slug: typed[currentIdx + 1].slug, title: typed[currentIdx + 1].title } : null;

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="fixed top-[72px] left-0 right-0 bottom-0 flex">
        <DocSidebar
          lang={lang}
          currentSlug={slug}
          sections={sections}
          langName={LANG_NAMES[lang] || lang}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 bg-slate-50/50 text-sm lg:px-6">
            <a href="/docs" className="text-slate-400 hover:text-slate-600 transition-colors">Docs</a>
            <span className="text-slate-300">/</span>
            <a href={`/docs/${lang}`} className="text-slate-400 hover:text-slate-600 transition-colors">{LANG_NAMES[lang] || lang}</a>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 font-medium truncate">{currentPage.title}</span>
          </div>

          <DocViewer
            content={currentPage.content}
            lang={lang}
            prevPage={prevPage}
            nextPage={nextPage}
          />
        </div>
      </div>
    </div>
  );
}
