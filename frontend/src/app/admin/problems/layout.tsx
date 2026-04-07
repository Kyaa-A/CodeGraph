import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Problems | Admin | CodeGraph",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
