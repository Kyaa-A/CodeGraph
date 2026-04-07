# CodeGraph Animation System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 10 animations across CodeGraph to make learning more engaging — reward feedback, polished transitions, and micro-interactions.

**Architecture:** All animations use Framer Motion (already installed at v12.38) and CSS keyframes, except for problem-solved confetti which uses `canvas-confetti` (~3KB). The XP toast system listens to the existing `"xp-updated"` window event (upgraded to `CustomEvent` with payload). Dashboard animations extract server-rendered data into client components. All animations respect `prefers-reduced-motion`.

**Tech Stack:** Framer Motion 12, React 19, Next.js 16, CSS keyframes, canvas-confetti, Tailwind CSS 4

---

### Task 1: Install canvas-confetti

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Install canvas-confetti**

```bash
cd /home/asnari/Project/CodeGraph/frontend && npm install canvas-confetti && npm install -D @types/canvas-confetti
```

- [ ] **Step 2: Verify installation**

```bash
cd /home/asnari/Project/CodeGraph/frontend && node -e "require('canvas-confetti'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
cd /home/asnari/Project/CodeGraph && git add frontend/package.json frontend/package-lock.json
git commit -m "chore: add canvas-confetti for problem celebration animation"
```

---

### Task 2: Upgrade xp-updated Event to CustomEvent with Payload

**Files:**
- Modify: `frontend/src/lib/xp.ts:44,81`
- Modify: `frontend/src/app/dashboard/daily-xp-trigger.tsx:16`
- Modify: `frontend/src/app/docs/[lang]/[slug]/doc-viewer.tsx:137`

The existing `"xp-updated"` event is a plain `Event` with no payload. We need to add `{ amount, reason }` so the toast can display what was earned. The existing `xp-bar.tsx` listener ignores `detail` so it stays compatible.

- [ ] **Step 1: Update awardProblemXp in xp.ts**

In `frontend/src/lib/xp.ts`, replace line 44:

```typescript
// OLD:
window.dispatchEvent(new Event("xp-updated"));

// NEW:
window.dispatchEvent(new CustomEvent("xp-updated", {
  detail: { amount: xpAmount, reason: "Problem Solved" },
}));
```

- [ ] **Step 2: Update awardLessonXp in xp.ts**

In `frontend/src/lib/xp.ts`, replace line 81:

```typescript
// OLD:
window.dispatchEvent(new Event("xp-updated"));

// NEW:
window.dispatchEvent(new CustomEvent("xp-updated", {
  detail: { amount: XP_AMOUNTS.lesson, reason: "Lesson Complete" },
}));
```

- [ ] **Step 3: Update DailyXpTrigger**

In `frontend/src/app/dashboard/daily-xp-trigger.tsx`, replace line 16:

```typescript
// OLD:
window.dispatchEvent(new Event("xp-updated"));

// NEW:
window.dispatchEvent(new CustomEvent("xp-updated", {
  detail: { amount: 5, reason: "Daily Login" },
}));
```

- [ ] **Step 4: Update doc-viewer.tsx**

In `frontend/src/app/docs/[lang]/[slug]/doc-viewer.tsx`, replace line 137:

```typescript
// OLD:
window.dispatchEvent(new Event("xp-updated"));

// NEW:
window.dispatchEvent(new CustomEvent("xp-updated", {
  detail: { amount: 5, reason: "Doc Read" },
}));
```

- [ ] **Step 5: Verify xp-bar.tsx still works**

Read `frontend/src/components/xp-bar.tsx` to confirm the event listener at line 46 (`window.addEventListener("xp-updated", handler)`) does not destructure `detail` — it just calls `fetchXpData()` on any `"xp-updated"` event, so it stays compatible with `CustomEvent`.

- [ ] **Step 6: Commit**

```bash
cd /home/asnari/Project/CodeGraph && git add frontend/src/lib/xp.ts frontend/src/app/dashboard/daily-xp-trigger.tsx frontend/src/app/docs/[lang]/[slug]/doc-viewer.tsx
git commit -m "feat: upgrade xp-updated event to CustomEvent with amount and reason payload"
```

---

### Task 3: Create XP Toast Component

**Files:**
- Create: `frontend/src/components/xp-toast.tsx`
- Modify: `frontend/src/app/layout.tsx:78`

- [ ] **Step 1: Create the XP toast component**

Create `frontend/src/components/xp-toast.tsx`:

```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface XpToast {
  id: number;
  amount: number;
  reason: string;
}

let toastId = 0;

export function XpToastProvider() {
  const [toasts, setToasts] = useState<XpToast[]>([]);

  const addToast = useCallback((amount: number, reason: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, amount, reason }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.amount) {
        addToast(detail.amount, detail.reason || "XP Earned");
      }
    };
    window.addEventListener("xp-updated", handler);
    return () => window.removeEventListener("xp-updated", handler);
  }, [addToast]);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-sm font-bold">+{toast.amount} XP</span>
            <span className="text-xs text-emerald-100">{toast.reason}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Add XpToastProvider to layout.tsx**

In `frontend/src/app/layout.tsx`, add the import and component. After the existing dynamic imports (around line 17), add:

```tsx
const XpToastProvider = dynamic(() => import("@/components/xp-toast").then((m) => m.XpToastProvider), {
  ssr: false,
});
```

Then inside the `<body>` tag, add `<XpToastProvider />` after `<LevelUpOverlay />` (after line 77):

```tsx
<LevelUpOverlay />
<XpToastProvider />
```

- [ ] **Step 3: Verify the build**

```bash
cd /home/asnari/Project/CodeGraph/frontend && npx next build 2>&1 | tail -20
```

Expected: Build succeeds without errors.

- [ ] **Step 4: Commit**

```bash
cd /home/asnari/Project/CodeGraph && git add frontend/src/components/xp-toast.tsx frontend/src/app/layout.tsx
git commit -m "feat: add floating XP toast notification system"
```

---

### Task 4: Page Transitions via template.tsx

**Files:**
- Create: `frontend/src/app/template.tsx`

Per Next.js 16 docs, `template.tsx` wraps between layout and children and is given a unique key per route segment automatically. It remounts on navigation, making it ideal for entrance animations.

- [ ] **Step 1: Create the template file**

Create `frontend/src/app/template.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

Note: We use a simple fade+slide entrance only (no exit animation) to avoid layout flash issues. The `template.tsx` automatically gets a unique key per route segment, so React unmounts/remounts on navigation, triggering the `initial` state each time.

- [ ] **Step 2: Verify the build**

```bash
cd /home/asnari/Project/CodeGraph/frontend && npx next build 2>&1 | tail -20
```

Expected: Build succeeds. The template wraps all pages under `app/`.

- [ ] **Step 3: Commit**

```bash
cd /home/asnari/Project/CodeGraph && git add frontend/src/app/template.tsx
git commit -m "feat: add page transition animation via template.tsx"
```

---

### Task 5: CSS Keyframes for Cursor Blink and Heatmap Pulse

**Files:**
- Modify: `frontend/src/app/globals.css:271` (before the reduced motion section)

- [ ] **Step 1: Add keyframes to globals.css**

In `frontend/src/app/globals.css`, add the following before the `/* Reduced Motion */` comment (before line 274):

```css
  /* Typing cursor blink */
  @keyframes cursor-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .typing-cursor {
    animation: cursor-blink 1s step-end infinite;
  }

  /* Heatmap today pulse */
  @keyframes heatmap-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    50% { box-shadow: 0 0 8px 2px rgba(16, 185, 129, 0.5); }
  }

  .heatmap-today-pulse {
    animation: heatmap-pulse 2s ease-in-out infinite;
  }

  .heatmap-today-solid {
    box-shadow: 0 0 6px 1px rgba(16, 185, 129, 0.4);
  }
```

- [ ] **Step 2: Commit**

```bash
cd /home/asnari/Project/CodeGraph && git add frontend/src/app/globals.css
git commit -m "feat: add CSS keyframes for typing cursor and heatmap pulse"
```

---

### Task 6: Landing Page Hero Typing Animation

**Files:**
- Create: `frontend/src/components/typing-code.tsx`
- Modify: `frontend/src/app/page.tsx:109-116`

- [ ] **Step 1: Create the TypingCode component**

Create `frontend/src/components/typing-code.tsx`:

```tsx
"use client";

import { useState, useEffect, useRef } from "react";

const CODE = `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        if target - num in seen:
            return [seen[target - num], i]
        seen[num] = i`;

const CHAR_DELAY = 35;

export function TypingCode() {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (indexRef.current < CODE.length) {
        indexRef.current++;
        setDisplayed(CODE.slice(0, indexRef.current));
      } else {
        clearInterval(timer);
        setDone(true);
      }
    }, CHAR_DELAY);
    return () => clearInterval(timer);
  }, []);

  return (
    <pre className="text-sm text-slate-700 font-mono leading-relaxed whitespace-pre">
      {displayed}
      {!done && <span className="typing-cursor text-emerald-500">|</span>}
    </pre>
  );
}
```

- [ ] **Step 2: Replace the static mockup lines in the hero**

In `frontend/src/app/page.tsx`, the hero right panel (lines 109-116) currently shows static gray bars:

```tsx
// OLD (lines 109-116):
                <div className="p-7 bg-white">
                  <div className="space-y-2.5">
                    <div className="h-2.5 w-3/4 bg-slate-100 rounded" />
                    <div className="h-2.5 w-1/2 bg-slate-100 rounded" />
                    <div className="h-2.5 w-5/6 bg-slate-100 rounded" />
                    <div className="h-2.5 w-2/3 bg-slate-100 rounded" />
                    <div className="h-2.5 w-4/5 bg-slate-100 rounded" />
                  </div>
```

Replace with:

```tsx
// NEW:
                <div className="p-7 bg-white min-h-[180px]">
                  <TypingCode />
```

Also add the import at the top of the file (after line 15):

```tsx
import { TypingCode } from "@/components/typing-code";
```

Note: The `TypingCode` component is a client component. The landing page (`page.tsx`) is a server component. In Next.js 16, you can import a client component into a server component — Next.js handles the boundary automatically. However, the `TypingCode` component needs to be rendered on the client side. Since it's imported with `"use client"` directive, this is handled automatically.

Wait — the landing page uses `async` and is a server component. We need to ensure the import works. In Next.js, importing a `"use client"` component into a server component is fine — it creates a client boundary at the component level.

- [ ] **Step 3: Remove the now-unused difficulty badge section below the code area**

The difficulty badges (lines 117-128) should remain — they're a separate visual element below the code:

```tsx
                  <div className="mt-7 flex items-center gap-3">
```

Make sure `mt-7` is still present after the `<TypingCode />` to maintain spacing. The full replacement block should be:

```tsx
                <div className="p-7 bg-white min-h-[180px]">
                  <TypingCode />
                  <div className="mt-7 flex items-center gap-3">
```

- [ ] **Step 4: Verify the build**

```bash
cd /home/asnari/Project/CodeGraph/frontend && npx next build 2>&1 | tail -20
```

- [ ] **Step 5: Commit**

```bash
cd /home/asnari/Project/CodeGraph && git add frontend/src/components/typing-code.tsx frontend/src/app/page.tsx
git commit -m "feat: add typing code animation to landing page hero"
```

---

### Task 7: Stagger Container (Reusable Component)

**Files:**
- Create: `frontend/src/components/stagger-container.tsx`

This reusable component will be used by the dashboard (Task 8) and leaderboard (Task 10).

- [ ] **Step 1: Create the stagger container component**

Create `frontend/src/components/stagger-container.tsx`:

```tsx
"use client";

import { motion, type Variants } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export function StaggerContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/asnari/Project/CodeGraph && git add frontend/src/components/stagger-container.tsx
git commit -m "feat: add reusable StaggerContainer and StaggerItem components"
```

---

### Task 8: Dashboard Animated Stats, Progress Ring, and Staggered Entrance

**Files:**
- Create: `frontend/src/components/animated-stats.tsx`
- Create: `frontend/src/components/level-progress-ring.tsx`
- Create: `frontend/src/components/dashboard-sections.tsx`
- Modify: `frontend/src/app/dashboard/page.tsx`

The dashboard is a server component. We need to extract the parts that need animation into client components, passing data as props.

- [ ] **Step 1: Create the animated counter component**

Create `frontend/src/components/animated-stats.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

function AnimatedNumber({ value, className = "" }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 1200;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [isInView, value]);

  return <span ref={ref} className={className}>{display.toLocaleString()}</span>;
}

export function AnimatedStatGrid({
  lessons,
  problems,
  courses,
}: {
  lessons: number;
  problems: number;
  courses: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
      <div>
        <p className="text-2xl font-bold text-emerald-400">
          <AnimatedNumber value={lessons} />
        </p>
        <p className="text-xs text-slate-400">Lessons</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-emerald-400">
          <AnimatedNumber value={problems} />
        </p>
        <p className="text-xs text-slate-400">Problems</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-emerald-400">
          <AnimatedNumber value={courses} />
        </p>
        <p className="text-xs text-slate-400">Courses</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the level progress ring component**

Create `frontend/src/components/level-progress-ring.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface LevelProgressRingProps {
  level: number;
  progress: number; // 0-100
  size?: number;
}

export function LevelProgressRing({ level, progress, size = 64 }: LevelProgressRingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    if (!isInView) return;
    const duration = 1200;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimatedProgress(eased * progress);
      if (p < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [isInView, progress]);

  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#emerald-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-none"
        />
        <defs>
          <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl sm:text-3xl font-bold text-white">{level}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create the dashboard sections wrapper**

Create `frontend/src/components/dashboard-sections.tsx`:

```tsx
"use client";

import { StaggerContainer, StaggerItem } from "@/components/stagger-container";

export function DashboardStagger({ children }: { children: React.ReactNode }) {
  return (
    <StaggerContainer>
      {children}
    </StaggerContainer>
  );
}

export { StaggerItem as DashboardSection };
```

- [ ] **Step 4: Update dashboard page — replace static stats grid**

In `frontend/src/app/dashboard/page.tsx`, add imports at the top:

```tsx
import { AnimatedStatGrid } from "@/components/animated-stats";
import { LevelProgressRing } from "@/components/level-progress-ring";
import { DashboardStagger, DashboardSection } from "@/components/dashboard-sections";
```

Then replace the static stats grid (lines 268-280):

```tsx
// OLD:
              <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
                <div>
                  <p className="text-2xl font-bold text-emerald-400">{totalLessonsCompleted}</p>
                  <p className="text-xs text-slate-400">Lessons</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">{problemsSolved}</p>
                  <p className="text-xs text-slate-400">Problems</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">{coursesCompleted}</p>
                  <p className="text-xs text-slate-400">Courses</p>
                </div>
              </div>

// NEW:
              <AnimatedStatGrid
                lessons={totalLessonsCompleted}
                problems={problemsSolved}
                courses={coursesCompleted}
              />
```

- [ ] **Step 5: Replace the static level badge with the progress ring**

Replace the level badge block (lines 259-266):

```tsx
// OLD:
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg shadow-emerald-500/30">
                  {level}
                </div>
                <div>
                  <p className="text-sm text-slate-400">Level {level}</p>
                  <p className="text-xl sm:text-2xl font-bold">{totalXp.toLocaleString()} XP</p>
                </div>
              </div>

// NEW:
              <div className="flex items-center gap-4">
                <LevelProgressRing level={level} progress={xpProgress} />
                <div>
                  <p className="text-sm text-slate-400">Level {level}</p>
                  <p className="text-xl sm:text-2xl font-bold">{totalXp.toLocaleString()} XP</p>
                </div>
              </div>
```

- [ ] **Step 6: Wrap dashboard sections in stagger animation**

Wrap the main content area of the dashboard with `DashboardStagger`. The sections to wrap are the ones after the Level+XP card. Replace the return statement structure by wrapping key sections in `DashboardSection`:

Around the activity heatmap section (line 298), wrap it:

```tsx
// Wrap the content after the Level+XP card with DashboardStagger
<DashboardStagger>
  {/* Activity Heatmap */}
  <DashboardSection>
    <div className="mb-8 rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
      ...existing heatmap content...
    </div>
  </DashboardSection>

  {/* Continue + Daily Challenge */}
  <DashboardSection>
    <div className="grid sm:grid-cols-2 gap-4 mb-8">
      ...existing content...
    </div>
  </DashboardSection>

  {/* Quick Actions */}
  <DashboardSection>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      ...existing content...
    </div>
  </DashboardSection>

  {/* Main content grid */}
  <DashboardSection>
    <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
      ...existing content...
    </div>
  </DashboardSection>
</DashboardStagger>
```

- [ ] **Step 7: Verify the build**

```bash
cd /home/asnari/Project/CodeGraph/frontend && npx next build 2>&1 | tail -20
```

- [ ] **Step 8: Commit**

```bash
cd /home/asnari/Project/CodeGraph && git add frontend/src/components/animated-stats.tsx frontend/src/components/level-progress-ring.tsx frontend/src/components/dashboard-sections.tsx frontend/src/app/dashboard/page.tsx
git commit -m "feat: add animated stats, level progress ring, and stagger entrance to dashboard"
```

---

### Task 9: Enhanced Problem-Solved Confetti

**Files:**
- Modify: `frontend/src/app/problems/[id]/problem-shell.tsx:189-194`

- [ ] **Step 1: Add confetti import**

At the top of `frontend/src/app/problems/[id]/problem-shell.tsx`, add:

```tsx
import confetti from "canvas-confetti";
```

- [ ] **Step 2: Add confetti trigger on successful submission**

In the `handleSubmit` callback, after line 191 (`if (data.passed) {`), add the confetti call before `setTimerRunning(false)`:

```tsx
      if (data.passed) {
        // Fire emerald confetti burst
        confetti({
          particleCount: 80,
          spread: 70,
          gravity: 1.2,
          ticks: 120,
          origin: { y: 0.6 },
          colors: ["#10B981", "#34D399", "#6EE7B7"],
        });
        setTimerRunning(false);
```

- [ ] **Step 3: Verify the build**

```bash
cd /home/asnari/Project/CodeGraph/frontend && npx next build 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
cd /home/asnari/Project/CodeGraph && git add frontend/src/app/problems/[id]/problem-shell.tsx
git commit -m "feat: add emerald confetti burst on problem solve"
```

---

### Task 10: Leaderboard Staggered Entrance and Tab Crossfade

**Files:**
- Modify: `frontend/src/app/leaderboard/leaderboard-tabs.tsx`

- [ ] **Step 1: Add imports**

At the top of `frontend/src/app/leaderboard/leaderboard-tabs.tsx`, add:

```tsx
import { motion, AnimatePresence } from "framer-motion";
```

- [ ] **Step 2: Wrap the table rows with stagger animation**

Replace the user rows section (lines 102-133). Wrap the mapping inside an `AnimatePresence` + `motion.div` container with stagger:

```tsx
// OLD:
        {users.map((u) => (
          <div
            key={u.id}
            className={`grid grid-cols-[32px_1fr_64px] sm:grid-cols-[48px_1fr_80px_80px_80px] px-3 sm:px-4 py-3 items-center border-b border-slate-50 last:border-0 transition-colors ${
              u.isCurrentUser ? "bg-emerald-50/50" : u.rank % 2 === 0 ? "bg-slate-50/40" : ""
            }`}
          >

// NEW:
        <AnimatePresence mode="wait">
          <motion.div
            key={period}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {users.map((u, index) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.04,
                  ease: "easeOut",
                }}
                className={`grid grid-cols-[32px_1fr_64px] sm:grid-cols-[48px_1fr_80px_80px_80px] px-3 sm:px-4 py-3 items-center border-b border-slate-50 last:border-0 transition-colors ${
                  u.isCurrentUser ? "bg-emerald-50/50" : u.rank % 2 === 0 ? "bg-slate-50/40" : ""
                }`}
              >
```

Make sure to close the wrapping tags at the end:

```tsx
// Close the motion.div and AnimatePresence after the users.map and the empty state:
              </motion.div>
            ))}

            {users.length === 0 && (
              // ... existing empty state unchanged ...
            )}
          </motion.div>
        </AnimatePresence>
```

- [ ] **Step 3: Add scale bounce for top 3**

For the top 3 podium entries (ranks 1-3), add a subtle scale spring. In the top row `motion.div`, add `whileInView` for the podium rows. Since these are already displayed in the podium section above, the table rows for rank <= 3 get an extra style:

In the `motion.div` for each user row, add a conditional `animate` prop:

```tsx
animate={{
  opacity: 1,
  x: 0,
  scale: u.rank <= 3 ? [1, 1.02, 1] : 1,
}}
```

- [ ] **Step 4: Verify the build**

```bash
cd /home/asnari/Project/CodeGraph/frontend && npx next build 2>&1 | tail -20
```

- [ ] **Step 5: Commit**

```bash
cd /home/asnari/Project/CodeGraph && git add frontend/src/app/leaderboard/leaderboard-tabs.tsx
git commit -m "feat: add staggered row entrance and tab crossfade to leaderboard"
```

---

### Task 11: Course Progress Bar Animation

**Files:**
- Modify: `frontend/src/components/course-card.tsx:74-75`
- Modify: `frontend/src/app/courses/[id]/page.tsx:197-201`

- [ ] **Step 1: Animate course card progress bar**

In `frontend/src/components/course-card.tsx`, the progress bar (lines 74-75) is:

```tsx
// OLD:
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(progress.completed / progress.total) * 100}%` }} />
              </div>

// NEW:
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: "0%" }}
                  whileInView={{ width: `${(progress.completed / progress.total) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                />
              </div>
```

The `motion` import is already present in this file (line 5: `import { motion } from "framer-motion"`).

- [ ] **Step 2: Animate course detail page progress bar**

In `frontend/src/app/courses/[id]/page.tsx`, the progress bar (lines 197-201):

This is a server component, so we cannot use Framer Motion directly here. Instead, add CSS animation. Replace:

```tsx
// OLD:
                  <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

// NEW:
                  <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000 ease-out"
                      style={{
                        width: `${progressPercent}%`,
                        animation: "progress-fill 0.8s ease-out",
                      }}
                    />
                  </div>
```

Also add a keyframe in `globals.css` (in the utilities layer, before the reduced motion section). In Task 5 we already edited globals.css, so add this alongside:

```css
  @keyframes progress-fill {
    from { width: 0%; }
  }
```

- [ ] **Step 3: Add progress-fill keyframe to globals.css**

In `frontend/src/app/globals.css`, add inside the `@layer utilities` block (near the other keyframes added in Task 5):

```css
  /* Progress bar fill animation */
  @keyframes progress-fill {
    from { width: 0%; }
  }
```

- [ ] **Step 4: Verify the build**

```bash
cd /home/asnari/Project/CodeGraph/frontend && npx next build 2>&1 | tail -20
```

- [ ] **Step 5: Commit**

```bash
cd /home/asnari/Project/CodeGraph && git add frontend/src/components/course-card.tsx frontend/src/app/courses/[id]/page.tsx frontend/src/app/globals.css
git commit -m "feat: add animated progress bars to course cards and course detail page"
```

---

### Task 12: Hover Micro-interactions on Cards

**Files:**
- Modify: `frontend/src/app/docs/page.tsx:153-161`
- Modify: `frontend/src/app/dashboard/page.tsx:393-438` (quick action cards)

- [ ] **Step 1: Add hover lift to doc language cards**

In `frontend/src/app/docs/page.tsx`, the language cards (lines 153-161) use a plain `<Link>`. Since this is a server component, use CSS-only hover effects. Update the className:

```tsx
// OLD:
                    className={`group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                      available
                        ? "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-100/50"
                        : "bg-slate-50 border-slate-100 opacity-50 pointer-events-none"
                    }`}

// NEW:
                    className={`group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                      available
                        ? "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1"
                        : "bg-slate-50 border-slate-100 opacity-50 pointer-events-none"
                    }`}
```

- [ ] **Step 2: Add hover scale to dashboard quick-action cards**

In `frontend/src/app/dashboard/page.tsx`, the quick action cards (lines 393-438) are inside `<Link>` elements. Since these are server-rendered, use CSS hover transforms. Update each quick action Link's className by replacing `hover:shadow-md` with `hover:shadow-md hover:-translate-y-0.5`. For example, for the first one (line 394-404):

```tsx
// OLD:
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group text-center"

// NEW:
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 hover:-translate-y-0.5 transition-all group text-center"
```

Apply the same `hover:-translate-y-0.5` addition to all 4 quick action cards:
- Courses card (line ~396)
- Problems card (line ~407)
- Docs card (line ~418)
- Playground card (line ~429)

- [ ] **Step 3: Verify the build**

```bash
cd /home/asnari/Project/CodeGraph/frontend && npx next build 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
cd /home/asnari/Project/CodeGraph && git add frontend/src/app/docs/page.tsx frontend/src/app/dashboard/page.tsx
git commit -m "feat: add hover micro-interactions to doc cards and dashboard quick actions"
```

---

### Task 13: Activity Heatmap "Today" Glow

**Files:**
- Modify: `frontend/src/app/dashboard/streak-heatmap.tsx:135-138`

The CSS keyframes were already added in Task 5. Now we apply the classes.

- [ ] **Step 1: Update the heatmap cell rendering**

In `frontend/src/app/dashboard/streak-heatmap.tsx`, update the cell div (lines 132-139) to add the glow class for today's cell:

```tsx
// OLD:
                <div
                  key={day.date}
                  className={`w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] rounded-[2px] ${cellColor(day.level, day.isFrozen, day.isRecovered)} ${
                    day.isToday ? "ring-1 ring-slate-400 ring-offset-1" : ""
                  }`}
                  title={`${day.date}${day.level >= 1 && !day.isFrozen && !day.isRecovered ? ` - ${day.level} activities` : day.isFrozen ? " - Frozen" : day.isRecovered ? " - Recovered" : ""}`}
                />

// NEW:
                <div
                  key={day.date}
                  className={`w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] rounded-[2px] ${cellColor(day.level, day.isFrozen, day.isRecovered)} ${
                    day.isToday
                      ? day.level >= 1
                        ? "heatmap-today-solid"
                        : "heatmap-today-pulse"
                      : ""
                  }`}
                  title={`${day.date}${day.level >= 1 && !day.isFrozen && !day.isRecovered ? ` - ${day.level} activities` : day.isFrozen ? " - Frozen" : day.isRecovered ? " - Recovered" : ""}`}
                />
```

Logic:
- If today AND has activity (`level >= 1`): solid emerald glow (`.heatmap-today-solid`)
- If today AND no activity yet (`level === 0`): pulsing emerald glow (`.heatmap-today-pulse`) to nudge the user
- Other days: no glow

- [ ] **Step 2: Verify the build**

```bash
cd /home/asnari/Project/CodeGraph/frontend && npx next build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
cd /home/asnari/Project/CodeGraph && git add frontend/src/app/dashboard/streak-heatmap.tsx
git commit -m "feat: add emerald glow/pulse to today's heatmap cell"
```

---

### Task 14: Final Build Verification and Cleanup

**Files:**
- Review all modified files

- [ ] **Step 1: Full build**

```bash
cd /home/asnari/Project/CodeGraph/frontend && npx next build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Lint check**

```bash
cd /home/asnari/Project/CodeGraph/frontend && npx eslint src/ 2>&1 | tail -20
```

Fix any lint errors if found.

- [ ] **Step 3: Remove dead code**

Delete the unused `authIllustration` entry from `frontend/src/lib/lottie-assets.ts` (identified during the audit) and delete the unused `.floating` class from `globals.css` (lines 254-262). These are pre-existing dead code, not from our changes.

Actually — skip this. The spec says "No changes to existing animations" and removing dead code is outside the scope of this task. Leave them.

- [ ] **Step 4: Final commit (if any fixes were needed)**

```bash
cd /home/asnari/Project/CodeGraph && git add -A
git commit -m "fix: address lint/build issues from animation additions"
```

Only run this if Step 2 found issues that needed fixing.
