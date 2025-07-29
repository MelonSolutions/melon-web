/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  getReports, 
  getDashboardStats, 
  getReport,
  createReport,
  updateReport,
  deleteReport,
  publishReport,
  duplicateReport,
  getShareLink,
  updateReportStatus,
  type ReportsFilters,
  type CreateReportRequest,
  type UpdateReportRequest,
  type DashboardStats 
} from '@/lib/api/reports';

export interface Question {
  id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  settings?: any;
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
  allowMultipleResponses?: boolean;
  collectEmail?: boolean;
  isPublic?: boolean;
  shareToken?: string;
}

// Hook for managing multiple reports
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

      const [reportsResponse, statsResponse] = await Promise.all([
        getReports(filters),
        getDashboardStats(),
      ]);

      // Handle different response structures
      if (Array.isArray(reportsResponse)) {
        setReports(reportsResponse);
      } else if (reportsResponse.data) {
        setReports(reportsResponse.data);
        if (reportsResponse.pagination) {
          setPagination(reportsResponse.pagination);
        }
      } else {
        setReports([]);
      }

      setDashboardStats(statsResponse);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching reports';
      setError(errorMessage);
      console.error('Error fetching reports:', err);
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

  // Create new report
  const createNewReport = useCallback(async (data: CreateReportRequest) => {
    try {
      const newReport = await createReport(data);
      await refetch();
      return newReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create report';
      throw new Error(errorMessage);
    }
  }, [refetch]);

  // Update existing report
  const updateExistingReport = useCallback(async (id: string, data: UpdateReportRequest) => {
    try {
      const updatedReport = await updateReport(id, data);
      await refetch();
      return updatedReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update report';
      throw new Error(errorMessage);
    }
  }, [refetch]);

  // Delete report
  const deleteExistingReport = useCallback(async (id: string) => {
    try {
      await deleteReport(id);
      await refetch();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete report';
      throw new Error(errorMessage);
    }
  }, [refetch]);

  // Publish report
  const publishExistingReport = useCallback(async (id: string) => {
    try {
      const publishedReport = await publishReport(id);
      await refetch();
      return publishedReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish report';
      throw new Error(errorMessage);
    }
  }, [refetch]);

  // Duplicate report
  const duplicateExistingReport = useCallback(async (id: string) => {
    try {
      const duplicatedReport = await duplicateReport(id);
      await refetch();
      return duplicatedReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate report';
      throw new Error(errorMessage);
    }
  }, [refetch]);

  // Update report status
  const updateStatus = useCallback(async (id: string, status: string) => {
    try {
      const updatedReport = await updateReportStatus(id, status);
      await refetch();
      return updatedReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update report status';
      throw new Error(errorMessage);
    }
  }, [refetch]);

  return {
    reports,
    dashboardStats,
    loading,
    error,
    pagination,
    refetch,
    createReport: createNewReport,
    updateReport: updateExistingReport,
    deleteReport: deleteExistingReport,
    publishReport: publishExistingReport,
    duplicateReport: duplicateExistingReport,
    updateStatus,
  };
}

// Hook for single report management
export function useReport(id: string) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const reportData = await getReport(id);
      setReport(reportData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch report';
      setError(errorMessage);
      console.error('Error fetching report:', err);
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

  // Update report
  const updateReportData = useCallback(async (data: UpdateReportRequest): Promise<Report> => {
    if (!id) throw new Error('No report ID provided');
    
    try {
      const updatedReport: Report = await updateReport(id, data);
      setReport(updatedReport);
      return updatedReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update report';
      throw new Error(errorMessage);
    }
  }, [id]);

  // Publish report
  const publishReportData = useCallback(async (): Promise<Report> => {
    if (!id) throw new Error('No report ID provided');
    
    try {
      const publishedReport: Report = await publishReport(id);
      setReport(publishedReport);
      return publishedReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish report';
      throw new Error(errorMessage);
    }
  }, [id]);

  // Get share link
  const getReportShareLink = useCallback(async (): Promise<{ shareToken: string; shareUrl: string }> => {
    if (!id) throw new Error('No report ID provided');
    
    try {
      return await getShareLink(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get share link';
      throw new Error(errorMessage);
    }
  }, [id]);

  // Update status
  const updateReportStatusData = useCallback(async (status: string): Promise<Report> => {
    if (!id) throw new Error('No report ID provided');
    
    try {
      const updatedReport: Report = await updateReportStatus(id, status);
      setReport(updatedReport);
      return updatedReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      throw new Error(errorMessage);
    }
  }, [id]);

  return {
    report,
    loading,
    error,
    refetch,
    updateReport: updateReportData,
    publishReport: publishReportData,
    getShareLink: getReportShareLink,
    updateStatus: updateReportStatusData,
  };
}

// Hook for report responses
export function useReportResponses(reportId: string) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResponses = useCallback(async () => {
    setLoading(false);
  }, [reportId]);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  return {
    responses,
    loading,
    error,
    refetch: fetchResponses,
  };
}