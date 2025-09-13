'use client';

import { ImpactMetric } from '@/types/impact-metrics';
import { MetricCard } from './MetricsCard';

interface MetricsListProps {
  metrics: ImpactMetric[];
  onRefetch: () => void;
}

export function MetricsList({ metrics, onRefetch }: MetricsListProps) {
  if (metrics.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No metrics found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric) => (
        <MetricCard
          key={metric._id}
          metric={metric}
          onRefetch={onRefetch}
        />
      ))}
    </div>
  );
}