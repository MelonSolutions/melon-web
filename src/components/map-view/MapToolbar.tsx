'use client';

import { useState } from 'react';
import { 
  Maximize, 
  RotateCcw, 
  Target, 
  Layers, 
  BarChart3, 
  TrendingUp, 
  Share2, 
  Download,
  Filter
} from 'lucide-react';
import { MapFilters } from '@/types/geospatial';

interface MapToolbarProps {
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
}

export function MapToolbar({ filters, onFiltersChange }: MapToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const sectors = ['Health', 'Education', 'Agriculture', 'Energy', 'Finance', 'Infrastructure'];
  const statuses = ['active', 'completed', 'draft', 'paused'];

  const handleSectorToggle = (sector: string) => {
    const newSectors = filters.sectors.includes(sector)
      ? filters.sectors.filter(s => s !== sector)
      : [...filters.sectors, sector];
    
    onFiltersChange({ ...filters, sectors: newSectors });
  };

  const handleStatusToggle = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    
    onFiltersChange({ ...filters, status: newStatus });
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Map controls */}
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
            <Maximize className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
            <Target className="w-4 h-4" />
          </button>
          
          <div className="h-6 w-px bg-gray-300 mx-2"></div>
          
          <button className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Layers className="w-4 h-4 mr-2" />
            Layers
          </button>
          <button className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Reports
          </button>
          <button className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <TrendingUp className="w-4 h-4 mr-2" />
            Impact Metrics
          </button>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-3 py-2 rounded-lg ${
              showFilters ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Share2 className="w-4 h-4 mr-2" />
            Share Map
          </button>
          <button className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Sectors Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sectors
              </label>
              <div className="space-y-2">
                {sectors.map(sector => (
                  <label key={sector} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.sectors.includes(sector)}
                      onChange={() => handleSectorToggle(sector)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{sector}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="space-y-2">
                {statuses.map(status => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={() => handleStatusToggle(status)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Impact Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Impact Score Range
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.impactRange[0]}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    impactRange: [Number(e.target.value), filters.impactRange[1]]
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{filters.impactRange[0]}%</span>
                  <span>{filters.impactRange[1]}%</span>
                </div>
              </div>
            </div>

            {/* Display Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.showCoverage}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      showCoverage: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show Coverage</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.showHeatmap}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      showHeatmap: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show Heatmap</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}