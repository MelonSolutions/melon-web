/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, Suspense } from 'react';
import { Plus, Filter, Download } from 'lucide-react';
import Link from 'next/link';
import { MetricsHeader } from '@/components/impact-metrics/MetricsHeader';
import { MetricsFilters } from '@/components/impact-metrics/MetricsFilters';
import { MetricsList } from '@/components/impact-metrics/MetricsList';
import { AutoScoringLogic } from '@/components/impact-metrics/AutoScoringLogic';
import { MetricsEmpty } from '@/components/impact-metrics/MetricsEmpty';
import { MetricsLoading } from '@/components/impact-metrics/MetricsLoading';
import { useImpactMetrics } from '@/hooks/useImpactMetrics';

function ImpactMetricsContent() {
  const [activeTab, setActiveTab] = useState<'overview' | 'all-metrics' | 'report-links' | 'time-series'>('overview');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sector: '',
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
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="text-gray-400 text-sm mb-2">Something went wrong</div>
          <button 
            onClick={refetch}
            className="text-sm text-[#5B94E5] hover:text-blue-700 font-medium cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const hasMetrics = metrics.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Impact Metrics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and monitor key performance indicators with auto-scoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Download className="w-4 h-4" />
            Export
          </button>
          <Link
            href="/impact-metrics/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Metric
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      {hasMetrics && <MetricsHeader stats={metricsStats} />}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'all-metrics', label: 'All Metrics' },
            { id: 'report-links', label: 'Report Links' },
            { id: 'time-series', label: 'Time Series' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#5B94E5] text-[#5B94E5]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {!hasMetrics ? (
            <MetricsEmpty />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Key Impact Metrics */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Key Impact Metrics</h3>
                  <p className="text-sm text-gray-500 mb-6">Auto-scored performance indicators</p>
                  <MetricsList metrics={metrics.slice(0, 3)} onRefetch={refetch} />
                </div>
              </div>

              {/* Auto-Scoring Logic */}
              <div>
                <AutoScoringLogic />
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'all-metrics' && (
        <div>
          <MetricsFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          {hasMetrics ? (
            <div className="mt-6">
              <MetricsList metrics={metrics} onRefetch={refetch} />
            </div>
          ) : (
            <MetricsEmpty />
          )}
        </div>
      )}

      {activeTab === 'report-links' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Report Links</h3>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Report linking functionality coming soon</p>
            <Link
              href="/impact-metrics/create"
              className="text-[#5B94E5] hover:text-blue-600 font-medium text-sm cursor-pointer"
            >
              Create a metric with report linking
            </Link>
          </div>
        </div>
      )}

      {activeTab === 'time-series' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Time Series</h3>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Time series analytics coming soon</p>
            <Link
              href="/impact-metrics/create"
              className="text-[#5B94E5] hover:text-blue-600 font-medium text-sm cursor-pointer"
            >
              Create a metric to track over time
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ImpactMetricsPage() {
  return (
    <Suspense fallback={<MetricsLoading />}>
      <ImpactMetricsContent />
    </Suspense>
  );
}