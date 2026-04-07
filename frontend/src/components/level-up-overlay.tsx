"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { LOTTIE } from "@/lib/lottie-assets";

interface LevelUpEvent {
  oldLevel: number;
  newLevel: number;
}

export function LevelUpOverlay() {
  const [levelUp, setLevelUp] = useState<LevelUpEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<LevelUpEvent>).detail;
      setLevelUp(detail);
    };
    window.addEventListener("level-up", handler);
    return () => window.removeEventListener("level-up", handler);
  }, []);

  useEffect(() => {
    if (levelUp) {
      const timer = setTimeout(() => setLevelUp(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [levelUp]);

  return (
    <AnimatePresence>
      {levelUp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setLevelUp(null)}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-64 h-64">
              <DotLottieReact
                src={LOTTIE.levelUp}
                loop={false}
                autoplay
                className="w-full h-full"
              />
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center -mt-4"
            >
              <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-1">
                Level Up!
              </p>
              <p className="text-white text-3xl sm:text-5xl font-bold mb-2">
                Level {levelUp.newLevel}
              </p>
              <p className="text-white/60 text-sm">
                Keep going, you&apos;re doing great!
              </p>
            </motion.div>

            <motion.button
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => setLevelUp(null)}
              className="mt-6 px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors"
            >
              Continue
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
