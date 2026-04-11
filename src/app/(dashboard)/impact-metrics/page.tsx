/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, Suspense } from 'react';
import { Plus, Filter, Download } from 'lucide-react';
import Link from 'next/link';
import { MetricsHeader } from '@/components/impact-metrics/MetricsHeader';
import { MetricsFilters } from '@/components/impact-metrics/MetricsFilters';
import { MetricsList } from '@/components/impact-metrics/MetricsList';
import { MetricsEmpty } from '@/components/impact-metrics/MetricsEmpty';
import { MetricsLoading } from '@/components/impact-metrics/MetricsLoading';
import { useImpactMetrics } from '@/hooks/useImpactMetrics';

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
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="text-gray-400 text-sm mb-2">Something went wrong</div>
          <p className="text-red-600 text-sm mb-4">{error}</p>
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
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
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
            { id: 'analytics', label: 'Analytics' },
            { id: 'reports', label: 'Report Links' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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
            <div className="space-y-6">
              {/* Key Impact Metrics */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Key Impact Metrics</h3>
                    <p className="text-sm text-gray-500">Top performing metrics with auto-scoring</p>
                  </div>
                  <Link
                    href="/impact-metrics?tab=all-metrics"
                    className="text-sm text-[#5B94E5] hover:text-[#4A7BC8] font-medium"
                  >
                    View all →
                  </Link>
                </div>
                <MetricsList metrics={metrics.slice(0, 6)} onRefetch={refetch} />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Performance</span>
                      <span className="text-sm font-medium text-gray-900">{metricsStats.avgPerformance}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Metrics Achieved</span>
                      <span className="text-sm font-medium text-green-600">{metricsStats.achieved} / {metricsStats.totalMetrics}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="text-sm font-medium text-gray-900">{metricsStats.achievedPercentage}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {metrics.slice(0, 3).map((metric) => (
                      <div key={metric._id} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#5B94E5] rounded-full mt-2"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{metric.name}</p>
                          <p className="text-xs text-gray-500">Updated {new Date(metric.updatedAt).toLocaleDateString()}</p>
                        </div>
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
        <div className="space-y-6">
          <MetricsFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          {hasMetrics ? (
            <MetricsList metrics={metrics} onRefetch={refetch} />
          ) : (
            <MetricsEmpty />
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics & Insights</h3>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Advanced analytics and insights coming soon</p>
            <p className="text-sm text-gray-400">Get deeper insights into your metrics performance, trends, and correlations</p>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Report Integration</h3>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Report linking functionality coming soon</p>
            <p className="text-sm text-gray-400 mb-4">
              Connect your metrics to report questions for automatic data updates
            </p>
            <Link
              href="/impact-metrics/create"
              className="text-[#5B94E5] hover:text-[#4A7BC8] font-medium text-sm"
            >
              Create a metric with report linking →
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