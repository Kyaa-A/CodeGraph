export default function CoursesLoading() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-8 w-40 bg-slate-100 rounded-lg animate-pulse mb-8" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-50 rounded-xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
