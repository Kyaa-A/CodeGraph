import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import type { Lesson } from "@/lib/supabase/types";

interface LessonListProps {
  courseId: string;
}

async function getLessons(courseId: string) {
  const supabase = await createClient();
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  return lessons ?? [];
}

function getLessonIcon(index: number) {
  return (
    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-heading font-bold">
      {index + 1}
    </div>
  );
}

export async function LessonList({ courseId }: LessonListProps) {
  const lessons = await getLessons(courseId);

  if (lessons.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="font-heading text-xl font-semibold mb-2">No lessons yet</h3>
        <p className="text-muted-foreground">This course doesn't have any lessons yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-6">
        Course Lessons <span className="text-muted-foreground text-lg font-normal">({lessons.length})</span>
      </h2>
      
      <div className="space-y-3">
        {lessons.map((lesson: Lesson, index: number) => (
          <Link key={lesson.id} href={`/courses/${courseId}/${lesson.id}`}>
            <div className="glass-card rounded-2xl p-4 transition-all duration-200 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 group cursor-pointer">
              <div className="flex items-center gap-4">
                {/* Lesson Number */}
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-heading font-bold text-lg group-hover:from-amber-500 group-hover:to-amber-400 group-hover:text-white transition-all">
                  {index + 1}
                </div>
                
                {/* Lesson Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-amber-600 transition-colors truncate">
                    {lesson.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {lesson.content ? "Ready to start" : "Content coming soon"}
                  </p>
                </div>
                
                {/* Start Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-all"
                >
                  Start
                  <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
