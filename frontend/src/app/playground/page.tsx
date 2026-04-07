"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CodeEditor } from "@/components/code-editor";
import { AuthModal } from "@/components/auth-modal";
import type { User } from "@supabase/supabase-js";

function PlaygroundSpinner() {
  return (
    <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-400">
        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading playground...
      </div>
    </div>
  );
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
        <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
          <p className="text-gray-500">Sign in to access the full playground</p>
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
    <div className="h-screen flex flex-col bg-[#1e1e1e] pt-20">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/10">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-medium text-gray-300">Playground</h1>
          <span className="text-xs text-gray-500">Write, run, and experiment with code</span>
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
