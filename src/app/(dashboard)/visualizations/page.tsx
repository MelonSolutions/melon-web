/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, Suspense, useMemo } from 'react';
import { Upload, Database, BarChart3, Share2, Users } from 'lucide-react';
import { VisualizationLoading } from '@/components/visualizations/VisualizationLoading';
import { VisualizationEmpty } from '@/components/visualizations/VisualizationEmpty';
import { ChartBuilder } from '@/components/visualizations/ChartBuilder';
import { DataSourceManager } from '@/components/visualizations/DataSourceManager';
import { SavedCharts } from '@/components/visualizations/SavedCharts';
import { CSVImportModal } from '@/components/visualizations/CSVImportModal';
import { ReportConnectionModal } from '@/components/visualizations/ReportConnectionModal';
import { KYCConnectionModal } from '@/components/visualizations/KYCConnectionModal';
import {
  useVisualizationStats,
  useDataSources,
  useCharts,
  useCsvImport,
  useReportsIntegration,
  useKYCIntegration
} from '@/hooks/useVisualizations';

function StatsCard({ icon: Icon, title, value }: {
  icon: React.ComponentType<any>;
  title: string;
  value: string | number;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
}

function VisualizationContent() {
  const [activeTab, setActiveTab] = useState<'data-sources' | 'chart-builder' | 'saved-charts'>('data-sources');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);

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
  const { createDataSourceFromKYC } = useKYCIntegration();

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

  const handleConnectKYC = async (kycData: any) => {
    try {
      const result = await createDataSourceFromKYC(kycData);
      if (result.success) {
        setShowKYCModal(false);
        await Promise.all([refetchDataSources(), refetchStats()]);
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Failed to connect KYC data' };
    }
  };

  const handleSaveChart = async (config: any) => {
    if (!config.name?.trim()) {
      config.name = `Chart ${new Date().toLocaleString()}`;
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
      // Extract ID properly - support both 'id' and '_id' fields
      const dataSourceId = dataSource.id || dataSource._id;
      if (!dataSourceId) {
        return { success: false, error: 'Data source ID is missing' };
      }
      return await previewDataSource(dataSourceId);
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Visualizations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Import data and create interactive charts and visualizations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowKYCModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Users className="w-4 h-4" />
            Connect KYC Data
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Database className="w-4 h-4" />
            Connect Survey Data
          </button>
        </div>
      </div>

      {hasData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            icon={Database}
            title="Data Sources"
            value={stats.totalDataSources}
          />
          <StatsCard
            icon={Database}
            title="Total Records"
            value={stats.totalRecords.toLocaleString()}
          />
          <StatsCard
            icon={BarChart3}
            title="Active Charts"
            value={stats.activeCharts}
          />
          <StatsCard
            icon={Share2}
            title="Shared"
            value={stats.sharedCharts}
          />
        </div>
      )}

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('data-sources')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'data-sources'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Data Sources
          </button>
          <button
            onClick={() => setActiveTab('chart-builder')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'chart-builder'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Chart Builder
          </button>
          <button
            onClick={() => setActiveTab('saved-charts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'saved-charts'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Saved Charts
          </button>
        </nav>
      </div>

      <div className="min-h-[600px]">
        {activeTab === 'data-sources' && (
          dataSources.length === 0 ? (
            <VisualizationEmpty
              activeTab={activeTab}
              onImportData={() => setShowImportModal(true)}
              onConnectReport={() => setShowReportModal(true)}
            />
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
            <VisualizationEmpty
              activeTab={activeTab}
              onImportData={() => setShowImportModal(true)}
              onConnectReport={() => setShowReportModal(true)}
            />
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
            <VisualizationEmpty
              activeTab={activeTab}
              onSwitchToChartBuilder={() => setActiveTab('chart-builder')}
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

      <KYCConnectionModal
        isOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        onConnect={handleConnectKYC}
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