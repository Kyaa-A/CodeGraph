function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className ?? ""}`} />;
}

export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-white pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <Skeleton className="h-8 w-40 mx-auto mb-3 rounded-lg" />
          <Skeleton className="h-4 w-64 mx-auto rounded-md" />
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>

        {/* Podium */}
        <div className="flex justify-center items-end gap-4 mb-10">
          <Skeleton className="h-36 w-28 rounded-2xl" />
          <Skeleton className="h-44 w-32 rounded-2xl" />
          <Skeleton className="h-36 w-28 rounded-2xl" />
        </div>

        {/* Table rows */}
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
              <Skeleton className="h-6 w-8 rounded" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
              <Skeleton className="h-5 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
