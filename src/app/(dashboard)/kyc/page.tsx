/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useKYCUsers } from '@/hooks/useKYC';
import {
  Search,
  Download,
  Grid3x3,
  List,
  RefreshCw,
  FileText,
  Plus,
  BarChart3,
  TrendingUp,
  MapPin,
  Upload,
  Filter,
  RotateCcw,
  Loader2,
  Trash2,
  CheckCircle,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { KYCEmpty } from '@/components/kyc/KYCEmpty';
import KYCLoading from '@/components/kyc/KYCLoading';
import { KYCCard } from '@/components/kyc/KYCCard';
import { DailyReportModal } from '@/components/kyc/DailyReportModal';
import { VerificationTrends } from '@/components/kyc/analysis/VerificationTrends';
import { GeographicDistribution } from '@/components/kyc/analysis/GeographicDistribution';
import {
  getKYCUsers,
  getOrganizations,
  getKYCDashboardStats,
  bulkDeleteKYCUsers,
  bulkApproveKYCUsers,
} from '@/lib/api/kyc';
import { useToast } from '@/components/ui/Toast';
import { useModal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAuthContext } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import { exportKYCToCSV } from '@/lib/exportKYCToCSV';
import { Pagination } from '@/components/ui/Pagination';
import { KYCUser } from '@/types/kyc';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Helper for rendering unified time range options
function renderTimeFilterOptions(availableMonths?: string[]) {
  const months =
    availableMonths && availableMonths.length > 0
      ? availableMonths
      : Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      });

  return (
    <>
      <optgroup label="Relative Period">
        <option value="1month">Last 30 Days</option>
        <option value="3months">Last 3 Months</option>
        <option value="6months">Last 6 Months</option>
        <option value="1year">Last Year</option>
        <option value="all">All Time</option>
      </optgroup>
      <optgroup label="Specific Month">
        {months.map((m) => {
          const [year, month] = m.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1, 1);
          const label = date.toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          });
          return (
            <option key={m} value={`month:${m}`}>
              {label}
            </option>
          );
        })}
      </optgroup>
    </>
  );
}

function parseTimeValue(value: string): { timeframe: string; month: string } {
  if (value.startsWith('month:')) {
    return { timeframe: '1month', month: value.replace('month:', '') };
  }
  return { timeframe: value, month: '' };
}

function getTimeValue(month: string): string {
  if (month) return `month:${month}`;
  return '6months';
}

function renderOrgOptions(organizations: any[]) {
  return (
    <>
      <option value="">All Organizations</option>
      {organizations.map((org) => (
        <option key={org._id || org.id} value={org._id || org.id}>
          {org.name}
        </option>
      ))}
    </>
  );
}

// Verification Trends Section
function VerificationTrendsCardSection({
  initialData,
  availableMonths,
  organizations,
  isMelonAdmin,
  globalOrgId,
  globalMonth,
}: {
  initialData: any[];
  availableMonths?: string[];
  organizations: any[];
  isMelonAdmin?: boolean;
  globalOrgId: string;
  globalMonth: string;
}) {
  const [data, setData] = useState<any[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const [orgId, setOrgId] = useState(globalOrgId);
  const [month, setMonth] = useState(globalMonth);

  useEffect(() => {
    setOrgId(globalOrgId);
    setMonth(globalMonth);
    setData(initialData);
  }, [globalOrgId, globalMonth, initialData]);

  const hasCustomFilter = orgId !== globalOrgId || month !== globalMonth;

  const handleOrgChange = async (val: string) => {
    setOrgId(val);
    setLoading(true);
    try {
      const res = await getKYCDashboardStats(val, { month });
      setData(res.timeSeries || []);
    } catch (err) {
      console.error('Failed fetching verification trends:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = async (val: string) => {
    const { month: m } = parseTimeValue(val);
    setMonth(m);
    setLoading(true);
    try {
      const res = await getKYCDashboardStats(orgId, { month: m });
      setData(res.timeSeries || []);
    } catch (err) {
      console.error('Failed fetching verification trends:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setOrgId(globalOrgId);
    setMonth(globalMonth);
    setLoading(true);
    try {
      const res = await getKYCDashboardStats(globalOrgId, { month: globalMonth });
      setData(res.timeSeries || []);
    } catch (err) {
      console.error('Failed resetting verification trends:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          Verification Trends
        </h3>
        <button
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${hasCustomFilter || showFilterDrawer
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filter</span>
          {hasCustomFilter && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 ml-0.5"></span>
          )}
        </button>
      </div>

      {showFilterDrawer && (
        <div className="p-3 bg-gray-50/80 rounded-lg border border-gray-200 flex flex-wrap items-center gap-3 transition-all">
          {isMelonAdmin && (
            <div className="flex-1 min-w-[130px]">
              <label className="block text-[10px] font-semibold uppercase text-gray-400 mb-1">
                Organization
              </label>
              <select
                value={orgId}
                onChange={(e) => handleOrgChange(e.target.value)}
                className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer pr-6 truncate font-medium"
              >
                {renderOrgOptions(organizations)}
              </select>
            </div>
          )}
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-semibold uppercase text-gray-400 mb-1">
              Time Range / Month
            </label>
            <select
              value={getTimeValue(month)}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer pr-6 truncate font-medium"
            >
              {renderTimeFilterOptions(availableMonths)}
            </select>
          </div>
          {hasCustomFilter && (
            <div className="self-end pb-0.5">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <VerificationTrends data={data || []} />
      )}
    </div>
  );
}

// Geographic Distribution Section
function GeographicDistributionCardSection({
  initialData,
  availableMonths,
  organizations,
  isMelonAdmin,
  globalOrgId,
  globalMonth,
}: {
  initialData: any[];
  availableMonths?: string[];
  organizations: any[];
  isMelonAdmin?: boolean;
  globalOrgId: string;
  globalMonth: string;
}) {
  const [data, setData] = useState<any[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const [orgId, setOrgId] = useState(globalOrgId);
  const [month, setMonth] = useState(globalMonth);

  useEffect(() => {
    setOrgId(globalOrgId);
    setMonth(globalMonth);
    setData(initialData);
  }, [globalOrgId, globalMonth, initialData]);

  const hasCustomFilter = orgId !== globalOrgId || month !== globalMonth;

  const handleOrgChange = async (val: string) => {
    setOrgId(val);
    setLoading(true);
    try {
      const res = await getKYCDashboardStats(val, { month });
      setData(res.geographicBreakdown || []);
    } catch (err) {
      console.error('Failed fetching geographic distribution:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = async (val: string) => {
    const { month: m } = parseTimeValue(val);
    setMonth(m);
    setLoading(true);
    try {
      const res = await getKYCDashboardStats(orgId, { month: m });
      setData(res.geographicBreakdown || []);
    } catch (err) {
      console.error('Failed fetching geographic distribution:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setOrgId(globalOrgId);
    setMonth(globalMonth);
    setLoading(true);
    try {
      const res = await getKYCDashboardStats(globalOrgId, { month: globalMonth });
      setData(res.geographicBreakdown || []);
    } catch (err) {
      console.error('Failed resetting geographic distribution:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" />
          Geographic Distribution
        </h3>
        <button
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${hasCustomFilter || showFilterDrawer
              ? 'bg-orange-50 border-orange-200 text-orange-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filter</span>
          {hasCustomFilter && (
            <span className="w-1.5 h-1.5 rounded-full bg-orange-600 ml-0.5"></span>
          )}
        </button>
      </div>

      {showFilterDrawer && (
        <div className="p-3 bg-gray-50/80 rounded-lg border border-gray-200 flex flex-wrap items-center gap-3 transition-all">
          {isMelonAdmin && (
            <div className="flex-1 min-w-[130px]">
              <label className="block text-[10px] font-semibold uppercase text-gray-400 mb-1">
                Organization
              </label>
              <select
                value={orgId}
                onChange={(e) => handleOrgChange(e.target.value)}
                className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer pr-6 truncate font-medium"
              >
                {renderOrgOptions(organizations)}
              </select>
            </div>
          )}
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-semibold uppercase text-gray-400 mb-1">
              Time Range / Month
            </label>
            <select
              value={getTimeValue(month)}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer pr-6 truncate font-medium"
            >
              {renderTimeFilterOptions(availableMonths)}
            </select>
          </div>
          {hasCustomFilter && (
            <div className="self-end pb-0.5">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <GeographicDistribution data={data || []} />
      )}
    </div>
  );
}

// Main KYC Content
function KYCContent() {
  const router = useRouter();
  const { user, organization, isTrial, isLoading: authLoading } = useAuthContext();

  useEffect(() => {
    if (!authLoading && isTrial) {
      router.push('/reports');
    }
  }, [isTrial, authLoading, router]);

  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { openConfirmModal } = useModal();

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [monthFilter, setMonthFilter] = useState(searchParams.get('month') || '');
  const [organizationId, setOrganizationId] = useState('');
  const [isFilterInitialized, setIsFilterInitialized] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);
  const [isDailyReportModalOpen, setIsDailyReportModalOpen] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [isApprovingBulk, setIsApprovingBulk] = useState(false);

  useEffect(() => {
    const urlOrgId = searchParams.get('organizationId');
    const savedOrgId = localStorage.getItem('selectedOrganizationId');

    if (urlOrgId) {
      setOrganizationId(urlOrgId);
      localStorage.setItem('selectedOrganizationId', urlOrgId);
    } else if (savedOrgId) {
      setOrganizationId(savedOrgId);
    }

    setIsFilterInitialized(true);
  }, [searchParams]);

  useEffect(() => {
    if (isFilterInitialized && organizationId !== undefined) {
      localStorage.setItem('selectedOrganizationId', organizationId);
    }
  }, [organizationId, isFilterInitialized]);

  const debouncedSearch = useDebounce(searchInput, 500);

  const filters = {
    search: debouncedSearch,
    status: statusFilter,
    organizationId: organizationId,
    identityType: '',
    month: monthFilter,
  };

  const {
    users,
    dashboardStats,
    pagination,
    loading,
    error,
    refetch,
    setPage,
  } = useKYCUsers(filters, { skip: !isFilterInitialized });

  useEffect(() => {
    if (
      !loading &&
      monthFilter &&
      dashboardStats?.availableMonths &&
      dashboardStats.availableMonths.length > 0 &&
      !dashboardStats.availableMonths.includes(monthFilter)
    ) {
      setMonthFilter('');
    }
  }, [loading, monthFilter, dashboardStats?.availableMonths]);

  const isMelonAdmin = organization?.name?.toLowerCase().includes('melon');

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const orgs = await getOrganizations(isMelonAdmin);
        setOrganizations(orgs);
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      }
    }
    fetchOrgs();
  }, [isMelonAdmin]);

  const handleGlobalTimeChange = (val: string) => {
    const { month: m } = parseTimeValue(val);
    setMonthFilter(m);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await getKYCUsers({
        ...filters,
        pageSize: -1,
      });
      const allUsers = response.data || [];

      if (allUsers.length === 0) {
        addToast({
          type: 'error',
          title: 'No Data',
          message: 'No verification data available for export with current filters',
        });
        return;
      }

      exportKYCToCSV(allUsers, `address_verifications_${new Date().toISOString().split('T')[0]}.csv`);

      addToast({
        type: 'success',
        title: 'Export Successful',
        message: `Exported ${allUsers.length} records to CSV`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: err.message || 'Failed to export verification data',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(users.map((user: KYCUser) => user.id || (user as any)._id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectUser = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    openConfirmModal({
      title: 'Delete Selected Verifications',
      description: `Are you sure you want to delete ${selectedIds.size} selected verification requests? This action cannot be undone.`,
      confirmText: 'Delete Selected',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setIsDeletingBulk(true);
          await bulkDeleteKYCUsers(Array.from(selectedIds));
          addToast({
            type: 'success',
            title: 'Deleted Successfully',
            message: `Deleted ${selectedIds.size} verification requests`,
          });
          setSelectedIds(new Set());
          refetch();
        } catch (err: any) {
          addToast({
            type: 'error',
            title: 'Delete Failed',
            message: err.message || 'Failed to delete selected requests',
          });
        } finally {
          setIsDeletingBulk(false);
        }
      },
    });
  };

  const handleBulkApprove = () => {
    if (selectedIds.size === 0) return;
    openConfirmModal({
      title: 'Approve Selected Verifications',
      description: `Are you sure you want to approve ${selectedIds.size} selected verification requests?`,
      confirmText: 'Approve Selected',
      variant: 'info',
      onConfirm: async () => {
        try {
          setIsApprovingBulk(true);
          await bulkApproveKYCUsers(Array.from(selectedIds));
          addToast({
            type: 'success',
            title: 'Approved Successfully',
            message: `Approved ${selectedIds.size} verification requests`,
          });
          setSelectedIds(new Set());
          refetch();
        } catch (err: any) {
          addToast({
            type: 'error',
            title: 'Approve Failed',
            message: err.message || 'Failed to approve selected requests',
          });
        } finally {
          setIsApprovingBulk(false);
        }
      },
    });
  };

  const statusTabs = [
    { id: '', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'assigned', label: 'Assigned' },
    { id: 'in_review', label: 'In Review' },
    { id: 'verification_submitted', label: 'Pending Approval' },
    { id: 'verified', label: 'Verified' },
    { id: 'rejected', label: 'Rejected' },
  ];

  const hasUsers = users && users.length > 0;
  const hasFilters = searchInput || statusFilter || monthFilter || organizationId;
  const isAllSelected = hasUsers && users.every((u: KYCUser) => selectedIds.has(u.id || (u as any)._id));

  if (loading && !isFilterInitialized) {
    return <KYCLoading />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">KYC Management</h1>
          <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
            <span>Manage address and business verification requests</span>
            {monthFilter && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                Filtering by: {new Date(monthFilter + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {isMelonAdmin && (
            <div className="w-full sm:w-56">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Organization
              </label>
              <select
                className="w-full truncate px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer transition-colors pr-8 text-gray-800"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.6rem center',
                  backgroundSize: '1.1rem',
                }}
              >
                {renderOrgOptions(organizations)}
              </select>
            </div>
          )}
          <div className="w-full sm:w-52">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Time Range / Month
            </label>
            <select
              value={getTimeValue(monthFilter)}
              onChange={(e) => handleGlobalTimeChange(e.target.value)}
              className="w-full truncate px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer transition-colors pr-8 text-gray-800"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.6rem center',
                backgroundSize: '1.1rem',
              }}
            >
              {renderTimeFilterOptions(dashboardStats?.availableMonths)}
            </select>
          </div>
          <div className="flex items-center gap-2 self-end">
            <Link href="/kyc/bulk-upload" prefetch={false}>
              <Button variant="secondary" icon={<Upload className="w-4 h-4" />}>
                Bulk Upload
              </Button>
            </Link>
            <Link href="/kyc/create" prefetch={false}>
              <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                Create Request
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Insights & Analysis Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <div onClick={() => setShowAnalysis(!showAnalysis)} className="cursor-pointer min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-widest truncate">
                Insights & Analysis
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                Visualizing {organizationId ? 'organization' : 'platform'} performance & trends
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0">
            <Link href="/map-view?layer=kyc" prefetch={false}>
              <Button
                variant="secondary"
                size="sm"
                className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 h-9"
                icon={<MapPin className="w-4 h-4" />}
              >
                <span className="hidden xs:inline">Mapping Spread</span>
                <span className="xs:hidden">Map</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600 h-9"
              onClick={() => setShowAnalysis(!showAnalysis)}
            >
              <span>{showAnalysis ? 'Hide' : 'Show'} details</span>
            </Button>
          </div>
        </div>

        {showAnalysis && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <VerificationTrendsCardSection
                initialData={dashboardStats.timeSeries || []}
                availableMonths={dashboardStats.availableMonths}
                organizations={organizations}
                isMelonAdmin={isMelonAdmin}
                globalOrgId={organizationId}
                globalMonth={monthFilter}
              />
              <GeographicDistributionCardSection
                initialData={dashboardStats.geographicBreakdown || []}
                availableMonths={dashboardStats.availableMonths}
                organizations={organizations}
                isMelonAdmin={isMelonAdmin}
                globalOrgId={organizationId}
                globalMonth={monthFilter}
              />
            </div>
          </div>
        )}
      </div>

      {!hasUsers && !hasFilters ? (
        <KYCEmpty />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Action Header & Refresh/Export Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-gray-200 gap-4 bg-white">
            <h2 className="text-base font-bold text-gray-900">
              Verification Requests
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={refetch}
                loading={loading}
                icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
              >
                <span>Refresh</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
                loading={exporting}
                icon={<Download className="w-4 h-4" />}
              >
                <span>Export</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDailyReportModalOpen(true)}
                icon={<FileText className="w-4 h-4" />}
              >
                <span>Daily Report</span>
              </Button>

              <div className="flex items-center border border-gray-200 rounded-lg bg-white ml-1">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 hover:text-gray-900 transition-colors ${view === 'grid' ? 'text-primary bg-gray-50' : 'text-gray-400'
                    }`}
                  title="Grid View"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 hover:text-gray-900 transition-colors border-l border-gray-200 ${view === 'list' ? 'text-primary bg-gray-50' : 'text-gray-400'
                    }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Selection Action Bar */}
          {selectedIds.size > 0 && (
            <div className="px-6 py-3 bg-blue-50/80 border-b border-blue-200 flex items-center justify-between transition-all">
              <span className="text-xs font-semibold text-blue-900">
                {selectedIds.size} request(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <Button
                  variant="primary"
                  size="sm"
                  loading={isApprovingBulk}
                  onClick={handleBulkApprove}
                  icon={<Check className="w-3.5 h-3.5" />}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Approve Selected
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  loading={isDeletingBulk}
                  onClick={handleBulkDelete}
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Delete Selected
                </Button>
              </div>
            </div>
          )}

          {/* Search Input & Status Pill Filters (Matching Screenshot) */}
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-white space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-full md:flex-1">
                <Input
                  type="text"
                  placeholder="Search by name, email, loan ID..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  icon={<Search className="w-4 h-4 text-gray-400" />}
                />
              </div>

              {/* Status Pills Bar */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {statusTabs.map((tab) => {
                  const isActive = statusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${isActive
                          ? 'bg-gray-900 border-gray-900 text-white shadow-xs'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content View */}
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="py-12 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : !hasUsers ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">No verification requests found matching your filters</p>
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((u: KYCUser) => {
                  const uid = u.id || (u as any)._id;
                  return (
                    <KYCCard
                      key={uid}
                      user={u}
                      view="grid"
                      onRefetch={refetch}
                      selectable={true}
                      isSelected={selectedIds.has(uid)}
                      onToggleSelect={(id) => handleSelectUser(id, !selectedIds.has(id))}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="divide-y divide-gray-100 border-t border-gray-200">
                {/* Header row for List View */}
                <div
                  className="hidden lg:grid gap-4 items-center px-4 sm:px-6 py-3 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200"
                  style={{ gridTemplateColumns: '40px minmax(200px, 2fr) minmax(120px, 1fr) 120px 80px 80px 80px 80px 60px' }}
                >
                  <div className="text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </div>
                  <div>Customer</div>
                  <div>Source</div>
                  <div>Status</div>
                  <div className="text-center">Logged</div>
                  <div className="text-center">Assigned</div>
                  <div className="text-center">Submitted</div>
                  <div className="text-center">Decision</div>
                  <div className="text-right">Action</div>
                </div>

                {/* List Rows using KYCCard with Action Menu */}
                {users.map((u: KYCUser) => {
                  const uid = u.id || (u as any)._id;
                  return (
                    <KYCCard
                      key={uid}
                      user={u}
                      view="list"
                      onRefetch={refetch}
                      selectable={true}
                      isSelected={selectedIds.has(uid)}
                      onToggleSelect={(id) => handleSelectUser(id, !selectedIds.has(id))}
                    />
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  pageSize={pagination.pageSize || 10}
                  onPageChange={setPage}
                  hasNextPage={pagination.hasNextPage ?? pagination.currentPage < pagination.totalPages}
                  hasPreviousPage={pagination.hasPreviousPage ?? pagination.currentPage > 1}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <DailyReportModal
        isOpen={isDailyReportModalOpen}
        onClose={() => setIsDailyReportModalOpen(false)}
      />
    </div>
  );
}

export default function KYCPage() {
  return (
    <Suspense fallback={<KYCLoading />}>
      <KYCContent />
    </Suspense>
  );
}
