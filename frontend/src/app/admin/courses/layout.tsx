import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Courses | Admin | CodeGraph",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
