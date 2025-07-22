'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PortfolioHeader } from '@/components/portfolio/PortfolioHeader';
import { PortfolioFilters } from '@/components/portfolio/PortfolioFilters';
import { ProjectsList } from '@/components/portfolio/ProjectsList';
import { PortfolioEmpty } from '@/components/portfolio/PortfolioEmpty';
import { usePortfolio } from '@/hooks/usePortfolio';
import { Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

function PortfolioContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    sector: searchParams.get('sector') || '',
    region: searchParams.get('region') || '',
  });
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const { 
    projects, 
    portfolioStats, 
    loading, 
    error,
    refetch 
  } = usePortfolio(filters);

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
          <p className="text-red-600 mb-4">Error loading projects</p>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-gray-600 mt-1 text-base">
            Manage and monitor all projects across regions and sectors
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
          <Link
            href="/portfolio/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Link>
        </div>
      </div>

      <PortfolioHeader stats={portfolioStats} />

      {projects.length === 0 && !filters.search && !filters.status && !filters.sector && !filters.region ? (
        <PortfolioEmpty />
      ) : (
        <>
          <PortfolioFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            view={view}
            onViewChange={setView}
          />
          
          <ProjectsList 
            projects={projects} 
            view={view} 
            onRefetch={refetch}
          />

          {projects.length === 0 && (filters.search || filters.status || filters.sector || filters.region) && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No projects found matching your criteria</p>
              <button
                onClick={() => setFilters({ search: '', status: '', sector: '', region: '' })}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
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
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="ml-4">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
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

export default function PortfolioPage() {
  return (
    <Suspense fallback={<PortfolioLoading />}>
      <PortfolioContent />
    </Suspense>
  );
}