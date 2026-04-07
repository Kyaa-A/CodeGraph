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
