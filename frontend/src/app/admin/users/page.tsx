"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { Profile, UserRole } from "@/lib/supabase/types";

interface UserWithProgress extends Profile {
  completedLessons: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  async function fetchUsers() {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!profiles) {
      setUsers([]);
      setLoading(false);
      return;
    }

    // Fetch progress counts for each user
    const { data: progress } = await supabase
      .from("user_progress")
      .select("user_id")
      .eq("completed", true);

    const progressMap = new Map<string, number>();
    (progress ?? []).forEach((p: { user_id: string }) => {
      progressMap.set(p.user_id, (progressMap.get(p.user_id) ?? 0) + 1);
    });

    setUsers(
      (profiles as Profile[]).map((p) => ({
        ...p,
        completedLessons: progressMap.get(p.id) ?? 0,
      }))
    );
    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
    fetchUsers();
  }, []);

  async function toggleRole(userId: string, currentRole: UserRole) {
    const newRole: UserRole = currentRole === "admin" ? "student" : "admin";

    // Prevent self-demotion if you're the only admin
    if (userId === currentUserId && currentRole === "admin") {
      const adminCount = users.filter((u) => u.role === "admin").length;
      if (adminCount <= 1) {
        alert("You are the only admin. Promote another user to admin before demoting yourself.");
        return;
      }
      if (!confirm("You are about to remove your own admin access. You won't be able to access this page anymore. Continue?")) {
        return;
      }
    }

    setUpdating(userId);

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    }
    setUpdating(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/10 via-white to-white pt-28 pb-16">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-10">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4 group"
            >
              <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Admin
            </Link>
            <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight">
              User Management
            </h1>
            <p className="mt-2 text-muted-foreground text-base sm:text-lg">
              View and manage user roles
            </p>
          </div>
          <div className="glass-card rounded-xl px-5 py-3 text-center shrink-0">
            <p className="text-3xl font-heading font-bold">{users.length}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b bg-slate-50/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* User info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {(user.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {user.name || "Unnamed User"}
                              {user.id === currentUserId && (
                                <span className="ml-2 text-xs text-emerald-600 font-normal">(You)</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {user.role === "admin" && (
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          )}
                          {user.role === "admin" ? "Admin" : "Student"}
                        </span>
                      </td>

                      {/* Progress */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">
                          {user.completedLessons} lessons
                        </span>
                      </td>

                      {/* Joined date */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`rounded-lg text-xs ${
                            user.role === "admin"
                              ? "border-red-200 text-red-600 hover:bg-red-50"
                              : "border-amber-200 text-amber-600 hover:bg-amber-50"
                          }`}
                          disabled={updating === user.id}
                          onClick={() =>
                            toggleRole(user.id, user.role)
                          }
                        >
                          {updating === user.id
                            ? "Updating..."
                            : user.role === "admin"
                              ? "Demote to Student"
                              : "Promote to Admin"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
