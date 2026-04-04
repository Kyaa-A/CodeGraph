"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";
import React from "react";

// Icons as SVG components
const Icons = {
  logo: () => (
    <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
      <rect width="32" height="32" rx="8" fill="#171717" />
      <path
        d="M8 12L12 16L8 20"
        stroke="#10b981"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 20H24"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="20" cy="11" r="2" fill="#10b981" />
    </svg>
  ),
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
    // Fetch streak
    supabase
      .from("user_progress")
      .select("completed_at")
      .eq("user_id", user.id)
      .eq("completed", true)
      .then(({ data }) => {
        if (!data || data.length === 0) {
          setStreak(0);
          return;
        }
        const days = [
          ...new Set(
            data
              .filter((p) => p.completed_at)
              .map((p) => {
                const d = new Date(p.completed_at!);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              })
          ),
        ]
          .sort()
          .reverse();
        if (days.length === 0) {
          setStreak(0);
          return;
        }
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
        if (days[0] !== todayStr && days[0] !== yesterdayStr) {
          setStreak(0);
          return;
        }
        let count = 1;
        let current = new Date(days[0]);
        for (let i = 1; i < days.length; i++) {
          const prev = new Date(current);
          prev.setDate(prev.getDate() - 1);
          const prevStr = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-${String(prev.getDate()).padStart(2, "0")}`;
          if (days[i] === prevStr) {
            count++;
            current = prev;
          } else break;
        }
        setStreak(count);
      });
  }, [user, supabase, pathname]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  // Hide navbar on auth pages (they have their own logo)
  if (pathname.startsWith("/auth")) return null;

  const navLinks = [
    { href: "/courses", label: "Courses", icon: Icons.courses },
    { href: "/problems", label: "Problems", icon: Icons.problems },
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
            {/* Streak badge */}
            {user && (
              <Link href="/dashboard">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5"
              >
                Sign out
              </Button>
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
            className="absolute right-4 top-16 w-64 rounded-xl border bg-white/95 p-2 shadow-xl shadow-black/10 backdrop-blur-xl"
          >
            <nav className="flex flex-col gap-1">
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
