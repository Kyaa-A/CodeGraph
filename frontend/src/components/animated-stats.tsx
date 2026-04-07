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
