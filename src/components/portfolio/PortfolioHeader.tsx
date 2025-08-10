'use client';

import { PortfolioStats } from '@/types/portfolio';

interface PortfolioHeaderProps {
  stats: PortfolioStats;
}

export function PortfolioHeader({ stats }: PortfolioHeaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-600">Total Projects</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.totalProjects}</p>
        <p className="text-sm text-gray-500 mt-1">All projects</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-600">Active Projects</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.activeProjects}</p>
        <p className="text-sm text-gray-500 mt-1">Currently running</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-600">Total Reach</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.totalReach}K</p>
        <p className="text-sm text-gray-500 mt-1">Individuals reached</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-600">Coverage Area</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.coverageArea}K</p>
        <p className="text-sm text-gray-500 mt-1">km² covered</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-600">Avg Impact Score</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.avgImpactScore}%</p>
        <p className="text-sm text-gray-500 mt-1">Portfolio average</p>
      </div>
    </div>
  );
}