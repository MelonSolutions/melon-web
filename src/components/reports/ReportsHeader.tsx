/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { FileText, Users, TrendingUp, Clock } from 'lucide-react';

interface StatsCardProps {
  icon: React.ComponentType<any>;
  title: string;
  value: string | number;
  change?: string;
  color: string;
}

function StatsCard({ icon: Icon, title, value, change, color }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-green-600">{change}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface ReportsHeaderProps {
  stats: {
    totalReports: number;
    activeReports: number;
    totalResponses: number;
    avgResponseRate: string;
  };
}

export function ReportsHeader({ stats }: ReportsHeaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        icon={FileText}
        title="Total Reports"
        value={stats.totalReports}
        color="bg-blue-500"
      />
      <StatsCard
        icon={TrendingUp}
        title="Active Reports"
        value={stats.activeReports}
        color="bg-green-500"
      />
      <StatsCard
        icon={Users}
        title="Total Responses"
        value={stats.totalResponses}
        color="bg-purple-500"
      />
      <StatsCard
        icon={Clock}
        title="Response Rate"
        value={stats.avgResponseRate}
        color="bg-orange-500"
      />
    </div>
  );
}
