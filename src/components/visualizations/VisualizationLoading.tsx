export function VisualizationLoading() {
  return (
    <div className="space-y-10 font-sans animate-pulse px-2">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-border/40 rounded-full"></div>
            <div className="h-10 w-56 bg-border/40 rounded-xl"></div>
          </div>
          <div className="h-4 w-80 bg-border/20 rounded-lg ml-5"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-12 w-32 bg-border/30 rounded-2xl"></div>
          <div className="h-12 w-40 bg-border/40 rounded-2xl"></div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface rounded-3xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-border/30 rounded-2xl"></div>
            </div>
            <div className="h-3 w-28 bg-border/20 rounded-full mb-2"></div>
            <div className="h-8 w-20 bg-border/40 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="flex space-x-10 border-b border-border/60 pb-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 w-28 bg-border/30 rounded-full"></div>
        ))}
      </div>

      {/* Main Workspace Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Configuration Panel Skeleton */}
        <div className="bg-surface rounded-[2.5rem] border border-border p-10 shadow-sm h-fit">
          <div className="h-6 w-40 bg-border/30 rounded-lg mb-10"></div>
          <div className="space-y-8">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-3 w-24 bg-border/20 rounded-full mb-3"></div>
                <div className="h-12 w-full bg-border/10 rounded-2xl border border-border/40"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Preview Skeleton */}
        <div className="lg:col-span-2 bg-surface rounded-[2.5rem] border border-border p-10 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div className="h-7 w-48 bg-border/30 rounded-lg"></div>
            <div className="flex gap-3">
              <div className="h-10 w-24 bg-border/20 rounded-xl"></div>
              <div className="h-10 w-32 bg-border/20 rounded-xl"></div>
            </div>
          </div>
          <div className="h-[450px] bg-surface-secondary/20 rounded-[2rem] border border-border/40 border-dashed relative z-10 flex items-center justify-center">
             <div className="w-24 h-24 bg-border/10 rounded-full"></div>
          </div>
          
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
             <div className="w-64 h-64 border-[40px] border-primary rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}