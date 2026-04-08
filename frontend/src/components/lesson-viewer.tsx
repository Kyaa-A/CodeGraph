"use client";

import { useState, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface LessonViewerProps {
  content: string;
  docLang?: string; // If set, shows "Run" button on code blocks linking to playground
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
    >
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

// Map common language aliases
const LANG_MAP: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  rb: "ruby",
  sh: "bash",
  shell: "bash",
  yml: "yaml",
};

// Languages supported by the playground
const RUNNABLE_LANGS = new Set([
  "python", "javascript", "typescript", "java", "c", "cpp", "csharp", "go", "rust", "ruby", "php", "kotlin",
]);

// Map doc lang slugs to playground language IDs
const DOC_TO_PLAYGROUND: Record<string, string> = {
  "html-css": "", nodejs: "javascript", langchain: "python",
};

function RunButton({ code, language }: { code: string; language: string }) {
  return (
    <a
      href={`/playground?lang=${encodeURIComponent(language)}&code=${encodeURIComponent(code)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Run
    </a>
  );
}

export const LessonViewer = memo(function LessonViewer({ content, docLang }: LessonViewerProps) {
  // Determine the playground language for this doc context
  const playgroundLang = docLang
    ? DOC_TO_PLAYGROUND[docLang] !== undefined
      ? DOC_TO_PLAYGROUND[docLang]
      : docLang
    : "";
  return (
    <article className="prose prose-neutral prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks with syntax highlighting + copy button
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const rawLang = match ? match[1] : "";
            const language = LANG_MAP[rawLang] || rawLang;
            const codeStr = String(children).replace(/\n$/, "");
            const isBlock = match || (typeof children === "string" && children.includes("\n"));

            return isBlock ? (
              <div className="relative my-6 rounded-xl overflow-hidden bg-[#1e1e1e] group">
                <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/10">
                  <span className="text-xs text-gray-400 font-mono uppercase">{language || "code"}</span>
                  <div className="flex items-center gap-3">
                    {playgroundLang && RUNNABLE_LANGS.has(language || playgroundLang) && (
                      <RunButton code={codeStr} language={language || playgroundLang} />
                    )}
                    <CopyButton text={codeStr} />
                  </div>
                </div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={language || "text"}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    background: "transparent",
                    fontSize: "0.875rem",
                    lineHeight: "1.6",
                  }}
                  codeTagProps={{
                    style: { fontFamily: "var(--font-geist-mono), ui-monospace, monospace" },
                  }}
                >
                  {codeStr}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[0.875em] font-mono border border-slate-200"
                {...props}
              >
                {children}
              </code>
            );
          },
          // Headings with anchor IDs for linking
          h1: ({ children }) => {
            const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            return (
              <h1 id={id} className="text-2xl sm:text-3xl font-heading font-bold text-foreground mt-8 mb-4 pb-2 border-b border-black/5 scroll-mt-24">
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            return (
              <h2 id={id} className="text-2xl font-heading font-semibold text-foreground mt-8 mb-4 scroll-mt-24">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            return (
              <h3 id={id} className="text-xl font-heading font-semibold text-foreground mt-6 mb-3 scroll-mt-24">
                {children}
              </h3>
            );
          },
          // Paragraphs — detect special sections
          p: ({ children }) => {
            const text = String(children);
            // "Try it Yourself" and "Exercise" callouts
            if (text.startsWith("Exercise:") || text.startsWith("**Exercise")) {
              return (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 my-5">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <p className="text-emerald-800 leading-relaxed mb-0 text-[0.95rem]">{children}</p>
                  </div>
                </div>
              );
            }
            return (
              <p className="text-muted-foreground leading-relaxed mb-4">
                {children}
              </p>
            );
          },
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-outside space-y-2 text-muted-foreground mb-4 ml-5">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside space-y-2 text-muted-foreground mb-4 ml-5">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-muted-foreground leading-relaxed pl-1">
              {children}
            </li>
          ),
          // Blockquotes — styled as tips/notes
          blockquote: ({ children }) => (
            <div className="border-l-4 border-blue-300 bg-blue-50 pl-5 pr-4 py-3 my-6 rounded-r-lg">
              <div className="flex items-start gap-2">
                <svg className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-blue-800 [&>p]:mb-0">{children}</div>
              </div>
            </div>
          ),
          // Strong text — detect "Key Points" / "Try it Yourself" headings
          strong: ({ children }) => {
            const text = String(children);
            if (text === "Try it Yourself" || text === "Try It Yourself") {
              return (
                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  {children}
                </span>
              );
            }
            return <strong className="font-semibold text-foreground">{children}</strong>;
          },
          // Links
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-emerald-600 hover:text-emerald-700 underline underline-offset-4 transition-colors"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          // Horizontal rule
          hr: () => <hr className="border-black/10 my-8" />,
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-xl border border-slate-200">
              <table className="w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-slate-100 px-4 py-3 text-muted-foreground">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-slate-50/50 transition-colors">
              {children}
            </tr>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
});
