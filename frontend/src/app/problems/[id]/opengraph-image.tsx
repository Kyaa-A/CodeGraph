import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const diffColors: Record<string, { bg: string; text: string }> = {
  easy: { bg: "rgba(16, 185, 129, 0.15)", text: "#34d399" },
  medium: { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24" },
  hard: { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171" },
};

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("problems")
    .select("title, difficulty, tags")
    .eq("id", id)
    .single();

  const title = data?.title || "Coding Problem";
  const difficulty = data?.difficulty || "medium";
  const tags = data?.tags?.slice(0, 3) || [];
  const color = diffColors[difficulty] || diffColors.medium;

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
              background: color.bg,
              borderRadius: "999px",
              color: color.text,
              fontSize: "18px",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {difficulty}
          </div>
          {tags.map((tag: string) => (
            <div
              key={tag}
              style={{
                padding: "8px 12px",
                background: "rgba(100, 116, 139, 0.15)",
                borderRadius: "8px",
                color: "#94a3b8",
                fontSize: "16px",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
        <div
          style={{
            fontSize: "52px",
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
          CodeGraph Problems
        </div>
      </div>
    ),
    { ...size }
  );
}
