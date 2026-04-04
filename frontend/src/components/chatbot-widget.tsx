"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "bot";
  text: string;
}

const FAQ: { q: string; a: string }[] = [
  {
    q: "What is CodeGraph?",
    a: "CodeGraph is a free platform to learn coding through interactive courses, LeetCode-style problems, and a powerful code playground that supports 13+ languages.",
  },
  {
    q: "Is CodeGraph free?",
    a: "Yes! CodeGraph is 100% free for individual learners. You get full access to all courses, problems, and the code playground.",
  },
  {
    q: "What languages are supported?",
    a: "We support Python, JavaScript, TypeScript, Java, C, C++, C#, Go, Rust, Ruby, PHP, Kotlin, and SQL. You can run code directly in your browser.",
  },
  {
    q: "How do I get started?",
    a: "Just create a free account! Then you can browse courses, solve problems, or jump straight into the playground to start coding.",
  },
  {
    q: "Do I need to install anything?",
    a: "No installation needed. Everything runs in your browser — the code editor, compiler, and all course content.",
  },
];

function findAnswer(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes("what is") && lower.includes("codegraph")) return FAQ[0].a;
  if (lower.includes("free") || lower.includes("cost") || lower.includes("price") || lower.includes("pay")) return FAQ[1].a;
  if (lower.includes("language") || lower.includes("python") || lower.includes("javascript") || lower.includes("support")) return FAQ[2].a;
  if (lower.includes("start") || lower.includes("begin") || lower.includes("sign up") || lower.includes("get started")) return FAQ[3].a;
  if (lower.includes("install") || lower.includes("download") || lower.includes("setup")) return FAQ[4].a;
  if (lower.includes("course")) return "We offer interactive courses on AI development, LangChain, Python, and more. Check them out at the Courses page!";
  if (lower.includes("problem") || lower.includes("leetcode") || lower.includes("challenge")) return "We have 20+ coding problems across easy, medium, and hard difficulties. Head to the Problems page to start solving!";
  if (lower.includes("playground") || lower.includes("editor") || lower.includes("code")) return "The playground lets you write and run code in 13+ languages right in your browser. Try it out on the Playground page!";
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) return "Hey there! How can I help you learn about CodeGraph?";
  if (lower.includes("thank")) return "You're welcome! Happy coding!";

  return "I'm not sure about that, but I can help with questions about CodeGraph's courses, problems, playground, supported languages, and getting started. What would you like to know?";
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi! I'm CodeGraph's assistant. Ask me anything about the platform, courses, or how to get started." },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = { role: "user", text: trimmed };
    const botMsg: Message = { role: "bot", text: findAnswer(trimmed) };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <>
      {/* Chat bubble button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-h-[500px] bg-white rounded-2xl shadow-2xl shadow-black/15 border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-emerald-500 text-white">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">CodeGraph Assistant</h3>
                  <p className="text-xs text-white/70">Ask me anything</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] max-h-[340px]">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-emerald-500 text-white rounded-br-md"
                        : "bg-slate-100 text-slate-700 rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick questions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {["What is CodeGraph?", "Is it free?", "What languages?"].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      const userMsg: Message = { role: "user", text: q };
                      const botMsg: Message = { role: "bot", text: findAnswer(q) };
                      setMessages((prev) => [...prev, userMsg, botMsg]);
                    }}
                    className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-slate-100">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="h-10 w-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
