export default function KYCLoading() {
  return (
    <div className="space-y-10 font-sans animate-pulse px-2">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-border/40 rounded-full"></div>
            <div className="h-10 w-64 bg-border/40 rounded-xl"></div>
          </div>
          <div className="h-4 w-96 bg-border/20 rounded-lg ml-5"></div>
        </div>
        <div className="h-12 w-48 bg-border/40 rounded-2xl"></div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-surface rounded-3xl border border-border p-6 shadow-sm">
            <div className="w-10 h-10 bg-border/30 rounded-2xl mb-4"></div>
            <div className="h-3 w-20 bg-border/20 rounded-full mb-1"></div>
            <div className="h-8 w-16 bg-border/40 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Analysis Section Skeleton */}
      <div className="bg-surface rounded-[2.5rem] border border-border overflow-hidden h-96 shadow-sm"></div>

      {/* Pipeline Container Skeleton */}
      <div className="bg-surface rounded-[2.5rem] border border-border overflow-hidden shadow-sm">
        <div className="px-10 py-8 border-b border-border bg-surface-secondary/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="h-10 w-48 bg-border/30 rounded-xl"></div>
          <div className="flex gap-4">
             <div className="h-10 w-24 bg-border/20 rounded-xl"></div>
             <div className="h-10 w-32 bg-border/20 rounded-xl"></div>
             <div className="h-10 w-32 bg-border/20 rounded-xl"></div>
          </div>
        </div>

        <div className="p-10 space-y-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-surface-secondary/30 rounded-3xl border border-border/40"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
