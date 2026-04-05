import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { LevelUpOverlay } from "@/components/level-up-overlay";
import { ChatbotWidget } from "@/components/chatbot-widget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CodeGraph - Learn to Code with Interactive Courses & Problems",
  description:
    "Master programming with interactive courses, LeetCode-style coding problems, and a built-in code playground. Free courses in Python, JavaScript, React, Next.js, and more.",
  keywords: ["coding", "programming", "courses", "problems", "playground", "learn to code"],
  openGraph: {
    title: "CodeGraph - Learn to Code with Interactive Courses & Problems",
    description: "Master programming with interactive courses, coding problems, and a built-in code playground.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <LevelUpOverlay />
        <main className="flex-1">{children}</main>
        <ChatbotWidget />
      </body>
    </html>
  );
}
