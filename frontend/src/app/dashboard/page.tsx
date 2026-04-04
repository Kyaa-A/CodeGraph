import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { Course, Lesson, UserProgress } from "@/lib/supabase/types";

// Icons
const Icons = {
  book: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  check: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  clock: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  arrowRight: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
  trophy: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  sparkles: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  fire: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  ),
};

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

  // Calculate streak from completed_at dates
  function calculateStreak(progress: UserProgress[]): number {
    const completedDates = progress
      .filter((p) => p.completed_at)
      .map((p) => {
        const d = new Date(p.completed_at!);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      });
    const uniqueDays = [...new Set(completedDates)].sort().reverse();
    if (uniqueDays.length === 0) return 0;

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    // Streak must include today or yesterday to be active
    if (uniqueDays[0] !== todayStr && uniqueDays[0] !== yesterdayStr) return 0;

    let streak = 1;
    let current = new Date(uniqueDays[0]);
    for (let i = 1; i < uniqueDays.length; i++) {
      const prev = new Date(current);
      prev.setDate(prev.getDate() - 1);
      const prevStr = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-${String(prev.getDate()).padStart(2, "0")}`;
      if (uniqueDays[i] === prevStr) {
        streak++;
        current = prev;
      } else {
        break;
      }
    }
    return streak;
  }

  const currentStreak = calculateStreak(userProgress);

  // Stats
  const totalCompleted = userProgress.length;
  const coursesInProgress = coursesWithProgress.filter(
    (c) => c.completedLessons > 0 && c.completedLessons < c.totalLessons
  ).length;
  const coursesCompleted = coursesWithProgress.filter(
    (c) => c.completedLessons === c.totalLessons && c.totalLessons > 0
  ).length;

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
    <div className="container mx-auto px-4 py-8 pt-28">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          {user
            ? "Track your progress and continue learning"
            : "Sign in to track your learning progress"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {[
          {
            label: "Lessons Completed",
            value: totalCompleted,
            icon: Icons.check,
            color: "text-green-600 bg-green-100",
          },
          {
            label: "Courses in Progress",
            value: coursesInProgress,
            icon: Icons.clock,
            color: "text-amber-600 bg-amber-100",
          },
          {
            label: "Courses Completed",
            value: coursesCompleted,
            icon: Icons.trophy,
            color: "text-purple-600 bg-purple-100",
          },
          {
            label: "Day Streak",
            value: currentStreak,
            icon: Icons.fire,
            color: "text-orange-600 bg-orange-100",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-card rounded-2xl p-5 transition-all hover:shadow-lg hover:shadow-black/5"
          >
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-heading font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Progress Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
        {coursesWithProgress.map(
          ({ course, totalLessons, completedLessons, nextLessonId }) => {
            const progressPercent =
              totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0;

            return (
              <div
                key={course.id}
                className="glass-card rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-black/5 relative overflow-hidden"
              >
                {/* Progress indicator line at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="pt-2">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-heading text-lg font-semibold line-clamp-1">
                      {course.title}
                    </h3>
                    {progressPercent === 100 && (
                      <span className="text-green-500">
                        <Icons.check />
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {course.description || "No description available"}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {completedLessons} of {totalLessons} lessons
                      </span>
                      <span className="font-semibold text-amber-600">
                        {progressPercent}%
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>

                  <div className="mt-5">
                    {nextLessonId ? (
                      <Link href={`/courses/${course.id}/${nextLessonId}`}>
                        <Button className="w-full btn-gold rounded-xl">
                          Continue Learning
                          <Icons.arrowRight />
                        </Button>
                      </Link>
                    ) : totalLessons > 0 ? (
                      <Button
                        className="w-full rounded-xl"
                        variant="secondary"
                        disabled
                      >
                        <Icons.check />
                        All Complete
                      </Button>
                    ) : (
                      <Link href={`/courses/${course.id}`}>
                        <Button
                          variant="outline"
                          className="w-full rounded-xl border-black/10 hover:bg-black/5"
                        >
                          View Course
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>

      {coursesWithProgress.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <Icons.sparkles />
          </div>
          <h3 className="font-heading text-xl font-semibold mb-2">
            No courses yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Start your learning journey by exploring our courses
          </p>
          <Link href="/courses">
            <Button className="btn-gold rounded-xl">
              Browse Courses
            </Button>
          </Link>
        </div>
      )}

      {/* Recent Activity */}
      {recentLessons.length > 0 && (
        <>
          <Separator className="my-8" />
          <div>
            <h2 className="font-heading text-xl font-semibold mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/courses/${lesson.course_id}/${lesson.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl glass-card hover:bg-white/80 transition-all group"
                >
                  <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                    <Icons.check />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{lesson.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Completed lesson
                    </p>
                  </div>
                  <Icons.arrowRight />
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
