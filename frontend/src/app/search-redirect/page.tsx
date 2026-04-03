import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SearchRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ lesson_id?: string }>;
}) {
  const { lesson_id } = await searchParams;

  if (!lesson_id) {
    redirect("/courses");
  }

  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("course_id")
    .eq("id", lesson_id)
    .single();

  if (lesson) {
    redirect(`/courses/${lesson.course_id}/${lesson_id}`);
  }

  redirect("/courses");
}
