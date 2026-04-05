"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Exchange PKCE code for session on mount
  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setError("Reset link expired or invalid. Please request a new one.");
        } else {
          setSessionReady(true);
        }
      });
    } else {
      // No code param — check if session already exists (hash-based flow)
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          setSessionReady(true);
        } else {
          setError("No valid reset session. Please request a new reset link.");
        }
      });
    }
  }, [searchParams, supabase.auth]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push("/dashboard"), 2000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <Link href="/" className="flex items-center gap-2.5 mb-10">
          <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
            <rect width="32" height="32" rx="8" fill="#171717" />
            <path d="M8 12L12 16L8 20" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 20H24" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="20" cy="11" r="2" fill="#10b981" />
          </svg>
          <span className="font-bold text-lg text-slate-900">CodeGraph</span>
        </Link>

        {!success ? (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Set new password</h1>
            <p className="text-slate-500 mb-8">Enter your new password below</p>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-4 text-sm text-red-600 mb-6">
                {error}
                {!sessionReady && (
                  <Link href="/auth/forgot-password" className="block mt-2 text-emerald-600 hover:text-emerald-700 font-medium">
                    Request a new reset link
                  </Link>
                )}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium text-sm">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-lg border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-slate-700 font-medium text-sm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 rounded-lg border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg"
                disabled={loading || !sessionReady}
              >
                {loading ? "Updating..." : !sessionReady ? "Verifying link..." : "Update password"}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Password updated!</h2>
            <p className="text-slate-500">Redirecting to dashboard...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
