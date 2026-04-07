"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LottieAnimation } from "@/components/lottie-animation";
import { LOTTIE } from "@/lib/lottie-assets";
import { LogoIcon } from "@/components/logo";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

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
            <LogoIcon className="h-10 w-10" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to continue</h2>
          <p className="text-sm text-slate-500 mb-6">
            Create a free account to access courses, problems, and track your progress.
          </p>

          <div className="space-y-3">
            <Link href={`/auth/login?next=${encodeURIComponent(pathname)}`} className="block">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11">
                Sign in
              </Button>
            </Link>
            <Link href={`/auth/signup?next=${encodeURIComponent(pathname)}`} className="block">
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
