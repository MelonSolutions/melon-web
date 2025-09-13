'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  getImpactMetrics, 
  getImpactMetricsStats, 
  getImpactMetric,
  createImpactMetric,
  updateImpactMetric,
  deleteImpactMetric,
  duplicateImpactMetric,
  updateImpactMetricValue
} from '@/lib/api/impact-metrics';
import { 
  ImpactMetric, 
  ImpactMetricsStats, 
  ImpactMetricsFilters, 
  CreateImpactMetricRequest,
  UpdateImpactMetricRequest
} from '@/types/impact-metrics';

// Main impact metrics hook
export function useImpactMetrics(filters: ImpactMetricsFilters = {}) {
  const [metrics, setMetrics] = useState<ImpactMetric[]>([]);
  const [metricsStats, setMetricsStats] = useState<ImpactMetricsStats>({
    totalMetrics: 0,
    activeMetrics: 0,
    achieved: 0,
    failed: 0,
    avgPerformance: 0,
    onTrackPercentage: '0%',
    achievedPercentage: '0%',
    failedPercentage: '0%',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both metrics and stats in parallel
      const [metricsResponse, statsData] = await Promise.all([
        getImpactMetrics({
          ...filters,
          pageSize: filters.pageSize || 10,
          currentPage: filters.currentPage || 1,
        }),
        getImpactMetricsStats(),
      ]);

      setMetrics(metricsResponse.data);
      setMetricsStats(statsData);
      
      if (metricsResponse.pagination) {
        setPagination(metricsResponse.pagination);
      }
    } catch (err) {
      console.error('Error fetching impact metrics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load impact metrics data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    metrics,
    metricsStats,
    loading,
    error,
    pagination,
    refetch,
  };
}

// Single impact metric hook
export function useImpactMetric(id: string) {
  const [metric, setMetric] = useState<ImpactMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetric = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const metricData = await getImpactMetric(id);
      setMetric(metricData);
    } catch (err) {
      console.error('Error fetching impact metric:', err);
      setError(err instanceof Error ? err.message : 'Failed to load impact metric');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMetric();
  }, [fetchMetric]);

  const refetch = useCallback(() => {
    fetchMetric();
  }, [fetchMetric]);

  return {
    metric,
    loading,
    error,
    refetch,
  };
}

// Impact metrics actions hook
export function useImpactMetricActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNewMetric = useCallback(async (data: CreateImpactMetricRequest): Promise<ImpactMetric | null> => {
    try {
      setLoading(true);
      setError(null);

      const metric = await createImpactMetric(data);
      return metric;
    } catch (err) {
      console.error('Error creating impact metric:', err);
      setError(err instanceof Error ? err.message : 'Failed to create impact metric');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExistingMetric = useCallback(async (id: string, data: UpdateImpactMetricRequest): Promise<ImpactMetric | null> => {
    try {
      setLoading(true);
      setError(null);

      const metric = await updateImpactMetric(id, data);
      return metric;
    } catch (err) {
      console.error('Error updating impact metric:', err);
      setError(err instanceof Error ? err.message : 'Failed to update impact metric');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMetricValue = useCallback(async (id: string, actualValue: number): Promise<ImpactMetric | null> => {
    try {
      setLoading(true);
      setError(null);

      const metric = await updateImpactMetricValue(id, actualValue);
      return metric;
    } catch (err) {
      console.error('Error updating metric value:', err);
      setError(err instanceof Error ? err.message : 'Failed to update metric value');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const duplicateExistingMetric = useCallback(async (id: string): Promise<ImpactMetric | null> => {
    try {
      setLoading(true);
      setError(null);

      const metric = await duplicateImpactMetric(id);
      return metric;
    } catch (err) {
      console.error('Error duplicating impact metric:', err);
      setError(err instanceof Error ? err.message : 'Failed to duplicate impact metric');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteExistingMetric = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await deleteImpactMetric(id);
      return true;
    } catch (err) {
      console.error('Error deleting impact metric:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete impact metric');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createMetric: createNewMetric,
    updateMetric: updateExistingMetric,
    updateValue: updateMetricValue,
    duplicateMetric: duplicateExistingMetric,
    deleteMetric: deleteExistingMetric,
  };
}