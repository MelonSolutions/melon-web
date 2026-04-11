/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Search, X } from 'lucide-react';
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
  { value: '', label: 'All Statuses' },
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

  const inputClasses = "w-full border border-border dark:border-white/10 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-surface dark:bg-black/20 text-sm font-bold dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none";
  const selectClasses = "px-4 py-3.5 text-[11px] font-black uppercase tracking-widest border border-border dark:border-white/10 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary bg-surface dark:bg-black/20 dark:text-gray-100 transition-all outline-none cursor-pointer min-w-[180px]";

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col lg:flex-row items-center gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search metrics..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={inputClasses + " pl-12 pr-4 py-3.5"}
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={selectClasses}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value} className="dark:bg-gray-900">
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">▼</div>
          </div>

          <div className="relative">
            <select
              value={filters.metricType}
              onChange={(e) => handleMetricTypeChange(e.target.value)}
              className={selectClasses}
            >
              {metricTypeOptions.map(option => (
                <option key={option.value} value={option.value} className="dark:bg-gray-900">
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">▼</div>
          </div>

          <div className="relative">
            <select
              value={filters.timeframe}
              onChange={(e) => handleTimeframeChange(e.target.value)}
              className={selectClasses}
            >
              {timeframeOptions.map(option => (
                <option key={option.value} value={option.value} className="dark:bg-gray-900">
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">▼</div>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.search || filters.status || filters.metricType || filters.timeframe) && (
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Active Filters:</span>
          <div className="flex flex-wrap items-center gap-2">
            {filters.search && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-primary text-[9px] font-black uppercase tracking-widest shadow-sm">
                <span>"{filters.search}"</span>
                <X className="w-3 h-3 cursor-pointer hover:rotate-90 transition-transform" onClick={() => handleSearchChange('')} />
              </div>
            )}
            {filters.status && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest shadow-sm">
                <span>{getTrackingStatusDisplayName(filters.status as TrackingStatus)}</span>
                <X className="w-3 h-3 cursor-pointer hover:rotate-90 transition-transform" onClick={() => handleStatusChange('')} />
              </div>
            )}
            {filters.metricType && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/5 border border-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest shadow-sm">
                <span>{getMetricTypeDisplayName(filters.metricType as MetricType)}</span>
                <X className="w-3 h-3 cursor-pointer hover:rotate-90 transition-transform" onClick={() => handleMetricTypeChange('')} />
              </div>
            )}
            {filters.timeframe && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-widest shadow-sm">
                <span>{timeframeOptions.find(opt => opt.value === filters.timeframe)?.label}</span>
                <X className="w-3 h-3 cursor-pointer hover:rotate-90 transition-transform" onClick={() => handleTimeframeChange('')} />
              </div>
            )}
            <button
              onClick={() => onFilterChange({ search: '', status: '', metricType: '', timeframe: '' })}
              className="text-[10px] font-black text-primary hover:text-primary-hover uppercase tracking-[0.2em] ml-2 transition-colors border-b border-primary/20 hover:border-primary"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
