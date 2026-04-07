import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo textClassName="font-bold text-slate-900" />
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} CodeGraph
          </p>
        </div>
      </div>
    </footer>
  );
}
