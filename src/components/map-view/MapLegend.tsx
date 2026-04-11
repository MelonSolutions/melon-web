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
    <div className="absolute bottom-6 left-6 z-[1000] bg-surface rounded-xl shadow-lg border border-border overflow-hidden max-w-xs transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface-secondary">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Legend</h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="cursor-pointer p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
        >
          {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4">
          {selectedMetric && (
            <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {selectedMetric.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{item.name}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{item.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Scale Reference */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Scale Reference</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-gray-900 dark:bg-gray-100"></div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">50 km</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};