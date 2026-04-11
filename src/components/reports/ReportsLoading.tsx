export function ReportsLoading() {
  return (
    <div className="space-y-10 font-sans animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-border/40 rounded-full"></div>
            <div className="h-10 w-48 bg-border/40 rounded-xl"></div>
          </div>
          <div className="h-4 w-72 bg-border/20 rounded-lg ml-5"></div>
        </div>
        <div className="h-12 w-40 bg-border/40 rounded-2xl"></div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface rounded-3xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-border/30 rounded-2xl"></div>
            </div>
            <div className="h-3 w-28 bg-border/20 rounded-full mb-2"></div>
            <div className="flex items-baseline gap-2">
              <div className="h-8 w-16 bg-border/40 rounded-lg"></div>
              <div className="h-3 w-20 bg-border/20 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-surface rounded-[2.5rem] border border-border p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full">
          <div className="h-12 flex-1 max-w-md bg-border/30 rounded-2xl"></div>
          <div className="h-12 w-40 bg-border/20 rounded-2xl"></div>
          <div className="h-12 w-40 bg-border/20 rounded-2xl"></div>
        </div>
        <div className="h-12 w-24 bg-border/30 rounded-2xl self-end lg:self-center"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-surface rounded-[2rem] border border-border overflow-hidden shadow-sm flex flex-col h-[380px]">
            <div className="p-8 flex-1">
              <div className="h-6 w-32 bg-border/20 rounded-lg mb-4"></div>
              <div className="h-8 w-56 bg-border/40 rounded-lg mb-2"></div>
              <div className="space-y-2 mb-8">
                <div className="h-3 w-full bg-border/10 rounded-full"></div>
                <div className="h-3 w-2/3 bg-border/10 rounded-full"></div>
              </div>
              
              <div className="mt-auto flex justify-between items-center">
                 <div className="h-6 w-24 bg-border/20 rounded-lg"></div>
                 <div className="h-6 w-16 bg-border/20 rounded-lg"></div>
              </div>
            </div>
            
            <div className="bg-surface-secondary/20 border-t border-border/60 px-8 py-5">
              <div className="flex items-center justify-between">
                <div className="h-6 w-32 bg-border/30 rounded-full"></div>
                <div className="h-8 w-8 bg-border/20 rounded-xl"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}