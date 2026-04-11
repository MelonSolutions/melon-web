'use client';

import { Search, Grid3X3, List } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface PortfolioFiltersProps {
  filters: {
    search: string;
    status: string;
    sector: string;
    region: string;
  };
  onFilterChange: (filters: {
    search: string;
    status: string;
    sector: string;
    region: string;
  }) => void;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

const statusOptions: { value: string; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const sectorOptions: { value: string; label: string }[] = [
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

const regionOptions: { value: string; label: string }[] = [
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

  const hasActiveFilters = filters.search || filters.status || filters.sector || filters.region;

  return (
    <div className="space-y-4">
      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium"
          />
        </div>

        {/* View Toggle */}
        <div className="flex border border-border rounded-lg overflow-hidden bg-surface shadow-sm">
          <button
            onClick={() => onViewChange('grid')}
            className={`px-3.5 py-2 transition-all duration-200 ${
              view === 'grid'
                ? 'bg-primary text-white font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:bg-surface-secondary'
            }`}
            title="Grid view"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <div className="w-px bg-border"></div>
          <button
            onClick={() => onViewChange('list')}
            className={`px-3.5 py-2 transition-all duration-200 ${
              view === 'list'
                ? 'bg-primary text-white font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:bg-surface-secondary'
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        <CustomSelect
          value={filters.status}
          onChange={handleStatusChange}
          options={statusOptions}
          className="min-w-[140px]"
        />

        <CustomSelect
          value={filters.sector}
          onChange={handleSectorChange}
          options={sectorOptions}
          className="min-w-[140px]"
        />

        <CustomSelect
          value={filters.region}
          onChange={handleRegionChange}
          options={regionOptions}
          className="min-w-[140px]"
        />

        {hasActiveFilters && (
          <button
            onClick={() => onFilterChange({ search: '', status: '', sector: '', region: '' })}
            className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary uppercase tracking-widest transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
