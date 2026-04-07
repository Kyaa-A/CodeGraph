import { createClient } from "@/lib/supabase/server";
import { CourseCard } from "@/components/course-card";
import { AuthGate } from "@/components/auth-gate";
import type { Course } from "@/lib/supabase/types";

export const revalidate = 300; // cache for 5 minutes

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
      <div className="max-w-7xl mx-auto px-4 py-12 pt-28">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-red-600 font-medium">Failed to load courses.</p>
          <p className="text-sm text-slate-500 mt-2">Please try again later.</p>
        </div>
      </div>
    );
  }

  const typedCourses = (courses ?? []) as Course[];

  // Fetch lesson counts per course
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, course_id");
  const lessonCountMap = new Map<string, number>();
  const lessonToCourse = new Map<string, string>();
  for (const l of lessons ?? []) {
    lessonCountMap.set(l.course_id, (lessonCountMap.get(l.course_id) ?? 0) + 1);
    lessonToCourse.set(l.id, l.course_id);
  }

  // Fetch user progress if logged in
  const { data: { user } } = await supabase.auth.getUser();
  const progressMap = new Map<string, number>();
  if (user) {
    const { data: completions } = await supabase
      .from("user_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .eq("completed", true);
    for (const c of completions ?? []) {
      const courseId = lessonToCourse.get(c.lesson_id);
      if (courseId) {
        progressMap.set(courseId, (progressMap.get(courseId) ?? 0) + 1);
      }
    }
  }

  return (
    <AuthGate>
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Explore Our Courses
            </h1>
            <p className="mt-2 text-slate-500 text-sm sm:text-lg max-w-2xl">
              Master AI development through hands-on, project-based learning.
              Build real applications with LangChain, LangGraph, and cutting-edge tools.
            </p>
          </div>

          {/* Course Grid */}
          {typedCourses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
                <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
              <p className="text-slate-500">
                Check back soon! We're working on exciting AI development courses for you.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {typedCourses.map((course) => {
                const total = lessonCountMap.get(course.id) ?? 0;
                const completed = progressMap.get(course.id) ?? 0;
                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    progress={total > 0 ? { completed, total } : null}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
