"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import type { Course, Lesson } from "@/lib/supabase/types";

export default function AdminLessonsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function loadData() {
    setLoading(true);
    const [{ data: coursesData }, { data: lessonsData }] = await Promise.all([
      supabase.from("courses").select("*").order("created_at"),
      supabase.from("lessons").select("*").order("order_index"),
    ]);
    setCourses((coursesData ?? []) as Course[]);
    setLessons((lessonsData ?? []) as Lesson[]);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !courseId) return;
    setSaving(true);

    await supabase.from("lessons").insert({
      course_id: courseId,
      title: title.trim(),
      content: content.trim(),
      order_index: orderIndex,
    });

    setTitle("");
    setContent("");
    setOrderIndex(0);
    setShowForm(false);
    setSaving(false);
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this lesson?")) return;
    await supabase.from("lessons").delete().eq("id", id);
    loadData();
  }

  // Group lessons by course
  const lessonsByCourse = courses.map((course) => ({
    course,
    lessons: lessons.filter((l) => l.course_id === course.id),
  }));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Lessons</h1>
          <p className="mt-2 text-muted-foreground">
            Create and organize lessons within courses
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "New Lesson"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create Lesson</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <select
                  id="course"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Lesson title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Order Index</Label>
                <Input
                  id="order"
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(Number(e.target.value))}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content (Markdown)</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="# Lesson content in Markdown"
                  rows={10}
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "Creating..." : "Create Lesson"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Separator className="my-6" />

      {loading ? (
        <p className="text-muted-foreground">Loading lessons...</p>
      ) : lessonsByCourse.length === 0 ? (
        <p className="text-muted-foreground">No courses yet.</p>
      ) : (
        <div className="space-y-8">
          {lessonsByCourse.map(({ course, lessons: courseLessons }) => (
            <div key={course.id}>
              <h2 className="mb-3 text-lg font-semibold">{course.title}</h2>
              {courseLessons.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No lessons in this course.
                </p>
              ) : (
                <div className="space-y-2">
                  {courseLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {lesson.order_index}
                        </span>
                        <p className="text-sm font-medium">{lesson.title}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(lesson.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
