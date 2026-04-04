import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Difficulty } from "@/lib/supabase/types";

interface ProblemCardProps {
  id: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  solved: boolean;
  attemptCount: number;
}

const difficultyConfig: Record<Difficulty, { label: string; class: string }> = {
  easy: { label: "Easy", class: "bg-emerald-100 text-emerald-700" },
  medium: { label: "Medium", class: "bg-amber-100 text-amber-700" },
  hard: { label: "Hard", class: "bg-red-100 text-red-700" },
};

export function ProblemCard({ id, title, difficulty, tags, solved, attemptCount }: ProblemCardProps) {
  const dc = difficultyConfig[difficulty];

  return (
    <Link href={`/problems/${id}`}>
      <div className={`glass-card rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 group cursor-pointer border ${
        solved ? "border-emerald-200/60 bg-emerald-50/30" : ""
      }`}>
        <div className="flex items-center gap-4">
          {/* Status icon */}
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
            solved
              ? "bg-emerald-500 text-white"
              : attemptCount > 0
                ? "bg-amber-100 text-amber-600"
                : "bg-slate-100 text-slate-400"
          }`}>
            {solved ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : attemptCount > 0 ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-amber-600 transition-colors truncate">
              {title}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <Badge className={`text-[10px] font-semibold px-2 py-0 border-0 ${dc.class}`}>
                {dc.label}
              </Badge>
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] text-slate-400 border-slate-200 px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <svg className="h-4 w-4 text-slate-300 group-hover:text-amber-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
