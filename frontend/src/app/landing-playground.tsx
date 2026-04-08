"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Play, Terminal, ChevronRight } from "lucide-react";

const LANGUAGES = [
  { id: "python", name: "Python" },
  { id: "javascript", name: "JavaScript" },
  { id: "typescript", name: "TypeScript" },
  { id: "java", name: "Java" },
  { id: "cpp", name: "C++" },
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
};

export function LandingPlayground() {
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
    <>
      <div id="playground" className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 border-b border-slate-200 bg-slate-50 gap-2">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleLangChange(lang.id)}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    editorLang === lang.id
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
              aria-label="Run code"
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

          {/* Static code display */}
          <div className="h-[280px] sm:h-[360px] overflow-auto bg-white">
            <pre className="p-4 text-sm font-mono leading-relaxed text-slate-700 whitespace-pre h-full">
              <code>{editorCode}</code>
            </pre>
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
      </div>

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
    </>
  );
}
