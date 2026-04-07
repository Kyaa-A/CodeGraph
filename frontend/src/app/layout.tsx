import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DailyXpTrigger } from "@/app/dashboard/daily-xp-trigger";
import { ClientWidgets } from "@/components/client-widgets";
import { LevelUpOverlay } from "@/components/level-up-overlay";

const XpToastProvider = dynamic(() => import("@/components/xp-toast").then((m) => m.XpToastProvider), {
  ssr: false,
});

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

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://codegraph.dev"),
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
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium">
          Skip to main content
        </a>
        <Navbar />
        <DailyXpTrigger />
        <LevelUpOverlay />
        <XpToastProvider />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
        <Suspense fallback={null}>
          <ClientWidgets />
        </Suspense>
      </body>
    </html>
  );
}
