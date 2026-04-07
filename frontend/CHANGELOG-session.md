# Session Changelog — 2026-04-07

## Streak System Fix
- **DailyXpTrigger moved to root layout** (`layout.tsx`) — fires on every page (docs, courses, etc.), not just dashboard
- **Streak calculation updated** — both navbar and dashboard now count daily logins, problem submissions, AND lesson completions
- **Navbar streak rewritten** — was only counting `user_progress.completed_at`, now fetches all 3 activity sources in parallel + streak freezes, uses same walk-backwards algorithm as dashboard
- **Session-cached trigger** — `DailyXpTrigger` uses `sessionStorage` to only fire once per browser session, not on every page navigation
- **XP bar** — added `daily_login` to event labels so it displays correctly in recent XP dropdown

## ARIA Accessibility
- Language dropdowns in **code-editor.tsx** and **problem-shell.tsx** now have `aria-haspopup="listbox"`, `aria-expanded`, `aria-label`, `role="listbox"`, `role="option"`, `aria-selected`
- **Escape key** closes language dropdowns in both components

## Footer Cleanup
- Removed redundant nav links (Courses, Problems, Playground, Docs, Leaderboard) that duplicated the header navbar — footer now just has logo + copyright

## New Files Created
- `src/app/profile/error.tsx` — profile-specific error boundary with retry button + dashboard link
- `src/app/admin/courses/layout.tsx` — metadata: "Manage Courses | Admin | CodeGraph"
- `src/app/admin/lessons/layout.tsx` — metadata: "Manage Lessons | Admin | CodeGraph"
- `src/app/admin/problems/layout.tsx` — metadata: "Manage Problems | Admin | CodeGraph"
- `src/app/admin/users/layout.tsx` — metadata: "Manage Users | Admin | CodeGraph"
- `src/app/courses/[id]/[lessonId]/loading.tsx` — lesson page loading skeleton (split layout with content + dark editor placeholder)
- `src/lib/constants.ts` — shared `SITE_STATS` for "1000+", "600+" strings (single source of truth)
- `src/app/manifest.ts` — PWA web app manifest for "Add to Home Screen" support

## SEO & Performance
- **Sitemap URL** aligned to `codegraph.dev` (was `codegraph.vercel.app`)
- Removed `/auth/login` and `/auth/signup` from sitemap (already disallowed in robots.txt)
- **Viewport export** added to root layout with `themeColor: "#10b981"` for mobile browser chrome coloring
- **Playground page** — extracted duplicated spinner into `PlaygroundSpinner` component, memoized Supabase client with `useMemo`
- **Navbar** — added Playground link to navigation menu
- **Problem list** — added "No matching problems" empty state with "Clear all filters" button when filters/search produce zero results
- **Hardcoded stats** replaced with `SITE_STATS` constants in login page and dashboard page

## Problem Generation (`backend/generate_problems.py`)
- **Rewrote script** with gap-aware generation: queries existing problems per topic/difficulty, only generates what's missing
- **Existing titles fed to LLM** — up to 50 existing titles included in prompt to avoid similar problems
- **Normalized dedup** — case-insensitive + whitespace-normalized title matching
- **CLI flags** added: `--target-multiplier`, `--topic`, `--difficulty`, `--dry-run`, `--start-batch`
- **~800+ new problems generated** targeting 2x coverage across all 20 topics

---

## Session 2 — Continued Improvements

### Bug Fixes
- **problem-shell.tsx** — Fixed missing `activeTab` state declaration causing TypeScript errors; cleaned up type casts
- **chatbot-widget.tsx** — Fixed React hooks ordering violation (early return was before `useEffect`/`useCallback`); moved conditional return after all hooks
- **Landing page** — Fixed `doc_pages` → `doc_topics` table name (was silently returning empty)
- **Bookmarks API** — Added try-catch error handling (was the only API route without it)
- **Stats API** — Added try-catch; removed non-functional `revalidate` export (only works for pages, not route handlers)
- **Auth layout** — Changed title from "Sign In | CodeGraph" to "Auth | CodeGraph" so signup/forgot-password pages don't show wrong title
- **Signup page** — Replaced direct `DotLottieReact` with `LottieAnimation` wrapper for consistency
- **Dead code removed** — Deleted unused `src/app/problems/streak-calendar.tsx` (superseded by shared component)

### Chatbot Widget
- **Hidden on editor pages** — Chat bubble no longer overlaps `/playground`, `/problems/*`, or lesson view (`/courses/[id]/[lessonId]`)

### Course Cards
- **`<img>` → `<Image>`** — Course cards now use Next.js `<Image>` for optimization
- **Progress bar** — Course cards show completed/total lessons with percentage bar

### Profile Page
- **`window.location.reload()` → `router.refresh()`** — Profile editor no longer does full page reload
- **Difficulty breakdown** — New SVG ring chart showing easy/medium/hard problems solved vs total

### Dashboard
- **Daily Challenge** — New card suggesting a random unsolved problem seeded by date (changes daily)
- **Prefers unsolved** — Challenge picks from unsolved pool first, falls back to all problems

### Problems Page
- **Sort options** — New dropdown: Default, Title A-Z, Difficulty, Unsolved First (logged in)
- **Random Problem button** — Shuffle icon next to sort; picks random unsolved problem from current filters

### API Security
- **Bookmarks rate limit** — Changed from IP-based to user ID-based
- **Stats rate limit** — Added IP-based rate limiting (60 req/min)

### Error Boundaries (new files)
- `src/app/dashboard/error.tsx`
- `src/app/leaderboard/error.tsx`
- `src/app/courses/error.tsx`
- `src/app/problems/error.tsx`
- `src/app/docs/error.tsx`
- `src/app/admin/error.tsx`

### Admin Pages
- Added error handling to Supabase insert/delete mutations (courses, lessons, problems)
- Added metadata exports for landing page and 404 page

### Problem Generation (Round 2)
- **3x target multiplier** — Generating ~900+ new unique problems (54 easy, 66 medium, 36 hard per topic)
- **Running in background** — Continues with dedup active, 200+ new problems added so far

---

## Session 3 — Features & UX Polish

### Search Palette (Cmd+K)
- **Wired up `SearchPalette`** — Existing fully-built component was dead code (never rendered). Now imported and rendered in `layout.tsx`
- **Navbar search button** — Added visible "Search ⌘K" button in desktop nav that triggers the palette

### OAuth Authentication
- **GitHub + Google OAuth** — Added OAuth buttons to both login and signup pages
- **Uses `signInWithOAuth`** with proper callback redirect (`/auth/callback?next=...`)
- **Styled with official brand SVG icons** — GitHub (black) and Google (multi-color)

### Problem Solver Toolbar
- **Reset Code button** — Restores starter code for current language (hidden on mobile to save space)
- **Copy Link button** — Copies problem URL to clipboard with checkmark confirmation

### Playground
- **Share button** — Generates shareable URL with `?lang=...&code=...` params and copies to clipboard
- **"Link copied!" feedback** — Temporary confirmation text after copying

### Docs Reading Progress
- **Scroll progress bar** — Thin emerald bar at top of doc viewer showing scroll position within the page
- **Sticky positioned** — Stays visible as user scrolls through content

### Course Detail Page
- **Lesson count for anonymous visitors** — Shows "X lessons" with book icon when not logged in (was only visible inside the progress bar for authenticated users)

### Profile Page
- **Difficulty breakdown rings** — SVG circular progress charts showing easy/medium/hard solved vs total
- **Pulls difficulty from problems table** — Joins submissions with problem difficulty data

