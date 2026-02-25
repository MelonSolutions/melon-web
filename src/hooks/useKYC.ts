/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect, useCallback } from 'react';
import { 
  getKYCUsers, 
  getKYCUser, 
  getKYCDashboardStats,
  ApiError 
} from '@/lib/api/kyc';
import { KYCUser, KYCDashboardStats } from '@/types/kyc';

interface PaginationData {
  total: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  nextPage?: number;
  hasPreviousPage: boolean;
}

interface UseKYCUsersResult {
  users: KYCUser[];
  dashboardStats: KYCDashboardStats;
  pagination: PaginationData;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
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
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ← ADD THIS: Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters?.search, filters?.status, filters?.identityType]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [response, statsData] = await Promise.all([
        getKYCUsers({ ...filters, page: currentPage }),
        getKYCDashboardStats(),
      ]);
      
      if (response.data && response.pagination) {
        setUsers(response.data);
        setPagination(response.pagination);
      } else {
        setUsers(Array.isArray(response) ? response : []);
      }
      
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
  }, [filters?.search, filters?.status, filters?.identityType, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    users,
    dashboardStats,
    pagination,
    loading,
    error,
    refetch: fetchData,
    setPage,
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
