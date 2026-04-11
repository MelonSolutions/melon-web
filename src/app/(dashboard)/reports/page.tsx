/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useReports } from '@/hooks/useReports';
import { Plus, Search, Filter, MoreHorizontal, Grid3X3, List, FileText, Activity, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { ReportsEmpty } from '@/components/reports/ReportsEmpty';
import { ReportsLoading } from '@/components/reports/ReportsLoading';
import { ReportCard } from '@/components/reports/ReportCard';
import { Button } from '@/components/ui/Button';

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
      <div className="flex flex-col items-center justify-center py-32 font-sans">
        <div className="w-20 h-20 bg-error/10 rounded-3xl flex items-center justify-center mb-6 border border-error/20">
            <Activity className="w-10 h-10 text-error" />
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-2">Sync Interrupted</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium text-center max-w-md">{error}</p>
        <Button 
          variant="primary"
          onClick={refetch}
          className="px-10 py-4 rounded-xl shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-xs"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const hasReports = reports && reports.length > 0;
  const hasFilters = filters.search || filters.status || filters.category;

  const statItems = [
    { label: 'Total Reports', value: dashboardStats.totalReports, subtext: 'Total Records', icon: <FileText className="w-5 h-5" />, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Active Reports', value: dashboardStats.activeReports, subtext: 'Live Collections', icon: <Activity className="w-5 h-5" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Total Responses', value: dashboardStats.totalResponses, subtext: 'Total Submissions', icon: <Users className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Avg. Response Rate', value: dashboardStats.avgResponseRate, subtext: 'Engagement Index', icon: <TrendingUp className="w-5 h-5" />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-10 font-sans pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-primary rounded-full"></div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Reports</h1>
          </div>
          <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest opacity-70">
            Manage and view your data collection reports
          </p>
        </div>
        <Link href="/reports/create">
          <Button
            variant="primary"
            className="rounded-xl font-black uppercase tracking-widest text-[10px] py-3.5 shadow-xl shadow-primary/20"
            icon={<Plus className="w-4 h-4" />}
          >
            New Report
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      {hasReports && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statItems.map((item) => (
            <div key={item.label} className="bg-surface rounded-3xl border border-border p-6 shadow-sm group hover:border-primary/20 transition-all duration-500">
               <div className="flex items-center justify-between mb-4">
                 <div className={`p-3 rounded-2xl ${item.bg} group-hover:scale-110 transition-transform duration-500`}>
                   <div className={item.color}>{item.icon}</div>
                 </div>
               </div>
               <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1">{item.label}</p>
               <div className="flex items-baseline gap-2">
                 <p className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{item.value}</p>
                 <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{item.subtext}</p>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters and Controls */}
      {hasReports && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-surface rounded-[2.5rem] border border-border p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
            <div className="relative flex-1 w-full max-w-md group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-4 h-4" />
              <input
                type="text"
                placeholder="Search reports..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 text-sm font-bold border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-surface dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none"
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full md:w-auto px-4 py-3.5 text-[10px] font-black uppercase tracking-widest border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary bg-surface dark:text-gray-100 transition-all outline-none cursor-pointer min-w-[160px]"
            >
              <option value="">Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CLOSED">Closed</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full md:w-auto px-4 py-3.5 text-[10px] font-black uppercase tracking-widest border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary bg-surface dark:text-gray-100 transition-all outline-none cursor-pointer min-w-[160px]"
            >
              <option value="">Category</option>
              <option value="Impact Assessment">Impact Assessment</option>
              <option value="Feedback">Feedback</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Community">Community</option>
            </select>
          </div>

          <div className="flex items-center gap-2 border border-border rounded-2xl bg-surface-secondary/30 p-1.5 self-end lg:self-center">
            <button
              onClick={() => setView('grid')}
              className={`p-2.5 rounded-xl transition-all duration-300 ${view === 'grid' ? 'bg-surface text-primary shadow-sm border border-border' : 'text-gray-400 hover:text-gray-600'}`}
              title="Grid Matrix"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2.5 rounded-xl transition-all duration-300 ${view === 'list' ? 'bg-surface text-primary shadow-sm border border-border' : 'text-gray-400 hover:text-gray-600'}`}
              title="Audit List"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="animate-in fade-in duration-700">
        {!hasReports && !hasFilters ? (
          <ReportsEmpty />
        ) : hasReports ? (
          view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reports.map((report) => {
                const reportId = report.id || report._id;
                return reportId ? (
                  <ReportCard key={reportId} report={report} view="grid" onRefetch={refetch} />
                ) : null;
              }).filter(Boolean)}
            </div>
          ) : (
            <div className="bg-surface rounded-[2.5rem] border border-border overflow-hidden shadow-sm">
              <div className="px-8 py-5 bg-surface-secondary/30 border-b border-border">
                <div className="grid grid-cols-12 gap-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                  <div className="col-span-4">Title</div>
                  <div className="col-span-2 text-center">Status</div>
                  <div className="col-span-2 text-center">Category</div>
                  <div className="col-span-2 text-center">Responses</div>
                  <div className="col-span-1 text-right">Created</div>
                  <div className="col-span-1"></div>
                </div>
              </div>
              <div className="divide-y divide-border/60">
                {reports.map((report) => {
                  const reportId = report.id || report._id;
                  return reportId ? (
                    <ReportCard key={reportId} report={report} view="list" onRefetch={refetch} />
                  ) : null;
                }).filter(Boolean)}
              </div>
            </div>
          )
        ) : (
          <div className="bg-surface rounded-[3rem] border border-border p-24 shadow-sm text-center relative overflow-hidden group font-sans">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50"></div>
             <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-surface-secondary mb-8 border border-border group-hover:scale-110 transition-transform duration-700">
                  <Search className="w-10 h-10 text-gray-300 dark:text-gray-700" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-4">No reports found</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-10">
                  We couldn't find any reports with your current filters. Adjust your search or clear filters.
                </p>
                <button
                  onClick={() => setFilters({ search: '', status: '', category: '' })}
                  className="text-xs font-black text-primary hover:text-primary-hover uppercase tracking-[0.2em] underline underline-offset-8 decoration-2"
                >
                  Clear filters
                </button>
             </div>
          </div>
        )}
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
