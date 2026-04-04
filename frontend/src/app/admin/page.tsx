import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
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
    { 
      label: "Courses", 
      value: courseCount ?? 0, 
      href: "/admin/courses",
      icon: () => (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: "from-amber-500 to-amber-600"
    },
    { 
      label: "Lessons", 
      value: lessonCount ?? 0, 
      href: "/admin/lessons",
      icon: () => (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: "from-blue-500 to-blue-600"
    },
    { 
      label: "Users", 
      value: userCount ?? 0, 
      href: "#",
      icon: () => (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: "from-green-500 to-green-600"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/10 via-white to-white pt-28 pb-16">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-heading text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground text-lg">
            Manage courses, lessons, and user analytics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <div className="glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg shadow-black/10 group-hover:scale-110 transition-transform`}>
                    <stat.icon />
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    Manage
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-4xl font-heading font-bold mt-1">{stat.value}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="font-heading text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/courses">
              <div className="glass-card rounded-xl p-5 transition-all duration-200 hover:bg-amber-50/30 hover:border-amber-200 cursor-pointer flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Add Course</p>
                  <p className="text-xs text-muted-foreground">Create new course</p>
                </div>
              </div>
            </Link>
            <Link href="/admin/lessons">
              <div className="glass-card rounded-xl p-5 transition-all duration-200 hover:bg-blue-50/30 hover:border-blue-200 cursor-pointer flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Add Lesson</p>
                  <p className="text-xs text-muted-foreground">Create new lesson</p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard">
              <div className="glass-card rounded-xl p-5 transition-all duration-200 hover:bg-purple-50/30 hover:border-purple-200 cursor-pointer flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">View Dashboard</p>
                  <p className="text-xs text-muted-foreground">User analytics</p>
                </div>
              </div>
            </Link>
            <Link href="/courses">
              <div className="glass-card rounded-xl p-5 transition-all duration-200 hover:bg-green-50/30 hover:border-green-200 cursor-pointer flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Preview Site</p>
                  <p className="text-xs text-muted-foreground">View as user</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
