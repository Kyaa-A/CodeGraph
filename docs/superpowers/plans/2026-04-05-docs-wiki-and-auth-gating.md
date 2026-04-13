# Documentation Wiki + Auth Gating Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a W3Schools-style public documentation system with comprehensive language docs, plus auth-gate courses and problems behind a login modal.

**Architecture:** Two new Supabase tables (`doc_topics` and `doc_pages`) store documentation content organized by language → section → page. A new `/docs/[lang]/[slug]` route renders pages with a persistent left sidebar (collapsible sections). A reusable `<AuthGate>` client component wraps protected routes and shows a login modal instead of redirecting. A Python generator script (`generate_docs.py`) uses the existing multi-provider LLM key rotation to bulk-generate comprehensive documentation content for 5 languages.

**Tech Stack:** Next.js 14+ App Router, Supabase Postgres, Tailwind + shadcn/ui, Python + LangChain (content generation), Cerebras/Groq/OpenRouter APIs

---

## Scope: Two Independent Subsystems

1. **Auth Gating** — Add login-required modal to `/courses` and `/problems` routes (Tasks 1–3)
2. **Documentation Wiki** — DB schema, frontend pages, content generation (Tasks 4–10)

These are independent and can be developed in parallel or sequentially.

---

## File Structure

### Auth Gating Files
| File | Responsibility |
|------|---------------|
| `frontend/src/components/auth-gate.tsx` | **Create.** Client component: checks auth, renders children if logged in, shows login modal if not |
| `frontend/src/lib/supabase/middleware.ts` | **Modify:38-44.** Remove `/courses` and `/problems` from middleware redirect — the modal handles it now |
| `frontend/src/app/courses/page.tsx` | **Modify.** Wrap content with `<AuthGate>` |
| `frontend/src/app/courses/[id]/page.tsx` | **Modify.** Wrap content with `<AuthGate>` |
| `frontend/src/app/problems/page.tsx` | **Modify.** Wrap content with `<AuthGate>` |
| `frontend/src/app/problems/[id]/page.tsx` | **Modify.** Remove existing redirect-to-login logic, wrap with `<AuthGate>` |

### Documentation Wiki Files
| File | Responsibility |
|------|---------------|
| `frontend/src/lib/supabase/types.ts` | **Modify.** Add `DocTopic` and `DocPage` interfaces |
| `frontend/src/app/docs/page.tsx` | **Create.** Docs landing page — grid of language cards |
| `frontend/src/app/docs/[lang]/page.tsx` | **Create.** Redirects to first page of the language |
| `frontend/src/app/docs/[lang]/[slug]/page.tsx` | **Create.** Doc page: fetches content, renders with sidebar |
| `frontend/src/app/docs/[lang]/[slug]/doc-sidebar.tsx` | **Create.** Client component: collapsible section sidebar |
| `frontend/src/app/docs/[lang]/[slug]/doc-viewer.tsx` | **Create.** Client component: renders markdown + prev/next nav |
| `frontend/src/components/navbar.tsx` | **Modify:172-183.** Add "Docs" link to nav (before Courses, always visible) |
| `backend/generate_docs.py` | **Create.** Bulk doc content generator using multi-provider LLM rotation |

### Database
| Table | Columns |
|-------|---------|
| `doc_topics` | `id uuid PK`, `lang text`, `section text`, `title text`, `slug text`, `order_index int`, `content text`, `created_at timestamptz` |

Single table is sufficient — `section` groups pages, `order_index` controls ordering within a language. No need for a separate sections table.

---

## Part 1: Auth Gating

### Task 1: Create the AuthGate Component

**Files:**
- Create: `frontend/src/components/auth-gate.tsx`

- [ ] **Step 1: Create the AuthGate client component**

This component checks if the user is logged in. If not, it renders a login modal overlay instead of the page content. The page is still server-rendered (for SEO), but the client component blocks interaction.

```tsx
// frontend/src/components/auth-gate.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Still loading
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Authenticated — show the page
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Not authenticated — show modal overlay
  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Blurred preview of the page behind */}
      <div className="pointer-events-none select-none blur-sm opacity-50">
        {children}
      </div>

      {/* Login modal overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 max-w-sm w-full mx-4 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <svg viewBox="0 0 32 32" fill="none" className="h-10 w-10">
              <rect width="32" height="32" rx="8" fill="#171717" />
              <path d="M8 12L12 16L8 20" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 20H24" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="20" cy="11" r="2" fill="#10b981" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to continue</h2>
          <p className="text-sm text-slate-500 mb-6">
            Create a free account to access courses, problems, and track your progress.
          </p>

          <div className="space-y-3">
            <Link href={`/auth/login?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/')}`} className="block">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11">
                Sign in
              </Button>
            </Link>
            <Link href={`/auth/signup?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/')}`} className="block">
              <Button variant="outline" className="w-full rounded-xl h-11 border-slate-200">
                Create free account
              </Button>
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Free documentation is available without an account.{" "}
              <Link href="/docs" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Browse docs →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build compiles**

Run: `cd frontend && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/auth-gate.tsx
git commit -m "[Frontend] Add AuthGate component for login-required modal"
```

---

### Task 2: Apply AuthGate to Courses and Problems Pages

**Files:**
- Modify: `frontend/src/app/courses/page.tsx`
- Modify: `frontend/src/app/courses/[id]/page.tsx`
- Modify: `frontend/src/app/problems/page.tsx`
- Modify: `frontend/src/app/problems/[id]/page.tsx`

- [ ] **Step 1: Wrap courses listing page**

In `frontend/src/app/courses/page.tsx`, add import at top and wrap the return JSX:

```tsx
// Add at top of file:
import { AuthGate } from "@/components/auth-gate";

// Wrap the return value — find `return (` and change to:
return (
  <AuthGate>
    {/* ... existing JSX unchanged ... */}
  </AuthGate>
);
```

- [ ] **Step 2: Wrap course detail page**

In `frontend/src/app/courses/[id]/page.tsx`, same pattern:

```tsx
// Add at top:
import { AuthGate } from "@/components/auth-gate";

// Wrap return:
return (
  <AuthGate>
    {/* ... existing JSX unchanged ... */}
  </AuthGate>
);
```

- [ ] **Step 3: Wrap problems listing page**

In `frontend/src/app/problems/page.tsx`, same pattern:

```tsx
import { AuthGate } from "@/components/auth-gate";

return (
  <AuthGate>
    {/* ... existing JSX unchanged ... */}
  </AuthGate>
);
```

- [ ] **Step 4: Simplify problems/[id] page — remove redirect logic**

In `frontend/src/app/problems/[id]/page.tsx`, find and remove the existing auth redirect:

```tsx
// REMOVE these lines (the redirect-to-login logic):
// if (!user) { redirect(`/auth/login?next=/problems/${id}`); }

// Add import:
import { AuthGate } from "@/components/auth-gate";

// Wrap return:
return (
  <AuthGate>
    {/* ... existing JSX unchanged ... */}
  </AuthGate>
);
```

- [ ] **Step 5: Update middleware — remove course lesson redirect**

In `frontend/src/lib/supabase/middleware.ts`, the middleware currently redirects unauthenticated users hitting `/courses/[id]/[lessonId]`. Remove that since AuthGate handles it on the client side now. Change lines 38-44:

```typescript
// BEFORE:
const protectedPaths = ["/dashboard"];
const isProtectedRoute =
  protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  ) ||
  /^\/courses\/[^/]+\/[^/]+/.test(request.nextUrl.pathname);

// AFTER:
const protectedPaths = ["/dashboard"];
const isProtectedRoute = protectedPaths.some((path) =>
  request.nextUrl.pathname.startsWith(path)
);
```

Note: Keep `/dashboard` as a hard redirect (no modal — you must be logged in). Courses, problems, and lessons use the modal instead.

- [ ] **Step 6: Build and verify**

Run: `cd frontend && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/courses/page.tsx frontend/src/app/courses/\[id\]/page.tsx frontend/src/app/problems/page.tsx frontend/src/app/problems/\[id\]/page.tsx frontend/src/lib/supabase/middleware.ts
git commit -m "[Frontend] Auth-gate courses and problems with login modal"
```

---

### Task 3: Add AuthGate to Lesson Pages

**Files:**
- Modify: `frontend/src/app/courses/[id]/[lessonId]/lesson-client-shell.tsx`

- [ ] **Step 1: Add auth check to lesson shell**

Since `lesson-client-shell.tsx` is already a client component, add the auth gate directly inside it rather than wrapping the server page. Add this near the top of the component body, after the existing state declarations:

```tsx
// Add to existing imports:
import { AuthGate } from "@/components/auth-gate";

// Wrap the entire return JSX with AuthGate:
return (
  <AuthGate>
    <>
      {/* ... all existing JSX ... */}
    </>
  </AuthGate>
);
```

- [ ] **Step 2: Build and verify**

Run: `cd frontend && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/courses/\[id\]/\[lessonId\]/lesson-client-shell.tsx
git commit -m "[Frontend] Auth-gate lesson pages with login modal"
```

---

## Part 2: Documentation Wiki

### Task 4: Create Database Table

**Files:**
- Supabase migration

- [ ] **Step 1: Create the `doc_topics` table**

Apply this migration via Supabase MCP:

```sql
CREATE TABLE doc_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lang text NOT NULL,          -- 'python', 'javascript', 'java', 'sql', 'langchain'
  section text NOT NULL,       -- 'Tutorial', 'Methods', 'Classes', 'Data Structures', etc.
  title text NOT NULL,         -- 'Variables & Data Types', 'If/Else Statements', etc.
  slug text NOT NULL,          -- 'variables-data-types'
  order_index int NOT NULL DEFAULT 0,
  content text NOT NULL DEFAULT '',  -- Markdown content
  created_at timestamptz DEFAULT now(),
  UNIQUE(lang, slug)
);

-- Index for fast lookups
CREATE INDEX idx_doc_topics_lang ON doc_topics(lang, order_index);

-- RLS: public read, admin write
ALTER TABLE doc_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read docs" ON doc_topics
  FOR SELECT USING (true);

CREATE POLICY "Service can insert docs" ON doc_topics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update docs" ON doc_topics
  FOR UPDATE USING (true);
```

- [ ] **Step 2: Verify table exists**

Run SQL: `SELECT count(*) FROM doc_topics;`
Expected: `0`

- [ ] **Step 3: Commit migration notes**

No file to commit — migration applied directly via Supabase.

---

### Task 5: Add TypeScript Types

**Files:**
- Modify: `frontend/src/lib/supabase/types.ts`

- [ ] **Step 1: Add DocTopic interface**

Add at the bottom of `frontend/src/lib/supabase/types.ts`:

```typescript
export interface DocTopic {
  id: string;
  lang: string;
  section: string;
  title: string;
  slug: string;
  order_index: number;
  content: string;
  created_at: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/lib/supabase/types.ts
git commit -m "[Frontend] Add DocTopic type for documentation wiki"
```

---

### Task 6: Create Docs Landing Page

**Files:**
- Create: `frontend/src/app/docs/page.tsx`

- [ ] **Step 1: Create the docs landing page**

This is the `/docs` route — shows a grid of language cards (like W3Schools homepage). Public, no auth required.

```tsx
// frontend/src/app/docs/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Documentation | CodeGraph",
  description: "Free programming documentation and tutorials",
};

const LANGUAGES = [
  {
    lang: "python",
    name: "Python",
    description: "Learn Python from basics to advanced. Variables, loops, functions, OOP, file handling, and more.",
    color: "bg-blue-500",
    icon: "🐍",
  },
  {
    lang: "javascript",
    name: "JavaScript",
    description: "Master JavaScript fundamentals. DOM, async/await, closures, ES6+, and modern web development.",
    color: "bg-yellow-500",
    icon: "⚡",
  },
  {
    lang: "java",
    name: "Java",
    description: "Complete Java guide. OOP, collections, generics, file I/O, threads, and data structures.",
    color: "bg-red-500",
    icon: "☕",
  },
  {
    lang: "sql",
    name: "SQL",
    description: "Database querying mastery. SELECT, JOINs, subqueries, indexes, transactions, and optimization.",
    color: "bg-cyan-500",
    icon: "🗄️",
  },
  {
    lang: "langchain",
    name: "LangChain",
    description: "Build AI applications. Chains, agents, RAG pipelines, embeddings, vector stores, and LangGraph.",
    color: "bg-purple-500",
    icon: "🤖",
  },
];

export default async function DocsPage() {
  const supabase = await createClient();

  // Get page counts per language
  const { data: counts } = await supabase
    .from("doc_topics")
    .select("lang");

  const langCounts = new Map<string, number>();
  for (const row of counts ?? []) {
    langCounts.set(row.lang, (langCounts.get(row.lang) || 0) + 1);
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Documentation</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Free, comprehensive programming references. Learn at your own pace — no account required.
          </p>
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LANGUAGES.map((l) => {
            const pageCount = langCounts.get(l.lang) || 0;
            return (
              <Link
                key={l.lang}
                href={pageCount > 0 ? `/docs/${l.lang}` : "#"}
                className={`group block rounded-2xl border border-slate-200 p-6 transition-all hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 ${
                  pageCount === 0 ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-10 w-10 rounded-xl ${l.color} flex items-center justify-center text-lg`}>
                    {l.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {l.name}
                    </h2>
                    <span className="text-xs text-slate-400">
                      {pageCount > 0 ? `${pageCount} topics` : "Coming soon"}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{l.description}</p>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-400">
            Want interactive lessons with a code editor?{" "}
            <Link href="/courses" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Check out our courses →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `cd frontend && npx next build 2>&1 | tail -5`
Expected: Build succeeds, `/docs` listed as dynamic route

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/docs/page.tsx
git commit -m "[Frontend] Add docs landing page with language grid"
```

---

### Task 7: Create Doc Page Route with Sidebar

**Files:**
- Create: `frontend/src/app/docs/[lang]/page.tsx`
- Create: `frontend/src/app/docs/[lang]/[slug]/page.tsx`
- Create: `frontend/src/app/docs/[lang]/[slug]/doc-sidebar.tsx`
- Create: `frontend/src/app/docs/[lang]/[slug]/doc-viewer.tsx`

- [ ] **Step 1: Create the language redirect page**

`/docs/python` should redirect to the first page of that language.

```tsx
// frontend/src/app/docs/[lang]/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DocLangPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();

  const { data: firstPage } = await supabase
    .from("doc_topics")
    .select("slug")
    .eq("lang", lang)
    .order("order_index", { ascending: true })
    .limit(1)
    .single();

  if (!firstPage) {
    redirect("/docs");
  }

  redirect(`/docs/${lang}/${firstPage.slug}`);
}
```

- [ ] **Step 2: Create the doc sidebar client component**

```tsx
// frontend/src/app/docs/[lang]/[slug]/doc-sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

interface SidebarSection {
  section: string;
  pages: { slug: string; title: string }[];
}

export function DocSidebar({
  lang,
  currentSlug,
  sections,
  langName,
}: {
  lang: string;
  currentSlug: string;
  sections: SidebarSection[];
  langName: string;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (section: string) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-slate-100 shrink-0 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <Link
          href="/docs"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors group"
        >
          <svg className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All Languages
        </Link>
        <h2 className="text-sm font-bold text-slate-900 mt-2">{langName} Documentation</h2>
      </div>

      {/* Sections */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {sections.map((s) => {
          const isCollapsed = collapsed[s.section] ?? false;
          const hasActive = s.pages.some((p) => p.slug === currentSlug);

          return (
            <div key={s.section} className="mb-1">
              {/* Section header */}
              <button
                onClick={() => toggle(s.section)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
              >
                {s.section}
                <svg
                  className={`h-3.5 w-3.5 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Pages */}
              {!isCollapsed && (
                <div className="space-y-0.5">
                  {s.pages.map((p) => {
                    const isActive = p.slug === currentSlug;
                    return (
                      <Link key={p.slug} href={`/docs/${lang}/${p.slug}`}>
                        <div
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 font-medium border-l-[3px] border-emerald-500 pl-[9px]"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          {p.title}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 3: Create the doc viewer client component**

```tsx
// frontend/src/app/docs/[lang]/[slug]/doc-viewer.tsx
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
        {/* Reuse the existing LessonViewer for markdown rendering */}
        <LessonViewer content={content} />

        {/* Previous / Next navigation */}
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
```

- [ ] **Step 4: Create the main doc page server component**

```tsx
// frontend/src/app/docs/[lang]/[slug]/page.tsx
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocSidebar } from "./doc-sidebar";
import { DocViewer } from "./doc-viewer";
import type { DocTopic } from "@/lib/supabase/types";

const LANG_NAMES: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  java: "Java",
  sql: "SQL",
  langchain: "LangChain",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("doc_topics")
    .select("title")
    .eq("lang", lang)
    .eq("slug", slug)
    .single();

  return {
    title: page ? `${page.title} - ${LANG_NAMES[lang] || lang} | CodeGraph Docs` : "Docs | CodeGraph",
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const supabase = await createClient();

  // Fetch all pages for this language (for sidebar)
  const { data: allPages } = await supabase
    .from("doc_topics")
    .select("slug, title, section, order_index, content")
    .eq("lang", lang)
    .order("order_index", { ascending: true });

  if (!allPages || allPages.length === 0) {
    notFound();
  }

  const typed = allPages as DocTopic[];

  // Find current page
  const currentPage = typed.find((p) => p.slug === slug);
  if (!currentPage) {
    notFound();
  }

  // Build sidebar sections
  const sectionMap = new Map<string, { slug: string; title: string }[]>();
  for (const p of typed) {
    if (!sectionMap.has(p.section)) {
      sectionMap.set(p.section, []);
    }
    sectionMap.get(p.section)!.push({ slug: p.slug, title: p.title });
  }
  const sections = [...sectionMap.entries()].map(([section, pages]) => ({
    section,
    pages,
  }));

  // Prev/next navigation
  const currentIdx = typed.findIndex((p) => p.slug === slug);
  const prevPage = currentIdx > 0 ? { slug: typed[currentIdx - 1].slug, title: typed[currentIdx - 1].title } : null;
  const nextPage = currentIdx < typed.length - 1 ? { slug: typed[currentIdx + 1].slug, title: typed[currentIdx + 1].title } : null;

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="fixed top-[72px] left-0 right-0 bottom-0 flex">
        {/* Sidebar */}
        <DocSidebar
          lang={lang}
          currentSlug={slug}
          sections={sections}
          langName={LANG_NAMES[lang] || lang}
        />

        {/* Mobile sidebar toggle + breadcrumb */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Breadcrumb bar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 bg-slate-50/50 text-sm lg:px-6">
            <a href="/docs" className="text-slate-400 hover:text-slate-600 transition-colors">Docs</a>
            <span className="text-slate-300">/</span>
            <a href={`/docs/${lang}`} className="text-slate-400 hover:text-slate-600 transition-colors">{LANG_NAMES[lang] || lang}</a>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 font-medium truncate">{currentPage.title}</span>
          </div>

          {/* Content */}
          <DocViewer
            content={currentPage.content}
            lang={lang}
            prevPage={prevPage}
            nextPage={nextPage}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Build and verify**

Run: `cd frontend && npx next build 2>&1 | tail -10`
Expected: Build succeeds, `/docs/[lang]/[slug]` listed as dynamic

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/docs/
git commit -m "[Frontend] Add doc page route with sidebar and viewer"
```

---

### Task 8: Add Docs Link to Navbar

**Files:**
- Modify: `frontend/src/components/navbar.tsx`

- [ ] **Step 1: Add docs icon and nav link**

In `frontend/src/components/navbar.tsx`, add a `docs` icon to the `Icons` object (after the existing `problems` icon around line 63):

```tsx
docs: () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
),
```

Then modify the `navLinks` array (around line 172) to add Docs as the first link, visible to everyone:

```tsx
const navLinks = [
  { href: "/docs", label: "Docs", icon: Icons.docs },
  { href: "/courses", label: "Courses", icon: Icons.courses },
  { href: "/problems", label: "Problems", icon: Icons.problems },
  ...(user
    ? [
        { href: "/dashboard", label: "Dashboard", icon: Icons.dashboard },
        ...(isAdmin
          ? [{ href: "/admin", label: "Admin", icon: Icons.admin }]
          : []),
      ]
    : []),
];
```

- [ ] **Step 2: Build and verify**

Run: `cd frontend && npx next build 2>&1 | tail -5`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/navbar.tsx
git commit -m "[Frontend] Add Docs link to navbar"
```

---

### Task 9: Build Documentation Content Generator

**Files:**
- Create: `backend/generate_docs.py`

- [ ] **Step 1: Create the doc generator script**

This reuses the same multi-provider LLM rotation pattern from `generate_problems.py`. It generates comprehensive markdown documentation for each topic, one page at a time.

```python
# backend/generate_docs.py
"""
Bulk documentation generator for CodeGraph.
Generates W3Schools-style comprehensive docs for 5 languages.
Multi-provider key rotation: Cerebras → Groq → OpenRouter.
"""
import json, re, time, sys, uuid
from langchain_openai import ChatOpenAI
from app.core.supabase import supabase

CEREBRAS_KEYS = [
    "<CEREBRAS_API_KEY_1>",
    "<CEREBRAS_API_KEY_2>",
    "<CEREBRAS_API_KEY_3>",
    "<CEREBRAS_API_KEY_4>",
    "<CEREBRAS_API_KEY_5>",
]
GROQ_KEYS = [
    "<GROQ_API_KEY_1>",
    "<GROQ_API_KEY_2>",
    "<GROQ_API_KEY_3>",
    "<GROQ_API_KEY_4>",
    "<GROQ_API_KEY_5>",
]
OPENROUTER_KEY = "<OPENROUTER_API_KEY>"

_cerebras_idx = 0
_groq_idx = 0


def make_llm(provider, key):
    configs = {
        "cerebras": ("https://api.cerebras.ai/v1", "qwen-3-235b-a22b-instruct-2507"),
        "groq": ("https://api.groq.com/openai/v1", "llama-3.3-70b-versatile"),
        "openrouter": ("https://openrouter.ai/api/v1", "meta-llama/llama-3.3-70b-instruct"),
    }
    base_url, model = configs[provider]
    return ChatOpenAI(
        base_url=base_url, api_key=key, model=model,
        temperature=0.7, max_tokens=4000, timeout=90,
    )


def next_cerebras():
    global _cerebras_idx
    key = CEREBRAS_KEYS[_cerebras_idx % len(CEREBRAS_KEYS)]
    _cerebras_idx += 1
    return "cerebras", key


def next_groq():
    global _groq_idx
    key = GROQ_KEYS[_groq_idx % len(GROQ_KEYS)]
    _groq_idx += 1
    return "groq", key


# ── Language → Section → Topics mapping ──────────────────────────
DOCS_STRUCTURE = {
    "python": [
        ("Tutorial", [
            "Introduction to Python", "Getting Started & Setup", "Syntax & Indentation",
            "Comments", "Variables", "Data Types", "Numbers", "Casting",
            "Strings", "String Methods", "Booleans", "Operators",
            "If...Else", "While Loops", "For Loops", "Break & Continue",
        ]),
        ("Data Structures", [
            "Lists", "List Methods", "List Comprehensions", "Tuples",
            "Sets", "Set Methods", "Dictionaries", "Dictionary Methods",
        ]),
        ("Functions", [
            "Functions", "Function Arguments", "Lambda Functions",
            "Scope", "Recursion", "Decorators", "Generators",
        ]),
        ("OOP", [
            "Classes & Objects", "Inheritance", "Polymorphism",
            "Encapsulation", "Abstract Classes", "Magic Methods",
        ]),
        ("Modules & Files", [
            "Modules & Import", "pip & Packages", "File Handling",
            "Read Files", "Write Files", "Delete Files",
            "Exception Handling", "Try...Except...Finally",
        ]),
        ("Advanced", [
            "List Comprehensions Advanced", "Regular Expressions",
            "JSON Handling", "Math Module", "Datetime Module",
            "Type Hints", "Virtual Environments", "Unit Testing",
        ]),
    ],
    "javascript": [
        ("Tutorial", [
            "Introduction to JavaScript", "Getting Started", "Syntax & Statements",
            "Comments", "Variables (let, const, var)", "Data Types",
            "Numbers", "Strings", "String Methods", "Template Literals",
            "Booleans", "Operators", "Comparisons",
            "If...Else", "Switch", "While Loops", "For Loops",
            "Break & Continue", "Type Conversion",
        ]),
        ("Functions & Scope", [
            "Functions", "Arrow Functions", "Parameters & Arguments",
            "Default Parameters", "Rest & Spread", "Closures",
            "Scope & Hoisting", "Callbacks",
        ]),
        ("Objects & Arrays", [
            "Arrays", "Array Methods", "Array Iteration",
            "Objects", "Object Methods", "Destructuring",
            "JSON", "Maps", "Sets",
        ]),
        ("DOM & Events", [
            "DOM Introduction", "Selecting Elements", "Changing HTML & CSS",
            "Event Listeners", "Event Propagation", "Forms & Validation",
        ]),
        ("Async JavaScript", [
            "Callbacks & Callback Hell", "Promises", "Async/Await",
            "Fetch API", "Error Handling in Async",
        ]),
        ("ES6+ Features", [
            "let & const", "Template Literals", "Destructuring",
            "Spread & Rest", "Modules (import/export)", "Classes",
            "Symbols", "Iterators & Generators", "Proxy & Reflect",
            "Optional Chaining", "Nullish Coalescing",
        ]),
    ],
    "java": [
        ("Tutorial", [
            "Introduction to Java", "Getting Started & Setup", "Syntax",
            "Output (System.out)", "Comments", "Variables", "Data Types",
            "Type Casting", "Operators", "Strings", "String Methods",
            "Math", "Booleans",
            "If...Else", "Switch", "While Loop", "For Loop",
            "Break & Continue", "Arrays",
        ]),
        ("Methods", [
            "Methods", "Method Parameters", "Method Overloading",
            "Scope", "Recursion",
        ]),
        ("OOP", [
            "Classes & Objects", "Class Attributes", "Class Methods",
            "Constructors", "this Keyword", "Modifiers",
            "Encapsulation", "Inheritance", "Polymorphism",
            "super Keyword", "Abstract Classes", "Interfaces",
            "Enums", "Inner Classes",
        ]),
        ("Error Handling", [
            "Exceptions", "Try...Catch...Finally", "Throw & Throws",
            "Custom Exceptions", "Multiple Exceptions",
        ]),
        ("Data Structures", [
            "Collections Framework", "ArrayList", "LinkedList",
            "HashMap", "HashSet", "TreeMap", "TreeSet",
            "Iterator", "Comparable & Comparator",
        ]),
        ("Advanced", [
            "Generics", "Lambda Expressions", "Streams API",
            "File I/O", "Threads & Concurrency", "Annotations",
            "Regular Expressions",
        ]),
    ],
    "sql": [
        ("Basics", [
            "Introduction to SQL", "SQL Syntax", "SELECT",
            "DISTINCT", "WHERE", "AND, OR, NOT", "ORDER BY",
            "LIMIT & OFFSET", "NULL Values", "Aliases",
        ]),
        ("Filtering & Sorting", [
            "LIKE & Wildcards", "IN", "BETWEEN",
            "GROUP BY", "HAVING", "EXISTS",
        ]),
        ("Joins", [
            "INNER JOIN", "LEFT JOIN", "RIGHT JOIN",
            "FULL OUTER JOIN", "CROSS JOIN", "Self Join",
        ]),
        ("Data Manipulation", [
            "INSERT INTO", "UPDATE", "DELETE",
            "UPSERT (INSERT ON CONFLICT)", "RETURNING Clause",
        ]),
        ("Advanced Queries", [
            "Subqueries", "Common Table Expressions (CTEs)",
            "Window Functions", "UNION & INTERSECT",
            "CASE Expressions", "Aggregate Functions",
        ]),
        ("Database Design", [
            "CREATE TABLE", "ALTER TABLE", "DROP Table",
            "Constraints (PK, FK, UNIQUE)", "Indexes",
            "Views", "Transactions", "Data Types",
        ]),
    ],
    "langchain": [
        ("Getting Started", [
            "What is LangChain?", "Installation & Setup",
            "LLM Basics", "Chat Models", "Prompt Templates",
        ]),
        ("Core Concepts", [
            "Chains", "Sequential Chains", "Output Parsers",
            "Memory", "Conversation Memory Types",
        ]),
        ("RAG Pipeline", [
            "What are Embeddings?", "Text Splitting & Chunking",
            "Vector Stores (pgvector)", "Retrieval Strategies",
            "RAG Chain", "Conversational RAG",
        ]),
        ("Agents & Tools", [
            "What are Agents?", "Tools", "Agent Types",
            "Custom Tools", "Agent with Memory",
        ]),
        ("LangGraph", [
            "Introduction to LangGraph", "State Graphs",
            "Nodes & Edges", "Conditional Routing",
            "Human-in-the-Loop", "Multi-Agent Systems",
        ]),
        ("Advanced", [
            "Streaming", "Callbacks & Tracing",
            "Evaluation & Testing", "Deployment",
            "LangSmith Integration",
        ]),
    ],
}

PROMPT = """Write a comprehensive tutorial page about "{title}" for {lang_name} documentation.

Requirements:
- Start with a clear # heading, then an intro paragraph
- Use ## for major sections within the page
- Include 3-5 code examples with ```{lang_code} blocks
- Show practical, real-world examples (not just "hello world")
- Include a "Try it Yourself" section with a practice exercise
- Add a "Key Points" summary at the end as bullet points
- Explain concepts clearly for beginners but include depth for intermediate learners
- Use tables where comparing options/methods makes sense
- Total length: 400-800 words of content (not counting code blocks)

Write ONLY the markdown content. No meta-commentary."""


def gen_page(lang, lang_name, lang_code, section, title, order_index):
    """Generate one documentation page."""
    providers_to_try = []
    for _ in range(3):
        providers_to_try.append(next_cerebras())
    providers_to_try.append(next_groq())
    providers_to_try.append(("openrouter", OPENROUTER_KEY))

    slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')

    for provider, key in providers_to_try:
        try:
            llm = make_llm(provider, key)
            result = llm.invoke(PROMPT.format(
                title=title, lang_name=lang_name, lang_code=lang_code
            ))
            content = result.content.strip()
            # Strip thinking tags
            content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL).strip()

            if len(content) < 200:
                continue

            row = {
                "lang": lang,
                "section": section,
                "title": title,
                "slug": slug,
                "order_index": order_index,
                "content": content,
            }
            supabase.table("doc_topics").upsert(row, on_conflict="lang,slug").execute()
            return provider

        except Exception as e:
            err = str(e)
            if "429" in err or "rate" in err.lower():
                wait = 5
                m = re.search(r'try again in (\d+(?:\.\d+)?)', err.lower())
                if m:
                    wait = int(float(m.group(1))) + 2
                print(f"    [{provider}] rate limited, wait {wait}s", flush=True)
                time.sleep(wait)
            else:
                print(f"    [{provider}] err: {err[:80]}", flush=True)
                time.sleep(1)

    return None


def main():
    # Check which pages already exist
    result = supabase.table("doc_topics").select("lang, slug").execute()
    existing = {(r["lang"], r["slug"]) for r in result.data}
    print(f"Starting with {len(existing)} existing doc pages", flush=True)

    lang_codes = {
        "python": "python", "javascript": "javascript",
        "java": "java", "sql": "sql", "langchain": "python",
    }
    lang_names = {
        "python": "Python", "javascript": "JavaScript",
        "java": "Java", "sql": "SQL", "langchain": "LangChain",
    }

    # Optional: filter to specific language
    target_lang = sys.argv[1] if len(sys.argv) > 1 else None

    total = 0
    order = 0

    for lang, sections in DOCS_STRUCTURE.items():
        if target_lang and lang != target_lang:
            continue

        lang_name = lang_names[lang]
        lang_code = lang_codes[lang]

        print(f"\n{'='*50}", flush=True)
        print(f"  {lang_name} Documentation", flush=True)
        print(f"{'='*50}", flush=True)

        order = 0
        for section, topics in sections:
            print(f"\n[{section}]", flush=True)
            for title in topics:
                order += 1
                slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')

                if (lang, slug) in existing:
                    print(f"  SKIP: {title} (already exists)", flush=True)
                    continue

                provider = gen_page(lang, lang_name, lang_code, section, title, order)
                if provider:
                    total += 1
                    print(f"  [{provider}] {title} (#{total})", flush=True)
                    existing.add((lang, slug))
                else:
                    print(f"  FAILED: {title}", flush=True)

                time.sleep(2)

    print(f"\n{'='*50}", flush=True)
    print(f"COMPLETE: {total} new doc pages generated", flush=True)


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Commit**

```bash
git add backend/generate_docs.py
git commit -m "[Backend] Add documentation content generator script"
```

---

### Task 10: Generate Documentation Content + Add Navbar Link + Deploy

- [ ] **Step 1: Run the database migration (Task 4)**

Apply the SQL from Task 4 via Supabase dashboard or MCP.

- [ ] **Step 2: Generate docs for all 5 languages**

```bash
cd /home/asnari/Project/CodeGraph/backend
nohup .venv/bin/python -u -m generate_docs > /tmp/codegraph-docs.log 2>&1 &
echo "PID: $!"
```

Monitor: `tail -20 /tmp/codegraph-docs.log`

The structure defines ~230 total pages across 5 languages. At ~3-5 pages/min with Cerebras, this takes ~1-2 hours.

- [ ] **Step 3: Verify content was generated**

Run SQL: `SELECT lang, count(*) FROM doc_topics GROUP BY lang ORDER BY lang;`
Expected: Each language has 30-60+ pages.

- [ ] **Step 4: Build, push, and deploy**

```bash
cd /home/asnari/Project/CodeGraph
npx next build  # verify
git add -A
git commit -m "[Frontend] Documentation wiki + auth gating for courses/problems"
git push origin main
```

- [ ] **Step 5: Verify on production**

Visit `learncodegraph.vercel.app/docs` — should show language grid.
Visit `learncodegraph.vercel.app/docs/python/variables` — should show doc page with sidebar.
Visit `learncodegraph.vercel.app/courses` while logged out — should show login modal.

---

## Summary

| # | Task | Files | Estimate |
|---|------|-------|----------|
| 1 | AuthGate component | 1 new | 5 min |
| 2 | Apply AuthGate to routes | 5 modified | 10 min |
| 3 | AuthGate lesson pages | 1 modified | 3 min |
| 4 | Database table | migration | 2 min |
| 5 | TypeScript types | 1 modified | 2 min |
| 6 | Docs landing page | 1 new | 5 min |
| 7 | Doc page + sidebar | 4 new | 15 min |
| 8 | Navbar docs link | 1 modified | 3 min |
| 9 | Doc content generator | 1 new | 10 min |
| 10 | Generate content + deploy | — | 1-2 hrs (generator runtime) |

**Total pages generated:** ~230 across Python (52), JavaScript (54), Java (51), SQL (34), LangChain (26)
