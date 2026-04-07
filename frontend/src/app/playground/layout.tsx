import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code Playground | CodeGraph",
  description: "Write, run, and test code in 13+ languages right in your browser",
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
