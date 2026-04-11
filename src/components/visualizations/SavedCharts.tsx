/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { MoreHorizontal, Edit, Eye, Share2, Trash2, Copy, BarChart3, Calendar, Activity, Layers, X, Loader2 } from 'lucide-react';
import { ChartConfig, CHART_TYPES } from '@/types/visualization';
import { formatDistanceToNow } from 'date-fns';
import { ChartPreview } from './ChartPreview';
import { Button } from '@/components/ui/Button';

interface SavedChartsProps {
  charts: ChartConfig[];
  onEdit: (chart: ChartConfig) => void;
  onDuplicate: (chart: ChartConfig) => Promise<{ success: boolean; error?: string }>;
  onDelete: (chartId: string) => Promise<{ success: boolean; error?: string }>;
  onShare: (chart: ChartConfig) => Promise<{ success: boolean; data?: any; error?: string }>;
}

export function SavedCharts({ charts, onEdit, onDuplicate, onDelete, onShare }: SavedChartsProps) {
  const [showActions, setShowActions] = useState<string | null>(null);
  const [previewChart, setPreviewChart] = useState<ChartConfig | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getChartTypeInfo = (type: string) => {
    return CHART_TYPES[type as keyof typeof CHART_TYPES] || {
      name: 'Unknown',
      description: 'Chart type',
      requiredAxes: [] as string[]
    };
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const handleAction = async (action: string, chart: ChartConfig) => {
    setShowActions(null);
    setActionLoading(`${action}-${chart.id}`);
    
    try {
      switch (action) {
        case 'edit':
          onEdit(chart);
          break;
        case 'duplicate':
          const dupResult = await onDuplicate(chart);
          if (!dupResult.success) console.error(dupResult.error);
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this chart?')) {
            const delResult = await onDelete(chart.id);
            if (!delResult.success) console.error(delResult.error);
          }
          break;
        case 'share':
          const result = await onShare(chart);
          if (result.success && result.data?.shareUrl && typeof navigator !== 'undefined' && navigator.clipboard) {
            await navigator.clipboard.writeText(result.data.shareUrl);
          }
          break;
        case 'preview':
          setPreviewChart(chart);
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} chart:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-10">
      <div className="bg-surface dark:bg-black/20 rounded-[3rem] border border-border dark:border-white/10 shadow-sm flex flex-col relative">
        <div className="px-10 py-8 border-b border-border/60 dark:border-white/10 bg-surface-secondary/30 dark:bg-white/5 flex items-center gap-4 rounded-t-[3rem]">
          <div className="p-3 bg-surface dark:bg-white/10 rounded-2xl border border-border dark:border-white/10 shadow-sm">
            <Layers className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase tracking-widest text-sm">Saved Charts</h3>
            <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5 opacity-80">Manage and share your visualizations</p>
          </div>
        </div>
        
        <div className="divide-y divide-border/30 dark:divide-white/10">
          {charts.map((chart, index) => {
            const typeInfo = getChartTypeInfo(chart.type);
            const chartId = chart.id || `chart-${index}`;
            const isLoading = actionLoading?.includes(chartId);
            const isLast = index === charts.length - 1;
            
            return (
              <div 
                key={chartId} 
                className={`px-10 py-8 group hover:bg-emerald-500/[0.02] dark:hover:bg-emerald-500/5 transition-all duration-300 ${isLast ? 'rounded-b-[3rem]' : ''}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-6 flex-1 min-w-0">
                    <div className="p-4 bg-surface-secondary/50 dark:bg-white/5 rounded-2xl border border-border dark:border-white/10 group-hover:border-emerald-500/20 transition-all shrink-0">
                      <BarChart3 className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h4 className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest truncate">
                          {chart.name || 'Untitled Chart'}
                        </h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {typeInfo.name.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-bold text-gray-400 dark:text-gray-500">
                        <div className="flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5" />
                          Axes: {chart.xAxis} {chart.yAxis ? `× ${chart.yAxis}` : ''}
                        </div>
                        <div className="flex items-center gap-2">
                           <Calendar className="w-3.5 h-3.5" />
                           Updated {formatDate(chart.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="rounded-xl px-5 font-black uppercase tracking-widest text-[9px] border-border/60"
                      onClick={() => handleAction('preview', chart)}
                      disabled={isLoading}
                    >
                      Preview
                    </Button>
                    <div className="relative">
                      <button
                        onClick={() => setShowActions(showActions === chartId ? null : chartId)}
                        disabled={isLoading}
                        className="p-3 hover:bg-surface-secondary/50 dark:hover:bg-white/5 rounded-xl border border-transparent hover:border-border dark:hover:border-white/10 transition-all disabled:opacity-50"
                      >
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>

                      {showActions === chartId && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={() => setShowActions(null)} />
                          <div className="absolute right-0 top-full mt-2 w-48 bg-surface dark:bg-gray-900 rounded-2xl shadow-2xl border border-border dark:border-white/10 py-2 z-30 animate-in fade-in zoom-in-95 duration-200">
                            <button
                              onClick={() => handleAction('edit', chart)}
                              className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-surface-secondary/50 dark:hover:bg-white/5 w-full text-left transition-colors rounded-t-2xl"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleAction('duplicate', chart)}
                              className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-surface-secondary/50 dark:hover:bg-white/5 w-full text-left transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                              Duplicate
                            </button>
                            <button
                              onClick={() => handleAction('share', chart)}
                              className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-surface-secondary/50 dark:hover:bg-white/5 w-full text-left transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                              Share
                            </button>
                            <div className="border-t border-border/40 dark:border-white/10 my-1 mx-2"></div>
                            <button
                              onClick={() => handleAction('delete', chart)}
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
              </div>
            );
          })}
        </div>
      </div>

      {previewChart && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <div className="bg-surface dark:bg-gray-900 rounded-[2rem] max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-border dark:border-white/10 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/60 dark:border-white/10 bg-surface-secondary/30 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 border border-emerald-500/20">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                    {previewChart.name || 'Untitled Chart'}
                  </h3>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5 opacity-60">Chart Preview</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewChart(null)}
                className="p-2 hover:bg-surface-secondary/50 dark:hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            <div className="p-8 overflow-auto flex-1 flex items-center justify-center bg-surface dark:bg-black/20">
              <div className="w-full bg-surface dark:bg-white/5 rounded-2xl p-6 border border-border dark:border-white/10">
                <ChartPreview config={previewChart} data={[]} isEmpty={false} />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-border/60 dark:border-white/10 bg-surface-secondary/20 dark:bg-white/5 gap-4">
              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <span className="opacity-50">ID:</span> 
                <span className="text-gray-700 dark:text-gray-300 font-mono">{previewChart.id || 'N/A'}</span>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button variant="secondary" onClick={() => setPreviewChart(null)} className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-black uppercase tracking-widest text-[9px] border-border/60">
                  Close
                </Button>
                <Button 
                  onClick={() => { previewChart && onEdit(previewChart); setPreviewChart(null); }} 
                  className="flex-1 sm:flex-none px-8 py-2.5 rounded-lg shadow-lg font-black uppercase tracking-widest text-[9px] bg-primary shadow-primary/20"
                >
                  Edit Chart
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}