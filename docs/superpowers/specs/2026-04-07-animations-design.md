# CodeGraph Animation System Design

**Date:** 2026-04-07
**Goal:** Add 10 animations across the platform to make the learning experience more engaging and polished, without duplicating existing Lottie/Framer Motion animations.

**Design Principles:**
- Lightweight CSS/Framer Motion for frequent animations; `canvas-confetti` only for rare celebrations
- All animations respect `prefers-reduced-motion`
- Emerald theme (`#10B981`) throughout
- No changes to existing animations

---

## 1. Floating "+XP" Toast System

**Purpose:** Instant reward feedback whenever XP is earned.

**Implementation:**
- New global `<XpToastProvider>` component wrapping the app in `layout.tsx`
- The existing `"xp-updated"` event is a plain `Event` with no payload. We need to upgrade it to a `CustomEvent` with `detail: { amount: number, reason: string }` in `lib/xp.ts` and all dispatch sites (`daily-xp-trigger.tsx`, `doc-viewer.tsx`, etc.). The `xp-bar.tsx` listener stays compatible (ignores detail).
- On event, renders a `motion.div` emerald pill showing amount ("+25 XP") and reason ("Problem Solved")
- Animation: fade in + slide up 40px over 0.6s, hold 1s, fade out
- Stacks multiple toasts if earned in quick succession
- Positioned top-center of viewport, below the navbar
- Emerald gradient background (`from-emerald-500 to-emerald-600`), white text, small sparkle icon

**Tech:** Framer Motion `AnimatePresence` + `motion.div`. No new dependencies.

**Files:**
- New: `frontend/src/components/xp-toast.tsx`
- Modified: `frontend/src/app/layout.tsx` (wrap with provider)
- Modified: `frontend/src/lib/xp.ts` (upgrade Event to CustomEvent with detail payload)
- Modified: `frontend/src/app/dashboard/daily-xp-trigger.tsx` (add detail to dispatch)
- Modified: `frontend/src/app/docs/[lang]/[slug]/doc-viewer.tsx` (add detail to dispatch)

---

## 2. Page Transitions

**Purpose:** Smooth fade + slide between routes for a polished SPA feel.

**Implementation:**
- New `template.tsx` at the app root (`frontend/src/app/template.tsx`)
- Wraps `{children}` in a Framer Motion `motion.div`
- Enter: fade in + slide up 12px over 0.3s ease-out
- Exit: fade out over 0.15s (fast exit so navigation feels snappy)
- Uses `key` from `usePathname()` so React re-mounts on route change
- Respects `prefers-reduced-motion` — skips animation if set

**Tech:** Framer Motion `motion.div`. No new dependencies.

**Files:**
- New: `frontend/src/app/template.tsx`

---

## 3. Dashboard Animated Counters + Progress Ring

**Purpose:** Make dashboard stats feel dynamic. Numbers count up, level shows as a circular progress ring.

**Implementation:**
- Extract the stats grid from the server component into a new client component `<AnimatedStats>`
- Server component passes data as props
- Use Framer Motion's `useMotionValue` + `useTransform` + `animate` to count from 0 to target over 1.2s ease-out
- Level progress ring: SVG `<circle>` with `stroke-dashoffset` animated via Framer Motion
  - Emerald gradient stroke (`#10B981` to `#34D399`)
  - Ring size: 80x80px
  - Shows level number in center, XP fraction below
- Numbers animate on first mount via `useInView` trigger (not every re-render)

**Tech:** Framer Motion `animate`, `useInView`. Pure SVG for ring. No new dependencies.

**Files:**
- New: `frontend/src/components/animated-stats.tsx`
- New: `frontend/src/components/level-progress-ring.tsx`
- Modified: `frontend/src/app/dashboard/page.tsx` (use new client components)

---

## 4. Dashboard Card Staggered Entrance

**Purpose:** Cards fade in sequentially for a polished entrance.

**Implementation:**
- Wrap each dashboard section in a `motion.div` with variants
- Container variant: `staggerChildren: 0.08`
- Child variant: `hidden: { opacity: 0, y: 20 }` → `visible: { opacity: 1, y: 0 }`
- Transition: 0.4s ease-out per card
- Triggered by `useInView` so cards below the fold animate when scrolled to
- Extract animated sections into a client wrapper component `<StaggerContainer>` + `<StaggerItem>`

**Tech:** Framer Motion variants with stagger. No new dependencies.

**Files:**
- New: `frontend/src/components/stagger-container.tsx`
- Modified: `frontend/src/app/dashboard/page.tsx` (wrap sections)

---

## 5. Enhanced Problem-Solved Celebration

**Purpose:** Bigger dopamine hit when all tests pass — a full-screen emerald confetti burst.

**Implementation:**
- Install `canvas-confetti` (~3KB gzipped)
- In `problem-shell.tsx`, when `submitResult.passed === true`:
  - Fire `canvas-confetti` with emerald palette: `['#10B981', '#34D399', '#6EE7B7']`
  - Config: 80 particles, spread 70, gravity 1.2, ticks 100
  - Fires once, auto-cleans the canvas
- Also briefly flash the editor border emerald for 1s via state toggle
- Existing inline Lottie + "All Tests Passed!" text remains unchanged

**Tech:** `canvas-confetti` (new dependency, ~3KB gzipped).

**Files:**
- Modified: `frontend/src/app/problems/[id]/problem-shell.tsx`
- Modified: `frontend/package.json` (add canvas-confetti)

---

## 6. Landing Page Hero Typing Animation

**Purpose:** Code types out character by character in the hero section, immediately communicating "coding platform" to visitors.

**Implementation:**
- New client component `<TypingCode>`
- Types at ~40ms per character with a blinking cursor (`|`) at the end
- Shows a short Python snippet:
  ```python
  def two_sum(nums, target):
      seen = {}
      for i, num in enumerate(nums):
          if target - num in seen:
              return [seen[target - num], i]
          seen[num] = i
  ```
- After typing completes, cursor blinks 3 times then stops
- Uses `useEffect` with `setInterval` — no animation library needed
- Cursor blink: CSS `@keyframes cursor-blink` with `opacity` toggle at 0.5s intervals
- Replaces the static code block in the hero's code mockup

**Tech:** Pure React state + CSS. No new dependencies.

**Files:**
- New: `frontend/src/components/typing-code.tsx`
- Modified: `frontend/src/app/page.tsx` (use TypingCode in hero)
- Modified: `frontend/src/app/globals.css` (add cursor-blink keyframes)

---

## 7. Leaderboard Staggered Entrance

**Purpose:** Rows reveal like competition results for a "rankings being announced" feel.

**Implementation:**
- Each row is a `motion.div` inside a stagger container
- Container: `staggerChildren: 0.04` (fast, many rows)
- Row: `hidden: { opacity: 0, x: -20 }` → `visible: { opacity: 1, x: 0 }`
- Top 3 rows get extra `scale: [1, 1.02, 1]` spring on entrance
- Tab switching (All Time / Weekly / Monthly): `AnimatePresence mode="wait"` for crossfade between lists

**Tech:** Framer Motion variants + AnimatePresence. No new dependencies.

**Files:**
- Modified: `frontend/src/app/leaderboard/page.tsx`

---

## 8. Course Progress Bar Animation

**Purpose:** Progress bars fill up on mount instead of appearing instantly.

**Implementation:**
- Replace static `style={{ width: \`${progress}%\` }}` with Framer Motion `motion.div`
- Animates width from `0%` to target over 0.8s ease-out
- Triggered by `useInView` so cards below the fold animate when scrolled to
- On the course detail page, when progress hits 100%: add a subtle emerald glow pulse via CSS

**Tech:** Framer Motion `motion.div` with `initial`/`animate`. No new dependencies.

**Files:**
- Modified: `frontend/src/components/course-card.tsx`
- Modified: `frontend/src/app/courses/[id]/page.tsx`

---

## 9. Hover Micro-interactions on Cards

**Purpose:** Tactile hover feedback on interactive cards throughout the platform.

**Implementation:**
- **Problem list items:** `whileHover={{ y: -4, transition: { duration: 0.2 } }}` + CSS `hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-500/30`
- **Course cards:** Already have `whileHover={{ y: -8 }}` — keep as-is
- **Doc language cards:** Add same lift pattern as problem items
- **Dashboard quick-action cards:** `whileHover={{ scale: 1.02 }}` + emerald border glow
- All use CSS `transition-shadow` for the glow and Framer Motion for the transform

**Tech:** Framer Motion `whileHover` + Tailwind CSS classes. No new dependencies.

**Files:**
- Modified: `frontend/src/app/problems/page.tsx`
- Modified: `frontend/src/app/docs/page.tsx`
- Modified: `frontend/src/app/dashboard/page.tsx`

---

## 10. Activity Heatmap "Today" Glow

**Purpose:** Today's cell pulses with emerald glow, nudging the user to maintain their streak.

**Implementation:**
- New CSS `@keyframes heatmap-pulse`: `box-shadow` oscillates between `0 0 0 rgba(16,185,129,0)` and `0 0 8px rgba(16,185,129,0.6)` over 2s infinite
- Apply `.heatmap-today` class to today's cell in the heatmap component
- If today has activity: solid emerald glow (no pulse). If no activity yet: pulsing glow
- Respects `prefers-reduced-motion` via existing media query

**Tech:** Pure CSS keyframes. No dependencies.

**Files:**
- Modified: `frontend/src/app/globals.css` (add heatmap-pulse keyframes + .heatmap-today class)
- Modified: `frontend/src/app/dashboard/page.tsx` (apply class to today's cell)

---

## Dependency Summary

| New Dependency | Size | Used By |
|---|---|---|
| `canvas-confetti` | ~3KB gzip | Problem celebration only |

## New Files

| File | Purpose |
|---|---|
| `frontend/src/app/template.tsx` | Page transitions |
| `frontend/src/components/xp-toast.tsx` | XP toast provider + toast component |
| `frontend/src/components/animated-stats.tsx` | Dashboard counting numbers |
| `frontend/src/components/level-progress-ring.tsx` | SVG circular level progress |
| `frontend/src/components/stagger-container.tsx` | Reusable stagger wrapper |
| `frontend/src/components/typing-code.tsx` | Hero typing animation |

## Modified Files

| File | Changes |
|---|---|
| `frontend/src/app/layout.tsx` | Add XpToastProvider |
| `frontend/src/app/page.tsx` | Use TypingCode in hero |
| `frontend/src/app/dashboard/page.tsx` | AnimatedStats, StaggerContainer, heatmap glow, hover cards |
| `frontend/src/app/problems/[id]/problem-shell.tsx` | canvas-confetti on success |
| `frontend/src/app/problems/page.tsx` | Hover micro-interactions |
| `frontend/src/app/leaderboard/page.tsx` | Staggered rows + tab crossfade |
| `frontend/src/app/docs/page.tsx` | Hover micro-interactions |
| `frontend/src/app/courses/[id]/page.tsx` | Progress bar animation |
| `frontend/src/components/course-card.tsx` | Progress bar animation |
| `frontend/src/app/globals.css` | cursor-blink + heatmap-pulse keyframes |
| `frontend/package.json` | Add canvas-confetti |
