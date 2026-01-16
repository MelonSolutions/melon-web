'use client';

import { useState, Suspense, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { PortfolioHeader } from '@/components/portfolio/PortfolioHeader';
import { PortfolioFilters } from '@/components/portfolio/PortfolioFilters';
import { ProjectsList } from '@/components/portfolio/ProjectsList';
import { PortfolioEmpty } from '@/components/portfolio/PortfolioEmpty';
import { usePortfolio } from '@/hooks/usePortfolio';
import { Plus, Loader2, Download } from 'lucide-react';
import Link from 'next/link';

function PortfolioContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    sector: searchParams.get('sector') || '',
    region: searchParams.get('region') || '',
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Debounce search filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [filters]);

  const { 
    projects, 
    portfolioStats, 
    loading, 
    error,
    refetch 
  } = usePortfolio(debouncedFilters);

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  if (loading && !projects.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5B94E5]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <p className="text-base font-medium text-gray-900 mb-2">Failed to load portfolio</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hasFilters = filters.search || filters.status || filters.sector || filters.region;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Portfolio</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage and analyze your project portfolio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <Link
            href="/portfolio/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>
      </div>

      {/* Stats */}
      <PortfolioHeader stats={portfolioStats} />

      {/* Main Content */}
      {projects.length === 0 && !hasFilters ? (
        <PortfolioEmpty />
      ) : (
        <>
          <PortfolioFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            view={view}
            onViewChange={setView}
          />
          
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <Loader2 className="h-6 w-6 animate-spin text-[#5B94E5]" />
            </div>
          ) : projects.length > 0 ? (
            <ProjectsList 
              projects={projects} 
              view={view} 
              onRefetch={refetch}
            />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <h3 className="text-base font-medium text-gray-900 mb-2">
                  No projects found
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  No projects match your current filters
                </p>
                <button
                  onClick={() => setFilters({ search: '', status: '', sector: '', region: '' })}
                  className="text-sm font-medium text-[#5B94E5] hover:text-[#4A7BC8] transition-colors"
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PortfolioLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-72 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5B94E5]" />
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={<PortfolioLoading />}>
      <PortfolioContent />
    </Suspense>
  );
}
