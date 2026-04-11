export function VisualizationLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-80 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="flex space-x-8 border-b border-gray-200">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Preview Skeleton */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-96 bg-gray-50 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}