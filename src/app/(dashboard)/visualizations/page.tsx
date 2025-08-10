/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState, Suspense, useMemo } from 'react';
import { Plus, Upload, Database, BarChart3, Share2 } from 'lucide-react';
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

function VisualizationContent() {
  const [activeTab, setActiveTab] = useState<'chart-builder' | 'data-sources' | 'saved-charts'>('chart-builder');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const { stats, loading: statsLoading, error: statsError } = useVisualizationStats();
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
    updateChart, 
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-lg flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Data</h3>
          <p className="text-gray-500 mb-4">{hasError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasData = dataSources.length > 0 || charts.length > 0;

  // Event handlers
  const handleImportCsv = async (file: File, mappings: any) => {
    try {
      const result = await importCsv(file, mappings);
      if (result.success) {
        setShowImportModal(false);
        refetchDataSources();
      }
      return result;
    } catch (error) {
      console.error('CSV import error:', error);
      return { success: false, error: 'Failed to import CSV' };
    }
  };

  const handleConnectReport = async (reportData: any) => {
    try {
      const result = await createDataSourceFromReport(reportData);
      if (result.success) {
        setShowReportModal(false);
        refetchDataSources();
      }
      return result;
    } catch (error) {
      console.error('Report connection error:', error);
      return { success: false, error: 'Failed to connect report' };
    }
  };

  const handleSaveChart = async (config: any) => {
    try {
      const result = await createChart(config);
      if (result.success) {
        refetchCharts();
        setActiveTab('saved-charts');
      }
      return result;
    } catch (error) {
      console.error('Chart save error:', error);
      return { success: false, error: 'Failed to save chart' };
    }
  };

  const handleEditChart = (chart: any) => {
    setActiveTab('chart-builder');
  };

  const handleDeleteDataSource = async (id: string) => {
    try {
      const result = await deleteDataSource(id);
      return result;
    } catch (error) {
      console.error('Delete data source error:', error);
      return { success: false, error: 'Failed to delete data source' };
    }
  };

  const handlePreviewDataSource = async (dataSource: any) => {
    try {
      const result = await previewDataSource(dataSource.id);
      if (result.success) {
        console.log('Preview data:', result.data);
      }
      return result;
    } catch (error) {
      console.error('Preview error:', error);
      return { success: false, error: 'Failed to preview data source' };
    }
  };

  const handleDuplicateChart = async (chart: any) => {
    try {
      const result = await duplicateChart(chart.id);
      if (result.success) {
        refetchCharts();
      }
      return result;
    } catch (error) {
      console.error('Duplicate chart error:', error);
      return { success: false, error: 'Failed to duplicate chart' };
    }
  };

  const handleDeleteChart = async (chartId: string) => {
    try {
      const result = await deleteChart(chartId);
      if (result.success) {
        refetchCharts();
      }
      return result;
    } catch (error) {
      console.error('Delete chart error:', error);
      return { success: false, error: 'Failed to delete chart' };
    }
  };

  const handleShareChart = async (chart: any) => {
    try {
      const result = await shareChart(chart.id);
      if (result.success && result.data) {
        refetchCharts();
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(result.data.shareUrl);
        }
      }
      return result;
    } catch (error) {
      console.error('Share chart error:', error);
      return { success: false, error: 'Failed to share chart' };
    }
  };

  // Empty state handlers
  const handleImportData = () => setShowImportModal(true);
  const handleConnectReportModal = () => setShowReportModal(true);
  const handleCreateChart = () => setActiveTab('chart-builder');
  const handleSwitchToChartBuilder = () => setActiveTab('chart-builder');

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
            onClick={handleImportData}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import Data
          </button>
          <button
            onClick={handleCreateChart}
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
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'chart-builder'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Chart Builder
          </button>
          <button
            onClick={() => setActiveTab('data-sources')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'data-sources'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Data Sources
          </button>
          <button
            onClick={() => setActiveTab('saved-charts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
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
          dataSources.length === 0 ? (
            <VisualizationEmpty
              activeTab={activeTab}
              onImportData={handleImportData}
              onConnectReport={handleConnectReportModal}
            />
          ) : (
            <ChartBuilder
              dataSources={dataSources}
              onSave={handleSaveChart}
              onPreview={() => {}}
            />
          )
        )}

        {activeTab === 'data-sources' && (
          dataSources.length === 0 ? (
            <VisualizationEmpty
              activeTab={activeTab}
              onImportData={handleImportData}
              onConnectReport={handleConnectReportModal}
            />
          ) : (
            <DataSourceManager
              dataSources={dataSources}
              onImport={handleImportData}
              onConnectReport={handleConnectReportModal}
              onDelete={handleDeleteDataSource}
              onPreview={handlePreviewDataSource}
            />
          )
        )}

        {activeTab === 'saved-charts' && (
          charts.length === 0 ? (
            <VisualizationEmpty
              activeTab={activeTab}
              onSwitchToChartBuilder={handleSwitchToChartBuilder}
            />
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

      {/* Modals */}
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