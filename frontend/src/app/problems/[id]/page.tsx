import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthGate } from "@/components/auth-gate";
import type { Problem, ProblemSubmission } from "@/lib/supabase/types";
import { ProblemShell } from "./problem-shell";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("problems")
    .select("title, difficulty")
    .eq("id", id)
    .single();

  return {
    title: data ? `${data.title} | CodeGraph Problems` : "Problem | CodeGraph",
    description: data ? `Solve ${data.title} - ${data.difficulty} difficulty` : "Coding problem",
  };
}

export default async function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: problem, error } = await supabase
    .from("problems")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !problem) {
    notFound();
  }

  const typedProblem = problem as Problem;

  // Fetch user's submissions for this problem
  let submissions: ProblemSubmission[] = [];
  if (user) {
    const { data: subs } = await supabase
      .from("problem_submissions")
      .select("*")
      .eq("problem_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    submissions = (subs ?? []) as ProblemSubmission[];
  }

  // Strip test_code from client payload (hidden tests)
  const clientProblem: Problem = {
    ...typedProblem,
    test_code: {},
  };

  return (
    <AuthGate>
      <ProblemShell problem={clientProblem} submissions={submissions} isAuthenticated={!!user} userId={user?.id ?? null} />
    </AuthGate>
  );
}
