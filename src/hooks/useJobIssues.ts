import { useState, useEffect, useCallback, useRef } from 'react';
import {
  JobIssue,
  JobIssueCounts,
  JobIssueList,
  JobIssueStats,
  JobIssueStatus,
} from '@/types/job-issues';
import {
  getJobIssues,
  getIssueCounts,
  getIssueStats,
  getIssuesForJob,
  ApiError,
} from '@/lib/api/job-issues';

export function notifyIssuesChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('job-issues:changed'));
  }
}

let globalCounts: JobIssueCounts = { unread: 0, open: 0 };

export function useIssueCounts(options?: { skip?: boolean }) {
  const [counts, setCounts] = useState<JobIssueCounts>(globalCounts);
  const isForbiddenRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCounts = useCallback(async () => {
    if (options?.skip || isForbiddenRef.current) return;
    try {
      const data = await getIssueCounts();
      globalCounts = data;
      setCounts(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        isForbiddenRef.current = true;
        globalCounts = { unread: 0, open: 0 };
        setCounts({ unread: 0, open: 0 });
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
      // On other errors, keep the last value
    }
  }, [options?.skip]);

  useEffect(() => {
    if (options?.skip) return;

    fetchCounts();

    intervalRef.current = setInterval(() => {
      fetchCounts();
    }, 60000);

    const onFocus = () => {
      fetchCounts();
    };

    const onChanged = () => {
      fetchCounts();
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('job-issues:changed', onChanged);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('job-issues:changed', onChanged);
    };
  }, [fetchCounts, options?.skip]);

  return {
    unread: counts.unread,
    open: counts.open,
    refetch: fetchCounts,
  };
}

export function useIssueStats(options?: { organizationId?: string; skip?: boolean }) {
  const [stats, setStats] = useState<JobIssueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const organizationId = options?.organizationId || undefined;
  const skip = options?.skip || forbidden;

  const fetchStats = useCallback(async () => {
    if (skip) return;
    try {
      const data = await getIssueStats(organizationId);
      setStats(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setForbidden(true);
      }
      // On other errors, keep the last value
    } finally {
      setLoading(false);
    }
  }, [organizationId, skip]);

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchStats();

    const onRefresh = () => {
      fetchStats();
    };

    window.addEventListener('focus', onRefresh);
    window.addEventListener('job-issues:changed', onRefresh);

    return () => {
      window.removeEventListener('focus', onRefresh);
      window.removeEventListener('job-issues:changed', onRefresh);
    };
  }, [fetchStats, skip]);

  return {
    stats,
    loading,
    forbidden,
    refetch: fetchStats,
  };
}

export function useJobIssueList(params: {
  status?: JobIssueStatus;
  page?: number;
  limit?: number;
  organizationId?: string;
} = {}) {
  const [data, setData] = useState<JobIssueList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getJobIssues(params);
      setData(res);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Couldn't load messages.");
      }
    } finally {
      setLoading(false);
    }
  }, [params.status, params.page, params.limit, params.organizationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

export function useIssuesForJob(kycId?: string) {
  const [issues, setIssues] = useState<JobIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = useCallback(async () => {
    if (!kycId) {
      setIssues([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await getIssuesForJob(kycId);
      setIssues(res);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Couldn't load issues.");
      }
    } finally {
      setLoading(false);
    }
  }, [kycId]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  return {
    issues,
    loading,
    error,
    refetch: fetchIssues,
  };
}
