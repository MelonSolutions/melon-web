/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Upload, Database, MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { DataSource } from '@/types/visualization';
import { formatDistanceToNow } from 'date-fns';

interface DataSourceManagerProps {
  dataSources: DataSource[];
  onImport: () => void;
  onConnectReport: () => void;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  onPreview: (dataSource: DataSource) => Promise<{ success: boolean; data?: any; error?: string }>;
}

export function DataSourceManager({ 
  dataSources, 
  onImport, 
  onConnectReport, 
  onDelete, 
  onPreview 
}: DataSourceManagerProps) {
  const [showActions, setShowActions] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const formatUploadDate = (uploadedAt: string | undefined) => {
    if (!uploadedAt) return 'Recently';
    try {
      const date = new Date(uploadedAt);
      if (isNaN(date.getTime())) return 'Recently';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const getDataSourceId = (dataSource: any): string => {
    return dataSource.id || dataSource._id || '';
  };

  const handleAction = async (action: string, dataSource: DataSource) => {
    setShowActions(null);
    const dataSourceId = getDataSourceId(dataSource);
    setActionLoading(`${action}-${dataSourceId}`);
    
    try {
      switch (action) {
        case 'preview':
          const result = await onPreview(dataSource);
          if (result.success) {
            setPreviewData(result.data);
          } else {
            alert(`Failed to preview: ${result.error}`);
          }
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this data source?')) {
            const deleteResult = await onDelete(dataSourceId);
            if (!deleteResult.success) {
              alert(`Failed to delete: ${deleteResult.error}`);
            }
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} data source:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  if (dataSources.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-6">
          <Database className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No data sources yet</h3>
        <p className="text-gray-500 mb-6">
          Import CSV files or connect reports to start creating visualizations
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onImport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button
            onClick={onConnectReport}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Database className="w-4 h-4" />
            Connect Survey
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Data Sources</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={onImport}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </button>
              <button
                onClick={onConnectReport}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Database className="w-4 h-4" />
                Connect Survey
              </button>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {dataSources.map((dataSource, index) => {
            const dataSourceId = getDataSourceId(dataSource);
            const isLoading = actionLoading?.includes(dataSourceId);
            
            return (
              <div key={dataSourceId || `datasource-${index}`} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-base font-medium text-gray-900 truncate">
                          {dataSource.name || 'Untitled Data Source'}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          dataSource.status === 'ready' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {dataSource.status || 'Unknown'}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {dataSource.type || 'Unknown'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>{(dataSource.rowCount || 0).toLocaleString()} rows</span>
                        <span>{dataSource.columns?.length || 0} columns</span>
                        <span>Updated {formatUploadDate(dataSource.uploadedAt)}</span>
                      </div>
                      
                      {dataSource.fileName && (
                        <p className="text-sm text-gray-600 mt-1">
                          {dataSource.fileName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="relative ml-4">
                    <button
                      onClick={() => setShowActions(showActions === dataSourceId ? null : dataSourceId)}
                      disabled={isLoading}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {showActions === dataSourceId && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowActions(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <button
                            onClick={() => handleAction('preview', dataSource)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                          >
                            <Eye className="w-4 h-4" />
                            Preview Data
                          </button>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={() => handleAction('delete', dataSource)}
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

                {dataSource.columns && dataSource.columns.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {dataSource.columns.slice(0, 5).map((column, colIndex) => (
                        <span
                          key={column.name || `col-${colIndex}`}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-700 rounded text-xs"
                        >
                          {column.name || `Column ${colIndex + 1}`}
                          <span className="text-gray-500">({column.type || 'unknown'})</span>
                        </span>
                      ))}
                      {dataSource.columns.length > 5 && (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-50 text-gray-500 rounded text-xs">
                          +{dataSource.columns.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {previewData && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Data Preview</h3>
              <button
                onClick={() => setPreviewData(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {previewData && previewData.length > 0 && Object.keys(previewData[0]).map((key, index) => (
                        <th key={`header-${index}`} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData && previewData.slice(0, 10).map((row: any, rowIndex: number) => (
                      <tr key={`row-${rowIndex}`}>
                        {Object.values(row).map((value: any, cellIndex: number) => (
                          <td key={`cell-${rowIndex}-${cellIndex}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {String(value || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Showing first 10 rows
              </div>
              
              <button
                onClick={() => setPreviewData(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}