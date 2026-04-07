export default function PlaygroundLoading() {
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="animate-pulse space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 bg-slate-200 rounded-lg" />
            <div className="h-8 w-32 bg-slate-200 rounded-lg" />
          </div>
          {/* Editor area */}
          <div className="h-[500px] bg-slate-200 rounded-2xl" />
          {/* Output area */}
          <div className="h-32 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
