/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Search, Grid, List } from 'lucide-react';

interface MetricsFiltersProps {
  filters: {
    search: string;
    status: string;
    sector: string;
    timeframe: string;
  };
  onFilterChange: (filters: any) => void;
  view?: 'grid' | 'list';
  onViewChange?: (view: 'grid' | 'list') => void;
}

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'achieved', label: 'Achieved' },
  { value: 'on-track', label: 'On Track' },
  { value: 'failed', label: 'Failed' },
];

const sectorOptions = [
  { value: '', label: 'All Sectors' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'energy', label: 'Energy' },
  { value: 'finance', label: 'Finance' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'environment', label: 'Environment' },
];

const timeframeOptions = [
  { value: '', label: 'All Time' },
  { value: 'current', label: 'Current' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'last-quarter', label: 'Last Quarter' },
  { value: 'last-year', label: 'Last Year' },
];

export function MetricsFilters({ filters, onFilterChange, view, onViewChange }: MetricsFiltersProps) {
  const handleFilterUpdate = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search metrics..."
            value={filters.search}
            onChange={(e) => handleFilterUpdate('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-transparent cursor-text"
          />
        </div>
        
        <select
          value={filters.status}
          onChange={(e) => handleFilterUpdate('status', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-transparent cursor-pointer"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.sector}
          onChange={(e) => handleFilterUpdate('sector', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-transparent cursor-pointer"
        >
          {sectorOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.timeframe}
          onChange={(e) => handleFilterUpdate('timeframe', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-transparent cursor-pointer"
        >
          {timeframeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {view && onViewChange && (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewChange('grid')}
            className={`p-2 rounded-lg cursor-pointer transition-colors ${
              view === 'grid' ? 'bg-blue-100 text-[#5B94E5]' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`p-2 rounded-lg cursor-pointer transition-colors ${
              view === 'list' ? 'bg-blue-100 text-[#5B94E5]' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}