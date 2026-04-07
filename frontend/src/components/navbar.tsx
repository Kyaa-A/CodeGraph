"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";
import React from "react";
import { XpBar } from "@/components/xp-bar";
import { LogoIcon } from "@/components/logo";

// Icons as SVG components
const Icons = {
  logo: () => <LogoIcon />,
  menu: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  close: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  courses: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  dashboard: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  admin: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  problems: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  docs: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
};

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [streak, setStreak] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    if (!user) {
      setStreak(0);
      setIsAdmin(false);
      return;
    }
    // Check admin role
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setIsAdmin(data?.role === "admin");
      });
    // Fetch streak from all activity sources: lessons, problems, daily logins
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    Promise.all([
      supabase.from("user_progress").select("completed_at").eq("user_id", user.id).eq("completed", true),
      supabase.from("problem_submissions").select("created_at").eq("user_id", user.id).eq("passed", true),
      supabase.from("xp_events").select("created_at").eq("user_id", user.id).eq("event_type", "daily_login"),
      supabase.from("streak_freezes").select("frozen_date").eq("user_id", user.id),
    ]).then(([progressRes, subsRes, loginsRes, freezesRes]) => {
      const lessonDates = (progressRes.data ?? [])
        .filter((p) => p.completed_at)
        .map((p) => fmt(new Date(p.completed_at!)));
      const submissionDates = (subsRes.data ?? [])
        .map((s) => fmt(new Date(s.created_at)));
      const loginDates = (loginsRes.data ?? [])
        .map((e) => fmt(new Date(e.created_at)));
      const protectedDates = new Set((freezesRes.data ?? []).map((f) => f.frozen_date));

      const allActiveDates = new Set([...lessonDates, ...submissionDates, ...loginDates]);

      if (allActiveDates.size === 0 && protectedDates.size === 0) {
        setStreak(0);
        return;
      }

      // Walk backwards from today counting consecutive active or protected days
      let count = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = fmt(d);
        if (allActiveDates.has(dateStr) || protectedDates.has(dateStr)) {
          count++;
        } else if (i > 0) {
          break;
        }
        // Grace: if today has no activity yet, don't break — check yesterday
      }
      setStreak(count);
    });
  }, [user, supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  // Hide navbar on auth pages (they have their own logo)
  if (pathname.startsWith("/auth")) return null;

  const navLinks = [
    { href: "/docs", label: "Docs", icon: Icons.docs },
    { href: "/courses", label: "Courses", icon: Icons.courses },
    { href: "/problems", label: "Problems", icon: Icons.problems },
    { href: "/playground", label: "Playground", icon: () => (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { href: "/leaderboard", label: "Ranking", icon: () => (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    ...(user
      ? [
          { href: "/dashboard", label: "Dashboard", icon: Icons.dashboard },
          ...(isAdmin
            ? [{ href: "/admin", label: "Admin", icon: Icons.admin }]
            : []),
        ]
      : []),
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <nav
          className={`flex h-14 items-center justify-between rounded-2xl border px-4 transition-all duration-300 ${
            scrolled
              ? "bg-white/80 shadow-lg shadow-black/5 backdrop-blur-xl border-black/5"
              : "bg-white/60 backdrop-blur-md border-black/5"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Icons.logo />
            <span className="font-heading text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              CodeGraph
            </span>
          </Link>

          {/* Desktop Nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 rounded-lg transition-all ${
                    pathname.startsWith(link.href)
                      ? "bg-black text-white hover:bg-black/90 hover:text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-black/5"
                  }`}
                >
                  <link.icon />
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search button — opens Cmd+K palette */}
            <button
              onClick={() => {
                window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
              }}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
              <kbd className="ml-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-400">⌘K</kbd>
            </button>
            {/* XP bar - hidden on mobile */}
            {user && <div className="hidden sm:block"><XpBar userId={user.id} /></div>}

            {/* Streak badge - hidden on mobile */}
            {user && (
              <Link href="/dashboard" className="hidden sm:block">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 rounded-lg text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" fill="orange" />
                  </svg>
                  <span className="text-xs font-bold">{streak}</span>
                </Button>
              </Link>
            )}

            <div className="h-4 w-px bg-border hidden sm:block" />

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-1">
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Profile"
                    className="rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5"
                >
                  <span className="hidden sm:inline">Sign out</span>
                  <svg className="h-4 w-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </Button>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button
                  size="sm"
                  className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Sign in
                </Button>
              </Link>
            )}

            {/* Mobile nav */}
            <MobileNav links={navLinks} pathname={pathname} />
          </div>
        </nav>
      </div>
    </header>
  );
}

function MobileNav({
  links,
  pathname,
}: {
  links: { href: string; label: string; icon: () => React.ReactElement }[];
  pathname: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        className="rounded-lg"
      >
        {open ? <Icons.close /> : <Icons.menu />}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-4 top-16 w-64 max-w-[calc(100vw-2rem)] rounded-xl border bg-white/95 p-2 shadow-xl shadow-black/10 backdrop-blur-xl"
          >
            <nav className="flex flex-col gap-1">
              {/* Mobile search trigger */}
              <button
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
                }}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
              <div className="h-px bg-slate-100 my-1" />
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 rounded-lg ${
                      pathname.startsWith(link.href)
                        ? "bg-black text-white hover:bg-black/90 hover:text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-black/5"
                    }`}
                    size="sm"
                  >
                    <link.icon />
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
