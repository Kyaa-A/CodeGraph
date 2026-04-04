import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LessonClientShell } from "./lesson-client-shell";
import type { Lesson } from "@/lib/supabase/types";

export const metadata = {
  title: "Lesson | CodeGraph",
  description: "Course lesson content",
};

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  const supabase = await createClient();

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (error || !lesson) {
    notFound();
  }

  const typedLesson = lesson as Lesson;

  // Get adjacent lessons for navigation
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, title, order_index")
    .eq("course_id", id)
    .order("order_index", { ascending: true });

  const lessons = (allLessons ?? []) as Pick<Lesson, "id" | "title" | "order_index">[];
  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  // Fetch real completion data
  const { data: { user } } = await supabase.auth.getUser();
  let completedLessonIds = new Set<string>();
  if (user) {
    const { data: progress } = await supabase
      .from("user_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .eq("completed", true)
      .in("lesson_id", lessons.map((l) => l.id));
    if (progress) {
      completedLessonIds = new Set(progress.map((p: { lesson_id: string }) => p.lesson_id));
    }
  }
  const completedCount = completedLessonIds.size;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  const completedIds = Array.from(completedLessonIds);

  return (
    <LessonClientShell
      lessonId={lessonId}
      courseId={id}
      lessonContent={typedLesson.content}
      starterCode={typedLesson.starter_code || ""}
      language={typedLesson.language || "python"}
      lessons={lessons}
      currentIndex={currentIndex}
      prevLesson={prevLesson}
      nextLesson={nextLesson}
      completedIds={completedIds}
      completedCount={completedCount}
      progressPercent={progressPercent}
    />
  );
}
