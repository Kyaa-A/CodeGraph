import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { Course, Lesson } from "@/lib/supabase/types";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (courseError || !course) {
    notFound();
  }

  const typedCourse = course as Course;

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", id)
    .order("order_index", { ascending: true });

  const typedLessons = (lessons ?? []) as Lesson[];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            {typedCourse.title}
          </h1>
          <Badge variant={typedCourse.is_free ? "secondary" : "default"}>
            {typedCourse.is_free ? "Free" : `$${typedCourse.price}`}
          </Badge>
        </div>
        <p className="mt-3 text-lg text-muted-foreground">
          {typedCourse.description}
        </p>
      </div>

      <Separator className="my-6" />

      <div>
        <h2 className="mb-4 text-xl font-semibold">
          Lessons ({typedLessons.length})
        </h2>
        {typedLessons.length === 0 ? (
          <p className="text-muted-foreground">
            No lessons yet for this course.
          </p>
        ) : (
          <div className="space-y-2">
            {typedLessons.map((lesson, index) => (
              <Link
                key={lesson.id}
                href={`/courses/${id}/${lesson.id}`}
                className="block"
              >
                <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{lesson.title}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Start
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
