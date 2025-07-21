'use client';

import { useState, useEffect, useCallback } from 'react';
import { getReports, getDashboardStats, ReportsFilters } from '@/lib/api/reports';

export interface Question {
  id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  settings?: unknown;
}

export interface Report {
  _id: string;
  title: string;
  description?: string;
  category: string;
  status: 'draft' | 'published' | 'closed';
  responseCount: number;
  createdAt: string;
  updatedAt: string;
  lastResponseAt?: string;
  questions?: Question[];
}

export interface DashboardStats {
  totalReports: number;
  activeReports: number;
  totalResponses: number;
  avgResponseRate: string;
}

export function useReports(filters: ReportsFilters = {}) {
  const [reports, setReports] = useState<Report[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalReports: 0,
    activeReports: 0,
    totalResponses: 0,
    avgResponseRate: '0%',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [reportsData, statsData] = await Promise.all([
        getReports(filters),
        getDashboardStats(),
      ]);

      setReports(reportsData.data || reportsData);
      setDashboardStats(statsData);

      // Handle pagination if present
      if (reportsData.pagination) {
        setPagination(reportsData.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const refetch = useCallback(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    dashboardStats,
    loading,
    error,
    pagination,
    refetch,
  };
}

// Hook for single report
export function useReport(id: string) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const { getReport } = await import('@/lib/api/reports');
      const reportData = await getReport(id);
      setReport(reportData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const refetch = useCallback(() => {
    fetchReport();
  }, [fetchReport]);

  return {
    report,
    loading,
    error,
    refetch,
  };
}