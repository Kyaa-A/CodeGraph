import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LANG_NAMES: Record<string, string> = {
  python: "Python", javascript: "JavaScript", typescript: "TypeScript",
  react: "React", "html-css": "HTML & CSS", java: "Java", sql: "SQL",
  go: "Go", rust: "Rust", c: "C", cpp: "C++", csharp: "C#",
  php: "PHP", nodejs: "Node.js", langchain: "LangChain",
  kotlin: "Kotlin", ruby: "Ruby", swift: "Swift",
};

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("doc_topics")
    .select("title, section")
    .eq("lang", lang)
    .eq("slug", slug)
    .single();

  const title = data?.title || slug;
  const langName = LANG_NAMES[lang] || lang;
  const section = data?.section || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div
            style={{
              padding: "8px 16px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "999px",
              color: "#34d399",
              fontSize: "18px",
              fontWeight: 600,
            }}
          >
            {langName}
          </div>
          {section && (
            <div style={{ color: "#64748b", fontSize: "18px" }}>/ {section}</div>
          )}
        </div>
        <div
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "white",
            lineHeight: 1.2,
            marginBottom: "24px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#94a3b8",
            fontSize: "22px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "#171717",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#10b981",
              fontWeight: 700,
              fontSize: "16px",
            }}
          >
            CG
          </div>
          CodeGraph Docs
        </div>
      </div>
    ),
    { ...size }
  );
}
