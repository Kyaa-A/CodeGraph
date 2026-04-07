import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <Logo textClassName="font-bold text-slate-900" />
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
            <Link href="/courses" className="hover:text-slate-700 transition-colors">
              Courses
            </Link>
            <Link href="/problems" className="hover:text-slate-700 transition-colors">
              Problems
            </Link>
            <Link href="/docs" className="hover:text-slate-700 transition-colors">
              Docs
            </Link>
            <Link href="/playground" className="hover:text-slate-700 transition-colors">
              Playground
            </Link>
            <Link href="/terms" className="hover:text-slate-700 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-slate-700 transition-colors">
              Privacy
            </Link>
          </nav>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} CodeGraph. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
