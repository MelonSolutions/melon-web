/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Upload, Database, MoreHorizontal, Eye, Trash2, Calendar, Layers, Activity, X } from 'lucide-react';
import { DataSource } from '@/types/visualization';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/Button';

interface DataSourceManagerProps {
  dataSources: DataSource[];
  onImport: () => void;
  onConnectReport: () => void;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string; }>;
  onPreview: (dataSource: DataSource) => Promise<{ success: boolean; data?: any; error?: string; }>;
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
            console.error(`Failed to preview: ${result.error}`);
          }
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this data source?')) {
            const deleteResult = await onDelete(dataSourceId);
            if (!deleteResult.success) {
              console.error(`Failed to delete: ${deleteResult.error}`);
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

  const inputClasses = "w-full px-6 py-4 bg-surface dark:bg-white/5 border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-sm dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600";
  const labelClasses = "text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2";

  return (
    <div className="space-y-10">
      <div className="bg-surface dark:bg-black/20 rounded-[3rem] border border-border dark:border-white/10 shadow-sm flex flex-col relative">
        <div className="px-10 py-8 border-b border-border/60 dark:border-white/10 bg-surface-secondary/30 dark:bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-t-[3rem]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-surface dark:bg-white/10 rounded-2xl border border-border dark:border-white/10 shadow-sm">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase tracking-widest text-sm">Data Sources</h3>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={onImport}
              className="rounded-xl font-bold uppercase tracking-widest text-[9px] py-3 border-border/60"
              icon={<Upload className="w-3.5 h-3.5" />}
            >
              Import CSV
            </Button>
            <Button
              variant="secondary"
              onClick={onConnectReport}
              className="rounded-xl font-bold uppercase tracking-widest text-[9px] py-3 border-border/60"
              icon={<Activity className="w-3.5 h-3.5" />}
            >
              Link Report
            </Button>
          </div>
        </div>

        <div className="divide-y divide-border/30 dark:divide-white/10">
          {dataSources.map((dataSource, index) => {
            const dataSourceId = getDataSourceId(dataSource);
            const isLoading = actionLoading?.includes(dataSourceId);
            const isLast = index === dataSources.length - 1;

            return (
              <div 
                key={dataSourceId || `datasource-${index}`} 
                className={`px-10 py-8 group hover:bg-primary/[0.02] dark:hover:bg-primary/5 transition-all duration-300 ${isLast ? 'rounded-b-[3rem]' : ''}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-6 flex-1 min-w-0">
                    <div className="p-4 bg-surface-secondary/50 dark:bg-white/5 rounded-2xl border border-border dark:border-white/10 group-hover:border-primary/20 transition-all shrink-0">
                      <Database className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h4 className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest truncate">
                          {dataSource.name || 'Untitled Source'}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${dataSource.status === 'ready'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}>
                          {dataSource.status || 'Offline'}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-border/40 dark:border-white/10">
                          {dataSource.type || 'RAW'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-bold text-gray-400 dark:text-gray-500">
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5" />
                          {(dataSource.rowCount || 0).toLocaleString()} Rows
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatUploadDate(dataSource.uploadedAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-xl px-5 font-black uppercase tracking-widest text-[9px] border-border/60"
                      onClick={() => handleAction('preview', dataSource)}
                      disabled={isLoading}
                    >
                      Preview
                    </Button>
                    <div className="relative">
                      <button
                        onClick={() => setShowActions(showActions === dataSourceId ? null : dataSourceId)}
                        disabled={isLoading}
                        className="p-3 hover:bg-surface-secondary/50 dark:hover:bg-white/5 rounded-xl border border-transparent hover:border-border dark:hover:border-white/10 transition-all disabled:opacity-50"
                      >
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>

                      {showActions === dataSourceId && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={() => setShowActions(null)} />
                          <div className="absolute right-0 top-full mt-2 w-48 bg-surface dark:bg-gray-900 rounded-2xl shadow-2xl border border-border dark:border-white/10 py-2 z-30 animate-in fade-in zoom-in-95 duration-200">
                            <button
                              onClick={() => handleAction('preview', dataSource)}
                              className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-surface-secondary/50 dark:hover:bg-white/5 w-full text-left transition-colors rounded-t-2xl"
                            >
                              <Eye className="w-4 h-4" />
                              Preview Data
                            </button>
                            <div className="border-t border-border/40 dark:border-white/10 my-1 mx-2"></div>
                            <button
                              onClick={() => handleAction('delete', dataSource)}
                              className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-error hover:bg-error/5 w-full text-left transition-colors rounded-b-2xl"
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

                {dataSource.columns && dataSource.columns.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {dataSource.columns.slice(0, 8).map((column, colIndex) => (
                      <span
                        key={column.name || `col-${colIndex}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-secondary/40 dark:bg-white/5 text-[9px] font-black uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400 rounded-lg border border-border/40 dark:border-white/10 transition-colors hover:border-primary/20"
                      >
                        {column.name || `Field ${colIndex + 1}`}
                        <span className="opacity-40 italic">[{column.type || 'v'}]</span>
                      </span>
                    ))}
                    {dataSource.columns.length > 8 && (
                      <span className="inline-flex items-center px-3 py-1.5 bg-surface-secondary/20 text-[9px] font-black uppercase tracking-widest text-gray-300 rounded-lg">
                        +{dataSource.columns.length - 8} Additional
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {previewData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <div className="bg-surface dark:bg-gray-900 rounded-[2rem] max-w-xl w-full max-h-[80vh] overflow-hidden flex flex-col border border-border dark:border-white/10 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/60 dark:border-white/10 bg-surface-secondary/30 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Data Preview</h3>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5 opacity-60">Sample synchronized dataset</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewData(null)}
                className="p-2 hover:bg-surface-secondary/50 dark:hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="p-6 overflow-auto flex-1 bg-surface dark:bg-black/20">
              <div className="overflow-x-auto rounded-xl border border-border dark:border-white/10 bg-surface dark:bg-white/5">
                <table className="min-w-full divide-y divide-border/30 dark:divide-white/10">
                  <thead>
                    <tr className="bg-surface-secondary/30 dark:bg-white/10">
                      {previewData && previewData.length > 0 && Object.keys(previewData[0]).map((key, index) => (
                        <th key={`header-${index}`} className="px-5 py-3 text-left text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-border/40 dark:border-white/10">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30 dark:divide-white/10">
                    {previewData && previewData.slice(0, 10).map((row: any, rowIndex: number) => (
                      <tr key={`row-${rowIndex}`} className="hover:bg-primary/[0.01] transition-colors">
                        {Object.values(row).map((value: any, cellIndex: number) => (
                          <td key={`cell-${rowIndex}-${cellIndex}`} className="px-5 py-3 whitespace-nowrap text-[10px] font-bold text-gray-700 dark:text-gray-300">
                            {String(value || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 dark:border-white/10 bg-surface-secondary/20 dark:bg-white/5">
              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest opacity-60">
                Top 10 indices shown
              </div>

              <Button
                variant="secondary"
                onClick={() => setPreviewData(null)}
                className="px-6 py-2.5 rounded-lg font-black uppercase tracking-widest text-[9px] border-border/60"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}