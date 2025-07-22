/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { GeographicAnalytics, ServiceGap, EmergencyResponse, ProjectLocation } from '@/types/geospatial';
import { mockServiceGaps, mockEmergencyResponse } from '@/lib/api/geospatial-mock';
import { AlertTriangle, Clipboard, Map, Users } from 'lucide-react';

interface MapSidebarProps {
  analytics: GeographicAnalytics;
  onProjectSelect: (project: ProjectLocation) => void;
}

export function MapSidebar({ analytics }: MapSidebarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Geographic Analytics</h2>
        <p className="text-sm text-gray-600 mt-1">Regional performance insights</p>
      </div>

      {/* Analytics Cards */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Active Projects */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.activeProjects}</div>
            <div className="text-xs text-gray-500 mt-1">Active Projects</div>
          </div>

          {/* Coverage */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.kmCoverage}K</div>
            <div className="text-xs text-gray-500 mt-1">km² Coverage</div>
          </div>

          {/* Beneficiaries */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.beneficiaries}K</div>
            <div className="text-xs text-gray-500 mt-1">Beneficiaries</div>
          </div>

          {/* Service Gap */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.avgServiceGap}%</div>
            <div className="text-xs text-gray-500 mt-1">Avg Service Gap</div>
          </div>
        </div>
      </div>

      {/* Service Gap Analysis */}
      <div className="px-6 pb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Service Gap Analysis</h3>
        <div className="space-y-3">
          {mockServiceGaps.map((gap, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{gap.sector}</span>
              <div className="flex items-center space-x-2">
                <span 
                  className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: `${gap.color}20`,
                    color: gap.color 
                  }}
                >
                  {gap.level}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Response */}
      <div className="px-6 pb-6 flex-1">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Emergency Response</h3>
        <p className="text-xs text-gray-600 mb-4">Rapid deployment planning</p>
        
        <div className="space-y-3">
          {mockEmergencyResponse.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {item.id === '1' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  {item.id === '2' && <Clipboard className="w-4 h-4 text-blue-500" />}
                  {item.id === '3' && <Map className="w-4 h-4 text-green-500" />}
                  {item.id === '4' && <Users className="w-4 h-4 text-purple-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {item.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}