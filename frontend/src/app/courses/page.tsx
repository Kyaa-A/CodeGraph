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
      <div className="max-w-7xl mx-auto px-4 py-12 pt-28">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-red-600 font-medium">Failed to load courses.</p>
          <p className="text-sm text-slate-500 mt-2">Please try again later.</p>
        </div>
      </div>
    );
  }

  const typedCourses = (courses ?? []) as Course[];

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Explore Our Courses
          </h1>
          <p className="mt-2 text-slate-500 text-lg max-w-2xl">
            Master AI development through hands-on, project-based learning.
            Build real applications with LangChain, LangGraph, and cutting-edge tools.
          </p>
        </div>

        {/* Course Grid */}
        {typedCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center">
              <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
            {typedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
