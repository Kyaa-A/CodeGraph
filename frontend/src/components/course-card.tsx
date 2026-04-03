import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Course } from "@/lib/supabase/types";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="h-full transition-colors hover:border-primary/50 hover:shadow-md">
        {course.thumbnail_url && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        {!course.thumbnail_url && (
          <div className="flex aspect-video w-full items-center justify-center rounded-t-lg bg-muted">
            <span className="text-4xl font-bold text-muted-foreground/30">
              {course.title.charAt(0)}
            </span>
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="line-clamp-1 text-lg">
              {course.title}
            </CardTitle>
            <Badge variant={course.is_free ? "secondary" : "default"}>
              {course.is_free ? "Free" : `$${course.price}`}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {course.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {new Date(course.created_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
