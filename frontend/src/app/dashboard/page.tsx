import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Course, Lesson, UserProgress } from "@/lib/supabase/types";

export const metadata = {
  title: "Dashboard | CodeGraph",
  description: "Your learning dashboard",
};

interface CourseWithProgress {
  course: Course;
  totalLessons: number;
  completedLessons: number;
  nextLessonId: string | null;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch courses
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  const typedCourses = (courses ?? []) as Course[];

  // Fetch all lessons
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("*")
    .order("order_index", { ascending: true });

  const typedLessons = (allLessons ?? []) as Lesson[];

  // Fetch user progress if logged in
  let userProgress: UserProgress[] = [];
  if (user) {
    const { data: progress } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("completed", true);

    userProgress = (progress ?? []) as UserProgress[];
  }

  const completedLessonIds = new Set(userProgress.map((p) => p.lesson_id));

  // Build course progress data
  const coursesWithProgress: CourseWithProgress[] = typedCourses.map(
    (course) => {
      const courseLessons = typedLessons.filter(
        (l) => l.course_id === course.id
      );
      const completed = courseLessons.filter((l) =>
        completedLessonIds.has(l.id)
      ).length;
      const nextLesson = courseLessons.find(
        (l) => !completedLessonIds.has(l.id)
      );

      return {
        course,
        totalLessons: courseLessons.length,
        completedLessons: completed,
        nextLessonId: nextLesson?.id ?? null,
      };
    }
  );

  // Recent completions
  const recentCompletions = userProgress
    .filter((p) => p.completed_at)
    .sort(
      (a, b) =>
        new Date(b.completed_at!).getTime() -
        new Date(a.completed_at!).getTime()
    )
    .slice(0, 5);

  const recentLessons = recentCompletions
    .map((p) => typedLessons.find((l) => l.id === p.lesson_id))
    .filter(Boolean) as Lesson[];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          {user
            ? "Track your learning progress"
            : "Sign in to track your progress"}
        </p>
      </div>

      {/* Course progress cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {coursesWithProgress.map(
          ({ course, totalLessons, completedLessons, nextLessonId }) => {
            const progressPercent =
              totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0;

            return (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>
                    {completedLessons} of {totalLessons} lessons completed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} />
                  </div>
                  {nextLessonId ? (
                    <Link href={`/courses/${course.id}/${nextLessonId}`}>
                      <Button className="w-full" size="sm">
                        Continue Learning
                      </Button>
                    </Link>
                  ) : totalLessons > 0 ? (
                    <Button className="w-full" size="sm" variant="secondary" disabled>
                      All Complete
                    </Button>
                  ) : (
                    <Link href={`/courses/${course.id}`}>
                      <Button className="w-full" size="sm" variant="outline">
                        View Course
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          }
        )}
      </div>

      {coursesWithProgress.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            No courses available yet.
          </p>
          <Link href="/courses">
            <Button variant="outline" className="mt-4">
              Browse Courses
            </Button>
          </Link>
        </div>
      )}

      {/* Recent activity */}
      {recentLessons.length > 0 && (
        <>
          <Separator className="my-8" />
          <div>
            <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
            <div className="space-y-2">
              {recentLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/courses/${lesson.course_id}/${lesson.id}`}
                  className="block"
                >
                  <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">{lesson.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
