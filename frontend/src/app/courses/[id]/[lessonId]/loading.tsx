export default function LessonLoading() {
  return (
    <div className="min-h-screen flex">
      {/* Left: Lesson content skeleton */}
      <div className="flex-1 p-8 border-r border-slate-200 overflow-hidden">
        {/* Back link */}
        <div className="h-4 w-28 bg-slate-200 rounded animate-pulse mb-6" />
        {/* Title */}
        <div className="h-8 w-3/4 bg-slate-200 rounded animate-pulse mb-4" />
        {/* Progress bar */}
        <div className="h-2 w-full bg-slate-100 rounded-full animate-pulse mb-8" />
        {/* Paragraph lines */}
        <div className="space-y-3">
          <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
        </div>
        {/* Code block placeholder */}
        <div className="mt-8 h-32 w-full bg-slate-100 rounded-lg animate-pulse" />
        {/* More paragraph lines */}
        <div className="mt-8 space-y-3">
          <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>

      {/* Right: Code editor skeleton */}
      <div className="flex-1 bg-slate-900 p-6 overflow-hidden">
        {/* Editor toolbar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-20 bg-slate-700 rounded animate-pulse" />
          <div className="h-8 w-24 bg-slate-700 rounded animate-pulse" />
          <div className="ml-auto h-8 w-20 bg-emerald-800 rounded animate-pulse" />
        </div>
        {/* Line numbers + code lines */}
        <div className="space-y-2 mt-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-6 bg-slate-700 rounded animate-pulse" />
              <div
                className="h-4 bg-slate-700 rounded animate-pulse"
                style={{ width: `${30 + Math.random() * 50}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
