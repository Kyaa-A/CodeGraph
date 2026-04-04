import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
