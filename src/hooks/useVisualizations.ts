/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/hooks/useVisualizations.ts - Fixed to prevent infinite loops

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  DataSource, 
  ChartConfig, 
  VisualizationStats 
} from '@/types/visualization';
import * as visualizationsAPI from '@/lib/api/visualizations';

export const useVisualizationStats = () => {
  const [stats, setStats] = useState<VisualizationStats>({
    totalDataSources: 0,
    totalRecords: 0,
    activeCharts: 0,
    sharedCharts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const fetchStats = useCallback(async () => {
    if (hasInitialized.current) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching dashboard stats...');
      const data = await visualizationsAPI.getDashboardStats();
      setStats(data);
      hasInitialized.current = true;
    } catch (err) {
      console.error('❌ Failed to fetch stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    hasInitialized.current = false;
    await fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch };
};

export const useDataSources = (type?: string) => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);
  const currentType = useRef(type);

  const fetchDataSources = useCallback(async () => {
    if (hasInitialized.current && currentType.current === type) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching data sources...', type ? `(type: ${type})` : '');
      const data = await visualizationsAPI.getDataSources(type);
      setDataSources(data);
      hasInitialized.current = true;
      currentType.current = type;
    } catch (err) {
      console.error('❌ Failed to fetch data sources:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data sources');
    } finally {
      setLoading(false);
    }
  }, [type]);

  const refetch = useCallback(async () => {
    hasInitialized.current = false;
    await fetchDataSources();
  }, [fetchDataSources]);

  const deleteDataSource = useCallback(async (id: string) => {
    try {
      await visualizationsAPI.deleteDataSource(id);
      setDataSources(prev => prev.filter(ds => ds.id !== id));
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete data source';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const previewDataSource = useCallback(async (id: string) => {
    try {
      const preview = await visualizationsAPI.previewDataSource(id);
      return { success: true, data: preview };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to preview data source';
      return { success: false, error: message };
    }
  }, []);

  useEffect(() => {
    fetchDataSources();
  }, [fetchDataSources]);

  return {
    dataSources,
    loading,
    error,
    refetch,
    deleteDataSource,
    previewDataSource,
  };
};

export const useCharts = (filters: {
  pageSize?: number;
  currentPage?: number;
  status?: string;
  type?: string;
  search?: string;
} = {}) => {
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);
  const currentFilters = useRef(JSON.stringify(filters));

  const fetchCharts = useCallback(async () => {
    const filtersString = JSON.stringify(filters);
    if (hasInitialized.current && currentFilters.current === filtersString) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching charts...', filters);
      const response = await visualizationsAPI.getCharts(filters);
      setCharts(response.data);
      setPagination(response.pagination);
      hasInitialized.current = true;
      currentFilters.current = filtersString;
    } catch (err) {
      console.error('❌ Failed to fetch charts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch charts');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  const refetch = useCallback(async () => {
    hasInitialized.current = false;
    await fetchCharts();
  }, [fetchCharts]);

  const createChart = useCallback(async (data: Partial<ChartConfig>) => {
    try {
      const newChart = await visualizationsAPI.createChart(data);
      setCharts(prev => [newChart, ...prev]);
      return { success: true, data: newChart };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create chart';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const updateChart = useCallback(async (id: string, data: Partial<ChartConfig>) => {
    try {
      const updatedChart = await visualizationsAPI.updateChart(id, data);
      setCharts(prev => prev.map(chart => 
        chart.id === id ? updatedChart : chart
      ));
      return { success: true, data: updatedChart };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update chart';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const duplicateChart = useCallback(async (id: string) => {
    try {
      const duplicatedChart = await visualizationsAPI.duplicateChart(id);
      setCharts(prev => [duplicatedChart, ...prev]);
      return { success: true, data: duplicatedChart };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to duplicate chart';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const deleteChart = useCallback(async (id: string) => {
    try {
      await visualizationsAPI.deleteChart(id);
      setCharts(prev => prev.filter(chart => chart.id !== id));
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete chart';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const shareChart = useCallback(async (id: string) => {
    try {
      const shareInfo = await visualizationsAPI.shareChart(id);
      setCharts(prev => prev.map(chart => 
        chart.id === id ? { ...chart, shareToken: shareInfo.shareToken } : chart
      ));
      return { success: true, data: shareInfo };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to share chart';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  useEffect(() => {
    fetchCharts();
  }, [fetchCharts]);

  return {
    charts,
    pagination,
    loading,
    error,
    refetch,
    createChart,
    updateChart,
    duplicateChart,
    deleteChart,
    shareChart,
  };
};

export const useChartData = (chartId: string | null) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateChartData = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await visualizationsAPI.generateChartData(id);
      setChartData(data);
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate chart data';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (chartId) {
      generateChartData(chartId);
    }
  }, [chartId, generateChartData]);

  return {
    chartData,
    loading,
    error,
    generateChartData,
  };
};

export const useCsvImport = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importCsv = useCallback(async (file: File, mappings: any) => {
    try {
      setUploading(true);
      setError(null);

      // Create FormData with proper structure
      const formData = new FormData();
      
      // Append the file first
      formData.append('file', file);
      
      // Append metadata as individual fields - ensure none are undefined
      formData.append('name', mappings.name?.toString() || file.name.replace('.csv', ''));
      formData.append('description', mappings.description?.toString() || '');
      formData.append('fileName', mappings.fileName?.toString() || file.name);
      formData.append('hasHeader', mappings.hasHeader?.toString() || 'true');
      formData.append('delimiter', mappings.delimiter?.toString() || ',');
      
      // Serialize complex objects to JSON strings - ensure array exists
      if (mappings.columnMappings && Array.isArray(mappings.columnMappings) && mappings.columnMappings.length > 0) {
        const cleanMappings = mappings.columnMappings.map((mapping: any) => ({
          name: mapping.name?.toString() || '',
          displayName: mapping.displayName?.toString() || mapping.name?.toString() || '',
          type: mapping.type?.toString() || 'string'
        }));
        formData.append('columnMappings', JSON.stringify(cleanMappings));
      } else {
        // Fallback: create basic mappings from file headers
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const basicMappings = headers.map(header => ({
            name: header,
            displayName: header.toLowerCase().replace(/\s+/g, '_'),
            type: 'string'
          }));
          formData.append('columnMappings', JSON.stringify(basicMappings));
        }
      }
      
      // Add any additional metadata
      if (mappings.totalRows) {
        formData.append('totalRows', mappings.totalRows.toString());
      }

      console.log('🔄 Calling importCsvFile API...');
      
      // Log what we're sending for debugging
      console.log('📝 FormData contents:');
      for (const [key, value] of formData.entries()) {
        if (key === 'file') {
          console.log(`  ${key}: File(${(value as File).name}, ${(value as File).size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
      
      const result = await visualizationsAPI.importCsvFile(formData);
      console.log('✅ Import result:', result);
      
      return { success: true, data: result };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import CSV';
      console.error('❌ CSV import hook error:', message);
      setError(message);
      return { success: false, error: message };
    } finally {
      setUploading(false);
    }
  }, []);

  const downloadSample = useCallback(async () => {
    try {
      const blob = await visualizationsAPI.downloadSampleCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sample_data.csv';
      a.click();
      URL.revokeObjectURL(url);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download sample';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  return {
    uploading,
    error,
    importCsv,
    downloadSample,
  };
};

export const useReportsIntegration = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const fetchAvailableReports = useCallback(async () => {
    if (hasInitialized.current) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching available reports...');
      const data = await visualizationsAPI.getAvailableReports();
      setReports(data);
      hasInitialized.current = true;
    } catch (err) {
      console.error('❌ Failed to fetch reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    hasInitialized.current = false;
    await fetchAvailableReports();
  }, [fetchAvailableReports]);

  const getReportFields = useCallback(async (reportId: string) => {
    try {
      const fields = await visualizationsAPI.getReportFields(reportId);
      return { success: true, data: fields };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch report fields';
      return { success: false, error: message };
    }
  }, []);

  const createDataSourceFromReport = useCallback(async (data: {
    name: string;
    description?: string;
    reportId: string;
    selectedFields?: string[];
    dateRange?: string;
  }) => {
    try {
      const result = await visualizationsAPI.createDataSourceFromReport(data);
      return { success: true, data: result };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create data source from report';
      return { success: false, error: message };
    }
  }, []);

  // Only fetch on mount, not on every render
  useEffect(() => {
    // Don't auto-fetch reports - only fetch when modal is opened
    // fetchAvailableReports();
  }, []);

  return {
    reports,
    loading,
    error,
    refetch: fetchAvailableReports, // Renamed to be more explicit
    getReportFields,
    createDataSourceFromReport,
  };
};