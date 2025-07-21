'use client';

import { PortfolioStats } from '@/types/portfolio';
import { FileText, CheckCircle, Users, MapPin, TrendingUp } from 'lucide-react';

interface PortfolioHeaderProps {
  stats: PortfolioStats;
}

export function PortfolioHeader({ stats }: PortfolioHeaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {/* Total Projects */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Projects</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalProjects}</p>
            <p className="text-sm text-gray-500">Across 12 regions</p>
          </div>
          <div className="ml-4">
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Active Projects */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">Active Projects</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.activeProjects}</p>
            <p className="text-sm text-gray-500">Currently running</p>
          </div>
          <div className="ml-4">
            <CheckCircle className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Total Reach */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Reach</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalReach}K</p>
            <p className="text-sm text-gray-500">Individuals reached</p>
          </div>
          <div className="ml-4">
            <Users className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Coverage Area */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">Coverage Area</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.coverageArea}K</p>
            <p className="text-sm text-gray-500">km² covered</p>
          </div>
          <div className="ml-4">
            <MapPin className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Avg Impact Score */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">Avg Impact Score</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.avgImpactScore}%</p>
            <p className="text-sm text-gray-500">Portfolio average</p>
          </div>
          <div className="ml-4">
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}