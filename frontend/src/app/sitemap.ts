import { createClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://codegraph.dev";

export default async function sitemap() {
  const supabase = await createClient();

  // Static pages
  const staticPages = [
    { url: `${BASE_URL}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${BASE_URL}/docs`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/courses`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/problems`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${BASE_URL}/playground`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE_URL}/leaderboard`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
  ];

  // Doc language index pages
  const { data: docLangs } = await supabase.from("doc_topics").select("lang");
  const uniqueLangs = [...new Set((docLangs ?? []).map((d) => d.lang))];
  const langPages = uniqueLangs.map((lang) => ({
    url: `${BASE_URL}/docs/${lang}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Individual doc pages
  const { data: docTopics } = await supabase.from("doc_topics").select("lang, slug");
  const docPages = (docTopics ?? []).map((doc) => ({
    url: `${BASE_URL}/docs/${doc.lang}/${doc.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Problem pages
  const { data: problems } = await supabase.from("problems").select("id");
  const problemPages = (problems ?? []).map((p) => ({
    url: `${BASE_URL}/problems/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Course pages
  const { data: courses } = await supabase.from("courses").select("id");
  const coursePages = (courses ?? []).map((c) => ({
    url: `${BASE_URL}/courses/${c.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...langPages, ...docPages, ...problemPages, ...coursePages];
}
