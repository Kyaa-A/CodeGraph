import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { success } = rateLimit(`bookmark:${user.id}`, 30, 60_000);
    if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const { problemId } = await req.json();
    if (!problemId) return NextResponse.json({ error: "Missing problemId" }, { status: 400 });

    // Toggle: if bookmark exists, delete it; otherwise insert
    const { data: existing } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("problem_id", problemId)
      .single();

    if (existing) {
      await supabase.from("bookmarks").delete().eq("id", existing.id);
      return NextResponse.json({ bookmarked: false });
    }

    await supabase.from("bookmarks").insert({ user_id: user.id, problem_id: problemId });
    return NextResponse.json({ bookmarked: true });
  } catch (error) {
    console.error("Bookmarks POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
