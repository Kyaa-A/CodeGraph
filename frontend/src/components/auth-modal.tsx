"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

export function AuthModal({ open, onClose, message }: AuthModalProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            role="button"
            aria-label="Close modal"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Escape" && onClose()}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md mx-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl shadow-black/20 overflow-hidden">
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-800 px-8 pt-10 pb-8 text-center rounded-t-3xl">
                {/* Close button */}
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Logo */}
                <div className="inline-flex items-center justify-center mb-4">
                  <svg viewBox="0 0 32 32" fill="none" className="h-12 w-12">
                    <rect width="32" height="32" rx="8" fill="#171717" />
                    <path d="M8 12L12 16L8 20" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 20H24" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="20" cy="11" r="2" fill="#10b981" />
                  </svg>
                </div>

                <h2 className="text-xl font-bold text-white">
                  Sign in to CodeGraph
                </h2>
                <p className="mt-2 text-sm text-white/60">
                  {message || "Create an account or sign in to access the full experience"}
                </p>
              </div>

              {/* Body */}
              <div className="px-8 py-8 space-y-3">
                <Link href={`/auth/signup?next=${encodeURIComponent(pathname)}`} className="block">
                  <Button className="w-full h-12 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm">
                    Create Free Account
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Button>
                </Link>

                <Link href={`/auth/login?next=${encodeURIComponent(pathname)}`} className="block">
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl border-neutral-200 hover:bg-neutral-50 font-medium text-sm"
                  >
                    I already have an account
                  </Button>
                </Link>

                <p className="text-center text-xs text-muted-foreground pt-2">
                  Free forever for individual learners
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
