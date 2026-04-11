'use client';

import { Loader2 } from 'lucide-react';

export function MetricsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-9 w-28 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-7 w-12 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading content */}
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5B94E5]" />
      </div>
    </div>
  );
}