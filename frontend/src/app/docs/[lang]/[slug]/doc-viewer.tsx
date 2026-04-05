"use client";

import Link from "next/link";
import { LessonViewer } from "@/components/lesson-viewer";
import { Button } from "@/components/ui/button";

export function DocViewer({
  content,
  lang,
  prevPage,
  nextPage,
}: {
  content: string;
  lang: string;
  prevPage: { slug: string; title: string } | null;
  nextPage: { slug: string; title: string } | null;
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 lg:p-8 max-w-3xl">
        <LessonViewer content={content} />

        <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between gap-4 pb-8">
          {prevPage ? (
            <Link href={`/docs/${lang}/${prevPage.slug}`}>
              <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:bg-slate-50 gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                {prevPage.title}
              </Button>
            </Link>
          ) : (
            <div />
          )}
          {nextPage ? (
            <Link href={`/docs/${lang}/${nextPage.slug}`}>
              <Button size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                {nextPage.title}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          ) : (
            <Link href="/docs">
              <Button variant="outline" size="sm" className="rounded-xl border-slate-200">
                Back to docs
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
