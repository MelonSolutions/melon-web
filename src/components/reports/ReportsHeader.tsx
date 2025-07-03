'use client';

import { FileText, Activity, Users, Calendar } from 'lucide-react';

interface DashboardStats {
  totalReports: number;
  activeReports: number;
  totalResponses: number;
  avgResponseRate: string;
}

interface ReportsHeaderProps {
  stats: DashboardStats;
}

export function ReportsHeader({ stats }: ReportsHeaderProps) {
  const statCards = [
    {
      title: 'Total Reports',
      value: stats.totalReports,
      change: '+2 from last month',
      icon: FileText,
    },
    {
      title: 'Active Reports',
      value: stats.activeReports,
      change: 'Currently collecting data',
      icon: Activity,
    },
    {
      title: 'Total Responses',
      value: stats.totalResponses,
      change: '+89 this week',
      icon: Users,
    },
    {
      title: 'Avg Response Rate',
      value: stats.avgResponseRate,
      change: '+5% from last month',
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.change}</p>
                </div>
                <div className="ml-4">
                  <IconComponent className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}