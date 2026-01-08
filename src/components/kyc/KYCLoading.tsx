export default function KYCLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border-l-4 p-6">
            <div className="space-y-2">
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div className="h-10 w-80 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Table Header Skeleton */}
        <div className="border-b border-gray-200 pb-4 mb-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="col-span-1 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="col-span-1 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 items-center py-3">
              <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="col-span-2 h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="col-span-2 h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="col-span-1 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="col-span-1 flex gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
