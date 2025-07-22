'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReportsHeader } from '@/components/reports/ReportsHeader';
import { ReportsFilters } from '@/components/reports/ReportsFilter';
import { ReportsList } from '@/components/reports/ReportsList';
import { ReportsEmpty } from '@/components/reports/ReportsEmpty';
import { useReports } from '@/hooks/useReports';
import { Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

function ReportsContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    category: searchParams.get('category') || '',
  });
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const { 
    reports, 
    dashboardStats, 
    loading, 
    error,
    refetch 
  } = useReports(filters);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading reports</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {reports.length === 0 && !filters.search && !filters.status && !filters.category ? (
        <ReportsEmpty />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
              <p className="text-gray-600 mt-1 text-base">
                Create, manage, and analyze your data collection forms
              </p>
            </div>
            <Link
              href="/reports/create"
              className="inline-flex items-center px-4 py-2 bg-[#5B94E5] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Report
            </Link>
          </div>

          <ReportsHeader stats={dashboardStats} />

          <ReportsFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            view={view}
            onViewChange={setView}
          />
          
          <ReportsList 
            reports={reports} 
            view={view} 
            onRefetch={refetch}
          />

          {reports.length === 0 && (filters.search || filters.status || filters.category) && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No reports found matching your criteria</p>
              <button
                onClick={() => setFilters({ search: '', status: '', category: '' })}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function ReportsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading content */}
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<ReportsLoading />}>
      <ReportsContent />
    </Suspense>
  );
}