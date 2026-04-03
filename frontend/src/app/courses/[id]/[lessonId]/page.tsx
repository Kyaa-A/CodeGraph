import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LessonViewer } from "@/components/lesson-viewer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LessonClientShell } from "./lesson-client-shell";
import type { Lesson } from "@/lib/supabase/types";

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

  const lessons = (allLessons ?? []) as Pick<
    Lesson,
    "id" | "title" | "order_index"
  >[];
  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <LessonClientShell lessonId={lessonId} courseId={id}>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/courses" className="hover:text-foreground">
            Courses
          </Link>
          <span>/</span>
          <Link href={`/courses/${id}`} className="hover:text-foreground">
            Course
          </Link>
          <span>/</span>
          <span className="text-foreground">{typedLesson.title}</span>
        </nav>

        <h1 className="mb-6 text-3xl font-bold tracking-tight">
          {typedLesson.title}
        </h1>

        <Separator className="my-6" />

        {/* Lesson content */}
        <div className="mx-auto max-w-3xl">
          <LessonViewer content={typedLesson.content} />
        </div>

        <Separator className="my-8" />

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {prevLesson ? (
            <Link href={`/courses/${id}/${prevLesson.id}`}>
              <Button variant="outline">Previous: {prevLesson.title}</Button>
            </Link>
          ) : (
            <div />
          )}
          {nextLesson ? (
            <Link href={`/courses/${id}/${nextLesson.id}`}>
              <Button>Next: {nextLesson.title}</Button>
            </Link>
          ) : (
            <Link href={`/courses/${id}`}>
              <Button variant="outline">Back to course</Button>
            </Link>
          )}
        </div>
      </div>
    </LessonClientShell>
  );
}
