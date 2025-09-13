'use client';

import { ImpactMetricsStats } from '@/types/impact-metrics';

interface MetricsHeaderProps {
  stats: ImpactMetricsStats;
}

export function MetricsHeader({ stats }: MetricsHeaderProps) {
  const statItems = [
    {
      label: 'Total Metrics',
      value: stats.totalMetrics,
      subtext: 'All metrics',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Active Metrics',
      value: stats.activeMetrics,
      subtext: 'Currently tracking',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Achieved',
      value: stats.achieved,
      subtext: stats.achievedPercentage,
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Failed',
      value: stats.failed,
      subtext: stats.failedPercentage,
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {statItems.map((item) => {
        
        return (
          <div key={item.label} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{item.value}</p>
                <p className="text-sm text-gray-500 mt-1">{item.subtext}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}