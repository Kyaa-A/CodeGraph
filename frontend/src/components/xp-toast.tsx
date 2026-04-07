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
