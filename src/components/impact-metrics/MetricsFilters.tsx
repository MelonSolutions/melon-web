/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Search } from 'lucide-react';
import { 
  TrackingStatus, 
  MetricType,
  getTrackingStatusDisplayName,
  getMetricTypeDisplayName
} from '@/types/impact-metrics';

interface MetricsFiltersProps {
  filters: {
    search: string;
    status: string;
    metricType: string;
    timeframe: string;
  };
  onFilterChange: (filters: any) => void;
}

const statusOptions: { value: TrackingStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'ON_TRACK', label: 'On Track' },
  { value: 'ACHIEVED', label: 'Achieved' },
  { value: 'FAIL', label: 'Failed' },
  { value: 'PAUSED', label: 'Paused' },
];

const metricTypeOptions: { value: MetricType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'PERCENTAGE', label: 'Percentage' },
  { value: 'CURRENCY', label: 'Currency' },
  { value: 'BOOLEAN', label: 'Yes/No' },
];

const timeframeOptions = [
  { value: '', label: 'All Time' },
  { value: 'current', label: 'Current Period' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'last-quarter', label: 'Last Quarter' },
  { value: 'last-year', label: 'Last Year' },
];

export function MetricsFilters({ 
  filters, 
  onFilterChange
}: MetricsFiltersProps) {
  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filters, search });
  };

  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filters, status });
  };

  const handleMetricTypeChange = (metricType: string) => {
    onFilterChange({ ...filters, metricType });
  };

  const handleTimeframeChange = (timeframe: string) => {
    onFilterChange({ ...filters, timeframe });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search metrics..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors bg-white"
        />
      </div>

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
          value={filters.metricType}
          onChange={(e) => handleMetricTypeChange(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] bg-white transition-colors min-w-[120px]"
        >
          {metricTypeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.timeframe}
          onChange={(e) => handleTimeframeChange(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] bg-white transition-colors min-w-[120px]"
        >
          {timeframeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active Filters Summary */}
      {(filters.search || filters.status || filters.metricType || filters.timeframe) && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Filters:</span>
          {filters.search && (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
              Search: &rdquo;{filters.search}&rdquo;
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
              {getTrackingStatusDisplayName(filters.status as TrackingStatus)}
            </span>
          )}
          {filters.metricType && (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs">
              {getMetricTypeDisplayName(filters.metricType as MetricType)}
            </span>
          )}
          {filters.timeframe && (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs">
              {timeframeOptions.find(opt => opt.value === filters.timeframe)?.label}
            </span>
          )}
          <button
            onClick={() => onFilterChange({ search: '', status: '', metricType: '', timeframe: '' })}
            className="text-[#5B94E5] hover:text-[#4A7BC8] text-xs font-medium"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}