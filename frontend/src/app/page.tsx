"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then(m => m.default), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-[#1e1e1e] flex items-center justify-center text-gray-500 text-sm">
      Loading editor...
    </div>
  ),
});

// --- Language data ---
const LANGUAGES = [
  { id: "python", name: "Python", icon: "🐍" },
  { id: "javascript", name: "JavaScript", icon: "🟨" },
  { id: "typescript", name: "TypeScript", icon: "🔷" },
  { id: "java", name: "Java", icon: "☕" },
  { id: "c", name: "C", icon: "⚙️" },
  { id: "cpp", name: "C++", icon: "⚙️" },
  { id: "csharp", name: "C#", icon: "🟪" },
  { id: "go", name: "Go", icon: "🐹" },
  { id: "rust", name: "Rust", icon: "🦀" },
  { id: "ruby", name: "Ruby", icon: "💎" },
  { id: "php", name: "PHP", icon: "🐘" },
  { id: "kotlin", name: "Kotlin", icon: "🟣" },
  { id: "sql", name: "SQL", icon: "🗃️" },
];

const DEFAULT_CODE: Record<string, string> = {
  python: 'print("Hello from CodeGraph!")\n\nfor i in range(5):\n    print(f"  Step {i + 1}: Learning Python")',
  javascript: 'console.log("Hello from CodeGraph!");\n\nfor (let i = 0; i < 5; i++) {\n    console.log(`  Step ${i + 1}: Learning JavaScript`);\n}',
  typescript: 'const greeting: string = "Hello from CodeGraph!";\nconsole.log(greeting);\n\nconst steps: number[] = [1, 2, 3, 4, 5];\nsteps.forEach(s => console.log(`  Step ${s}: Learning TypeScript`));',
  java: 'class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from CodeGraph!");\n        for (int i = 1; i <= 5; i++) {\n            System.out.println("  Step " + i + ": Learning Java");\n        }\n    }\n}',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello from CodeGraph!\\n");\n    for (int i = 1; i <= 5; i++) {\n        printf("  Step %d: Learning C\\n", i);\n    }\n    return 0;\n}',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from CodeGraph!" << endl;\n    for (int i = 1; i <= 5; i++) {\n        cout << "  Step " << i << ": Learning C++" << endl;\n    }\n    return 0;\n}',
  csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello from CodeGraph!");\n        for (int i = 1; i <= 5; i++) {\n            Console.WriteLine($"  Step {i}: Learning C#");\n        }\n    }\n}',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from CodeGraph!")\n    for i := 1; i <= 5; i++ {\n        fmt.Printf("  Step %d: Learning Go\\n", i)\n    }\n}',
  rust: 'fn main() {\n    println!("Hello from CodeGraph!");\n    for i in 1..=5 {\n        println!("  Step {}: Learning Rust", i);\n    }\n}',
  ruby: 'puts "Hello from CodeGraph!"\n\n5.times do |i|\n  puts "  Step #{i + 1}: Learning Ruby"\nend',
  php: '<?php\necho "Hello from CodeGraph!\\n";\n\nfor ($i = 1; $i <= 5; $i++) {\n    echo "  Step $i: Learning PHP\\n";\n}',
  kotlin: 'fun main() {\n    println("Hello from CodeGraph!")\n    for (i in 1..5) {\n        println("  Step $i: Learning Kotlin")\n    }\n}',
  sql: "SELECT 'Hello from CodeGraph!' AS greeting;\nSELECT 'Step ' || value || ': Learning SQL' AS step\nFROM generate_series(1, 5) AS value;",
};

// --- Showcase tab data ---
const SHOWCASE_TABS = [
  {
    id: "courses",
    label: "Courses",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    id: "problems",
    label: "Problems",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    id: "playground",
    label: "Playground",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    ),
  },
];

// --- Main Component ---
export default function HomePage() {
  const [activeShowcase, setActiveShowcase] = useState(0);
  const [editorLang, setEditorLang] = useState("python");
  const [editorCode, setEditorCode] = useState(DEFAULT_CODE.python);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const showcaseInterval = useRef<NodeJS.Timeout | null>(null);

  // Auto-cycle showcase tabs
  useEffect(() => {
    showcaseInterval.current = setInterval(() => {
      setActiveShowcase((prev) => (prev + 1) % 3);
    }, 5000);
    return () => {
      if (showcaseInterval.current) clearInterval(showcaseInterval.current);
    };
  }, []);

  const handleShowcaseClick = (index: number) => {
    setActiveShowcase(index);
    if (showcaseInterval.current) clearInterval(showcaseInterval.current);
    showcaseInterval.current = setInterval(() => {
      setActiveShowcase((prev) => (prev + 1) % 3);
    }, 5000);
  };

  const handleLangChange = (langId: string) => {
    setEditorLang(langId);
    setEditorCode(DEFAULT_CODE[langId] || "");
    setOutput("");
  };

  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput("");
    try {
      const res = await fetch("/api/playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: editorCode, language: editorLang }),
      });
      const data = await res.json();
      if (data.error) {
        setOutput(data.error);
      } else {
        setOutput(data.output || "(no output)");
      }
    } catch {
      setOutput("Failed to execute code.");
    } finally {
      setRunning(false);
    }
  }, [editorCode, editorLang]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="h-20" />

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-24 sm:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium mb-8">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              13 languages supported — free to use
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
          >
            <span className="text-white">Code.</span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">Learn.</span>{" "}
            <span className="text-white">Solve.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            The all-in-one platform for developers. Interactive courses, LeetCode-style
            problems, and a multi-language playground — all in your browser.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link href="/auth/signup">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-base px-8 h-12 rounded-full">
                Get Started Free
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </Link>
            <Link href="#developer">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/5 text-base px-8 h-12 rounded-full">
                Try the Playground
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== ANIMATED SHOWCASE ===== */}
      <section className="py-20 sm:py-28 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              Everything you need, one platform
            </h2>
            <p className="mt-3 text-lg text-neutral-500">
              From structured courses to coding challenges to a free playground
            </p>
          </motion.div>

          {/* Tab bar */}
          <div className="flex justify-center gap-2 mb-10">
            {SHOWCASE_TABS.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => handleShowcaseClick(i)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeShowcase === i
                    ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/20"
                    : "bg-white text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="relative min-h-[420px]">
            <AnimatePresence mode="wait">
              {activeShowcase === 0 && (
                <motion.div
                  key="courses"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl border border-neutral-200 shadow-xl shadow-neutral-200/50 overflow-hidden"
                >
                  <div className="p-8 sm:p-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900">Structured Courses</h3>
                        <p className="text-sm text-neutral-500">Learn by building real projects step by step</p>
                      </div>
                    </div>

                    {/* Mini course cards */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      {[
                        { title: "AI Fundamentals with LangChain", lessons: 8, progress: 65, color: "from-amber-500 to-orange-500" },
                        { title: "Python for Beginners", lessons: 7, progress: 30, color: "from-blue-500 to-cyan-500" },
                        { title: "JavaScript Essentials", lessons: 6, progress: 0, color: "from-yellow-500 to-amber-500" },
                      ].map((course) => (
                        <div key={course.title} className="rounded-xl border border-neutral-200 p-4 hover:border-neutral-300 transition-colors">
                          <div className={`h-2 w-12 rounded-full bg-gradient-to-r ${course.color} mb-3`} />
                          <h4 className="text-sm font-semibold text-neutral-800 line-clamp-1">{course.title}</h4>
                          <p className="text-xs text-neutral-400 mt-1">{course.lessons} lessons</p>
                          <div className="mt-3 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                          </div>
                          <p className="text-[10px] text-neutral-400 mt-1">{course.progress}% complete</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 text-center">
                      <Link href="/courses">
                        <Button variant="outline" className="rounded-full px-6 border-neutral-200 hover:bg-neutral-50">
                          Browse Courses
                          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeShowcase === 1 && (
                <motion.div
                  key="problems"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl border border-neutral-200 shadow-xl shadow-neutral-200/50 overflow-hidden"
                >
                  <div className="p-8 sm:p-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900">Coding Problems</h3>
                        <p className="text-sm text-neutral-500">LeetCode-style challenges to sharpen your skills</p>
                      </div>
                    </div>

                    {/* Mini problem list */}
                    <div className="space-y-2">
                      {[
                        { title: "Two Sum", difficulty: "Easy", tags: ["arrays", "hash-table"], color: "text-emerald-600 bg-emerald-50" },
                        { title: "Valid Parentheses", difficulty: "Easy", tags: ["stack", "string"], color: "text-emerald-600 bg-emerald-50" },
                        { title: "Maximum Subarray", difficulty: "Medium", tags: ["arrays", "dp"], color: "text-amber-600 bg-amber-50" },
                        { title: "Group Anagrams", difficulty: "Medium", tags: ["hash-table", "sorting"], color: "text-amber-600 bg-amber-50" },
                        { title: "Trapping Rain Water", difficulty: "Hard", tags: ["two-pointers", "stack"], color: "text-red-600 bg-red-50" },
                      ].map((p) => (
                        <div key={p.title} className="flex items-center justify-between px-4 py-3 rounded-xl border border-neutral-100 hover:border-neutral-200 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.color}`}>{p.difficulty}</span>
                            <span className="text-sm font-medium text-neutral-800">{p.title}</span>
                          </div>
                          <div className="hidden sm:flex items-center gap-1.5">
                            {p.tags.map((t) => (
                              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">{t}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 text-center">
                      <Link href="/problems">
                        <Button variant="outline" className="rounded-full px-6 border-neutral-200 hover:bg-neutral-50">
                          View All Problems
                          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeShowcase === 2 && (
                <motion.div
                  key="playground"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl border border-neutral-200 shadow-xl shadow-neutral-200/50 overflow-hidden"
                >
                  <div className="p-8 sm:p-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900">Code Playground</h3>
                        <p className="text-sm text-neutral-500">Write and run code in 13 languages — right in your browser</p>
                      </div>
                    </div>

                    {/* Language grid */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {LANGUAGES.map((lang) => (
                        <div key={lang.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 text-xs font-medium text-neutral-600">
                          <span>{lang.icon}</span>
                          {lang.name}
                        </div>
                      ))}
                    </div>

                    {/* Mini editor preview */}
                    <div className="rounded-xl bg-[#1e1e1e] p-4 font-mono text-sm text-gray-300 leading-relaxed">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-3 w-3 rounded-full bg-red-500/80" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                        <div className="h-3 w-3 rounded-full bg-green-500/80" />
                        <span className="ml-2 text-[10px] text-gray-500">playground.py</span>
                      </div>
                      <div><span className="text-[#569cd6]">print</span>(<span className="text-[#ce9178]">&quot;Hello from CodeGraph!&quot;</span>)</div>
                      <div className="mt-1 text-gray-500"># Run code instantly in any language</div>
                    </div>

                    <div className="mt-6 text-center">
                      <Link href="#developer">
                        <Button variant="outline" className="rounded-full px-6 border-neutral-200 hover:bg-neutral-50">
                          Try It Below
                          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ===== DEVELOPER SECTION ===== */}
      <section id="developer" className="py-20 sm:py-28 bg-neutral-950">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
              <svg className="h-7 w-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Built for Developers
            </h2>
            <p className="mt-3 text-lg text-neutral-400 max-w-xl mx-auto">
              We support {LANGUAGES.length} popular languages. Pick one and start coding — no signup needed.
            </p>
          </motion.div>

          {/* Language selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleLangChange(lang.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  editorLang === lang.id
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                <span>{lang.icon}</span>
                <span className="hidden sm:inline">{lang.name}</span>
              </button>
            ))}
          </div>

          {/* Editor + Output */}
          <div className="grid lg:grid-cols-[1fr,340px] gap-4">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#1e1e1e]">
              {/* Editor toolbar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#2d2d2d] border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="ml-2 text-xs text-gray-500">
                    {LANGUAGES.find(l => l.id === editorLang)?.icon}{" "}
                    {LANGUAGES.find(l => l.id === editorLang)?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRun}
                    disabled={running}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      running
                        ? "bg-white/5 text-gray-500"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                    }`}
                  >
                    {running ? (
                      <>
                        <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Running...
                      </>
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        Run
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Monaco editor */}
              <div className="h-[320px]">
                <MonacoEditor
                  height="100%"
                  language={editorLang === "cpp" ? "cpp" : editorLang === "csharp" ? "csharp" : editorLang}
                  value={editorCode}
                  onChange={(value) => setEditorCode(value || "")}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineHeight: 22,
                    padding: { top: 16, bottom: 16 },
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    automaticLayout: true,
                    tabSize: 4,
                    renderLineHighlight: "line",
                    cursorBlinking: "smooth",
                    smoothScrolling: true,
                    contextmenu: false,
                  }}
                />
              </div>

              {/* Output */}
              {(output || running) && (
                <div className="border-t border-white/10">
                  <div className="px-4 py-2 bg-[#252526] flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Output</span>
                    {output && (
                      <button onClick={() => setOutput("")} className="text-xs text-gray-500 hover:text-gray-300">Clear</button>
                    )}
                  </div>
                  <div className="px-4 py-3 bg-[#1a1a1a] max-h-40 overflow-y-auto">
                    {running ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Executing...
                      </div>
                    ) : (
                      <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">{output}</pre>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-4">
              {/* Quick links */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <h4 className="text-sm font-semibold text-white mb-4">Quick Start</h4>
                <div className="space-y-2">
                  {[
                    { label: "Two Sum", href: "/problems/two-sum", tag: "Easy" },
                    { label: "FizzBuzz", href: "/problems/fizzbuzz", tag: "Easy" },
                    { label: "Valid Parentheses", href: "/problems/valid-parentheses", tag: "Easy" },
                    { label: "Maximum Subarray", href: "/problems/maximum-subarray", tag: "Medium" },
                  ].map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">{link.label}</span>
                      </div>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        link.tag === "Easy" ? "text-emerald-400 bg-emerald-400/10" : "text-amber-400 bg-amber-400/10"
                      }`}>{link.tag}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Open full playground CTA */}
              <button
                onClick={() => setShowAuthModal(true)}
                className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-left hover:bg-amber-500/10 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-amber-400">Open Full Playground</h4>
                    <p className="text-xs text-neutral-500 mt-1">Save code, access all features</p>
                  </div>
                  <svg className="h-5 w-5 text-amber-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </button>

              {/* Browse all problems */}
              <Link
                href="/problems"
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/5 transition-colors group block"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Browse All Problems</h4>
                    <p className="text-xs text-neutral-500 mt-1">20+ challenges across all difficulties</p>
                  </div>
                  <svg className="h-5 w-5 text-neutral-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-16 bg-white border-t border-neutral-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "5", label: "Interactive Courses", icon: "📚" },
              { value: "20+", label: "Coding Problems", icon: "🧩" },
              { value: "13", label: "Languages", icon: "🌐" },
              { value: "Free", label: "To Get Started", icon: "🚀" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-neutral-900">{stat.value}</div>
                <div className="text-sm text-neutral-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 bg-neutral-950">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Ready to start coding?
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              Join developers learning and building on CodeGraph. Free forever.
            </p>
            <div className="mt-8">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-base px-10 h-12 rounded-full">
                  Get Started Free
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-neutral-500">No credit card required</p>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-neutral-950 border-t border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7">
                <rect width="32" height="32" rx="8" fill="#171717" />
                <path d="M8 12L12 16L8 20" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 20H24" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="20" cy="11" r="2" fill="#D4AF37" />
              </svg>
              <span className="font-bold text-white">CodeGraph</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-neutral-500">
              <Link href="/courses" className="hover:text-neutral-300 transition-colors">Courses</Link>
              <Link href="/problems" className="hover:text-neutral-300 transition-colors">Problems</Link>
              <Link href="#developer" className="hover:text-neutral-300 transition-colors">Playground</Link>
            </div>
            <p className="text-xs text-neutral-600">
              &copy; {new Date().getFullYear()} CodeGraph
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Sign in to save your code and access the full playground"
      />
    </div>
  );
}
