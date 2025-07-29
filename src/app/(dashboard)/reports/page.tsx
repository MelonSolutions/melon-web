/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useReports } from '@/hooks/useReports';
import { Plus, Search, Filter, MoreHorizontal, Grid3X3, List } from 'lucide-react';
import Link from 'next/link';
import { ReportsEmpty } from '@/components/reports/ReportsEmpty';
import { ReportsLoading } from '@/components/reports/ReportsLoading';
import { ReportCard } from '@/components/reports/ReportCard';

interface Report {
  _id: string;
  title: string;
  description?: string;
  category: string;
  status: 'draft' | 'published' | 'closed';
  responseCount: number;
  createdAt: string;
  updatedAt: string;
}

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

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <ReportsLoading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="text-gray-400 text-sm mb-2">Something went wrong</div>
          <button 
            onClick={refetch}
            className="text-sm text-[#5B94E5] hover:text-blue-700 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const hasReports = reports && reports.length > 0;
  const hasFilters = filters.search || filters.status || filters.category;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and analyze your data collection forms
          </p>
        </div>
        <Link
          href="/reports/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Report
        </Link>
      </div>

      {/* Stats Overview */}
      {hasReports && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-semibold text-gray-900">{dashboardStats.totalReports}</div>
            <div className="text-sm text-gray-500">Total Reports</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-semibold text-gray-900">{dashboardStats.activeReports}</div>
            <div className="text-sm text-gray-500">Active Reports</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-semibold text-gray-900">{dashboardStats.totalResponses}</div>
            <div className="text-sm text-gray-500">Total Responses</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-semibold text-gray-900">{dashboardStats.avgResponseRate}</div>
            <div className="text-sm text-gray-500">Response Rate</div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      {hasReports && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search reports..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors w-64"
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
            >
              <option value="">All Categories</option>
              <option value="Impact Assessment">Impact Assessment</option>
              <option value="Feedback">Feedback</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Community">Community</option>
            </select>
          </div>

          <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded ${view === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded ${view === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {!hasReports && !hasFilters ? (
        <ReportsEmpty />
      ) : hasReports ? (
        view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <ReportCard key={report._id} report={report} view="grid" onRefetch={refetch} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-4">Name</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Responses</div>
                <div className="col-span-1">Updated</div>
                <div className="col-span-1"></div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {reports.map((report) => (
                <ReportCard key={report._id} report={report} view="list" onRefetch={refetch} />
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No reports found matching your criteria</div>
          <button
            onClick={() => setFilters({ search: '', status: '', category: '' })}
            className="text-sm text-[#5B94E5] hover:text-blue-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
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
