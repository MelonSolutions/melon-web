/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Search, Grid3x3, List, Filter } from 'lucide-react';
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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search projects..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-3">
          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Sector Filter */}
          <select
            value={filters.sector}
            onChange={(e) => handleSectorChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {sectorOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Region Filter */}
          <select
            value={filters.region}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {regionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle and Filter Button */}
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => onViewChange('grid')}
              className={`p-2 ${
                view === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewChange('list')}
              className={`p-2 ${
                view === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Button */}
          <button className="flex items-center px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}