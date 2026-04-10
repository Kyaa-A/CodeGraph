"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CodeEditor } from "@/components/code-editor";
import { AuthModal } from "@/components/auth-modal";
import { LoadingScreen } from "@/components/loading-screen";
import type { User } from "@supabase/supabase-js";

function PlaygroundSpinner() {
  return <LoadingScreen message="Loading playground..." />;
}

function PlaygroundContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const prefillLang = searchParams.get("lang") || undefined;
  const prefillCode = searchParams.get("code") || undefined;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
      if (!data.user) {
        setShowAuth(true);
      }
    });
  }, [supabase]);

  if (loading) {
    return <PlaygroundSpinner />;
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-slate-500">Sign in to access the full playground</p>
        </div>
        <AuthModal
          open={showAuth}
          onClose={() => router.push("/")}
          message="Sign in to save your code and access the full playground experience"
        />
      </>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Spacer for fixed navbar */}
      <div className="h-20 shrink-0" />
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-medium text-slate-700">Playground</h1>
          <span className="text-xs text-slate-500">Write, run, and experiment with code</span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <CodeEditor initialLanguage={prefillLang} initialCode={prefillCode} />
      </div>
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<PlaygroundSpinner />}>
      <PlaygroundContent />
    </Suspense>
  );
}
