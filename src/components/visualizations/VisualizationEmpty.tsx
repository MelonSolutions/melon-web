'use client';

import Link from 'next/link';
import { BarChart3, Plus, Upload } from 'lucide-react';

interface VisualizationEmptyProps {
  activeTab: 'charts' | 'data-sources' | 'saved-charts';
}

export function VisualizationEmpty({ activeTab }: VisualizationEmptyProps) {
  if (activeTab === 'data-sources') {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-6">
          <Upload className="w-8 h-8 text-gray-400" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No data sources yet
        </h3>
        
        <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
          Get started by importing your first dataset to create visualizations.
        </p>
        
        <div className="flex items-center justify-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors">
            <Upload className="w-4 h-4" />
            Import CSV Data
          </button>
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 px-4 py-2 text-[#5B94E5] bg-blue-50 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
          >
            Connect Reports
          </Link>
        </div>
      </div>
    );
  }

  if (activeTab === 'saved-charts') {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-6">
          <BarChart3 className="w-8 h-8 text-gray-400" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No saved charts yet
        </h3>
        
        <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
          Create your first chart in the Chart Builder to see it here.
        </p>
        
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
          <Plus className="w-4 h-4" />
          Create Your First Chart
        </button>
      </div>
    );
  }

  // Chart Builder empty state
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-6">
        <BarChart3 className="w-8 h-8 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Ready to create charts
      </h3>
      
      <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
        Select a data source from the sidebar to start building your visualization.
      </p>
      
      <div className="flex items-center justify-center gap-3">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
          <Upload className="w-4 h-4" />
          Import Data
        </button>
        <Link
          href="/reports"
          className="inline-flex items-center gap-2 px-4 py-2 text-[#5B94E5] bg-blue-50 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
        >
          Use Report Data
        </Link>
      </div>
    </div>
  );
}