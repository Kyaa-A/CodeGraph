import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const { success } = rateLimit(`stats:${ip}`, 60, 60_000);
    if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const supabase = await createClient();

    const [coursesRes, problemsRes, docLangsRes] = await Promise.all([
      supabase.from("courses").select("id", { count: "exact", head: true }),
      supabase.from("problems").select("id", { count: "exact", head: true }),
      supabase.from("doc_topics").select("lang"),
    ]);

    const courseCount = coursesRes.count ?? 0;
    const problemCount = problemsRes.count ?? 0;

    // Count unique doc languages
    const docLangs = new Set((docLangsRes.data ?? []).map((d) => d.lang));

    return NextResponse.json({
      courses: courseCount,
      problems: problemCount,
      languages: docLangs.size,
    });
  } catch (error) {
    console.error("Stats GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
