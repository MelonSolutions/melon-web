'use client';

export function MetricsLoading() {
  return (
    <div className="space-y-10 font-sans animate-pulse px-2 pb-20">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-border/40 dark:bg-white/10 rounded-full"></div>
            <div className="h-10 w-64 bg-border/40 dark:bg-white/10 rounded-2xl"></div>
          </div>
          <div className="h-4 w-80 bg-border/20 dark:bg-white/5 rounded-lg ml-5"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-12 w-28 bg-border/30 dark:bg-white/10 rounded-xl"></div>
          <div className="h-12 w-28 bg-border/30 dark:bg-white/10 rounded-xl"></div>
          <div className="h-12 w-40 bg-border/40 dark:bg-white/20 rounded-xl shadow-sm"></div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-surface dark:bg-black/20 rounded-[2.5rem] border border-border dark:border-white/10 p-8 shadow-sm">
            <div className="w-12 h-12 bg-border/30 dark:bg-white/10 rounded-2xl mb-6"></div>
            <div className="h-3 w-32 bg-border/20 dark:bg-white/5 rounded-full mb-3"></div>
            <div className="flex items-baseline gap-2">
                <div className="h-10 w-20 bg-border/40 dark:bg-white/20 rounded-xl"></div>
                <div className="h-3 w-12 bg-border/20 dark:bg-white/5 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="space-y-10">
         <div className="flex space-x-10 border-b border-border/60">
             {[...Array(4)].map((_, i) => (
                 <div key={i} className="py-6 px-1 w-32 bg-border/20 dark:bg-white/5 rounded-t-lg"></div>
             ))}
         </div>
         
         <div className="bg-surface dark:bg-black/20 rounded-[3rem] border border-border dark:border-white/10 p-10 h-[600px] shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-12">
               <div>
                  <div className="h-8 w-64 bg-border/40 dark:bg-white/10 rounded-xl mb-3"></div>
                  <div className="h-4 w-96 bg-border/20 dark:bg-white/5 rounded-lg"></div>
               </div>
               <div className="h-10 w-32 bg-border/30 dark:bg-white/10 rounded-xl"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-72 bg-surface-secondary/20 dark:bg-white/5 rounded-[2rem] border border-border/40 dark:border-white/10"></div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}