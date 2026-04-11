/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Download, Save, Settings2, Eye, Info, Loader2 } from 'lucide-react';
import { 
  DataSource, 
  ChartConfig, 
  ChartType, 
  AggregationType,
  CHART_TYPES,
  AGGREGATION_TYPES
} from '@/types/visualization';
import { ChartPreview } from './ChartPreview';
import { Button } from '@/components/ui/Button';

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
      colors: ['#5B94E5'],
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
        data[chartConfig.yAxis] = Math.floor(Math.random() * 100) + 10;
      } else {
        data['count'] = Math.floor(Math.random() * 50) + 5;
      }
      return data;
    });

    setPreviewData(mockData);
    onPreview(mockData);
  };

  const handleConfigChange = (key: keyof ChartConfig, value: any) => {
    setChartConfig(prev => ({ ...prev, [key]: value }));
    if (key === 'type') {
      const chartType = CHART_TYPES[value as ChartType];
      if (chartType) {
        setChartConfig(prev => ({
          ...prev,
          ...(!chartType.requiredAxes.includes('y') && { yAxis: undefined }),
          ...(!chartType.requiredAxes.includes('groupBy') && { groupBy: undefined })
        }));
      }
    }
  };

  const handleDataSourceChange = (selectedId: string) => {
    const foundDataSource = normalizedDataSources.find(ds => ds.id === selectedId);
    setSelectedDataSource(foundDataSource || null);
    if (foundDataSource) {
      setChartConfig(prev => ({
        ...prev,
        dataSourceId: foundDataSource.id,
        xAxis: undefined,
        yAxis: undefined,
      }));
    }
  };

  const handleSaveChart = async () => {
    if (!canCreateChart) return;
    setIsSaving(true);
    try {
      const saveConfig = { ...chartConfig, dataSourceId: selectedDataSource?.id };
      const result = await onSave(saveConfig);
      if (result.success) {
        setChartConfig({ type: 'bar', aggregation: 'count', styling: { colors: ['#5B94E5'], showLegend: true, showGrid: true, height: 400 }, filters: [] });
        setSelectedDataSource(null);
        setPreviewData([]);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportChart = async () => {
    if (!canCreateChart) return;
    setIsExporting(true);
    try {
      const exportData = { chartConfig, dataSource: selectedDataSource?.name, previewData, exportedAt: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${chartConfig.name || 'visualization-export'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const canCreateChart = selectedDataSource && chartConfig.type && chartConfig.xAxis;

  const inputClasses = "w-full px-6 py-4 bg-surface-secondary/30 dark:bg-white/5 border border-border dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary transition-all outline-none text-[11px] font-black uppercase tracking-widest appearance-none cursor-pointer hover:border-primary/20";
  const labelClasses = "text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.22em] flex items-center gap-2 mb-3";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-4 space-y-8">
        <div className="bg-surface dark:bg-black/20 rounded-[2.5rem] border border-border dark:border-white/10 p-10 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase tracking-widest text-sm">Chart Settings</h3>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1 opacity-70">Define chart properties and data mapping</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <label className={labelClasses}>Chart Title</label>
              <input type="text" value={chartConfig.name || ''} onChange={(e) => handleConfigChange('name', e.target.value)} className={inputClasses} placeholder="Enter title" />
            </div>
            <div className="space-y-2">
              <label className={labelClasses}>Data Source</label>
              <select value={selectedDataSource?.id || ''} onChange={(e) => handleDataSourceChange(e.target.value)} className={inputClasses}>
                <option value="" className="dark:bg-gray-900">Select source</option>
                {normalizedDataSources.map((ds) => (
                  <option key={ds.id} value={ds.id} className="dark:bg-gray-900">{ds.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className={labelClasses}>Chart Type</label>
              <select value={chartConfig.type || 'bar'} onChange={(e) => handleConfigChange('type', e.target.value as ChartType)} className={inputClasses}>
                {Object.entries(CHART_TYPES).map(([type, config]) => (
                  <option key={type} value={type} className="dark:bg-gray-900">{config.name.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {selectedDataSource && selectedDataSource.columns && (
              <>
                <div className="space-y-2">
                  <label className={labelClasses}>X-Axis Column</label>
                  <select value={chartConfig.xAxis || ''} onChange={(e) => handleConfigChange('xAxis', e.target.value)} className={inputClasses}>
                    <option value="" className="dark:bg-gray-900">Select column</option>
                    {selectedDataSource.columns.map((col) => (
                      <option key={col.name} value={col.name} className="dark:bg-gray-900">{col.name}</option>
                    ))}
                  </select>
                </div>
                {CHART_TYPES[chartConfig.type as ChartType]?.requiredAxes.includes('y') && (
                  <div className="space-y-2">
                    <label className={labelClasses}>Y-Axis Column</label>
                    <select value={chartConfig.yAxis || ''} onChange={(e) => handleConfigChange('yAxis', e.target.value)} className={inputClasses}>
                      <option value="" className="dark:bg-gray-900">Auto-count</option>
                      {selectedDataSource.columns.filter(col => col.type === 'number').map((col) => (
                        <option key={col.name} value={col.name} className="dark:bg-gray-900">{col.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="space-y-2">
                  <label className={labelClasses}>Aggregation</label>
                  <select value={chartConfig.aggregation || 'count'} onChange={(e) => handleConfigChange('aggregation', e.target.value as AggregationType)} className={inputClasses}>
                    {Object.entries(AGGREGATION_TYPES).map(([type, config]) => (
                      <option key={type} value={type} className="dark:bg-gray-900">{config.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 space-y-8">
        <div className="bg-surface dark:bg-black/20 rounded-[3rem] border border-border dark:border-white/10 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          <div className="px-10 py-8 border-b border-border/60 dark:border-white/10 bg-surface-secondary/30 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-surface dark:bg-white/10 rounded-2xl border border-border dark:border-white/10 shadow-sm">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest text-sm">Preview</h3>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={handleExportChart} disabled={!canCreateChart || isExporting} className="rounded-xl px-6 font-black uppercase tracking-widest text-[9px] border-border/60" icon={<Download className="w-3.5 h-3.5" />}>Export</Button>
              <Button onClick={handleSaveChart} disabled={!canCreateChart || isSaving} className="rounded-xl px-8 shadow-xl font-black uppercase tracking-widest text-[9px] bg-primary shadow-primary/20" icon={isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}>Save Chart</Button>
            </div>
          </div>

          <div className="flex-1 p-10 flex flex-col items-center justify-center">
             {!canCreateChart ? (
               <div className="flex flex-col items-center justify-center text-center max-w-sm">
                 <div className="w-20 h-20 bg-surface-secondary rounded-[2rem] flex items-center justify-center mb-6 border border-border">
                    <BarChart3 className="w-10 h-10 text-gray-300 animate-pulse" />
                 </div>
                 <h4 className="text-[13px] font-black uppercase tracking-widest mb-2">No Data Selected</h4>
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">Select a data source and configuration to see the chart preview.</p>
               </div>
             ) : (
               <div className="w-full h-full">
                  <ChartPreview config={chartConfig as ChartConfig} data={previewData} isEmpty={!canCreateChart} />
               </div>
             )}
          </div>

          {canCreateChart && (
            <div className="px-10 py-8 border-t border-border/60 dark:border-white/10 bg-surface-secondary/10 dark:bg-white/5">
              <div className="flex items-center gap-4 mb-6">
                 <Info className="w-4 h-4 text-primary" />
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Visualization Summary</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Type', value: CHART_TYPES[chartConfig.type as ChartType]?.name },
                  { label: 'X-Axis', value: chartConfig.xAxis },
                  { label: 'Y-Axis', value: chartConfig.yAxis || 'Auto-Count' },
                  { label: 'Aggregation', value: chartConfig.aggregation },
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase truncate">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}