/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

interface MapLegendProps {
  layers: any[];
  selectedMetric?: string;
}

export function MapLegend({ layers, selectedMetric }: MapLegendProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const legendItems = [
    { name: 'High Risk', color: '#dc2626', description: 'Malaria incidence > 100/1000' },
    { name: 'Medium Risk', color: '#ea580c', description: 'Malaria incidence 50-100/1000' },
    { name: 'Low Risk', color: '#ca8a04', description: 'Malaria incidence < 50/1000' },
    { name: 'No Data', color: '#6b7280', description: 'No reported cases' },
  ];

  if (legendItems.length === 0) return null;

  return (
    <div className="absolute bottom-6 left-6 z-[1000] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-xs">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900">Legend</h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
        >
          {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4">
          {selectedMetric && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedMetric.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          )}

          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3 py-2">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                <div className="text-xs text-gray-500 truncate">{item.description}</div>
              </div>
            </div>
          ))}

          {/* Scale Reference */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">Scale</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-gray-800"></div>
                <span className="text-xs text-gray-600">50 km</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};