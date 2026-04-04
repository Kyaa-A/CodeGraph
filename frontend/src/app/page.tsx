"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { Code2, BookOpen, Terminal, Play, ChevronRight, Sparkles, Zap, Shield, Globe, Rocket, Star, ArrowRight, Cpu, Layers, CheckCircle2, TerminalIcon, MonitorPlay } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then(m => m.default), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-[#0d1117] flex items-center justify-center text-slate-500 text-sm">
      Loading editor...
    </div>
  ),
});

// --- Language data ---
const LANGUAGES = [
  { id: "python", name: "Python" },
  { id: "javascript", name: "JavaScript" },
  { id: "typescript", name: "TypeScript" },
  { id: "java", name: "Java" },
  { id: "c", name: "C" },
  { id: "cpp", name: "C++" },
  { id: "csharp", name: "C#" },
  { id: "go", name: "Go" },
  { id: "rust", name: "Rust" },
  { id: "ruby", name: "Ruby" },
  { id: "php", name: "PHP" },
  { id: "kotlin", name: "Kotlin" },
  { id: "sql", name: "SQL" },
];

const DEFAULT_CODE: Record<string, string> = {
  python: `def main():
    # Welcome to CodeGraph
    print("Hello from CodeGraph! 🚀")
    
    # Solve coding challenges
    for i in range(5):
        print(f"  Step {i + 1}: Master Python")

if __name__ == "__main__":
    main()`,
  javascript: `// Welcome to CodeGraph
function main() {
    console.log("Hello from CodeGraph! 🚀");
    
    // Solve coding challenges
    for (let i = 1; i <= 5; i++) {
        console.log(\`  Step \${i}: Master JavaScript\`);
    }
}

main();`,
  typescript: `// Welcome to CodeGraph
const main = (): void => {
    console.log("Hello from CodeGraph! 🚀");
    
    // Solve coding challenges
    const steps: number[] = [1, 2, 3, 4, 5];
    steps.forEach(s => console.log(\`  Step \${s}: Master TypeScript\`));
};

main();`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from CodeGraph! 🚀");
        
        // Solve coding challenges
        for (int i = 1; i <= 5; i++) {
            System.out.println("  Step " + i + ": Master Java");
        }
    }
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello from CodeGraph! 🚀\\n");
    
    // Solve coding challenges
    for (int i = 1; i <= 5; i++) {
        printf("  Step %d: Master C\\n", i);
    }
    return 0;
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello from CodeGraph! 🚀" << endl;
    
    // Solve coding challenges
    for (int i = 1; i <= 5; i++) {
        cout << "  Step " << i << ": Master C++" << endl;
    }
    return 0;
}`,
  csharp: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello from CodeGraph! 🚀");
        
        // Solve coding challenges
        for (int i = 1; i <= 5; i++) {
            Console.WriteLine($"  Step {i}: Master C#");
        }
    }
}`,
  go: `package main

import "fmt"

func main() {
    fmt.Println("Hello from CodeGraph! 🚀")
    
    // Solve coding challenges
    for i := 1; i <= 5; i++ {
        fmt.Printf("  Step %d: Master Go\\n", i)
    }
}`,
  rust: `fn main() {
    println!("Hello from CodeGraph! 🚀");
    
    // Solve coding challenges
    for i in 1..=5 {
        println!("  Step {}: Master Rust", i);
    }
}`,
  ruby: `puts "Hello from CodeGraph! 🚀"

# Solve coding challenges
5.times do |i|
  puts "  Step #{i + 1}: Master Ruby"
end`,
  php: `<?php
echo "Hello from CodeGraph! 🚀\\n";

// Solve coding challenges
for ($i = 1; $i <= 5; $i++) {
    echo "  Step $i: Master PHP\\n";
}`,
  kotlin: `fun main() {
    println("Hello from CodeGraph! 🚀")
    
    // Solve coding challenges
    for (i in 1..5) {
        println("  Step $i: Master Kotlin")
    }
}`,
  sql: "\n-- Query your data\nSELECT 'Hello from CodeGraph! 🚀' AS greeting;\n\n-- Solve coding challenges\nSELECT 'Step ' || value || ': Master SQL' AS step\nFROM generate_series(1, 5) AS value;",
};

// --- Features data ---
const FEATURES = [
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: "Interactive Courses",
    description: "Master concepts with hands-on projects and guided tutorials",
    color: "from-emerald-500/20 to-emerald-500/5",
    borderColor: "border-emerald-500/20",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: <Cpu className="h-5 w-5" />,
    title: "Coding Problems",
    description: "Practice with LeetCode-style challenges across all difficulty levels",
    color: "from-amber-500/20 to-amber-500/5",
    borderColor: "border-amber-500/20",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    icon: <Terminal className="h-5 w-5" />,
    title: "Live Playground",
    description: "Write and execute code instantly in 13 languages from your browser",
    color: "from-violet-500/20 to-violet-500/5",
    borderColor: "border-violet-500/20",
    iconBg: "bg-violet-500/20",
    iconColor: "text-violet-400",
  },
];

// --- Bento grid items ---
const BENTO_ITEMS = [
  {
    title: "13 Languages",
    value: "13+",
    label: "Popular programming languages supported",
    icon: <Globe className="h-4 w-4" />,
    color: "from-blue-500/10 to-blue-500/5",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/20",
  },
  {
    title: "Coding Problems",
    value: "20+",
    label: "LeetCode-style challenges",
    icon: <Zap className="h-4 w-4" />,
    color: "from-amber-500/10 to-amber-500/5",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/20",
  },
  {
    title: "Interactive Courses",
    value: "5+",
    label: "Step-by-step learning paths",
    icon: <Layers className="h-4 w-4" />,
    color: "from-emerald-500/10 to-emerald-500/5",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/20",
  },
  {
    title: "Free to Use",
    value: "100%",
    label: "No credit card required",
    icon: <Shield className="h-4 w-4" />,
    color: "from-violet-500/10 to-violet-500/5",
    border: "border-violet-500/20",
    iconBg: "bg-violet-500/20",
  },
];

// --- Main Component ---
export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [editorLang, setEditorLang] = useState("python");
  const [editorCode, setEditorCode] = useState(DEFAULT_CODE.python);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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
    <div className="flex flex-col min-h-screen bg-[#020617]">
      <div className="h-20" />

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-[#020617]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_50%,rgba(99,102,241,0.12),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_20%_80%,rgba(16,185,129,0.1),transparent)]" />
        </div>
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='72' height='72' viewBox='0 0 72 72' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 0h2v72h-2zM0 36h72v2H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm text-slate-300 text-sm font-medium mb-8">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Now with AI-powered assistance</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
            >
              <span className="text-white">Code.</span>{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Learn.</span>{" "}
              <span className="text-white">Solve.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed"
            >
              The all-in-one platform for developers. Interactive courses, LeetCode-style
              problems, and a multi-language playground — all in your browser.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link href="/auth/signup">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base px-8 h-12 rounded-xl shadow-lg shadow-emerald-500/20">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#playground">
                <Button size="lg" variant="outline" className="border-slate-700 bg-slate-800/50 text-white hover:bg-slate-700/50 text-base px-8 h-12 rounded-xl backdrop-blur-sm">
                  <Play className="mr-2 h-4 w-4 text-emerald-400" />
                  Try Playground
                </Button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>No signup required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>13 languages</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== BENTO STATS GRID ===== */}
      <section className="relative py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BENTO_ITEMS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`relative p-5 rounded-2xl bg-gradient-to-br ${item.color} ${item.border} border backdrop-blur-sm`}
              >
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <div className={`p-1.5 rounded-lg ${item.iconBg || 'bg-slate-800/50'}`}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider">{item.title}</span>
                </div>
                <div className="text-3xl font-bold text-white">{item.value}</div>
                <div className="text-xs text-slate-500 mt-1">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="relative py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Everything you need to learn coding
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              From structured courses to coding challenges to a powerful playground — 
              all designed to accelerate your development journey.
            </p>
          </motion.div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                onMouseEnter={() => setActiveFeature(i)}
                className={`group relative p-6 rounded-2xl bg-gradient-to-br ${feature.color} ${feature.borderColor} border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${feature.iconBg} ${feature.iconColor} mb-5`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                
                <div className="mt-6 flex items-center text-emerald-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn more</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== INTERACTIVE PLAYGROUND ===== */}
      <section id="playground" className="relative py-20 sm:py-28">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
              <MonitorPlay className="h-3.5 w-3.5" />
              Interactive Demo
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Built for Developers
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto">
              Write, run, and debug code instantly. No setup, no installation — 
              just open your browser and start coding.
            </p>
          </motion.div>

          {/* Language selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleLangChange(lang.id)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  editorLang === lang.id
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {lang.name}
              </button>
            ))}
          </motion.div>

          {/* Editor card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-2xl shadow-black/20"
          >
            {/* Editor toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/90" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/90" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/90" />
                </div>
                <div className="h-4 w-px bg-slate-700 mx-2" />
                <div className="flex items-center gap-2 text-slate-400">
                  <TerminalIcon className="h-4 w-4" />
                  <span className="text-sm">playground.{editorLang === "cpp" ? "cpp" : editorLang === "csharp" ? "cs" : editorLang}</span>
                </div>
              </div>
              <button
                onClick={handleRun}
                disabled={running}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  running
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                }`}
              >
                {running ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Run
                  </>
                )}
              </button>
            </div>

            {/* Editor */}
            <div className="grid lg:grid-cols-[1fr,320px]">
              <div className="h-[380px]">
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
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                />
              </div>

              {/* Output panel */}
              <div className="border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-950/50">
                <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Output</span>
                  {output && !running && (
                    <button 
                      onClick={() => setOutput("")}
                      className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="p-4 h-full lg:h-[332px] overflow-y-auto">
                  {running ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Executing code...
                    </div>
                  ) : output ? (
                    <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap">{output}</pre>
                  ) : (
                    <div className="text-sm text-slate-600 italic">
                      Click \"Run\" to execute your code
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick start links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 grid sm:grid-cols-2 gap-4"
          >
            <Link 
              href="/problems"
              className="group flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-500/10">
                  <Zap className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Start Coding</h4>
                  <p className="text-xs text-slate-500">Browse 20+ coding problems</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link 
              href="/courses"
              className="group flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-500/10">
                  <Rocket className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Start Learning</h4>
                  <p className="text-xs text-slate-500">Explore structured courses</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-[#020617]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(16,185,129,0.15),transparent)]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800 backdrop-blur-sm"
          >
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-6">
              <Code2 className="h-6 w-6" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Ready to start coding?
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-lg mx-auto">
              Join thousands of developers learning and building on CodeGraph. 
              It's free forever.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base px-10 h-12 rounded-xl shadow-lg shadow-emerald-500/20">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/problems">
                <Button size="lg" variant="outline" className="border-slate-700 bg-slate-800/50 text-white hover:bg-slate-700/50 text-base px-10 h-12 rounded-xl">
                  Explore Problems
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-500">No credit card required</p>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative border-t border-slate-800/50 bg-[#020617]">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/10">
                <Code2 className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">CodeGraph</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-8 text-sm">
              <Link href="/courses" className="text-slate-500 hover:text-slate-300 transition-colors">Courses</Link>
              <Link href="/problems" className="text-slate-500 hover:text-slate-300 transition-colors">Problems</Link>
              <Link href="/playground" className="text-slate-500 hover:text-slate-300 transition-colors">Playground</Link>
            </div>

            {/* Copyright */}
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} CodeGraph. All rights reserved.
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
