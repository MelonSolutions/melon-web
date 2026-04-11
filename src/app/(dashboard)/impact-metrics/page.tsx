/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, Suspense } from 'react';
import { Plus, Filter, Download, Activity, BarChart3, TrendingUp, Info } from 'lucide-react';
import Link from 'next/link';
import { MetricsHeader } from '@/components/impact-metrics/MetricsHeader';
import { MetricsFilters } from '@/components/impact-metrics/MetricsFilters';
import { MetricsList } from '@/components/impact-metrics/MetricsList';
import { MetricsEmpty } from '@/components/impact-metrics/MetricsEmpty';
import { MetricsLoading } from '@/components/impact-metrics/MetricsLoading';
import { useImpactMetrics } from '@/hooks/useImpactMetrics';
import { Button } from '@/components/ui/Button';

function ImpactMetricsContent() {
  const [activeTab, setActiveTab] = useState<'overview' | 'all-metrics' | 'analytics' | 'reports'>('overview');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    metricType: '',
    timeframe: ''
  });

  const {
    metrics,
    metricsStats,
    loading,
    error,
    refetch
  } = useImpactMetrics(filters);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return <MetricsLoading />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 font-sans">
        <div className="w-20 h-20 bg-error/10 rounded-3xl flex items-center justify-center mb-6 border border-error/20">
          <Info className="w-10 h-10 text-error" />
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-2">Sync Error</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium max-w-md text-center">{error}</p>
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

  const hasMetrics = metrics.length > 0;

  return (
    <div className="space-y-10 font-sans pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-primary rounded-full"></div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Impact Metrics</h1>
          </div>
          <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest opacity-70">
            Track and monitor key performance indicators with auto-scoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3.5 border-border/60"
            icon={<Filter className="w-4 h-4" />}
          >
            Filter
          </Button>
          <Button
            variant="secondary"
            className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3.5 border-border/60"
            icon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
          <Link href="/impact-metrics/create">
            <Button
              variant="primary"
              className="rounded-xl font-black uppercase tracking-widest text-[10px] py-3.5 shadow-xl shadow-primary/20"
              icon={<Plus className="w-4 h-4" />}
            >
              New Metric
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      {hasMetrics && <MetricsHeader stats={metricsStats} />}

      {/* Navigation Tabs */}
      <div className="border-b border-border/60">
        <nav className="flex space-x-10">
          {[
            { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
            { id: 'all-metrics', label: 'All Metrics', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'reports', label: 'Report Links', icon: <Info className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`group flex items-center gap-2.5 py-5 px-1 border-b-4 font-black text-[11px] uppercase tracking-[0.15em] transition-all duration-300 outline-none ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-300 hover:border-gray-200 dark:hover:border-gray-800'
                }`}
            >
              <span className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'scale-100 group-hover:scale-110'}`}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-700">
        {activeTab === 'overview' && (
          <>
            {!hasMetrics ? (
              <MetricsEmpty />
            ) : (
              <div className="space-y-10">
                {/* Key Impact Metrics */}
                <div className="bg-surface rounded-[2.5rem] border border-border p-10 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <BarChart3 className="w-64 h-64 text-primary" />
                  </div>
                  <div className="flex items-center justify-between mb-10 relative z-10">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Key Impact Metrics</h3>
                      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1 opacity-70">Top performing metrics with auto-scoring</p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setActiveTab('all-metrics')}
                      className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-6 rounded-xl"
                    >
                      View All →
                    </Button>
                  </div>
                  <MetricsList metrics={metrics.slice(0, 6)} onRefetch={refetch} />
                </div>

                {/* Performance Summary Intel */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="bg-surface rounded-[2.5rem] border border-border p-10 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-8 -bottom-8 opacity-[0.03] pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                      <TrendingUp className="w-48 h-48 text-primary" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight mb-8">Performance Summary</h3>
                    <div className="space-y-6 relative z-10">
                      <div className="flex justify-between items-center p-5 rounded-2xl bg-surface-secondary/30 border border-border/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Average Performance</span>
                        <span className="text-lg font-black text-primary tracking-tighter">{metricsStats.avgPerformance}%</span>
                      </div>
                      <div className="flex justify-between items-center p-5 rounded-2xl bg-surface-secondary/30 border border-border/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Metrics Achieved</span>
                        <span className="text-lg font-black text-emerald-500 tracking-tighter">{metricsStats.achieved} / {metricsStats.totalMetrics}</span>
                      </div>
                      <div className="flex justify-between items-center p-primary/5 border border-primary/10 rounded-2xl">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest px-5 py-5">Success Rate</span>
                        <span className="text-lg font-black text-primary tracking-tighter px-5 py-5">{metricsStats.achievedPercentage}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface rounded-[2.5rem] border border-border p-10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                      <Activity className="w-48 h-48 text-primary" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight mb-8">Recent Activity</h3>
                    <div className="space-y-4 relative z-10">
                      {metrics.slice(0, 4).map((metric) => (
                        <div key={metric._id} className="flex items-center gap-5 p-4 rounded-[1.5rem] bg-surface-secondary/20 border border-border/40 hover:border-primary/20 transition-all group/item">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover/item:scale-110 transition-transform">
                            <Activity className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 dark:text-gray-100 truncate tracking-tight">{metric.name}</p>
                            <p className="text-[9px] uppercase font-bold text-gray-400 dark:text-gray-500 mt-1 tracking-widest">Updated: {new Date(metric.updatedAt).toLocaleDateString()}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'all-metrics' && (
          <div className="space-y-8">
            <div className="bg-surface rounded-[2.5rem] border border-border p-8 shadow-sm">
              <MetricsFilters
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
            {hasMetrics ? (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <MetricsList metrics={metrics} onRefetch={refetch} />
              </div>
            ) : (
              <MetricsEmpty />
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-surface rounded-[3rem] border border-border p-24 shadow-sm text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-surface-secondary mb-8 border border-border group-hover:rotate-12 transition-transform duration-700">
                <Filter className="w-10 h-10 text-gray-300 dark:text-gray-700" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-4">Analytics & Insights</h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-10">
                Advanced analytics and insights coming soon. Get deeper insights into your metrics performance, trends, and correlations.
              </p>
              <div className="flex justify-center gap-4">
                <div className="w-32 h-1 bg-primary/20 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-primary animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-surface rounded-[3rem] border border-border p-24 shadow-sm text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 to-transparent opacity-50"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-surface-secondary mb-8 border border-border group-hover:-rotate-12 transition-transform duration-700">
                <Plus className="w-10 h-10 text-gray-300 dark:text-gray-700" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-4">Report Integration</h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-10">
                Report linking functionality coming soon. Connect your metrics to report questions for automatic data updates.
              </p>
              <Link href="/impact-metrics/create">
                <Button
                  variant="ghost"
                  className="text-[12px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/5 px-10 py-6 rounded-2xl border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all"
                >
                  Create a metric with report linking →
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChevronRight({ className }: { className?: string; }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function ImpactMetricsPage() {
  return (
    <Suspense fallback={<MetricsLoading />}>
      <ImpactMetricsContent />
    </Suspense>
  );
}
