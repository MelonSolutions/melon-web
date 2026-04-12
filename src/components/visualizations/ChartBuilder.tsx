/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  onSave: (config: Partial<ChartConfig>) => Promise<{ success: boolean; error?: string }>;
  onPreview: (data: any) => void;
}

export function ChartBuilder({ dataSources, onSave, onPreview }: ChartBuilderProps) {
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
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

  const getDataSourceId = (dataSource: any): string => {
    return dataSource.id || dataSource._id || '';
  };

  const normalizedDataSources = dataSources.map(ds => ({
    ...ds,
    id: getDataSourceId(ds)
  }));

  useEffect(() => {
    if (selectedDataSource && chartConfig.type && chartConfig.xAxis) {
      generatePreviewData();
    }
  }, [selectedDataSource, chartConfig]);

  const generatePreviewData = () => {
    if (!selectedDataSource || !chartConfig.xAxis) return;

    // Generate meaningful mock data based on chart configuration
    const categories = ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'];
    const mockData = categories.map((category, index) => {
      const data: any = {};
      data[chartConfig.xAxis!] = category;
      
      if (chartConfig.yAxis) {
        data[chartConfig.yAxis] = Math.floor(Math.random() * 100) + 10 + (index * 5);
      } else {
        data['value'] = Math.floor(Math.random() * 50) + 5 + (index * 3);
      }

      if (chartConfig.groupBy) {
        data[chartConfig.groupBy] = ['Group 1', 'Group 2'][index % 2];
      }

      return data;
    });

    setPreviewData(mockData);
    onPreview(mockData);
  };

  const handleConfigChange = (key: keyof ChartConfig, value: any) => {
    setChartConfig(prev => ({
      ...prev,
      [key]: value
    }));

    // Reset dependent fields when changing chart type
    if (key === 'type') {
      const chartType = CHART_TYPES[value as ChartType];
      if (chartType) {
        setChartConfig(prev => ({
          ...prev,
          [key]: value,
          // Clear axes if new chart type doesn't support them
          ...(!chartType.requiredAxes.includes('y') && { yAxis: undefined }),
          ...(!chartType.requiredAxes.includes('groupBy') && { groupBy: undefined })
        }));
      }
    }
  };

  const handleDataSourceChange = (selectedId: string) => {
    if (!selectedId) {
      setSelectedDataSource(null);
      setPreviewData([]);
      return;
    }

    const foundDataSource = normalizedDataSources.find(ds => ds.id === selectedId);
    setSelectedDataSource(foundDataSource || null);

    if (foundDataSource) {
      setChartConfig(prev => ({
        ...prev,
        dataSourceId: foundDataSource.id,
        xAxis: undefined,
        yAxis: undefined,
        groupBy: undefined,
      }));
      setPreviewData([]);
    }
  };

  const handleSaveChart = async () => {
    if (!canCreateChart) return;

    setIsSaving(true);
    try {
      const saveConfig = {
        ...chartConfig,
        name: chartConfig.name?.trim() || `Chart - ${selectedDataSource?.name}`,
        dataSourceId: selectedDataSource?.id,
      };

      const result = await onSave(saveConfig);
      
      if (result.success) {
        // Reset form after successful save
        setChartConfig({
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
        setSelectedDataSource(null);
        setPreviewData([]);
      } else {
        alert(`Failed to save chart: ${result.error}`);
      }
    } catch (error) {
      alert('Failed to save chart');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportChart = async () => {
    if (!canCreateChart) return;

    setIsExporting(true);
    try {
      // Generate export data
      const exportData = {
        chartConfig,
        dataSource: selectedDataSource?.name,
        previewData,
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${chartConfig.name || 'chart'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export chart');
    } finally {
      setIsExporting(false);
    }
  };

  const canCreateChart = selectedDataSource && chartConfig.type && chartConfig.xAxis;

  if (normalizedDataSources.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Chart Configuration</h3>
          <p className="text-sm text-gray-500">Import a data source to start building charts</p>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-6">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Sources Available</h3>
            <p className="text-gray-500 mb-4">Import CSV data or connect a report to start creating charts</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Chart Configuration</h3>
        <p className="text-sm text-gray-500 mb-6">Configure your visualization settings</p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chart Name
            </label>
            <input
              type="text"
              value={chartConfig.name || ''}
              onChange={(e) => handleConfigChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter chart name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Source
            </label>
            <select
              value={selectedDataSource?.id || ''}
              onChange={(e) => handleDataSourceChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select data source</option>
              {normalizedDataSources.map((ds, index) => (
                <option key={ds.id || `ds-${index}`} value={ds.id}>
                  {ds.name} ({ds.rowCount || 0} rows)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chart Type
            </label>
            <select
              value={chartConfig.type || 'bar'}
              onChange={(e) => handleConfigChange('type', e.target.value as ChartType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {Object.entries(CHART_TYPES).map(([type, config]) => (
                <option key={type} value={type}>
                  {config.name}
                </option>
              ))}
            </select>
          </div>

          {selectedDataSource && selectedDataSource.columns && (
            <>
              {CHART_TYPES[chartConfig.type as ChartType]?.requiredAxes.includes('x') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    X-Axis (Categories)
                  </label>
                  <select
                    value={chartConfig.xAxis || ''}
                    onChange={(e) => handleConfigChange('xAxis', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select column</option>
                    {selectedDataSource.columns.map((col, index) => (
                      <option key={col.name || `col-${index}`} value={col.name}>
                        {col.name} ({col.type})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {CHART_TYPES[chartConfig.type as ChartType]?.requiredAxes.includes('y') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Y-Axis (Values) <span className="text-gray-400 text-xs">Optional for count aggregation</span>
                  </label>
                  <select
                    value={chartConfig.yAxis || ''}
                    onChange={(e) => handleConfigChange('yAxis', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select column (optional)</option>
                    {selectedDataSource.columns
                      .filter(col => col.type === 'number')
                      .map((col, index) => (
                        <option key={col.name || `num-col-${index}`} value={col.name}>
                          {col.name} ({col.type})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {CHART_TYPES[chartConfig.type as ChartType]?.requiredAxes.includes('groupBy') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group By <span className="text-gray-400 text-xs">Optional</span>
                  </label>
                  <select
                    value={chartConfig.groupBy || ''}
                    onChange={(e) => handleConfigChange('groupBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select column (optional)</option>
                    {selectedDataSource.columns.map((col, index) => (
                      <option key={col.name || `group-col-${index}`} value={col.name}>
                        {col.name} ({col.type})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aggregation
                </label>
                <select
                  value={chartConfig.aggregation || 'count'}
                  onChange={(e) => handleConfigChange('aggregation', e.target.value as AggregationType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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

      <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Chart Preview</h3>
            {selectedDataSource && (
              <p className="text-sm text-gray-500 mt-1">
                {selectedDataSource.name} • {selectedDataSource.rowCount || 0} rows
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportChart}
              disabled={!canCreateChart || isExporting}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
            <button
              onClick={handleSaveChart}
              disabled={!canCreateChart || isSaving}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Chart'}
            </button>
          </div>
        </div>

        <ChartPreview
          config={chartConfig as ChartConfig}
          data={previewData} 
          isEmpty={!canCreateChart}
        />

        {canCreateChart && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Chart Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Type:</span> {CHART_TYPES[chartConfig.type as ChartType]?.name}
              </div>
              <div>
                <span className="font-medium">X-Axis:</span> {chartConfig.xAxis}
              </div>
              <div>
                <span className="font-medium">Y-Axis:</span> {chartConfig.yAxis || 'Count'}
              </div>
              <div>
                <span className="font-medium">Aggregation:</span> {chartConfig.aggregation}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}