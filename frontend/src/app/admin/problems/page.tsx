"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Problem, Difficulty } from "@/lib/supabase/types";

const difficultyColors: Record<Difficulty, string> = {
  easy: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-red-100 text-red-700",
};

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [tags, setTags] = useState("");
  const [hints, setHints] = useState("");
  const [constraintsText, setConstraintsText] = useState("");
  const [examplesJson, setExamplesJson] = useState('[{"input": "", "output": "", "explanation": ""}]');
  const [starterCodeJson, setStarterCodeJson] = useState('{"python": "def solution():\\n    pass", "javascript": "function solution() {\\n\\n}"}');
  const [testCodeJson, setTestCodeJson] = useState('{"python": "", "javascript": ""}');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  async function loadProblems() {
    setLoading(true);
    const { data } = await supabase
      .from("problems")
      .select("*")
      .order("created_at", { ascending: false });
    setProblems((data ?? []) as Problem[]);
    setLoading(false);
  }

  useEffect(() => {
    loadProblems();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    setSlug(
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
    );
  }, [title]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    let parsedExamples, parsedStarterCode, parsedTestCode;
    try {
      parsedExamples = JSON.parse(examplesJson);
      parsedStarterCode = JSON.parse(starterCodeJson);
      parsedTestCode = JSON.parse(testCodeJson);
    } catch {
      alert("Invalid JSON in examples, starter code, or test code fields");
      return;
    }

    const { error } = await supabase.from("problems").insert({
      title,
      slug,
      description,
      difficulty,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      hints: hints.split("\n").filter(Boolean),
      constraints: constraintsText.split("\n").filter(Boolean),
      examples: parsedExamples,
      starter_code: parsedStarterCode,
      test_code: parsedTestCode,
    });

    if (error) {
      alert(`Error: ${error.message}`);
      return;
    }

    setTitle("");
    setSlug("");
    setDescription("");
    setDifficulty("easy");
    setTags("");
    setHints("");
    setConstraintsText("");
    setExamplesJson('[{"input": "", "output": "", "explanation": ""}]');
    setStarterCodeJson('{"python": "def solution():\\n    pass", "javascript": "function solution() {\\n\\n}"}');
    setTestCodeJson('{"python": "", "javascript": ""}');
    setShowForm(false);
    loadProblems();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this problem? All submissions will also be deleted.")) return;
    const { error } = await supabase.from("problems").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    loadProblems();
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
              Manage Problems
            </h1>
            <p className="mt-2 text-muted-foreground text-base sm:text-lg">
              Create and manage coding challenges
            </p>
          </div>
          <Button
            className="btn-gold rounded-xl"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "New Problem"}
          </Button>
        </div>

        {/* Create Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <form
                onSubmit={handleCreate}
                className="glass-card rounded-2xl p-6 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Two Sum"
                      required
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug (auto-generated)</Label>
                    <Input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="two-sum"
                      required
                      className="rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="array, hash-table, two-pointers"
                      className="rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description (supports line breaks)</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Given an array of integers nums and an integer target..."
                    rows={5}
                    required
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Constraints (one per line)</Label>
                  <Textarea
                    value={constraintsText}
                    onChange={(e) => setConstraintsText(e.target.value)}
                    placeholder={"2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9"}
                    rows={3}
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Hints (one per line)</Label>
                  <Textarea
                    value={hints}
                    onChange={(e) => setHints(e.target.value)}
                    placeholder={"Try using a hash map\nWhat complement do you need for each number?"}
                    rows={2}
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Examples (JSON array)</Label>
                  <Textarea
                    value={examplesJson}
                    onChange={(e) => setExamplesJson(e.target.value)}
                    rows={4}
                    className="rounded-lg font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Starter Code (JSON: language -&gt; code)</Label>
                  <Textarea
                    value={starterCodeJson}
                    onChange={(e) => setStarterCodeJson(e.target.value)}
                    rows={4}
                    className="rounded-lg font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Test Code (JSON: language -&gt; hidden tests)</Label>
                  <Textarea
                    value={testCodeJson}
                    onChange={(e) => setTestCodeJson(e.target.value)}
                    rows={6}
                    className="rounded-lg font-mono text-xs"
                  />
                </div>

                <Button type="submit" className="btn-gold rounded-xl">
                  Create Problem
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <Separator className="mb-8" />

        {/* Problem List */}
        {loading ? (
          <p className="text-muted-foreground text-center py-12">Loading...</p>
        ) : problems.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            No problems yet. Create your first coding challenge!
          </p>
        ) : (
          <div className="space-y-3">
            {problems.map((problem) => (
              <motion.div
                key={problem.id}
                layout
                className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <Badge className={`text-xs font-semibold px-2.5 py-0.5 border-0 shrink-0 ${difficultyColors[problem.difficulty]}`}>
                    {problem.difficulty}
                  </Badge>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{problem.title}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {problem.tags.map((t) => (
                        <span key={t} className="text-[10px] text-slate-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Link href={`/problems/${problem.id}`}>
                    <Button variant="outline" size="sm" className="rounded-lg text-xs">
                      Preview
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs border-red-200 text-red-500 hover:bg-red-50"
                    onClick={() => handleDelete(problem.id)}
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
