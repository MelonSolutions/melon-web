'use client';

import { useState, Suspense, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { PortfolioHeader } from '@/components/portfolio/PortfolioHeader';
import { PortfolioFilters } from '@/components/portfolio/PortfolioFilters';
import { ProjectsList } from '@/components/portfolio/ProjectsList';
import { PortfolioEmpty } from '@/components/portfolio/PortfolioEmpty';
import { usePortfolio } from '@/hooks/usePortfolio';
import { Plus, Loader2, Download, Briefcase, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

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
    return <PortfolioLoading />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 font-sans">
        <div className="w-20 h-20 rounded-3xl bg-error/10 border border-error/20 flex items-center justify-center mb-6">
           <AlertCircle className="w-10 h-10 text-error" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-widest text-gray-900 dark:text-gray-100 mb-2">Failed to load portfolio</h3>
        <p className="text-sm font-medium text-gray-500 mb-10 max-w-sm text-center leading-relaxed">The portfolio retrieval process encountered an error: {error}</p>
        <Button 
          variant="primary" 
          onClick={refetch}
          className="px-12 py-4 rounded-xl font-black uppercase tracking-widest text-[10px]"
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Try Again
        </Button>
      </div>
    );
  }

  const hasFilters = filters.search || filters.status || filters.sector || filters.region;

  return (
    <div className="space-y-10 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-2 h-8 bg-primary rounded-full shadow-lg shadow-primary/20"></div>
             <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Portfolio</h1>
          </div>
          <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-5">
            Manage and analyze your project portfolio
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="secondary" className="px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] border-border/60" icon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          <Link href="/portfolio/create">
            <Button
              variant="primary"
              className="px-8 py-3.5 rounded-xl shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[10px]"
              icon={<Plus className="w-4 h-4" />}
            >
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Dashboard */}
      <PortfolioHeader stats={portfolioStats} />

      {/* Main Content Area */}
      {projects.length === 0 && !hasFilters ? (
        <PortfolioEmpty />
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <PortfolioFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            view={view}
            onViewChange={setView}
          />
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-10">
               {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-surface rounded-3xl border border-border h-[400px] animate-pulse">
                     <div className="p-8 space-y-4">
                        <div className="h-4 w-32 bg-border/20 rounded-full"></div>
                        <div className="h-8 w-64 bg-border/40 rounded-xl"></div>
                        <div className="h-32 w-full bg-border/10 rounded-2xl"></div>
                     </div>
                  </div>
               ))}
            </div>
          ) : projects.length > 0 ? (
            <ProjectsList 
              projects={projects} 
              view={view} 
              onRefetch={refetch}
            />
          ) : (
            <div className="bg-surface rounded-[4rem] border-2 border-dashed border-border p-32 text-center group">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-surface-secondary mb-8 border border-border group-hover:scale-110 transition-transform duration-700">
                <Briefcase className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter mb-4">
                No projects found
              </h3>
              <p className="text-sm font-medium text-gray-500 mb-10 max-w-sm mx-auto leading-relaxed">
                No projects match your current filters. Adjust your search or reset the parameters.
              </p>
              <Button
                variant="secondary"
                onClick={() => setFilters({ search: '', status: '', sector: '', region: '' })}
                className="px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] border-border/60"
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PortfolioLoading() {
  return (
    <div className="space-y-10 font-sans animate-pulse px-2">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-border/40 rounded-full"></div>
            <div className="h-10 w-48 bg-border/40 rounded-xl"></div>
          </div>
          <div className="h-4 w-72 bg-border/20 rounded-lg ml-5"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-12 w-32 bg-border/30 rounded-2xl"></div>
          <div className="h-12 w-40 bg-border/40 rounded-2xl"></div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-surface rounded-3xl border border-border p-6 shadow-sm">
            <div className="w-10 h-10 bg-border/30 rounded-2xl mb-4"></div>
            <div className="h-3 w-28 bg-border/20 rounded-full mb-2"></div>
            <div className="h-8 w-20 bg-border/40 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-10">
         {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface rounded-[2.5rem] border border-border h-[420px] shadow-sm"></div>
         ))}
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
