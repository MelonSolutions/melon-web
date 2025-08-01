/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  MapPin, 
  Activity,
  ChevronRight,
  ChevronDown,
  ExternalLink
} from 'lucide-react';

interface AnalyticsSidebarProps {
  filters: any;
  layers: any[];
  onRegionClick: (region: string) => void;
}

export function AnalyticsSidebar({ filters, layers, onRegionClick }: AnalyticsSidebarProps) {
  const [expandedSections, setExpandedSections] = useState(new Set(['overview', 'regions']));

  const analytics = {
    totalPoints: 1247,
    countries: 12,
    regionCount: 45,
    coverage: 8200,
    dataQuality: 94,
    regions: [
      { name: 'Lagos State', count: 156 },
      { name: 'Kano State', count: 134 },
      { name: 'Rivers State', count: 98 },
      { name: 'Kaduna State', count: 87 },
      { name: 'Oyo State', count: 76 },
    ],
    topMetrics: [
      { name: 'Malaria Incidence', value: 298, unit: 'per 1000' },
      { name: 'Health Facilities', value: 45, unit: 'facilities' },
      { name: 'Population Coverage', value: 67, unit: '%' },
    ]
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  interface SectionHeaderProps {
    id: string;
    title: string;
    icon: React.ElementType;
    count?: number;
  }

  const SectionHeader = ({ id, title, icon: Icon, count }: SectionHeaderProps) => (
    <button
      onClick={() => toggleSection(id)}
      className="cursor-pointer w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-gray-500" />
        <span className="font-medium text-gray-900">{title}</span>
        {count !== undefined && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {count}
          </span>
        )}
      </div>
      {expandedSections.has(id) ? (
        <ChevronDown className="w-4 h-4 text-gray-400" />
      ) : (
        <ChevronRight className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Geographic Analytics</h2>
        <p className="text-sm text-gray-600 mt-1">
          {analytics.totalPoints.toLocaleString()} data points analyzed
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Overview Section */}
        <div className="border-b border-gray-200">
          <SectionHeader id="overview" title="Overview" icon={Activity} />
          {expandedSections.has('overview') && (
            <div className="p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm font-semibold text-gray-700">
                    {analytics.countries}
                  </div>
                  <div className="text-sm text-gray-900 font-medium">Countries</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm font-semibold text-gray-700">
                    {analytics.regionCount}
                  </div>
                  <div className="text-sm text-gray-900 font-medium">Regions</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm font-semibold text-gray-700">
                    {(analytics.coverage / 1000).toFixed(1)}K
                  </div>
                  <div className="text-sm text-gray-900 font-medium">km² Coverage</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm font-semibold text-gray-700">
                    {analytics.dataQuality}%
                  </div>
                  <div className="text-sm text-gray-900 font-medium">Data Quality</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Regional Breakdown */}
        <div className="cursor-pointer border-b border-gray-200">
          <SectionHeader 
            id="regions" 
            title="Regional Breakdown" 
            icon={MapPin} 
            count={analytics.regions.length} 
          />
          {expandedSections.has('regions') && (
            <div className="p-4">
              {analytics.regions.slice(0, 8).map((region) => (
                <button
                  key={region.name}
                  onClick={() => onRegionClick(region.name)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <span className="text-sm text-gray-900 truncate font-medium">{region.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 font-medium">{region.count}</span>
                    <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Top Metrics */}
        <div className="cursor-pointer border-b border-gray-200">
          <SectionHeader 
            id="metrics" 
            title="Key Metrics" 
            icon={TrendingUp} 
            count={analytics.topMetrics.length} 
          />
          {expandedSections.has('metrics') && (
            <div className="p-4">
              {analytics.topMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-900 truncate capitalize font-medium">
                    {metric.name.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    {metric.value.toLocaleString()}
                    {metric.unit && <span className="text-xs text-gray-500 ml-1">{metric.unit}</span>}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};