/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect, useCallback } from 'react';
import { 
  getKYCUsers, 
  getKYCUser, 
  getKYCDashboardStats,
  ApiError 
} from '@/lib/api/kyc';
import { KYCUser, KYCDashboardStats } from '@/types/kyc';

interface UseKYCUsersResult {
  users: KYCUser[];
  dashboardStats: KYCDashboardStats;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useKYCUsers(filters?: {
  search?: string;
  status?: string;
  identityType?: string;
}): UseKYCUsersResult {
  const [users, setUsers] = useState<KYCUser[]>([]);
  const [dashboardStats, setDashboardStats] = useState<KYCDashboardStats>({
    totalUsers: 0,
    pending: 0,
    assigned: 0,
    inReview: 0,
    verificationSubmitted: 0,
    verified: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usersData, statsData] = await Promise.all([
        getKYCUsers(filters),
        getKYCDashboardStats(),
      ]);
      
      setUsers(usersData);
      setDashboardStats(statsData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch KYC data');
      }
      console.error('Error fetching KYC data:', err);
    } finally {
      setLoading(false);
    }
  }, [filters?.search, filters?.status, filters?.identityType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    users,
    dashboardStats,
    loading,
    error,
    refetch: fetchData,
  };
}

interface UseKYCUserResult {
  user: KYCUser | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useKYCUser(id: string): UseKYCUserResult {
  const [user, setUser] = useState<KYCUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getKYCUser(id);
      setUser(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch user data');
      }
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
}
