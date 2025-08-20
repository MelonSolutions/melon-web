/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Search, Grid3X3, List } from 'lucide-react';
import { 
  ProjectStatus, 
  ProjectSector, 
  ProjectRegion,
  getStatusDisplayName,
  getSectorDisplayName,
  getRegionDisplayName
} from '@/types/portfolio';

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
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const sectorOptions: { value: ProjectSector | ''; label: string }[] = [
  { value: '', label: 'All Sectors' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'ENERGY', label: 'Energy' },
  { value: 'AGRICULTURE', label: 'Agriculture' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'ENVIRONMENT', label: 'Environment' },
  { value: 'TECHNOLOGY', label: 'Technology' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'SOCIAL_SERVICES', label: 'Social Services' },
  { value: 'ECONOMIC_DEVELOPMENT', label: 'Economic Development' },
];

const regionOptions: { value: ProjectRegion | ''; label: string }[] = [
  { value: '', label: 'All Regions' },
  { value: 'NORTHERN_REGION', label: 'Northern Region' },
  { value: 'SOUTHERN_REGION', label: 'Southern Region' },
  { value: 'EASTERN_REGION', label: 'Eastern Region' },
  { value: 'WESTERN_REGION', label: 'Western Region' },
  { value: 'CENTRAL_REGION', label: 'Central Region' },
  { value: 'NORTH_EAST', label: 'North East' },
  { value: 'NORTH_WEST', label: 'North West' },
  { value: 'SOUTH_EAST', label: 'South East' },
  { value: 'SOUTH_WEST', label: 'South West' },
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
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors bg-white"
        />
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] bg-white transition-colors min-w-[120px]"
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
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] bg-white transition-colors min-w-[120px]"
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
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] bg-white transition-colors min-w-[120px]"
          >
            {regionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => onViewChange('grid')}
            className={`p-2.5 transition-colors ${
              view === 'grid'
                ? 'bg-[#5B94E5] text-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
            title="Grid view"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`p-2.5 transition-colors ${
              view === 'list'
                ? 'bg-[#5B94E5] text-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.search || filters.status || filters.sector || filters.region) && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Filters:</span>
          {filters.search && (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
              Search: &rdquo;{filters.search}&rdquo;
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
              {getStatusDisplayName(filters.status as ProjectStatus)}
            </span>
          )}
          {filters.sector && (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs">
              {getSectorDisplayName(filters.sector as ProjectSector)}
            </span>
          )}
          {filters.region && (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs">
              {getRegionDisplayName(filters.region as ProjectRegion)}
            </span>
          )}
          <button
            onClick={() => onFilterChange({ search: '', status: '', sector: '', region: '' })}
            className="text-[#5B94E5] hover:text-[#4A7BC8] text-xs font-medium"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}