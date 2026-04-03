import { createClient } from "@/lib/supabase/server";
import { CourseCard } from "@/components/course-card";
import type { Course } from "@/lib/supabase/types";

export const metadata = {
  title: "Courses | CodeGraph",
  description: "Browse AI development courses",
};

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-destructive">Failed to load courses.</p>
      </div>
    );
  }

  const typedCourses = (courses ?? []) as Course[];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
        <p className="mt-2 text-muted-foreground">
          Learn AI development by building real projects
        </p>
      </div>

      {typedCourses.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            No courses available yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {typedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
