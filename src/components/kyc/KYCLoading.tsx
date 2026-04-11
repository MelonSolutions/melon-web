export default function KYCLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="h-10 flex-1 max-w-md bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
