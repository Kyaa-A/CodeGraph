import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Admin | CodeGraph",
  description: "Admin dashboard",
};

export default async function AdminPage() {
  const supabase = await createClient();

  const { count: courseCount } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true });

  const { count: lessonCount } = await supabase
    .from("lessons")
    .select("*", { count: "exact", head: true });

  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const stats = [
    { label: "Courses", value: courseCount ?? 0, href: "/admin/courses" },
    { label: "Lessons", value: lessonCount ?? 0, href: "/admin/lessons" },
    { label: "Users", value: userCount ?? 0, href: "#" },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Manage courses, lessons, and users
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-colors hover:border-primary/50">
              <CardHeader>
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-4xl">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" size="sm">
                  Manage
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
