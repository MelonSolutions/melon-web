'use client';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
}

function StatsCard({ title, value, change }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className="text-sm text-gray-500">{change}</p>
        )}
      </div>
    </div>
  );
}

interface MetricsStats {
  totalMetrics: number;
  achieved: number;
  failed: number;
  avgPerformance: number;
  achievedPercentage: number;
  failedPercentage: number;
}

interface MetricsHeaderProps {
  stats: MetricsStats;
}

export function MetricsHeader({ stats }: MetricsHeaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Metrics"
        value={stats.totalMetrics}
      />
      <StatsCard
        title="Achieved"
        value={stats.achieved}
        change={`${stats.achievedPercentage}% of total`}
      />
      <StatsCard
        title="Failed"
        value={stats.failed}
        change={`${stats.failedPercentage}% of total`}
      />
      <StatsCard
        title="Avg Performance"
        value={`${stats.avgPerformance}%`}
        change="Auto-calculated"
      />
    </div>
  );
}