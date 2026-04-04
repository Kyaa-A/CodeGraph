"use client";

import { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Badge } from "@/components/ui/badge";
import type { Difficulty, ProblemSubmission } from "@/lib/supabase/types";

interface ProblemDescriptionProps {
  title: string;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  hints: string[];
  submissions: ProblemSubmission[];
}

const difficultyConfig: Record<Difficulty, { label: string; class: string }> = {
  easy: { label: "Easy", class: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  medium: { label: "Medium", class: "bg-amber-100 text-amber-700 border-amber-200" },
  hard: { label: "Hard", class: "bg-red-100 text-red-700 border-red-200" },
};

export function ProblemDescription({
  title,
  difficulty,
  tags,
  description,
  examples,
  constraints,
  hints,
  submissions,
}: ProblemDescriptionProps) {
  const [activeTab, setActiveTab] = useState<"description" | "submissions">("description");
  const [showHints, setShowHints] = useState<boolean[]>(hints.map(() => false));

  const diffConfig = difficultyConfig[difficulty];
  const solvedCount = submissions.filter((s) => s.passed).length;
  const totalAttempts = submissions.length;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Problem header */}
      <div className="p-6 border-b border-slate-200 shrink-0">
        <h1 className="font-heading text-xl font-bold text-slate-900 mb-3">{title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`text-xs font-semibold px-2.5 py-0.5 border ${diffConfig.class}`}>
            {diffConfig.label}
          </Badge>
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs text-slate-500 border-slate-200">
              {tag}
            </Badge>
          ))}
          {totalAttempts > 0 && (
            <span className="text-xs text-slate-400 ml-2">
              {solvedCount > 0 ? (
                <span className="text-emerald-600 font-medium">Solved</span>
              ) : (
                `${totalAttempts} attempt${totalAttempts > 1 ? "s" : ""}`
              )}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 shrink-0">
        <button
          onClick={() => setActiveTab("description")}
          className={`px-5 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "description"
              ? "text-amber-600 border-b-2 border-amber-500"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Description
        </button>
        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-5 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "submissions"
              ? "text-amber-600 border-b-2 border-amber-500"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Submissions ({totalAttempts})
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "description" ? (
          <div className="space-y-6">
            {/* Problem statement */}
            <div className="prose prose-slate prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, "<br/>") }} />
            </div>

            {/* Examples */}
            {examples.length > 0 && (
              <div className="space-y-4">
                {examples.map((ex, i) => (
                  <div key={i} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Example {i + 1}
                    </p>
                    <div className="space-y-2 font-mono text-sm">
                      <p>
                        <span className="text-slate-500">Input: </span>
                        <span className="text-slate-800">{ex.input}</span>
                      </p>
                      <p>
                        <span className="text-slate-500">Output: </span>
                        <span className="text-slate-800">{ex.output}</span>
                      </p>
                      {ex.explanation && (
                        <p className="text-slate-500 text-xs mt-2">
                          <span className="font-semibold">Explanation: </span>
                          {ex.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {constraints.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Constraints
                </p>
                <ul className="space-y-1.5">
                  {constraints.map((c, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-slate-300 mt-1 shrink-0">&bull;</span>
                      <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{c}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hints */}
            {hints.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <DotLottieReact
                    src="https://lottie.host/e7e37b80-60e9-457c-bba6-9316e75839e3/TgVAsNqb9S.lottie"
                    loop
                    autoplay
                    className="w-8 h-8"
                  />
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Hints
                  </p>
                </div>
                <div className="space-y-2">
                  {hints.map((hint, i) => (
                    <div key={i}>
                      <button
                        onClick={() =>
                          setShowHints((prev) =>
                            prev.map((v, j) => (j === i ? !v : v))
                          )
                        }
                        className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1.5"
                      >
                        <svg
                          className={`h-3.5 w-3.5 transition-transform ${showHints[i] ? "rotate-90" : ""}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                        Hint {i + 1}
                      </button>
                      {showHints[i] && (
                        <p className="text-sm text-slate-600 mt-1 ml-5 p-3 rounded-lg bg-amber-50 border border-amber-100">
                          {hint}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Submissions tab */
          <div className="space-y-3">
            {submissions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No submissions yet</p>
            ) : (
              submissions.map((sub) => (
                <div
                  key={sub.id}
                  className={`rounded-xl border p-4 ${
                    sub.passed
                      ? "bg-emerald-50/50 border-emerald-200"
                      : "bg-red-50/50 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-semibold ${
                        sub.passed ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {sub.passed ? "Accepted" : "Wrong Answer"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(sub.created_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="capitalize">{sub.language}</span>
                    {sub.runtime_ms && <span>{sub.runtime_ms}ms</span>}
                    {sub.test_results && (
                      <span>
                        {sub.test_results.filter((t) => t.passed).length}/{sub.test_results.length} passed
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
