'use client';

import { PortfolioStats } from '@/types/portfolio';

interface PortfolioHeaderProps {
  stats: PortfolioStats;
}

export function PortfolioHeader({ stats }: PortfolioHeaderProps) {
  const statItems = [
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      subtext: 'All projects',
    },
    {
      label: 'Active Projects',
      value: stats.activeProjects,
      subtext: 'Currently running',
    },
    {
      label: 'Total Reach',
      value: stats.totalReach,
      subtext: 'Individuals reached',
    },
    {
      label: 'Coverage Area',
      value: stats.coverageArea,
      subtext: 'km² covered',
    },
    {
      label: 'Avg Impact Score',
      value: stats.avgImpactScore,
      subtext: 'Portfolio average',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {statItems.map((item) => {
        
        return (
          <div key={item.label} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">{item.label}</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              <p className="text-sm text-gray-500 mt-1">{item.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}