"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { LOTTIE } from "@/lib/lottie-assets";
import { ChatbotWidget } from "@/components/chatbot-widget";
import {
  BookOpen,
  Terminal,
  Play,
  ChevronRight,
  Globe,
  ArrowRight,
  Laptop,
  CheckCircle2,
  Code2
} from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then(m => m.default), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-[#fafafa] flex items-center justify-center text-slate-400 text-sm">
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
  { id: "c", name: "C", disabled: true },
  { id: "cpp", name: "C++" },
  { id: "csharp", name: "C#", disabled: true },
  { id: "go", name: "Go", disabled: true },
  { id: "rust", name: "Rust", disabled: true },
  { id: "ruby", name: "Ruby", disabled: true },
  { id: "php", name: "PHP" },
  { id: "kotlin", name: "Kotlin", disabled: true },
  { id: "sql", name: "SQL", disabled: true },
];

const DEFAULT_CODE: Record<string, string> = {
  python: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

nums = [2, 7, 11, 15]
target = 9
print(f"Input: nums={nums}, target={target}")
print(f"Output: {two_sum(nums, target)}")`,
  javascript: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}

const nums = [2, 7, 11, 15];
const target = 9;
console.log("Input: nums=" + JSON.stringify(nums) + ", target=" + target);
console.log("Output:", twoSum(nums, target));`,
  typescript: `function twoSum(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement)!, i];
        }
        map.set(nums[i], i);
    }
    return [];
}

const nums = [2, 7, 11, 15];
const target = 9;
console.log("Input: nums=" + JSON.stringify(nums) + ", target=" + target);
console.log("Output:", twoSum(nums, target));`,
  java: `import java.util.*;

class Main {
    static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }

    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = twoSum(nums, target);
        System.out.println("Input: nums=[2,7,11,15], target=9");
        System.out.println("Output: [" + result[0] + ", " + result[1] + "]");
    }
}`,
  cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (map.find(complement) != map.end()) {
            return {map[complement], i};
        }
        map[nums[i]] = i;
    }
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> result = twoSum(nums, target);
    cout << "Input: nums=[2,7,11,15], target=9" << endl;
    cout << "Output: [" << result[0] << ", " << result[1] << "]" << endl;
    return 0;
}`,
  php: `<?php
function twoSum($nums, $target) {
    $map = [];
    foreach ($nums as $i => $num) {
        $complement = $target - $num;
        if (isset($map[$complement])) {
            return [$map[$complement], $i];
        }
        $map[$num] = $i;
    }
    return [];
}

$nums = [2, 7, 11, 15];
$target = 9;
$result = twoSum($nums, $target);
echo "Input: nums=[2,7,11,15], target=9\\n";
echo "Output: [" . $result[0] . ", " . $result[1] . "]\\n";`,
};

// --- Features data ---
const FEATURES = [
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Structured Courses",
    description: "Learn with step-by-step tutorials designed by industry experts",
    href: "/courses",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: <Code2 className="h-6 w-6" />,
    title: "Coding Problems",
    description: "Practice with LeetCode-style challenges across all difficulty levels",
    href: "/problems",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Code Playground",
    description: "Write, run, and test code in 13+ languages right in your browser",
    href: "/playground",
    color: "bg-blue-100 text-blue-600",
  },
];

// --- Stats data ---
const STATS = [
  { value: "5+", label: "Interactive Courses", icon: <BookOpen className="h-5 w-5" /> },
  { value: "20+", label: "Coding Problems", icon: <Code2 className="h-5 w-5" /> },
  { value: "13", label: "Languages", icon: <Globe className="h-5 w-5" /> },
  { value: "100%", label: "Free", icon: <CheckCircle2 className="h-5 w-5" /> },
];

// --- Hexagonal icon component ---
function HexIcon({ icon, color, className = "" }: { icon: React.ReactNode; color: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 60 60" className="h-16 w-16">
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

// --- Main Component ---
export default function HomePage() {
  const [editorLang, setEditorLang] = useState("python");
  const [editorCode, setEditorCode] = useState(DEFAULT_CODE.python);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);


  const handleLangChange = (langId: string) => {
    setEditorLang(langId);
    setEditorCode(DEFAULT_CODE[langId] || DEFAULT_CODE.python);
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

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight leading-tight">
                A New Way to
                <span className="block text-emerald-400">Learn Coding</span>
              </h1>
              <p className="mt-7 text-lg sm:text-xl text-slate-300 leading-relaxed">
                CodeGraph is the best platform to help you enhance your skills, expand
                your knowledge and prepare for technical interviews. Interactive courses,
                coding problems, and a powerful playground — all in your browser.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base px-8 h-13 rounded-full">
                    Create Account
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#playground">
                  <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white text-base px-8 h-13 rounded-full">
                    Start Exploring
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right - Mockup + Developer Animation */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              {/* Code mockup card */}
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

              {/* Developer animation overlaid */}
              <div className="absolute -top-6 -right-6 sm:-top-10 sm:-right-10 w-32 h-32 sm:w-52 sm:h-52 pointer-events-none">
                <DotLottieReact
                  src={LOTTIE.codingHero}
                  loop
                  autoplay
                  className="w-full h-full drop-shadow-lg"
                />
              </div>

              {/* Floating checkmark */}
              <div className="absolute -bottom-3 -left-3 sm:-bottom-5 sm:-left-5 w-16 h-16 sm:w-22 sm:h-22 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-12">
                <CheckCircle2 className="h-7 w-7 sm:h-9 sm:w-9 text-white" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" className="w-full">
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-2">Start Exploring</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Explore is a well-organized tool that helps you get the most out of CodeGraph by providing structure to guide your progress.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex gap-6"
            >
              <HexIcon icon={<BookOpen className="h-6 w-6" />} color="text-blue-500" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Questions, Community & Contests</h3>
                <p className="text-slate-500 leading-relaxed">
                  Over 20 coding problems for you to practice. Come and join our growing community of developers and participate in contests to challenge yourself and earn rewards.
                </p>
                <Link href="/problems" className="inline-flex items-center mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                  View Questions
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            {/* Feature Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex gap-6"
            >
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== DEVELOPER SECTION ===== */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <HexIcon icon={<Code2 className="h-6 w-6" />} color="text-emerald-500" className="mx-auto mb-4" />
            <h2 className="text-emerald-600 font-semibold text-lg mb-2">Developer</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              We now support 13 popular coding languages. At our core, CodeGraph is about developers. Our powerful development tools such as Playground help you test, debug and even write your own projects online.
            </p>
          </motion.div>

          {/* Interactive Playground - Side by Side Layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            id="playground"
            className="max-w-5xl mx-auto"
          >
            {/* Left Panel - Code Editor */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              {/* Tabs */}
              <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 border-b border-slate-200 bg-slate-50 gap-2">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                  {LANGUAGES.slice(0, 5).map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleLangChange(lang.id)}
                      disabled={lang.disabled}
                      className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                        lang.disabled
                          ? "text-slate-400 cursor-not-allowed"
                          : editorLang === lang.id
                            ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleRun}
                  disabled={running}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    running
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  }`}
                >
                  {running ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current" />
                      Run
                    </>
                  )}
                </button>
              </div>

              {/* Editor */}
              <div className="h-[280px] sm:h-[360px]">
                <MonacoEditor
                  height="100%"
                  language={editorLang === "cpp" ? "cpp" : editorLang}
                  value={editorCode}
                  onChange={(value) => setEditorCode(value || "")}
                  theme="light"
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
                    contextmenu: false,
                  }}
                />
              </div>

              {/* Output Panel */}
              <div className="border-t border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Console Output</span>
                  {output && (
                    <button 
                      onClick={() => setOutput("")}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-3 min-h-[80px]">
                  {running ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Executing...
                    </div>
                  ) : output ? (
                    <pre className="text-sm font-mono text-slate-700 whitespace-pre-wrap">{output}</pre>
                  ) : (
                    <span className="text-sm text-slate-400 italic">Click Run to see output</span>
                  )}
                </div>
              </div>
            </div>

          </motion.div>

          {/* Open Full Playground link */}
          <div className="flex justify-center mt-6">
            <Link
              href="/playground"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
            >
              <Terminal className="h-4 w-4" />
              Open Full Playground
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-600 mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm sm:text-base text-slate-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
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
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
                <rect width="32" height="32" rx="8" fill="#171717" />
                <path d="M8 12L12 16L8 20" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 20H24" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="20" cy="11" r="2" fill="#10b981" />
              </svg>
              <span className="font-bold text-slate-900">CodeGraph</span>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-slate-500">
              <Link href="/courses" className="hover:text-slate-700 transition-colors">Courses</Link>
              <Link href="/problems" className="hover:text-slate-700 transition-colors">Problems</Link>
              <Link href="/playground" className="hover:text-slate-700 transition-colors">Playground</Link>
              <Link href="/terms" className="hover:text-slate-700 transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-slate-700 transition-colors">Privacy</Link>
            </div>
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} CodeGraph
            </p>
          </div>
        </div>
      </footer>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}
