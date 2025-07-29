/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Search, Grid, List } from 'lucide-react';

interface ReportsFiltersProps {
  filters: {
    search: string;
    status: string;
    category: string;
  };
  onFilterChange: (filters: any) => void;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export function ReportsFilters({ filters, onFilterChange, view, onViewChange }: ReportsFiltersProps) {
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
            placeholder="Search reports..."
            value={filters.search}
            onChange={(e) => handleFilterUpdate('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filters.status}
          onChange={(e) => handleFilterUpdate('status', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) => handleFilterUpdate('category', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          <option value="Impact Assessment">Impact Assessment</option>
          <option value="Feedback">Feedback</option>
          <option value="Health">Health</option>
          <option value="Education">Education</option>
          <option value="Agriculture">Agriculture</option>
          <option value="Community">Community</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onViewChange('grid')}
          className={`p-2 rounded-lg ${view === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <Grid className="w-5 h-5" />
        </button>
        <button
          onClick={() => onViewChange('list')}
          className={`p-2 rounded-lg ${view === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <List className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
