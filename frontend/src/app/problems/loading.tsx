export default function ProblemsLoading() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex gap-2 mb-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 w-20 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="space-y-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-14 bg-slate-50 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
          <div className="hidden lg:block w-[280px] space-y-5">
            <div className="h-48 bg-slate-50 rounded-xl border border-slate-100 animate-pulse" />
            <div className="h-64 bg-slate-50 rounded-xl border border-slate-100 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
