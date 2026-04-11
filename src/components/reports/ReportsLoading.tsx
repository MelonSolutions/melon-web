export function ReportsLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-9 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-9 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse ml-4"></div>
              </div>
              
              <div className="flex gap-2 mb-4">
                <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-6 py-3">
              <div className="flex gap-2">
                <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}