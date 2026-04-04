"use client";

import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";

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
  python: '# Write your Python code here\nprint("Hello, World!")\n',
  javascript: '// Write your JavaScript code here\nconsole.log("Hello, World!");\n',
  typescript: '// Write your TypeScript code here\nconst greeting: string = "Hello, World!";\nconsole.log(greeting);\n',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n',
  csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}\n',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}\n',
  rust: 'fn main() {\n    println!("Hello, World!");\n}\n',
  ruby: '# Write your Ruby code here\nputs "Hello, World!"\n',
  php: '<?php\n// Write your PHP code here\necho "Hello, World!\\n";\n',
  kotlin: 'fun main() {\n    println("Hello, World!")\n}\n',
  sql: '-- Write your SQL here\nSELECT "Hello, World!" AS greeting;\n',
};

interface CodeEditorProps {
  initialCode?: string;
  initialLanguage?: string;
}

export function CodeEditor({ initialCode, initialLanguage }: CodeEditorProps) {
  const [language, setLanguage] = useState(initialLanguage || "python");
  const [code, setCode] = useState(initialCode || DEFAULT_CODE[initialLanguage || "python"] || DEFAULT_CODE.python);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [showLanguages, setShowLanguages] = useState(false);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput("");
    setExitCode(null);

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await res.json();

      if (data.error) {
        setOutput(data.error);
        setExitCode(1);
      } else {
        const combined = [data.output, data.stderr].filter(Boolean).join("\n");
        setOutput(combined || "(no output)");
        setExitCode(data.exitCode);
      }
    } catch {
      setOutput("Failed to connect to execution server.");
      setExitCode(1);
    } finally {
      setRunning(false);
    }
  }, [code, language]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (code === DEFAULT_CODE[language] || code === "") {
      setCode(DEFAULT_CODE[newLang] || "");
    }
    setShowLanguages(false);
  };

  const handleReset = () => {
    setCode(initialCode || DEFAULT_CODE[language] || "");
    setOutput("");
    setExitCode(null);
  };

  const currentLang = LANGUAGES.find((l) => l.id === language);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-2xl overflow-hidden border border-white/10">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowLanguages(!showLanguages)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors"
            >
              <span>{currentLang?.icon}</span>
              <span>{currentLang?.name}</span>
              <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showLanguages && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLanguages(false)} />
                <div className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-[#2d2d2d] border border-white/10 shadow-xl z-50 py-1 max-h-64 overflow-y-auto">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageChange(lang.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                        lang.id === language
                          ? "bg-amber-500/20 text-amber-400"
                          : "text-gray-300 hover:bg-white/5"
                      }`}
                    >
                      <span>{lang.icon}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors"
          >
            Reset
          </button>
          <Button
            onClick={handleRun}
            disabled={running}
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 gap-2 shadow-lg shadow-emerald-500/20"
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
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language === "cpp" ? "cpp" : language === "csharp" ? "csharp" : language}
          value={code}
          onChange={(value) => setCode(value || "")}
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

      {/* Output Panel */}
      <div className="border-t border-white/10">
        <div className="flex items-center justify-between px-4 py-2 bg-[#252526]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Output</span>
            {exitCode !== null && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                exitCode === 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
              }`}>
                {exitCode === 0 ? "Success" : `Exit: ${exitCode}`}
              </span>
            )}
          </div>
          {output && (
            <button
              onClick={() => { setOutput(""); setExitCode(null); }}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="h-32 overflow-y-auto px-4 py-3 bg-[#1a1a1a]">
          {running ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Executing...
            </div>
          ) : output ? (
            <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">{output}</pre>
          ) : (
            <p className="text-sm text-gray-600 italic">Click "Run" to execute your code</p>
          )}
        </div>
      </div>
    </div>
  );
}
