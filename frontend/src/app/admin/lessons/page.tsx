"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
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

    const { error } = await supabase.from("lessons").insert({
      course_id: courseId,
      title: title.trim(),
      content: content.trim(),
      order_index: orderIndex,
    });

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    setTitle("");
    setContent("");
    setOrderIndex(0);
    setShowForm(false);
    setSaving(false);
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this lesson?")) return;
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    loadData();
  }

  // Group lessons by course
  const lessonsByCourse = courses.map((course) => ({
    course,
    lessons: lessons.filter((l) => l.course_id === course.id),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/10 via-white to-white pt-28 pb-16">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">Manage Lessons</h1>
            <p className="mt-2 text-muted-foreground">Create and organize lessons within courses</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className={`rounded-xl ${showForm ? "" : "btn-gold"}`}
          >
            {showForm ? (
              <>
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Lesson
              </>
            )}
          </Button>
        </div>

        {/* Create Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="glass-card rounded-2xl p-6 border-blue-200">
                <h2 className="font-heading text-lg font-semibold mb-4">Create New Lesson</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="course" className="text-sm font-medium">Course</Label>
                    <select
                      id="course"
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                      className="w-full h-12 rounded-xl border border-black/10 bg-white/70 px-4 text-sm focus:bg-white focus:border-emerald-500 focus:outline-none"
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
                    <Label htmlFor="title" className="text-sm font-medium">Lesson Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter lesson title"
                      required
                      className="h-12 rounded-xl border-black/10 bg-white/70 focus:bg-white focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order" className="text-sm font-medium">Order Index</Label>
                    <Input
                      id="order"
                      type="number"
                      value={orderIndex}
                      onChange={(e) => setOrderIndex(Number(e.target.value))}
                      min={0}
                      className="h-12 rounded-xl border-black/10 bg-white/70 focus:bg-white focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-sm font-medium">Content (Markdown)</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="# Lesson content in Markdown..."
                      rows={10}
                      className="rounded-xl border-black/10 bg-white/70 focus:bg-white focus:border-emerald-500 font-mono text-sm"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={saving} className="btn-gold rounded-xl">
                      {saving ? (
                        <>
                          <svg className="animate-spin mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Creating...
                        </>
                      ) : (
                        "Create Lesson"
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowForm(false)}
                      className="rounded-xl border-black/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Separator className="my-8" />

        {/* Lessons List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 rounded-xl border-4 border-emerald-200 border-t-emerald-500 animate-spin" />
            <span className="ml-3 text-muted-foreground">Loading lessons...</span>
          </div>
        ) : lessonsByCourse.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-6">Create a course first to add lessons to it</p>
          </div>
        ) : (
          <div className="space-y-10">
            {lessonsByCourse.map(({ course, lessons: courseLessons }) => (
              <div key={course.id} className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-heading text-lg font-semibold">{course.title}</h2>
                    <p className="text-sm text-muted-foreground">{courseLessons.length} {courseLessons.length === 1 ? 'lesson' : 'lessons'}</p>
                  </div>
                </div>
                
                {courseLessons.length === 0 ? (
                  <div className="rounded-xl bg-black/5 p-6 text-center">
                    <p className="text-sm text-muted-foreground">No lessons in this course yet</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { setCourseId(course.id); setShowForm(true); }}
                      className="mt-2"
                    >
                      Add first lesson
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {courseLessons
                      .sort((a, b) => a.order_index - b.order_index)
                      .map((lesson) => (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-black/5"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 text-xs font-bold shrink-0">
                            {lesson.order_index}
                          </span>
                          <p className="text-sm font-medium truncate">{lesson.title}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(lesson.id)}
                          className="rounded-lg shrink-0"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
