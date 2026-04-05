"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface LessonViewerProps {
  content: string;
}

export function LessonViewer({ content }: LessonViewerProps) {
  return (
    <article className="prose prose-neutral prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks with custom styling
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const isBlock = match || (typeof children === "string" && children.includes("\n"));

            return isBlock ? (
              <div className="relative my-6 rounded-xl overflow-hidden bg-[#1e1e1e]">
                {language && (
                  <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/10">
                    <span className="text-xs text-gray-400 font-mono uppercase">{language}</span>
                    <span className="flex gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-red-500/80" />
                      <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                      <span className="h-3 w-3 rounded-full bg-green-500/80" />
                    </span>
                  </div>
                )}
                <pre className="p-4 overflow-x-auto">
                  <code
                    className="text-sm font-mono text-gray-300 leading-relaxed"
                    {...props}
                  >
                    {children}
                  </code>
                </pre>
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
          // Headings with better styling
          h1: ({ children }) => (
            <h1 className="text-3xl font-heading font-bold text-foreground mt-8 mb-4 pb-2 border-b border-black/5">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-heading font-semibold text-foreground mt-8 mb-4">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-heading font-semibold text-foreground mt-6 mb-3">
              {children}
            </h3>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p className="text-muted-foreground leading-relaxed mb-4">
              {children}
            </p>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4 ml-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4 ml-2">
              {children}
            </ol>
          ),
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-slate-300 bg-slate-50 pl-6 pr-4 py-3 my-6 rounded-r-lg text-muted-foreground">
              {children}
            </blockquote>
          ),
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
            <div className="overflow-x-auto my-6 rounded-lg border border-black/10">
              <table className="w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-black/10 px-4 py-3 text-left font-semibold bg-muted/30">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-black/5 px-4 py-3 text-muted-foreground">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
