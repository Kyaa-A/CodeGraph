import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ChevronRight,
  Globe,
  ArrowRight,
  Laptop,
  CheckCircle2,
  Code2
} from "lucide-react";
import { LandingPlayground } from "./landing-playground";

export const metadata: Metadata = {
  title: "CodeGraph — Learn to Code with AI",
  description: "Master programming with interactive courses, LeetCode-style problems, and an AI-powered code playground.",
};

export const revalidate = 300;

function HexIcon({ icon, color, className = "" }: { icon: React.ReactNode; color: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 60 60" className="h-16 w-16" aria-hidden="true">
        <path
          d="M30 5 L55 20 V42 L30 56 L5 42 V20 Z"
          fill="currentColor"
          className={color}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-white">
        {icon}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const supabase = await createClient();

  const [coursesRes, problemsRes, langsRes] = await Promise.all([
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("problems").select("*", { count: "exact", head: true }),
    supabase.from("doc_topics").select("lang").then((res) => {
      const langs = new Set((res.data ?? []).map((d: { lang: string }) => d.lang));
      return { count: langs.size };
    }),
  ]);

  const stats = [
    { label: "Interactive Courses", icon: <BookOpen className="h-5 w-5" />, value: `${coursesRes.count ?? 5}+` },
    { label: "Coding Problems", icon: <Code2 className="h-5 w-5" />, value: `${(problemsRes.count ?? 1000).toLocaleString()}+` },
    { label: "Doc Languages", icon: <Globe className="h-5 w-5" />, value: `${langsRes.count || 15}` },
    { label: "Free", icon: <CheckCircle2 className="h-5 w-5" />, value: "100%" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="h-20" />

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left - Content */}
            <div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                A New Way to
                <span className="block text-emerald-400">Learn Coding</span>
              </h1>
              <p className="mt-7 text-lg sm:text-xl text-slate-300 leading-relaxed">
                CodeGraph is the best platform to help you enhance your skills, expand
                your knowledge and prepare for technical interviews. Interactive courses,
                coding problems, and a powerful playground — all in your browser.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Link href="/auth/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base px-8 h-13 rounded-full">
                    Create Account
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#playground" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white text-base px-8 h-13 rounded-full">
                    Start Exploring
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right - Mockup */}
            <div className="relative overflow-hidden sm:overflow-visible">
              <div className="relative rounded-2xl bg-white shadow-2xl overflow-hidden transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                <div className="bg-slate-100 px-5 py-3.5 border-b border-slate-200 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="ml-4 text-sm text-slate-500">solution.py</div>
                </div>
                <div className="p-7 bg-white">
                  <div className="space-y-2.5">
                    <div className="h-2.5 w-3/4 bg-slate-100 rounded" />
                    <div className="h-2.5 w-1/2 bg-slate-100 rounded" />
                    <div className="h-2.5 w-5/6 bg-slate-100 rounded" />
                    <div className="h-2.5 w-2/3 bg-slate-100 rounded" />
                    <div className="h-2.5 w-4/5 bg-slate-100 rounded" />
                  </div>
                  <div className="mt-7 flex items-center gap-3">
                    <div className="h-9 w-22 bg-emerald-100 rounded flex items-center justify-center">
                      <span className="text-xs text-emerald-600 font-medium">Easy</span>
                    </div>
                    <div className="h-9 w-22 bg-amber-100 rounded flex items-center justify-center">
                      <span className="text-xs text-amber-600 font-medium">Medium</span>
                    </div>
                    <div className="h-9 w-22 bg-red-100 rounded flex items-center justify-center">
                      <span className="text-xs text-red-600 font-medium">Hard</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-3 -left-3 sm:-bottom-5 sm:-left-5 w-16 h-16 sm:w-22 sm:h-22 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-12">
                <CheckCircle2 className="h-7 w-7 sm:h-9 sm:w-9 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" className="w-full" aria-hidden="true">
            <path
              d="M0 50L60 45.7C120 41 240 33 360 35.3C480 37 600 50 720 52.3C840 55 960 46 1080 41.7C1200 37 1320 37 1380 37L1440 37V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V50Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="explore" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-2">Start Exploring</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Explore is a well-organized tool that helps you get the most out of CodeGraph by providing structure to guide your progress.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-6">
              <HexIcon icon={<BookOpen className="h-6 w-6" />} color="text-blue-500" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Questions, Community & Contests</h3>
                <p className="text-slate-500 leading-relaxed">
                  Over 1,000 coding problems for you to practice. Join our growing community of developers, build streaks, climb the leaderboard, and earn XP rewards.
                </p>
                <Link href="/problems" className="inline-flex items-center mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                  View Questions
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="flex gap-6">
              <HexIcon icon={<Laptop className="h-6 w-6" />} color="text-amber-500" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Interview Prep</h3>
                <p className="text-slate-500 leading-relaxed">
                  Sharpen your skills with LeetCode-style problems across multiple difficulty levels. Track your progress, build streaks, and time your solutions to prepare for technical interviews.
                </p>
                <Link href="/problems" className="inline-flex items-center mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                  Start Practicing
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DEVELOPER SECTION ===== */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <HexIcon icon={<Code2 className="h-6 w-6" />} color="text-emerald-500" className="mx-auto mb-4" />
            <h2 className="text-emerald-600 font-semibold text-lg mb-2">Developer</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              We now support 13 popular coding languages. At our core, CodeGraph is about developers. Our powerful development tools such as Playground help you test, debug and even write your own projects online.
            </p>
          </div>

          <LandingPlayground />
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-600 mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm sm:text-base text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-emerald-600 font-semibold text-lg mb-2">Ready to start coding?</h2>
          <p className="text-slate-600 mb-8">
            Join thousands of developers learning and building on CodeGraph. Free forever.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base px-10 h-12 rounded-full">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-4 text-xs text-slate-400">No credit card required</p>
        </div>
      </section>
    </div>
  );
}
