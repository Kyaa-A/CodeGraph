import Link from "next/link";

export function LogoIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#171717" />
      <path d="M8 12L12 16L8 20" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 20H24" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="11" r="2" fill="#10b981" />
    </svg>
  );
}

export function Logo({ className = "", textClassName = "font-bold text-lg text-slate-900" }: {
  className?: string;
  textClassName?: string;
}) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon />
      <span className={textClassName}>CodeGraph</span>
    </Link>
  );
}
