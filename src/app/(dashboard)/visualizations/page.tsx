/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, Suspense, useMemo } from 'react';
import { Upload, Database, BarChart3, Share2, Activity, Layers, PieChart, Info, Plus } from 'lucide-react';
import { VisualizationLoading } from '@/components/visualizations/VisualizationLoading';
import { VisualizationEmpty } from '@/components/visualizations/VisualizationEmpty';
import { ChartBuilder } from '@/components/visualizations/ChartBuilder';
import { DataSourceManager } from '@/components/visualizations/DataSourceManager';
import { SavedCharts } from '@/components/visualizations/SavedCharts';
import { CSVImportModal } from '@/components/visualizations/CSVImportModal';
import { ReportConnectionModal } from '@/components/visualizations/ReportConnectionModal';
import {
  useVisualizationStats,
  useDataSources,
  useCharts,
  useCsvImport,
  useReportsIntegration
} from '@/hooks/useVisualizations';
import { Button } from '@/components/ui/Button';

function StatsCard({ icon: Icon, title, value, color, bg }: {
  icon: React.ComponentType<any>;
  title: string;
  value: string | number;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-surface dark:bg-black/20 rounded-[2.5rem] border border-border dark:border-white/10 p-8 shadow-sm group hover:border-primary/20 transition-all duration-500 font-sans">
      <div className="flex items-center justify-between mb-6">
        <div className={`p-4 rounded-2xl ${bg} group-hover:scale-110 transition-transform duration-500 border border-border/20`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em] mb-2">{title}</p>
      <p className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{value}</p>
    </div>
  );
}

function VisualizationContent() {
  const [activeTab, setActiveTab] = useState<'data-sources' | 'chart-builder' | 'saved-charts'>('data-sources');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useVisualizationStats();
  const {
    dataSources,
    loading: dataSourcesLoading,
    error: dataSourcesError,
    deleteDataSource,
    previewDataSource,
    refetch: refetchDataSources
  } = useDataSources();

  const chartFilters = useMemo(() => ({}), []);

  const {
    charts,
    loading: chartsLoading,
    error: chartsError,
    createChart,
    duplicateChart,
    deleteChart,
    shareChart,
    refetch: refetchCharts
  } = useCharts(chartFilters);

  const { importCsv, uploading } = useCsvImport();
  const { createDataSourceFromReport } = useReportsIntegration();

  const isLoading = statsLoading || dataSourcesLoading || chartsLoading;
  const hasError = statsError || dataSourcesError || chartsError;

  if (isLoading) {
    return <VisualizationLoading />;
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 font-sans animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-error/10 rounded-3xl flex items-center justify-center mb-8 border border-error/20">
          <Info className="w-10 h-10 text-error" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-3">Sync Error</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10 font-bold text-center max-w-md uppercase tracking-wider opacity-70 leading-relaxed">
          {hasError}
        </p>
        <Button
          variant="primary"
          onClick={() => window.location.reload()}
          className="px-12 py-5 rounded-2xl shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[10px]"
        >
          Retry Connection
        </Button>
      </div>
    );
  }

  const hasData = dataSources.length > 0 || charts.length > 0;

  const handleImportCsv = async (file: File, mappings: any) => {
    try {
      const result = await importCsv(file, mappings);
      if (result.success) {
        setShowImportModal(false);
        await Promise.all([refetchDataSources(), refetchStats()]);
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Failed to import CSV' };
    }
  };

  const handleConnectReport = async (reportData: any) => {
    try {
      const result = await createDataSourceFromReport(reportData);
      if (result.success) {
        setShowReportModal(false);
        await Promise.all([refetchDataSources(), refetchStats()]);
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Failed to connect report' };
    }
  };

  const handleSaveChart = async (config: any) => {
    if (!config.name?.trim()) {
      config.name = `Chart-${new Date().getTime()}`;
    }

    try {
      const result = await createChart(config);
      if (result.success) {
        await Promise.all([refetchCharts(), refetchStats()]);
        setActiveTab('saved-charts');
        return { success: true };
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Failed to save chart' };
    }
  };

  const handleDeleteDataSource = async (id: string) => {
    try {
      const result = await deleteDataSource(id);
      if (result.success) {
        await refetchStats();
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Failed to delete data source' };
    }
  };

  const handlePreviewDataSource = async (dataSource: any) => {
    try {
      return await previewDataSource(dataSource.id);
    } catch (error) {
      return { success: false, error: 'Failed to preview data source' };
    }
  };

  const handleDuplicateChart = async (chart: any) => {
    try {
      const result = await duplicateChart(chart.id);
      if (result.success) {
        await refetchStats();
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Failed to duplicate chart' };
    }
  };

  const handleDeleteChart = async (chartId: string) => {
    try {
      const result = await deleteChart(chartId);
      if (result.success) {
        await refetchStats();
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Failed to delete chart' };
    }
  };

  const handleShareChart = async (chart: any) => {
    try {
      const result = await shareChart(chart.id);
      if (result.success && result.data) {
        await refetchStats();
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(result.data.shareUrl);
        }
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Failed to share chart' };
    }
  };

  const handleEditChart = (chart: any) => {
    setActiveTab('chart-builder');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 font-sans pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-4 md:px-0">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-2 h-10 bg-primary rounded-full"></div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Visualizations</h1>
              <p className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em] mt-1 opacity-70">Import data and create interactive charts and visualizations</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={() => setShowImportModal(true)}
            className="rounded-xl px-10 py-5 font-black uppercase tracking-widest text-[10px] border-border/60"
            icon={<Upload className="w-4 h-4" />}
          >
            Import CSV
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowReportModal(true)}
            className="rounded-xl px-12 py-5 shadow-2xl shadow-primary/20 font-black uppercase tracking-widest text-[10px]"
            icon={<Database className="w-4 h-4" />}
          >
             Connect Report
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {hasData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <StatsCard
            icon={Database}
            title="Data Sources"
            value={stats.totalDataSources}
            color="text-primary"
            bg="bg-primary/10"
          />
          <StatsCard
            icon={Layers}
            title="Total Records"
            value={stats.totalRecords.toLocaleString()}
            color="text-blue-500"
            bg="bg-blue-500/10"
          />
          <StatsCard
            icon={BarChart3}
            title="Active Charts"
            value={stats.activeCharts}
            color="text-emerald-500"
            bg="bg-emerald-500/10"
          />
          <StatsCard
            icon={Share2}
            title="Shared Assets"
            value={stats.sharedCharts}
            color="text-amber-500"
            bg="bg-amber-500/10"
          />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-border/40 dark:border-white/10 px-4 md:px-0">
        <nav className="flex space-x-12">
          {[
            { id: 'data-sources', label: 'Data Sources', icon: <Database className="w-4 h-4" /> },
            { id: 'chart-builder', label: 'Chart Builder', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'saved-charts', label: 'Saved Charts', icon: <PieChart className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`group flex items-center gap-3 py-6 px-1 border-b-[3px] font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-500 outline-none ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-300 hover:border-gray-200 dark:hover:border-gray-800'
                }`}
            >
              <span className={`transition-transform duration-500 ${activeTab === tab.id ? 'scale-125' : 'scale-100 group-hover:scale-125'}`}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Component Content */}
      <div className="animate-in fade-in duration-1000 min-h-[600px] px-4 md:px-0 mt-8">
        {activeTab === 'data-sources' && (
          dataSources.length === 0 ? (
            <div className="pt-4">
              <VisualizationEmpty
                activeTab={activeTab}
                onImportData={() => setShowImportModal(true)}
                onConnectReport={() => setShowReportModal(true)}
              />
            </div>
          ) : (
            <DataSourceManager
              dataSources={dataSources}
              onImport={() => setShowImportModal(true)}
              onConnectReport={() => setShowReportModal(true)}
              onDelete={handleDeleteDataSource}
              onPreview={handlePreviewDataSource}
            />
          )
        )}

        {activeTab === 'chart-builder' && (
          dataSources.length === 0 ? (
            <div className="pt-4">
              <VisualizationEmpty
                activeTab={activeTab}
                onImportData={() => setShowImportModal(true)}
                onConnectReport={() => setShowReportModal(true)}
              />
            </div>
          ) : (
            <ChartBuilder
              dataSources={dataSources}
              onSave={handleSaveChart}
              onPreview={() => { }}
            />
          )
        )}

        {activeTab === 'saved-charts' && (
          charts.length === 0 ? (
            <div className="pt-4">
              <VisualizationEmpty
                activeTab={activeTab}
                onSwitchToChartBuilder={() => setActiveTab('chart-builder')}
              />
            </div>
          ) : (
            <SavedCharts
              charts={charts}
              onEdit={handleEditChart}
              onDuplicate={handleDuplicateChart}
              onDelete={handleDeleteChart}
              onShare={handleShareChart}
            />
          )
        )}
      </div>

      <CSVImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportCsv}
        isUploading={uploading}
      />

      <ReportConnectionModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onConnect={handleConnectReport}
      />
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
