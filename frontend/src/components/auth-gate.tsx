"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LottieAnimation } from "@/components/lottie-animation";
import { LOTTIE } from "@/lib/lottie-assets";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const supabase = createClient();

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
        <div className="w-20 h-20">
          <LottieAnimation
            src={LOTTIE.greenLoader}
            loop
            className="w-full h-full"
          />
        </div>
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
      <div className="pointer-events-none select-none blur-sm opacity-50">
        {children}
      </div>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 max-w-sm w-full mx-4 text-center">
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
            <Link href={`/auth/login?next=${typeof window !== 'undefined' ? encodeURIComponent(window.location.pathname) : '/'}`} className="block">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11">
                Sign in
              </Button>
            </Link>
            <Link href={`/auth/signup?next=${typeof window !== 'undefined' ? encodeURIComponent(window.location.pathname) : '/'}`} className="block">
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
