/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
  getDashboardStats,
  getProgramProgress,
  getRegionalDistribution,
  DashboardStats,
  ProgramProgress,
  RegionalDistribution,
} from '@/lib/api/overview';

interface UseOverviewResult {
  dashboardStats: DashboardStats | null;
  programProgress: ProgramProgress[];
  regionalDistribution: RegionalDistribution[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useOverview(timeframe: string = '6months'): UseOverviewResult {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [programProgress, setProgramProgress] = useState<ProgramProgress[]>([]);
  const [regionalDistribution, setRegionalDistribution] = useState<RegionalDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [stats, progress, regional] = await Promise.all([
        getDashboardStats(timeframe),
        getProgramProgress(),
        getRegionalDistribution(),
      ]);

      setDashboardStats(stats);
      setProgramProgress(progress);
      setRegionalDistribution(regional);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch overview data');
      console.error('Error fetching overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  return {
    dashboardStats,
    programProgress,
    regionalDistribution,
    loading,
    error,
    refetch: fetchData,
  };
}
