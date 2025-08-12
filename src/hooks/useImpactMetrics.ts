/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';

interface Metric {
  id: string;
  label: string;
  unit: string;
  sector: string;
  actualValue: number;
  targetValue: number;
  status: 'achieved' | 'on-track' | 'failed';
  progress: number;
  weight: number;
  lastUpdated: string;
  isAutoUpdated: boolean;
  linkedToReport: boolean;
}

interface MetricsStats {
  totalMetrics: number;
  achieved: number;
  failed: number;
  avgPerformance: number;
  achievedPercentage: number;
  failedPercentage: number;
}

interface UseImpactMetricsReturn {
  metrics: Metric[];
  metricsStats: MetricsStats;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const mockMetrics: Metric[] = [
  {
    id: '1',
    label: 'Households Reached',
    unit: 'households',
    sector: 'Health',
    actualValue: 870,
    targetValue: 1000,
    status: 'on-track',
    progress: 87,
    weight: 20,
    lastUpdated: '2 hours ago',
    isAutoUpdated: true,
    linkedToReport: true,
  },
  {
    id: '2',
    label: 'Students Enrolled',
    unit: 'students',
    sector: 'Education',
    actualValue: 520,
    targetValue: 500,
    status: 'achieved',
    progress: 104,
    weight: 25,
    lastUpdated: '1 day ago',
    isAutoUpdated: true,
    linkedToReport: true,
  },
  {
    id: '3',
    label: 'Clean Water Access',
    unit: 'people',
    sector: 'Infrastructure',
    actualValue: 340,
    targetValue: 800,
    status: 'failed',
    progress: 43,
    weight: 30,
    lastUpdated: '3 days ago',
    isAutoUpdated: false,
    linkedToReport: false,
  },
  {
    id: '4',
    label: 'Microloans Disbursed',
    unit: 'loans',
    sector: 'Finance',
    actualValue: 150,
    targetValue: 200,
    status: 'on-track',
    progress: 75,
    weight: 25,
    lastUpdated: '1 day ago',
    isAutoUpdated: true,
    linkedToReport: true,
  },
];

export function useImpactMetrics(filters: {
  search: string;
  status: string;
  sector: string;
  timeframe: string;
}): UseImpactMetricsReturn {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterMetrics = (metrics: Metric[]) => {
    return metrics.filter(metric => {
      const matchesSearch = !filters.search || 
        metric.label.toLowerCase().includes(filters.search.toLowerCase()) ||
        metric.sector.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || metric.status === filters.status;
      const matchesSector = !filters.sector || metric.sector.toLowerCase() === filters.sector.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesSector;
    });
  };

  const calculateStats = (metrics: Metric[]): MetricsStats => {
    const totalMetrics = metrics.length;
    const achieved = metrics.filter(m => m.status === 'achieved').length;
    const failed = metrics.filter(m => m.status === 'failed').length;
    const avgPerformance = totalMetrics > 0 
      ? Math.round(metrics.reduce((sum, m) => sum + m.progress, 0) / totalMetrics)
      : 0;
    
    return {
      totalMetrics,
      achieved,
      failed,
      avgPerformance,
      achievedPercentage: totalMetrics > 0 ? Math.round((achieved / totalMetrics) * 100) : 0,
      failedPercentage: totalMetrics > 0 ? Math.round((failed / totalMetrics) * 100) : 0,
    };
  };

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const filteredMetrics = filterMetrics(mockMetrics);
      setMetrics(filteredMetrics);
    } catch (err) {
      setError('Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchMetrics();
  };

  useEffect(() => {
    fetchMetrics();
  }, [filters.search, filters.status, filters.sector, filters.timeframe]);

  const metricsStats = calculateStats(metrics);

  return {
    metrics,
    metricsStats,
    loading,
    error,
    refetch,
  };
}
