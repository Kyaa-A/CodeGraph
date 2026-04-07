import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth | CodeGraph",
  description: "Sign in or create your CodeGraph account to track progress and earn XP",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
