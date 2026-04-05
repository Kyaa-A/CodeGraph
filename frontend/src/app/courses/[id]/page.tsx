import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Course } from "@/lib/supabase/types";
import { LessonList } from "./lesson-list";
import { AdminOnly } from "@/components/admin-only";
import { AuthGate } from "@/components/auth-gate";
import { LottieAnimation } from "@/components/lottie-animation";
import { LOTTIE } from "@/lib/lottie-assets";

export const metadata = {
  title: "Course | CodeGraph",
  description: "Course details and lessons",
};

// Helper to get course image
function getCourseImage(course: Course): string {
  if (course.thumbnail_url) return course.thumbnail_url;

  // Title-based keyword matching
  const title = course.title.toLowerCase();
  const images: Record<string, string> = {
    python: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=800&auto=format&fit=crop",
    javascript: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=800&auto=format&fit=crop",
    react: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",
    nextjs: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=800&auto=format&fit=crop",
    ai: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop",
    langchain: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop",
    database: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=800&auto=format&fit=crop",
    backend: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop",
    frontend: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
  };

  for (const [keyword, url] of Object.entries(images)) {
    if (title.includes(keyword)) return url;
  }
  return "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=800&auto=format&fit=crop";
}

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
  const courseImage = getCourseImage(typedCourse);

  // Get user progress for this course
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let completedLessonIds = new Set<string>();
  if (user) {
    const { data: progress } = await supabase
      .from("user_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .eq("completed", true);

    completedLessonIds = new Set(
      (progress ?? []).map((p: { lesson_id: string }) => p.lesson_id)
    );
  }

  // Get lessons ordered by index
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", id)
    .order("order_index", { ascending: true });

  const lessonIds = (allLessons ?? []).map((l: { id: string }) => l.id);
  const totalLessons = lessonIds.length;
  const completedCount = lessonIds.filter((lid: string) => completedLessonIds.has(lid)).length;
  const hasProgress = completedCount > 0;

  // Next uncompleted lesson, or first lesson
  const nextLessonId = lessonIds.find((lid: string) => !completedLessonIds.has(lid)) ?? lessonIds[0];
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <AuthGate>
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <Link 
          href="/courses" 
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6 group"
        >
          <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Courses
        </Link>

        {/* Course Header Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-10">
          <div className="flex flex-col lg:flex-row">
            {/* Course Image */}
            <div className="lg:w-2/5 h-64 lg:h-auto relative overflow-hidden">
              <img 
                src={courseImage}
                alt={typedCourse.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-r" />
              
              {/* Mobile Badge */}
              <div className="absolute top-4 left-4 lg:hidden">
                <Badge 
                  className={`text-xs font-semibold px-3 py-1 border-0 shadow-lg ${
                    typedCourse.is_free 
                      ? "bg-emerald-500 text-white" 
                      : "bg-slate-900 text-white"
                  }`}
                >
                  {typedCourse.is_free ? "Free Course" : `$${typedCourse.price}`}
                </Badge>
              </div>
            </div>

            {/* Course Info */}
            <div className="flex-1 p-6 lg:p-10 flex flex-col justify-center">
              {/* Desktop Badge */}
              <div className="hidden lg:flex items-center gap-3 mb-4">
                <Badge 
                  className={`text-xs font-semibold px-3 py-1 border-0 ${
                    typedCourse.is_free 
                      ? "bg-emerald-500 text-white" 
                      : "bg-slate-900 text-white"
                  }`}
                >
                  {typedCourse.is_free ? "Free Course" : `$${typedCourse.price}`}
                </Badge>
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Updated {new Date(typedCourse.updated_at || typedCourse.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </span>
                {typedCourse.is_free && (
                  <Badge variant="outline" className="text-xs border-slate-200 text-slate-600">
                    Open Access
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4 leading-tight">
                {typedCourse.title}
              </h1>
              
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-4 sm:mb-6">
                {typedCourse.description || "Learn modern development with hands-on projects and expert guidance."}
              </p>

              {/* Progress bar (if logged in) */}
              {user && totalLessons > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600 font-medium">Your Progress</span>
                    <span className="font-bold text-emerald-600">{completedCount}/{totalLessons} lessons ({progressPercent}%)</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {nextLessonId ? (
                  <Link href={`/courses/${id}/${nextLessonId}`}>
                    <Button
                      size="lg"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8 shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {hasProgress ? "Continue Learning" : "Start Learning"}
                    </Button>
                  </Link>
                ) : totalLessons > 0 ? (
                  <div className="flex items-center gap-2">
                    <LottieAnimation
                      src={LOTTIE.trophy}
                      className="w-14 h-14"
                    />
                    <Button size="lg" disabled className="rounded-xl px-8 bg-emerald-100 text-emerald-700">
                      Course Complete!
                    </Button>
                  </div>
                ) : (
                  <Button size="lg" disabled className="rounded-xl px-8">
                    No lessons yet
                  </Button>
                )}
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                  >
                    <svg className="h-5 w-5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    View Progress
                  </Button>
                </Link>
              </div>

              {/* Admin actions */}
              <AdminOnly>
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Admin Actions</p>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin?course=${id}`}>
                      <Button variant="outline" size="sm" className="rounded-lg text-xs border-amber-200 text-amber-700 hover:bg-amber-50">
                        <svg className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Course
                      </Button>
                    </Link>
                    <Link href={`/admin?course=${id}&tab=lessons`}>
                      <Button variant="outline" size="sm" className="rounded-lg text-xs border-blue-200 text-blue-700 hover:bg-blue-50">
                        <svg className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Manage Lessons
                      </Button>
                    </Link>
                  </div>
                </div>
              </AdminOnly>
            </div>
          </div>
        </div>

        {/* Lessons Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-4 sm:p-8 lg:p-12">
          <LessonList courseId={id} />
        </div>
      </div>
    </div>
    </AuthGate>
  );
}
