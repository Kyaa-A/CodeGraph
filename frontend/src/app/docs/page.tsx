import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Documentation | CodeGraph",
  description: "Free programming documentation and tutorials for 15+ languages",
};

/* ── Real SVG logos for each language ── */
const LOGOS: Record<string, React.ReactNode> = {
  python: (
    <svg viewBox="0 0 256 255" className="h-full w-full">
      <defs><linearGradient id="py-a" x1="12.959%" x2="79.639%" y1="12.039%" y2="78.201%"><stop offset="0%" stopColor="#387EB8"/><stop offset="100%" stopColor="#366994"/></linearGradient><linearGradient id="py-b" x1="19.128%" x2="90.742%" y1="20.579%" y2="88.429%"><stop offset="0%" stopColor="#FFE052"/><stop offset="100%" stopColor="#FFC331"/></linearGradient></defs>
      <path fill="url(#py-a)" d="M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072ZM92.802 19.66a11.12 11.12 0 1 1 0 22.24 11.12 11.12 0 0 1 0-22.24Z"/>
      <path fill="url(#py-b)" d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.518 33.897Zm34.114-19.586a11.12 11.12 0 1 1 0-22.24 11.12 11.12 0 0 1 0 22.24Z"/>
    </svg>
  ),
  javascript: (
    <svg viewBox="0 0 256 256" className="h-full w-full">
      <rect width="256" height="256" fill="#F7DF1E" rx="12"/>
      <path d="m67.312 213.932 19.59-11.856c3.78 6.701 7.218 12.371 15.465 12.371 7.905 0 12.89-3.092 12.89-15.12v-81.798h24.057v82.138c0 24.917-14.606 36.259-35.916 36.259-19.245 0-30.416-9.967-36.087-21.996m85.07-2.576 19.588-11.341c5.157 8.421 11.859 14.607 23.715 14.607 9.969 0 16.325-4.984 16.325-11.858 0-8.248-6.53-11.17-17.528-15.98l-6.013-2.58c-17.357-7.387-28.87-16.667-28.87-36.257 0-18.044 13.747-31.792 35.228-31.792 15.294 0 26.292 5.328 34.196 19.247L210.29 147.2c-4.44-7.905-9.25-11.028-16.672-11.028-7.56 0-12.373 4.812-12.373 11.028 0 7.731 4.812 10.826 15.906 15.637l6.014 2.577c20.45 8.765 31.963 17.7 31.963 37.804 0 21.654-17.012 33.51-39.867 33.51-22.339 0-36.774-10.654-43.819-24.574"/>
    </svg>
  ),
  typescript: (
    <svg viewBox="0 0 256 256" className="h-full w-full">
      <rect width="256" height="256" fill="#3178C6" rx="12"/>
      <path fill="#fff" d="M150.518 200.475v27.62c4.492 2.302 9.805 4.028 15.938 5.179 6.133 1.151 12.597 1.726 19.393 1.726 6.622 0 12.914-.633 18.874-1.899 5.96-1.266 11.187-3.352 15.678-6.257 4.492-2.906 8.048-6.796 10.669-11.672 2.62-4.876 3.931-10.94 3.931-18.191 0-5.237-.96-9.795-2.882-13.672-1.921-3.878-4.549-7.272-7.884-10.182-3.335-2.91-7.218-5.468-11.648-7.672-4.43-2.204-9.134-4.291-14.112-6.26-3.683-1.498-6.996-2.944-9.94-4.34-2.944-1.395-5.455-2.846-7.535-4.353-2.08-1.507-3.683-3.147-4.81-4.92-1.127-1.773-1.69-3.82-1.69-6.14 0-2.148.476-4.07 1.429-5.766.952-1.696 2.321-3.148 4.107-4.356 1.786-1.208 3.944-2.137 6.474-2.787 2.53-.65 5.38-.975 8.55-.975 2.235 0 4.587.174 7.058.523 2.47.348 4.94.899 7.41 1.651 2.47.752 4.852 1.708 7.146 2.87 2.294 1.16 4.376 2.521 6.245 4.082v-25.697c-4.144-1.67-8.636-2.882-13.478-3.636-4.841-.755-10.322-1.132-16.443-1.132-6.622 0-12.826.683-18.613 2.05-5.787 1.365-10.886 3.494-15.296 6.386-4.41 2.893-7.884 6.597-10.422 11.113-2.538 4.515-3.807 9.94-3.807 16.275 0 8.726 2.538 16.032 7.614 21.92 5.076 5.889 12.59 10.606 22.54 14.151 3.856 1.382 7.45 2.764 10.782 4.148 3.331 1.382 6.219 2.878 8.664 4.487 2.444 1.61 4.375 3.407 5.793 5.393 1.417 1.986 2.126 4.291 2.126 6.916 0 2.032-.536 3.878-1.607 5.539-1.072 1.66-2.59 3.09-4.554 4.29-1.964 1.2-4.342 2.127-7.133 2.783-2.79.655-5.884.983-9.28.983-6.102 0-12.18-1.205-18.234-3.614-6.054-2.41-11.563-5.985-16.527-10.727Zm-46.937-76.69h30.356v-22.8H72.636v22.8h30.349v86.523h22.23v-86.523H103.58Z"/>
    </svg>
  ),
  react: (
    <svg viewBox="0 0 256 228" className="h-full w-full">
      <path fill="#61DAFB" d="M210.483 73.824a171.49 171.49 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621 6.238-30.281 2.16-54.676-11.769-62.708-13.355-7.7-35.196.329-57.254 19.526a171.23 171.23 0 0 0-6.375 5.848 155.866 155.866 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233 50.33 10.957 46.379 33.89 51.986 62.588a170.974 170.974 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a145.52 145.52 0 0 0 6.921 2.165 167.467 167.467 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266 13.744 7.926 36.812-.22 59.273-19.855a145.567 145.567 0 0 0 5.342-4.923 168.064 168.064 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586 13.731-7.949 18.194-32.003 12.4-61.268a145.016 145.016 0 0 0-1.535-6.842c1.62-.48 3.21-.99 4.76-1.53 29.151-10.09 48.44-25.865 48.44-42.044.001-15.167-18.016-30.26-45.513-40.078Zm-6.365 70.984c-1.4.463-2.836.91-4.3 1.345-3.24-10.257-7.612-21.163-12.963-32.432 5.106-11 9.31-21.767 12.459-31.957 2.619.758 5.16 1.557 7.61 2.4 23.69 8.156 38.14 20.213 38.14 29.504 0 10.09-15.634 22.959-40.945 31.14Zm-10.514 20.834c2.562 12.94 2.927 24.64 1.23 33.787-1.524 8.219-4.59 13.698-8.382 15.893-8.067 4.66-25.084-1.4-43.077-16.806a157.048 157.048 0 0 1-6.437-5.87c7.214-7.889 14.423-17.06 21.459-27.246 12.376-1.098 24.068-2.894 34.671-5.345a132.236 132.236 0 0 1 .536 5.587Zm-76.72 59.056c-8.668 7.664-16.647 12.49-23.324 14.666-5.996 1.953-10.508 1.838-13.378.17-6.106-3.527-8.744-16.163-6.18-33.377a155.3 155.3 0 0 1 1.873-8.512c10.565 2.317 22.15 3.925 34.428 4.817 7.106 9.95 14.468 18.934 21.78 26.676a131.92 131.92 0 0 1-15.199 15.56ZM53.958 82.36c-1.066-.373-2.1-.76-3.098-1.16C28.04 72.24 13.2 60.024 13.2 49.633c0-9.568 13.352-21.2 35.65-29.074 2.833-.997 5.795-1.924 8.864-2.783 3.266 10.36 7.66 21.434 12.98 32.817-5.427 11.594-9.903 22.808-13.198 33.285a140.267 140.267 0 0 1-3.538-1.518Zm11.044 24.628c4.428-9.698 9.678-19.674 15.65-29.639 5.885-9.825 12.334-19.377 19.284-28.44 8.49-.735 17.346-1.118 26.443-1.118 9.184 0 18.118.395 26.662 1.155 6.898 9.03 13.312 18.544 19.168 28.315 5.96 9.928 11.183 19.945 15.573 29.674-4.407 9.735-9.643 19.742-15.602 29.645-5.87 9.8-12.305 19.345-19.225 28.399-8.523.758-17.416 1.156-26.576 1.156-9.098 0-17.927-.379-26.364-1.107C87 130.622 80.61 121.125 74.757 111.36c-5.953-9.91-11.183-19.84-15.573-29.498a1.567 1.567 0 0 1 5.818 25.126ZM128.38 17.26c6.984-6.16 13.749-10.895 19.923-14.12 5.542-2.895 10.053-3.962 13.016-2.248 6.306 3.643 8.875 17.398 6.073 35.85a158.985 158.985 0 0 1-1.185 5.234c-10.441-2.16-21.77-3.655-33.686-4.424-7.032-9.778-14.275-18.66-21.577-26.318a139.63 139.63 0 0 1 17.436 6.026ZM85.017 113.322a675.64 675.64 0 0 1-3.158-5.581c-1.067-1.92-2.104-3.843-3.108-5.77 6.65-1.44 13.647-2.6 20.916-3.462 2.394 3.628 4.876 7.264 7.44 10.873 2.6 3.66 5.195 7.203 7.795 10.626-7.434-.934-14.582-2.24-21.364-3.865a417.098 417.098 0 0 1-8.52-2.82Zm43.695 42.12c-4.508-5.7-8.95-11.788-13.29-18.202a612.94 612.94 0 0 0 27.024.01c-4.33 6.397-8.786 12.478-13.313 18.162l-.42.03Zm29.18-5.226c7.402.97 14.515 2.293 21.272 3.924a413.76 413.76 0 0 1-8.563 2.873c-1.064 1.93-2.158 3.852-3.28 5.76a676.59 676.59 0 0 1-3.146 5.533c-2.579-3.358-5.135-6.843-7.677-10.453-2.538-3.604-5.007-7.24-7.39-10.89a359.566 359.566 0 0 0 8.784 3.253Zm-21.568-89.842a648.08 648.08 0 0 1 13.564 18.47 612.94 612.94 0 0 0-27.363-.008c4.355-6.291 8.85-12.305 13.369-18.105l.43-.357ZM128 90.808c12.946 0 23.448 10.502 23.448 23.448 0 12.946-10.502 23.448-23.448 23.448-12.946 0-23.448-10.502-23.448-23.448 0-12.946 10.502-23.448 23.448-23.448Z"/>
    </svg>
  ),
  "html-css": (
    <svg viewBox="0 0 256 256" className="h-full w-full">
      <path fill="#E44D26" d="M128 225.886 41.093 204.97 23.31 5h209.38l-17.794 199.954z"/>
      <path fill="#F16529" d="M128 209.912V23.83h86.694L198.37 198.47z"/>
      <path fill="#EBEBEB" d="M60.484 56.792h67.56v24.084H86.676l2.168 24.26H128v24.064H62.852zM64.648 131.264h24.212l1.72 19.22L128 159.43v25.003l-62.068-17.196z"/>
      <path fill="#fff" d="M195.394 56.792H128v24.084h64.698zm-2.216 48.344H128v24.064h40.84l-3.892 43.36L128 182.592v24.26l62.132-17.224z"/>
    </svg>
  ),
  java: (
    <svg viewBox="0 0 256 346" className="h-full w-full">
      <path fill="#5382A1" d="M82.554 267.473s-13.198 7.675 9.393 10.272c27.369 3.122 41.356 2.675 71.517-3.034 0 0 7.93 4.972 19.003 9.279-67.611 28.977-153.019-1.679-99.913-16.517m-8.262-37.814s-14.803 10.958 7.805 13.296c29.236 3.016 52.324 3.263 92.276-4.439 0 0 5.526 5.602 14.215 8.666-81.747 23.904-172.842 1.886-114.296-17.523"/>
      <path fill="#E76F00" d="M143.942 165.515c16.66 19.18-4.377 36.44-4.377 36.44s42.301-21.837 22.874-49.183c-18.144-25.5-32.059-38.172 43.268-81.858 0 0-118.238 29.53-61.765 94.6"/>
      <path fill="#5382A1" d="M233.364 295.442s9.767 8.047-10.757 14.273c-39.026 11.823-162.432 15.393-196.714.471-12.323-5.36 10.787-12.8 18.056-14.362 7.581-1.644 11.914-1.337 11.914-1.337-13.705-9.655-88.583 18.957-38.034 27.15 137.853 22.356 251.292-10.066 215.535-26.195M88.9 190.48s-62.771 14.91-22.228 20.323c17.118 2.292 51.243 1.774 83.03-.889 25.978-2.187 52.063-6.85 52.063-6.85s-9.16 3.923-15.787 8.448c-63.744 16.765-186.886 8.966-151.435-8.183 29.981-14.492 54.358-12.85 54.358-12.85m112.605 62.942c64.8-33.672 34.839-66.03 13.927-61.67-5.126 1.066-7.411 1.99-7.411 1.99s1.903-2.98 5.537-4.27c41.37-14.545 73.187 42.897-13.355 65.647 0 .001 1.003-.896 1.302-1.697"/>
      <path fill="#E76F00" d="M162.439.371s35.887 35.9-34.037 91.101c-56.071 44.282-12.786 69.53-.023 98.377-32.73-29.53-56.75-55.526-40.635-79.72C111.395 74.612 176.918 57.393 162.439.37"/>
    </svg>
  ),
  sql: (
    <svg viewBox="0 0 256 256" className="h-full w-full">
      <rect width="256" height="256" fill="#00758F" rx="12"/>
      <text x="128" y="160" fill="white" fontSize="100" fontWeight="bold" fontFamily="Arial" textAnchor="middle">SQL</text>
    </svg>
  ),
  go: (
    <svg viewBox="0 0 256 256" className="h-full w-full">
      <rect width="256" height="256" fill="#00ADD8" rx="12"/>
      <text x="128" y="165" fill="white" fontSize="100" fontWeight="bold" fontFamily="Arial" textAnchor="middle">Go</text>
    </svg>
  ),
  rust: (
    <svg viewBox="0 0 256 256" className="h-full w-full">
      <rect width="256" height="256" fill="#000" rx="12"/>
      <text x="128" y="155" fill="#F74C00" fontSize="80" fontWeight="bold" fontFamily="Arial" textAnchor="middle">Rust</text>
    </svg>
  ),
  c: (
    <svg viewBox="0 0 256 256" className="h-full w-full">
      <rect width="256" height="256" fill="#A8B9CC" rx="12"/>
      <text x="128" y="170" fill="#fff" fontSize="140" fontWeight="bold" fontFamily="Arial" textAnchor="middle">C</text>
    </svg>
  ),
  cpp: (
    <svg viewBox="0 0 256 256" className="h-full w-full">
      <rect width="256" height="256" fill="#00599C" rx="12"/>
      <text x="128" y="165" fill="#fff" fontSize="100" fontWeight="bold" fontFamily="Arial" textAnchor="middle">C++</text>
    </svg>
  ),
  csharp: (
    <svg viewBox="0 0 256 256" className="h-full w-full">
      <rect width="256" height="256" fill="#68217A" rx="12"/>
      <text x="128" y="165" fill="#fff" fontSize="110" fontWeight="bold" fontFamily="Arial" textAnchor="middle">C#</text>
    </svg>
  ),
  php: (
    <svg viewBox="0 0 256 256" className="h-full w-full">
      <rect width="256" height="256" fill="#777BB4" rx="12"/>
      <text x="128" y="160" fill="#fff" fontSize="90" fontWeight="bold" fontFamily="Arial" textAnchor="middle">PHP</text>
    </svg>
  ),
  nodejs: (
    <svg viewBox="0 0 256 256" className="h-full w-full">
      <rect width="256" height="256" fill="#339933" rx="12"/>
      <text x="128" y="155" fill="#fff" fontSize="70" fontWeight="bold" fontFamily="Arial" textAnchor="middle">Node</text>
    </svg>
  ),
  langchain: (
    <svg viewBox="0 0 256 256" className="h-full w-full">
      <rect width="256" height="256" fill="#1C3C3C" rx="12"/>
      <text x="128" y="155" fill="#10B981" fontSize="60" fontWeight="bold" fontFamily="Arial" textAnchor="middle">Lang</text>
      <text x="128" y="205" fill="#fff" fontSize="50" fontWeight="bold" fontFamily="Arial" textAnchor="middle">Chain</text>
    </svg>
  ),
};

/* ── Language data grouped by category ── */
const CATEGORIES = [
  {
    title: "Web Development",
    description: "Build websites and web applications",
    languages: [
      { lang: "html-css", name: "HTML & CSS", description: "Semantic HTML, Flexbox, Grid, responsive design" },
      { lang: "javascript", name: "JavaScript", description: "DOM, async/await, closures, ES6+" },
      { lang: "typescript", name: "TypeScript", description: "Interfaces, generics, utility types" },
      { lang: "react", name: "React", description: "Components, hooks, state, Next.js" },
      { lang: "nodejs", name: "Node.js", description: "Express, REST APIs, streams" },
      { lang: "php", name: "PHP", description: "Server-side web, OOP, PDO" },
    ],
  },
  {
    title: "Programming Languages",
    description: "Core languages for software development",
    languages: [
      { lang: "python", name: "Python", description: "Variables, OOP, file handling, advanced" },
      { lang: "java", name: "Java", description: "OOP, collections, generics, threads" },
      { lang: "c", name: "C", description: "Pointers, memory, structs, file I/O" },
      { lang: "cpp", name: "C++", description: "Classes, templates, STL, smart pointers" },
      { lang: "csharp", name: "C#", description: "LINQ, generics, async, .NET" },
      { lang: "go", name: "Go", description: "Goroutines, channels, interfaces" },
      { lang: "rust", name: "Rust", description: "Ownership, borrowing, lifetimes, traits" },
    ],
  },
  {
    title: "Data & AI",
    description: "Databases, data science, and AI frameworks",
    languages: [
      { lang: "sql", name: "SQL", description: "JOINs, subqueries, indexes, optimization" },
      { lang: "langchain", name: "LangChain", description: "Chains, agents, RAG, embeddings" },
    ],
  },
];

export default async function DocsPage() {
  const supabase = await createClient();

  const { data: counts } = await supabase.from("doc_topics").select("lang");

  const langCounts = new Map<string, number>();
  for (const row of counts ?? []) {
    langCounts.set(row.lang, (langCounts.get(row.lang) || 0) + 1);
  }

  const totalPages = Array.from(langCounts.values()).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-6">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {totalPages}+ pages across {langCounts.size} languages
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Learn to Code
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
            Free, comprehensive programming references. No account required.
          </p>

          {/* Popular quick links */}
          <div className="flex flex-wrap justify-center gap-2">
            {["python", "javascript", "java", "sql", "react", "typescript"].map((lang) => {
              const count = langCounts.get(lang) || 0;
              if (count === 0) return null;
              const name = CATEGORIES.flatMap((c) => c.languages).find((l) => l.lang === lang)?.name ?? lang;
              return (
                <Link
                  key={lang}
                  href={`/docs/${lang}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <div className="h-5 w-5 shrink-0 overflow-hidden rounded-sm">{LOGOS[lang]}</div>
                  {name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-16 space-y-12">
        {CATEGORIES.map((cat) => (
          <section key={cat.title}>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900">{cat.title}</h2>
              <p className="text-sm text-slate-500">{cat.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {cat.languages.map((l) => {
                const pageCount = langCounts.get(l.lang) || 0;
                const available = pageCount > 0;

                return (
                  <Link
                    key={l.lang}
                    href={available ? `/docs/${l.lang}` : "#"}
                    className={`group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                      available
                        ? "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-100/50"
                        : "bg-slate-50 border-slate-100 opacity-50 pointer-events-none"
                    }`}
                  >
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md">{LOGOS[l.lang]}</div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors text-sm">
                        {l.name}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">{l.description}</p>
                      <span className="text-xs text-slate-400 mt-0.5 block">
                        {available ? `${pageCount} topics` : "Coming soon"}
                      </span>
                    </div>
                    {available && (
                      <svg className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 shrink-0 ml-auto transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {/* Bottom CTA */}
        <div className="text-center pt-4 pb-8">
          <p className="text-sm text-slate-400">
            Want interactive lessons with a code editor?{" "}
            <Link href="/courses" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Check out our courses →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
