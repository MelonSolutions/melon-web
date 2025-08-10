'use client';

import { useState } from 'react';
import { MoreHorizontal, Edit, Eye, Share2, Trash2 } from 'lucide-react';
import { ChartConfig, CHART_TYPES } from '@/types/visualization';
import { formatDistanceToNow } from 'date-fns';
import { ChartPreview } from './ChartPreview';

interface SavedChartsProps {
  charts: ChartConfig[];
  onEdit: (chart: ChartConfig) => void;
  onDuplicate: (chart: ChartConfig) => void;
  onDelete: (chartId: string) => void;
  onShare: (chart: ChartConfig) => void;
}

export function SavedCharts({ charts, onEdit, onDuplicate, onDelete, onShare }: SavedChartsProps) {
  const [showActions, setShowActions] = useState<string | null>(null);
  const [previewChart, setPreviewChart] = useState<ChartConfig | null>(null);

  const getChartTypeInfo = (type: string) => {
    return CHART_TYPES[type as keyof typeof CHART_TYPES] || {
      name: 'Unknown',
      description: 'Chart type'
    };
  };

  const handleAction = (action: string, chart: ChartConfig) => {
    setShowActions(null);
    
    switch (action) {
      case 'edit':
        onEdit(chart);
        break;
      case 'duplicate':
        onDuplicate(chart);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this chart?')) {
          onDelete(chart.id);
        }
        break;
      case 'share':
        onShare(chart);
        break;
      case 'preview':
        setPreviewChart(chart);
        break;
    }
  };

  if (charts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
          <MoreHorizontal className="w-6 h-6 text-gray-400" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No saved charts yet
        </h3>
        
        <p className="text-gray-500 mb-6">
          Create your first chart in the Chart Builder to see it here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Saved Charts</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {charts.map((chart) => {
            const typeInfo = getChartTypeInfo(chart.type);
            
            return (
              <div key={chart.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-base font-medium text-gray-900 truncate">
                          {chart.name}
                        </h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {typeInfo.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>{chart.xAxis} {chart.yAxis ? `× ${chart.yAxis}` : ''}</span>
                        <span className="capitalize">{chart.aggregation}</span>
                        <span>
                          Updated {formatDistanceToNow(new Date(chart.updatedAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {chart.groupBy && (
                        <p className="text-sm text-gray-600 mt-1">
                          Grouped by {chart.groupBy}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="relative ml-4">
                    <button
                      onClick={() => setShowActions(showActions === chart.id ? null : chart.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {showActions === chart.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowActions(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <button
                            onClick={() => handleAction('preview', chart)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                          >
                            <Eye className="w-4 h-4" />
                            Preview
                          </button>
                          <button
                            onClick={() => handleAction('edit', chart)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleAction('share', chart)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                          >
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={() => handleAction('delete', chart)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview Modal */}
      {previewChart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {previewChart.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {getChartTypeInfo(previewChart.type).name} • {previewChart.aggregation} aggregation
                </p>
              </div>
              <button
                onClick={() => setPreviewChart(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>
            
            <div className="p-6">
              <ChartPreview
                config={previewChart}
                data={[]}
                isEmpty={false}
              />
            </div>
            
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Chart ID: {previewChart.id}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPreviewChart(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onEdit(previewChart);
                    setPreviewChart(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Edit Chart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}