/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Search, Grid3X3, List } from 'lucide-react';
import { ProjectStatus, ProjectSector, ProjectRegion } from '@/types/portfolio';

interface PortfolioFiltersProps {
  filters: {
    search: string;
    status: string;
    sector: string;
    region: string;
  };
  onFilterChange: (filters: any) => void;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

const statusOptions: { value: ProjectStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'draft', label: 'Draft' },
  { value: 'paused', label: 'Paused' },
];

const sectorOptions: { value: ProjectSector | ''; label: string }[] = [
  { value: '', label: 'All Sectors' },
  { value: 'Health', label: 'Health' },
  { value: 'Education', label: 'Education' },
  { value: 'Agriculture', label: 'Agriculture' },
  { value: 'Energy', label: 'Energy' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Infrastructure', label: 'Infrastructure' },
  { value: 'Environment', label: 'Environment' },
];

const regionOptions: { value: ProjectRegion | ''; label: string }[] = [
  { value: '', label: 'All Regions' },
  { value: 'Northern Region', label: 'Northern Region' },
  { value: 'Eastern Region', label: 'Eastern Region' },
  { value: 'Central Region', label: 'Central Region' },
  { value: 'Western Region', label: 'Western Region' },
  { value: 'Southern Region', label: 'Southern Region' },
  { value: 'Urban Areas', label: 'Urban Areas' },
];

export function PortfolioFilters({ 
  filters, 
  onFilterChange, 
  view, 
  onViewChange 
}: PortfolioFiltersProps) {
  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filters, search });
  };

  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filters, status });
  };

  const handleSectorChange = (sector: string) => {
    onFilterChange({ ...filters, sector });
  };

  const handleRegionChange = (region: string) => {
    onFilterChange({ ...filters, region });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search projects..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
        />
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] bg-white transition-colors"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filters.sector}
            onChange={(e) => handleSectorChange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] bg-white transition-colors"
          >
            {sectorOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filters.region}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] bg-white transition-colors"
          >
            {regionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex border border-gray-300 rounded-lg">
          <button
            onClick={() => onViewChange('grid')}
            className={`p-2 ${
              view === 'grid'
                ? 'bg-[#5B94E5] text-white'
                : 'text-gray-600 hover:text-gray-800'
            } transition-colors`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`p-2 ${
              view === 'list'
                ? 'bg-[#5B94E5] text-white'
                : 'text-gray-600 hover:text-gray-800'
            } transition-colors`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}