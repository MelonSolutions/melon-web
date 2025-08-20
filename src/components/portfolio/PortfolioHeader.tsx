'use client';

import { PortfolioStats } from '@/types/portfolio';
import { Layers, Activity, Users, MapPin, TrendingUp } from 'lucide-react';

interface PortfolioHeaderProps {
  stats: PortfolioStats;
}

export function PortfolioHeader({ stats }: PortfolioHeaderProps) {
  const statItems = [
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      subtext: 'All projects',
      icon: Layers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Active Projects',
      value: stats.activeProjects,
      subtext: 'Currently running',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Total Reach',
      value: stats.totalReach,
      subtext: 'Individuals reached',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Coverage Area',
      value: stats.coverageArea,
      subtext: 'km² covered',
      icon: MapPin,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Avg Impact Score',
      value: stats.avgImpactScore,
      subtext: 'Portfolio average',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {statItems.map((item) => {
        const IconComponent = item.icon;
        
        return (
          <div key={item.label} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{item.value}</p>
                <p className="text-sm text-gray-500 mt-1">{item.subtext}</p>
              </div>
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <IconComponent className={`w-5 h-5 ${item.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}