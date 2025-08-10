/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import { useState, Suspense } from 'react';
import { Plus, Upload, Database, BarChart3, Share2 } from 'lucide-react';
import { VisualizationLoading } from '@/components/visualizations/VisualizationLoading';
import { ChartBuilder } from '@/components/visualizations/ChartBuilder';
import { DataSourceManager } from '@/components/visualizations/DataSourceManager';
import { SavedCharts } from '@/components/visualizations/SavedCharts';
import { DataSource, ChartConfig, VisualizationStats } from '@/types/visualization';

const useVisualizations = () => {
  const [loading, setLoading] = useState(false);
  
  // Mock data
  const stats: VisualizationStats = {
    totalDataSources: 8,
    totalRecords: 11200,
    activeCharts: 15,
    sharedCharts: 9
  };

  const dataSources: DataSource[] = [
    // {
    //   id: '1',
    //   name: 'Health Program Survey Responses',
    //   type: 'report',
    //   columns: [
    //     { name: 'region', type: 'string', nullable: false, unique: false },
    //     { name: 'rating', type: 'number', nullable: false, unique: false },
    //     { name: 'feedback', type: 'string', nullable: true, unique: false },
    //     { name: 'timestamp', type: 'date', nullable: false, unique: false }
    //   ],
    //   rowCount: 1247,
    //   uploadedAt: '2024-08-01T10:00:00Z',
    //   status: 'ready'
    // }
  ];

  const savedCharts: ChartConfig[] = [
    {
      id: '1',
      name: 'Average App Rating by Region',
      type: 'bar',
      dataSourceId: '1',
      xAxis: 'region',
      yAxis: 'rating',
      aggregation: 'average',
      filters: [],
      styling: {
        colors: ['#4F46E5'],
        showLegend: true,
        showGrid: true,
        title: 'Average App Rating by Region'
      },
      createdAt: '2024-08-01T10:00:00Z',
      updatedAt: '2024-08-02T15:30:00Z'
    }
  ];

  return {
    stats,
    dataSources,
    savedCharts,
    loading,
    importCSV: () => console.log('Import CSV'),
    connectReport: () => console.log('Connect report'),
    deleteDataSource: (id: string) => console.log('Delete data source:', id),
    previewDataSource: (ds: DataSource) => console.log('Preview:', ds),
    saveChart: (config: Partial<ChartConfig>) => console.log('Save chart:', config),
    editChart: (chart: ChartConfig) => console.log('Edit chart:', chart),
    duplicateChart: (chart: ChartConfig) => console.log('Duplicate chart:', chart),
    deleteChart: (id: string) => console.log('Delete chart:', id),
    shareChart: (chart: ChartConfig) => console.log('Share chart:', chart),
    refetch: () => console.log('Refetch')
  };
};

function VisualizationContent() {
  const [activeTab, setActiveTab] = useState<'chart-builder' | 'data-sources' | 'saved-charts'>('chart-builder');
  const [previewData, setPreviewData] = useState<any[]>([]);

  const {
    stats,
    dataSources,
    savedCharts,
    loading,
    importCSV,
    connectReport,
    deleteDataSource,
    previewDataSource,
    saveChart,
    editChart,
    duplicateChart,
    deleteChart,
    shareChart,
    refetch
  } = useVisualizations();

  if (loading) {
    return <VisualizationLoading />;
  }

  const hasData = dataSources.length > 0 || savedCharts.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Visualizations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Import data and create interactive charts and visualizations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={importCSV}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import Data
          </button>
          <button
            onClick={() => setActiveTab('chart-builder')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Chart
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {hasData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Sources</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.totalDataSources}</p>
              </div>
              <Database className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.totalRecords.toLocaleString()}</p>
              </div>
              <Database className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Charts</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.activeCharts}</p>
              </div>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shared</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.sharedCharts}</p>
              </div>
              <Share2 className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('chart-builder')}
            className={`cursor-pointer py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'chart-builder'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Chart Builder
          </button>
          <button
            onClick={() => setActiveTab('data-sources')}
            className={`cursor-pointer py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'data-sources'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Data Sources
          </button>
          <button
            onClick={() => setActiveTab('saved-charts')}
            className={`cursor-pointer py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'saved-charts'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Saved Charts
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'chart-builder' && (
          <ChartBuilder
            dataSources={dataSources}
            onSave={saveChart}
            onPreview={setPreviewData}
          />
        )}

        {activeTab === 'data-sources' && (
          <DataSourceManager
            dataSources={dataSources}
            onImport={importCSV}
            onConnectReport={connectReport}
            onDelete={deleteDataSource}
            onPreview={previewDataSource}
          />
        )}

        {activeTab === 'saved-charts' && (
          <SavedCharts
            charts={savedCharts}
            onEdit={editChart}
            onDuplicate={duplicateChart}
            onDelete={deleteChart}
            onShare={shareChart}
          />
        )}
      </div>
    </div>
  );
}

export default function VisualizationsPage() {
  return (
    <Suspense fallback={<VisualizationLoading />}>
      <VisualizationContent />
    </Suspense>
  );
}