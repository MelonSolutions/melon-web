/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  getResponsesByReport,
  getResponseDetails,
  getResponseAnalytics,
  getImpactMetricsProgress,
  submitResponse,
  type ReportResponse,
  type ResponseAnalytics,
  type ImpactMetricsProgressResponse,
  type CreateResponseRequest,
} from '@/lib/api/responses';

export function useReportResponses(reportId: string, pagination: { pageSize?: number; currentPage?: number } = {}) {
  const [responses, setResponses] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  const fetchResponses = useCallback(async () => {
    if (!reportId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await getResponsesByReport(reportId, pagination);
      setResponses(result.data || []);
      setPaginationInfo(result.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch responses';
      setError(errorMessage);
      console.error('Error fetching responses:', err);
    } finally {
      setLoading(false);
    }
  }, [reportId, pagination.pageSize, pagination.currentPage]);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  const refetch = useCallback(() => {
    fetchResponses();
  }, [fetchResponses]);

  return {
    responses,
    loading,
    error,
    pagination: paginationInfo,
    refetch,
  };
}

export function useResponse(responseId: string) {
  const [response, setResponse] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResponse = useCallback(async () => {
    if (!responseId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const responseData = await getResponseDetails(responseId);
      setResponse(responseData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch response';
      setError(errorMessage);
      console.error('Error fetching response:', err);
    } finally {
      setLoading(false);
    }
  }, [responseId]);

  useEffect(() => {
    fetchResponse();
  }, [fetchResponse]);

  const refetch = useCallback(() => {
    fetchResponse();
  }, [fetchResponse]);

  return {
    response,
    loading,
    error,
    refetch,
  };
}

export function useResponseAnalytics(reportId: string) {
  const [analytics, setAnalytics] = useState<ResponseAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!reportId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const analyticsData = await getResponseAnalytics(reportId);
      setAnalytics(analyticsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const refetch = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch,
  };
}

export function useImpactMetricsProgress(reportId: string) {
  const [progress, setProgress] = useState<ImpactMetricsProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!reportId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const progressData = await getImpactMetricsProgress(reportId);
      setProgress(progressData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch impact metrics progress';
      setError(errorMessage);
      console.error('Error fetching impact metrics progress:', err);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const refetch = useCallback(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    loading,
    error,
    refetch,
  };
}

export function useResponseSubmission() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitResponseData = useCallback(async (data: CreateResponseRequest) => {
    try {
      setLoading(true);
      setError(null);

      const result = await submitResponse(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit response';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    submitResponse: submitResponseData,
    loading,
    error,
  };
}