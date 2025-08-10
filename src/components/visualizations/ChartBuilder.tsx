/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Download, Save } from 'lucide-react';
import { 
  DataSource, 
  ChartConfig, 
  ChartType, 
  AggregationType,
  CHART_TYPES,
  AGGREGATION_TYPES
} from '@/types/visualization';
import { ChartPreview } from './ChartPreview';

interface ChartBuilderProps {
  dataSources: DataSource[];
  onSave: (config: Partial<ChartConfig>) => void;
  onPreview: (data: any) => void;
}

export function ChartBuilder({ dataSources, onSave, onPreview }: ChartBuilderProps) {
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [chartConfig, setChartConfig] = useState<Partial<ChartConfig>>({
    type: 'bar',
    aggregation: 'count',
    styling: {
      colors: ['#4F46E5'],
      showLegend: true,
      showGrid: true,
      height: 400
    },
    filters: []
  });

  useEffect(() => {
    if (selectedDataSource && chartConfig.type && chartConfig.xAxis) {
      generatePreviewData();
    }
  }, [selectedDataSource, chartConfig]);

  const generatePreviewData = () => {
    if (!selectedDataSource || !chartConfig.xAxis) return;

    // Mock data generation for preview
    const mockData = Array.from({ length: 5 }, (_, i) => ({
      [chartConfig.xAxis!]: `Category ${i + 1}`,
      [chartConfig.yAxis || 'count']: Math.floor(Math.random() * 100) + 10
    }));

    onPreview(mockData);
  };

  const handleConfigChange = (key: keyof ChartConfig, value: any) => {
    setChartConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const canCreateChart = selectedDataSource && chartConfig.type && chartConfig.xAxis;

  if (dataSources.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Chart Configuration</h3>
          <p className="text-sm text-gray-500">Configure your visualization settings</p>
        </div>

        {/* Empty State */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-6">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chart Preview</h3>
            <p className="text-gray-500 mb-4">Configure your settings and click &rdquo;Generate&rdquo; to create your visualization</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Configuration Panel */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Chart Configuration</h3>
        <p className="text-sm text-gray-500 mb-6">Configure your visualization settings</p>

        <div className="space-y-6">
          {/* Data Source Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Source
            </label>
            <select
              value={selectedDataSource?.id || ''}
              onChange={(e) => {
                const ds = dataSources.find(d => d.id === e.target.value);
                setSelectedDataSource(ds || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
            >
              <option value="">Select data source</option>
              {dataSources.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chart Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chart Type
            </label>
            <select
              value={chartConfig.type || 'bar'}
              onChange={(e) => handleConfigChange('type', e.target.value as ChartType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
            >
              {Object.entries(CHART_TYPES).map(([type, config]) => (
                <option key={type} value={type}>
                  {config.name}
                </option>
              ))}
            </select>
          </div>

          {/* Axis Configuration */}
          {selectedDataSource && (
            <>
              {/* X Axis */}
              {CHART_TYPES[chartConfig.type as ChartType]?.requiredAxes.includes('x') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    X-Axis (Categories)
                  </label>
                  <select
                    value={chartConfig.xAxis || ''}
                    onChange={(e) => handleConfigChange('xAxis', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                  >
                    <option value="">Select column</option>
                    {selectedDataSource.columns.map((col) => (
                      <option key={col.name} value={col.name}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Y Axis */}
              {CHART_TYPES[chartConfig.type as ChartType]?.requiredAxes.includes('y') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Y-Axis (Values)
                  </label>
                  <select
                    value={chartConfig.yAxis || ''}
                    onChange={(e) => handleConfigChange('yAxis', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                  >
                    <option value="">Select column</option>
                    {selectedDataSource.columns
                      .filter(col => col.type === 'number')
                      .map((col) => (
                        <option key={col.name} value={col.name}>
                          {col.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Group By */}
              {CHART_TYPES[chartConfig.type as ChartType]?.requiredAxes.includes('groupBy') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group By
                  </label>
                  <select
                    value={chartConfig.groupBy || ''}
                    onChange={(e) => handleConfigChange('groupBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                  >
                    <option value="">Select column</option>
                    {selectedDataSource.columns.map((col) => (
                      <option key={col.name} value={col.name}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Aggregation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aggregation
                </label>
                <select
                  value={chartConfig.aggregation || 'count'}
                  onChange={(e) => handleConfigChange('aggregation', e.target.value as AggregationType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                >
                  {Object.entries(AGGREGATION_TYPES).map(([type, config]) => (
                    <option key={type} value={type}>
                      {config.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chart Preview */}
      <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Chart Preview</h3>
            {selectedDataSource && (
              <p className="text-sm text-gray-500 mt-1">
                {selectedDataSource.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={!canCreateChart}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => onSave(chartConfig)}
              disabled={!canCreateChart}
              className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Save Chart
            </button>
          </div>
        </div>

        <ChartPreview
          config={chartConfig as ChartConfig}
          data={[]} 
          isEmpty={!canCreateChart}
        />
      </div>
    </div>
  );
}