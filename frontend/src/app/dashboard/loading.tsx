function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className ?? ""}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20">
      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-6xl">
        {/* Welcome header */}
        <div className="mb-8 sm:mb-10">
          <Skeleton className="h-4 w-24 mb-2 rounded-md" />
          <Skeleton className="h-9 w-48 rounded-lg" />
        </div>

        {/* Level card */}
        <Skeleton className="h-40 w-full rounded-2xl mb-8 bg-slate-800/10" />

        {/* Activity heatmap */}
        <Skeleton className="h-44 w-full rounded-2xl mb-8" />

        {/* Continue + Daily */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-6 w-32 rounded-lg" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 rounded-lg" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
