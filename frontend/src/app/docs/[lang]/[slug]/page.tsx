import { notFound } from "next/navigation";
import Link from "next/link";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { withTimeout } from "@/lib/utils";
import { DocSidebar } from "./doc-sidebar";
import { DocViewer } from "./doc-viewer";
import type { DocTopic } from "@/lib/supabase/types";

export const revalidate = 600; // cache 10 min

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
  kotlin: "Kotlin",
  ruby: "Ruby",
  swift: "Swift",
};

// Deduplicate Supabase calls between generateMetadata and page function
const getDocData = cache(async (lang: string) => {
  const supabase = await createClient();
  // Only fetch metadata for sidebar — NOT content for all pages
  const [{ data: sidebarPages }, { data: { user } }] = await Promise.all([
    supabase
      .from("doc_topics")
      .select("id, slug, title, section, order_index")
      .eq("lang", lang)
      .order("order_index", { ascending: true }),
    supabase.auth.getUser(),
  ]);
  return { sidebarPages, user };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const { sidebarPages } = await getDocData(lang);
  const page = (sidebarPages ?? []).find((p) => p.slug === slug);

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

  // Sidebar is cached and shared with generateMetadata via React `cache()`
  const [{ sidebarPages, user }, { data: currentPageData }] = await withTimeout(
    Promise.all([
      getDocData(lang),
      Promise.resolve(
        supabase
          .from("doc_topics")
          .select("id, slug, title, section, order_index, content")
          .eq("lang", lang)
          .eq("slug", slug)
          .single()
      ),
    ]),
    8000
  );

  const allPages = sidebarPages;

  if (!allPages || allPages.length === 0 || !currentPageData) {
    notFound();
  }

  const typed = allPages as Pick<DocTopic, "id" | "slug" | "title" | "section" | "order_index">[];
  const currentPage = currentPageData as DocTopic;

  // Fetch read status for logged-in user
  let readSlugs = new Set<string>();
  if (user) {
    const topicIds = typed.map((p) => p.id);
    const { data: reads } = await supabase
      .from("doc_reads")
      .select("doc_topic_id")
      .eq("user_id", user.id)
      .in("doc_topic_id", topicIds);
    const readIds = new Set((reads ?? []).map((r: { doc_topic_id: string }) => r.doc_topic_id));
    for (const p of typed) {
      if (readIds.has(p.id)) readSlugs.add(p.slug);
    }
  }

  const sectionMap = new Map<string, { slug: string; title: string; isRead: boolean }[]>();
  for (const p of typed) {
    if (!sectionMap.has(p.section)) {
      sectionMap.set(p.section, []);
    }
    sectionMap.get(p.section)!.push({ slug: p.slug, title: p.title, isRead: readSlugs.has(p.slug) });
  }
  const sections = [...sectionMap.entries()].map(([section, pages]) => ({
    section,
    pages,
  }));

  const currentIsRead = readSlugs.has(slug);
  const totalRead = readSlugs.size;
  const totalPages = typed.length;

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
            <Link href="/docs" className="text-slate-400 hover:text-slate-600 transition-colors">Docs</Link>
            <span className="text-slate-300">/</span>
            <Link href={`/docs/${lang}`} className="text-slate-400 hover:text-slate-600 transition-colors">{LANG_NAMES[lang] || lang}</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 font-medium truncate">{currentPage.title}</span>
          </div>

          <DocViewer
            content={currentPage.content}
            lang={lang}
            prevPage={prevPage}
            nextPage={nextPage}
            docTopicId={currentPage.id}
            isRead={currentIsRead}
            isAuthenticated={!!user}
            readProgress={{ read: totalRead, total: totalPages }}
          />
        </div>
      </div>
    </div>
  );
}
