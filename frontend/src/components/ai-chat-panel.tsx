"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage } from "@/lib/api";
import { createChatSession, sendChatMessage } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AIChatPanelProps {
  lessonId: string;
  courseId: string;
}

// Icons
const Icons = {
  send: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  bot: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  ),
  user: () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  sparkle: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

export function AIChatPanel({ lessonId }: AIChatPanelProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI tutor for this lesson. Ask me anything about the content!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize chat session on mount
  useEffect(() => {
    createChatSession(lessonId).then(({ session_id }) => {
      setSessionId(session_id);
    }).catch(console.error);
  }, [lessonId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !sessionId) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { response } = await sendChatMessage(sessionId, lessonId, input);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, lessonId, sessionId]);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-white">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <Icons.bot />
        </div>
        <div>
          <h3 className="font-heading font-semibold">AI Tutor</h3>
          <p className="text-xs text-muted-foreground">Ask anything about this lesson</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4" ref={scrollRef}>
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role !== "user" && (
                  <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Icons.bot />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-black text-white rounded-br-md"
                      : "bg-slate-50 text-foreground rounded-bl-md border border-slate-200"
                  }`}
                >
                  {message.role === "user" ? (
                    message.content
                  ) : (
                    <div className="prose prose-sm prose-slate max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ol]:mb-2 [&>pre]:mb-2">
                      <ReactMarkdown
                        components={{
                          code({ className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || "");
                            const codeStr = String(children).replace(/\n$/, "");
                            const isBlock = match || (typeof children === "string" && children.includes("\n"));
                            return isBlock ? (
                              <SyntaxHighlighter
                                style={oneDark}
                                language={match?.[1] || "text"}
                                PreTag="div"
                                customStyle={{ margin: "0.5rem 0", padding: "0.75rem", borderRadius: "0.5rem", fontSize: "0.8rem" }}
                              >
                                {codeStr}
                              </SyntaxHighlighter>
                            ) : (
                              <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded text-[0.8em]" {...props}>
                                {children}
                              </code>
                            );
                          },
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Icons.user />
                  </div>
                )}
              </motion.div>
            ))}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Icons.bot />
                </div>
                <div className="bg-slate-50 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-200">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-white">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask about the lesson..."
            className="min-h-[60px] max-h-[120px] resize-none rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20"
            disabled={loading || !sessionId}
          />
          <Button
            type="submit"
            disabled={!input.trim() || loading || !sessionId}
            className="btn-gold rounded-xl px-4 shrink-0"
          >
            <Icons.send />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift + Enter for new line
        </p>
      </form>
    </div>
  );
}
