/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import { BarChart3, Database, TrendingUp, Share2 } from 'lucide-react';
import { VisualizationStats } from '@/types/visualization';

interface StatsCardProps {
  icon: React.ComponentType<any>;
  title: string;
  value: string | number;
}

function StatsCard({ icon: Icon, title, value }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
}

interface VisualizationHeaderProps {
  stats: VisualizationStats;
}

export function VisualizationHeader({ stats }: VisualizationHeaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatsCard
        icon={Database}
        title="Data Sources"
        value={stats.totalDataSources}
      />
      <StatsCard
        icon={Database}
        title="Total Records"
        value={stats.totalRecords.toLocaleString()}
      />
      <StatsCard
        icon={BarChart3}
        title="Active Charts"
        value={stats.activeCharts}
      />
      <StatsCard
        icon={Share2}
        title="Shared"
        value={stats.sharedCharts}
      />
    </div>
  );
}