export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-8 w-32 bg-slate-100 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-50 rounded-xl border border-slate-100 animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-slate-50 rounded-xl border border-slate-100 animate-pulse" />
      </div>
    </div>
  );
}
