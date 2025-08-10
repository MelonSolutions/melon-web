'use client';

import { useState } from 'react';
import { Upload, Database, MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { DataSource } from '@/types/visualization';
import { formatDistanceToNow } from 'date-fns';

interface DataSourceManagerProps {
  dataSources: DataSource[];
  onImport: () => void;
  onConnectReport: () => void;
  onDelete: (id: string) => void;
  onPreview: (dataSource: DataSource) => void;
}

export function DataSourceManager({ 
  dataSources, 
  onImport, 
  onConnectReport,
  onDelete,
  onPreview 
}: DataSourceManagerProps) {
  const [showActions, setShowActions] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'processing':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'csv':
        return { label: 'CSV File', color: 'bg-blue-50 text-blue-700' };
      case 'report':
        return { label: 'Report Data', color: 'bg-green-50 text-green-700' };
      case 'api':
        return { label: 'API Source', color: 'bg-purple-50 text-purple-700' };
      default:
        return { label: 'Unknown', color: 'bg-gray-50 text-gray-700' };
    }
  };

  if (dataSources.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onImport}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button
            onClick={onConnectReport}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Database className="w-4 h-4" />
            Connect Report
          </button>
        </div>

        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data sources</h3>
          <p className="text-gray-500 mb-6">Import your first dataset to get started</p>
          <button
            onClick={onImport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onImport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors"
        >
          <Upload className="w-4 h-4" />
          Import CSV
        </button>
        <button
          onClick={onConnectReport}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Database className="w-4 h-4" />
          Connect Report
        </button>
      </div>

      {/* Data Sources List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Data Sources</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {dataSources.map((dataSource) => {
            const typeInfo = getTypeDisplay(dataSource.type);
            
            return (
              <div key={dataSource.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-base font-medium text-gray-900 truncate">
                          {dataSource.name}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(dataSource.status)}`}>
                          {dataSource.status.charAt(0).toUpperCase() + dataSource.status.slice(1)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>{dataSource.rowCount.toLocaleString()} rows</span>
                        <span>{dataSource.columns.length} columns</span>
                        <span>
                          Updated {formatDistanceToNow(new Date(dataSource.uploadedAt), { addSuffix: true })}
                        </span>
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
                      onClick={() => setShowActions(showActions === dataSource.id ? null : dataSource.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {showActions === dataSource.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowActions(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <button
                            onClick={() => {
                              onPreview(dataSource);
                              setShowActions(null);
                            }}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                          >
                            <Eye className="w-4 h-4" />
                            Preview Data
                          </button>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={() => {
                              onDelete(dataSource.id);
                              setShowActions(null);
                            }}
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

                {/* Column Preview */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {dataSource.columns.slice(0, 8).map((column) => (
                      <span
                        key={column.name}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                      >
                        {column.name}
                        <span className="ml-1 text-gray-500">({column.type})</span>
                      </span>
                    ))}
                    {dataSource.columns.length > 8 && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-50 text-gray-500">
                        +{dataSource.columns.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}