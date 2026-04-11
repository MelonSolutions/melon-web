/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useKYCUsers } from '@/hooks/useKYC';
import { Search, Download, Grid3x3, List, RefreshCw, FileText, Plus, BarChart3, TrendingUp, LayoutGrid, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { KYCEmpty } from '@/components/kyc/KYCEmpty';
import KYCLoading from '@/components/kyc/KYCLoading';
import { KYCCard } from '@/components/kyc/KYCCard';
import { DailyReportModal } from '@/components/kyc/DailyReportModal';
import { VerificationTrends } from '@/components/kyc/analysis/VerificationTrends';
import { OrgBreakdown } from '@/components/kyc/analysis/OrgBreakdown';
import { GeographicDistribution } from '@/components/kyc/analysis/GeographicDistribution';
import { exportKYCData, getKYCUsers, getOrganizations } from '@/lib/api/kyc';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { useAuthContext } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import { exportKYCToCSV } from '@/lib/exportKYCToCSV';
import { Pagination } from '@/components/ui/Pagination';
import { KYCUser } from '@/types/kyc';
import { getUserId } from '@/lib/utils';



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

function KYCContent() {
  const { user, organization } = useAuthContext();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [organizationId, setOrganizationId] = useState('');
  const [isFilterInitialized, setIsFilterInitialized] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);
  const [isDailyReportModalOpen, setIsDailyReportModalOpen] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [showAnalysis, setShowAnalysis] = useState(true);

  // Load saved organization selection on mount
  useEffect(() => {
    const urlOrgId = searchParams.get('organizationId');
    const savedOrgId = localStorage.getItem('selectedOrganizationId');

    if (urlOrgId) {
      setOrganizationId(urlOrgId);
      localStorage.setItem('selectedOrganizationId', urlOrgId);
    } else if (savedOrgId) {
      setOrganizationId(savedOrgId);
    }
    
    // Mark as initialized so useKYCUsers can start fetching
    setIsFilterInitialized(true);
  }, []);

  // Save organization selection whenever it changes
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
  };

  const {
    users,
    dashboardStats,
    pagination,
    loading,
    error,
    refetch,
    setPage
  } = useKYCUsers(filters, { skip: !isFilterInitialized });
 
  const isMelonAdmin = organization?.name?.toLowerCase().includes('melon');
 
  useEffect(() => {
    async function fetchOrgs() {
      try {
        const orgs = await getOrganizations();
        setOrganizations(orgs);
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      }
    }
    fetchOrgs();
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true);

      // Fetch all users matching filters instead of just the current page
      const response = await getKYCUsers({
        ...filters,
        pageSize: -1
      });

      const allUsers = response.data || [];

      if (allUsers.length === 0) {
        addToast({
          type: 'error',
          title: 'No Data',
          message: 'No verification data to export matching your filters.',
        });
        return;
      }

      exportKYCToCSV(allUsers);

      addToast({
        type: 'success',
        title: 'Export Successful',
        message: `Exported ${allUsers.length} total verification record(s) across all pages.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export verification data. Please try again.',
      });
    } finally {
      setExporting(false);
    }
  };

  const filteredUsers = users?.filter(user => {
    if (!statusFilter) return true;
    return user.status === statusFilter;
  }) || [];

  // Initial load - show full skeleton
  if (loading && (!users || users.length === 0) && !dashboardStats.totalUsers) {
    return <KYCLoading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3">Something went wrong</p>
          <Button variant="secondary" size="sm" onClick={refetch}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const hasUsers = users && users.length > 0;
  const hasFilters = debouncedSearch || statusFilter;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Address Verification</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
            Manage and oversee platform-wide address and business verification requests
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {isMelonAdmin && (
            <div className="w-48 sm:w-64 transition-all group">
              <div className="relative">
                <select
                  className="w-full pl-4 pr-10 py-3 text-sm font-bold border border-border rounded-xl bg-surface text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer hover:border-primary/50 transition-all shadow-sm"
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                >
                  <option value="">All Organizations</option>
                  {organizations.map((org) => (
                    <option key={org._id || org.id} value={org._id || org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-primary transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}
          <Link href="/kyc/create" prefetch={false} className="w-full sm:w-auto">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} className="w-full sm:w-auto py-3 px-6 shadow-lg shadow-primary/20">
              Create New Request
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          label="Total"
          value={dashboardStats.totalUsers}
          description="All platform requests"
        />
        <StatCard
          label="Pending"
          value={dashboardStats.pending}
          description="Awaiting assignment"
        />
        <StatCard
          label="Assigned"
          value={dashboardStats.assigned}
          description="Claimed by agents"
        />
        <StatCard
          label="In Review"
          value={dashboardStats.inReview}
          description="Currently ongoing"
        />
        <StatCard
          label="Verified"
          value={dashboardStats.verified}
          description="Passed verification"
        />
        <StatCard
          label="Rejected"
          value={dashboardStats.rejected}
          description="Failed verification"
        />
      </div>

      {/* Insights & Analysis Section */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm transition-all group hover:border-primary/20">
        <div 
          className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-border bg-gradient-to-r from-surface to-surface-secondary/50 gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20 shadow-inner group-hover:scale-105 transition-transform duration-300">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div onClick={() => setShowAnalysis(!showAnalysis)} className="cursor-pointer min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em]">Insights & Analysis</h2>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate font-bold mt-0.5 opacity-80 uppercase">Visualizing {organizationId ? 'organization' : 'platform'} performance & trends</p>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto sm:ml-0">
            <Link href="/map-view?layer=kyc" prefetch={false}>
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 h-10 font-bold rounded-xl px-4"
                icon={<MapPin className="w-4 h-4" />}
              >
                <span className="hidden xs:inline">Mapping Spread</span>
                <span className="xs:hidden">Map</span>
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 h-10 font-bold rounded-xl hover:bg-surface-secondary px-4 transition-all"
              onClick={() => setShowAnalysis(!showAnalysis)}
              icon={<LayoutGrid className={`w-4 h-4 transition-transform duration-300 ${showAnalysis ? 'rotate-180' : ''}`} />}
            >
              <span className="hidden xs:inline">{showAnalysis ? 'Collapse Insights' : 'Expand Insights'}</span>
              <span className="xs:hidden">{showAnalysis ? 'Hide' : 'Show'}</span>
            </Button>
          </div>
        </div>
        
        {showAnalysis && (
          <div className="p-8 animate-in slide-in-from-top-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-3 uppercase tracking-widest">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Verification Trends (30d)
                  </h3>
                </div>
                <div className="bg-surface-secondary/20 rounded-2xl border border-border/50 p-4">
                  <VerificationTrends data={dashboardStats.timeSeries || []} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-3 uppercase tracking-widest">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    Geographic Distribution
                  </h3>
                </div>
                <div className="bg-surface-secondary/20 rounded-2xl border border-border/50 p-4">
                  <GeographicDistribution data={dashboardStats.geographicBreakdown || []} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!hasUsers && !hasFilters ? (
        <KYCEmpty />
      ) : (
        <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-300 hover:border-primary/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-border bg-surface-secondary/10 gap-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Verification Pipeline
              </h2>
              <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                {pagination.total} Records
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={refetch}
                loading={loading}
                icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
                className="h-10 text-xs font-bold uppercase tracking-widest px-4 border-border/60 hover:border-primary/40 transition-colors"
              >
                <span>Refresh</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
                loading={exporting}
                icon={<Download className="w-4 h-4" />}
                className="h-10 text-xs font-bold uppercase tracking-widest px-4 border-border/60 hover:border-primary/40 transition-colors"
              >
                <span>Export Data</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDailyReportModalOpen(true)}
                icon={<FileText className="w-4 h-4" />}
                className="h-10 text-xs font-bold uppercase tracking-widest px-4 border-border/60 hover:border-primary/40 transition-colors"
              >
                <span>Reports</span>
              </Button>

              <div className="flex items-center border border-border/60 rounded-xl bg-surface group-hover:border-primary/40 overflow-hidden shadow-sm transition-all duration-300">
                  <button
                  onClick={() => setView('grid')}
                  className={`px-4 py-2.5 transition-all flex items-center gap-2 group/btn ${view === 'grid'
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-surface-secondary'
                    }`}
                  title="Grid view"
                >
                  <Grid3x3 className={`w-4 h-4 transition-transform group-hover/btn:scale-110 ${view === 'grid' ? 'scale-110' : ''}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Grid</span>
                </button>
                <div className="w-[1px] h-4 bg-border/60" />
                <button
                  onClick={() => setView('list')}
                  className={`px-4 py-2.5 transition-all flex items-center gap-2 group/btn ${view === 'list'
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-surface-secondary'
                    }`}
                  title="List view"
                >
                  <List className={`w-4 h-4 transition-transform group-hover/btn:scale-110 ${view === 'list' ? 'scale-110' : ''}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">List</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-border bg-surface">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 w-full max-w-lg">
                <div className="relative group">
                  <Input
                    placeholder="Search by name, email, loan ID..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    icon={<Search className="w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />}
                    className="pl-12 py-3 rounded-xl border-border/60 focus:border-primary transition-all text-sm font-medium"
                  />
                  {searchInput !== debouncedSearch && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary/50" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar scroll-smooth">
                {[
                  { id: '', label: 'All Status' },
                  { id: 'PENDING', label: 'Pending' },
                  { id: 'ASSIGNED', label: 'Assigned' },
                  { id: 'IN_REVIEW', label: 'In Review' },
                  { id: 'VERIFICATION_SUBMITTED', label: 'Review' },
                  { id: 'VERIFIED', label: 'Verified' },
                  { id: 'REJECTED', label: 'Rejected' },
                ].map((status) => (
                  <button
                    key={status.id}
                    onClick={() => setStatusFilter(status.id)}
                    className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] rounded-xl transition-all border whitespace-nowrap shadow-sm ${statusFilter === status.id
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                      : 'bg-surface text-gray-500 dark:text-gray-400 border-border/60 hover:bg-surface-secondary hover:border-primary/30 hover:text-primary'
                      }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8">
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-20 bg-surface-secondary/40 rounded-2xl animate-pulse border border-border/20"></div>
                ))}
              </div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <>
              {view === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8 bg-surface-secondary/5">
                  {filteredUsers.map((user) => {
                    const userId = getUserId(user);
                    return userId ? (
                      <KYCCard
                        key={userId}
                        user={user}
                        view="grid"
                        onRefetch={refetch}
                      />
                    ) : null;
                  })}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-full inline-block align-middle">
                    <div className="hidden lg:block px-8 py-4 bg-surface-secondary/20 border-b border-border transition-colors">
                      <div 
                        className="grid gap-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]"
                        style={{ gridTemplateColumns: 'minmax(220px, 2fr) minmax(140px, 1fr) 130px 90px 90px 90px 90px 60px' }}
                      >
                        <div>Customer Entity</div>
                        <div>Reporting Source</div>
                        <div>Workflow Status</div>
                        <div className="text-center">Logged At</div>
                        <div className="text-center">Claimed</div>
                        <div className="text-center">Submitted</div>
                        <div className="text-center">Validated</div>
                        <div className="text-right">Action</div>
                      </div>
                    </div>

                    <div className="divide-y divide-border/60 bg-surface">
                      {filteredUsers.map((user) => {
                        const userId = getUserId(user);
                        return userId ? (
                          <KYCCard
                            key={userId}
                            user={user}
                            view="list"
                            onRefetch={refetch}
                          />
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              )}
              <div className="p-6 border-t border-border bg-surface-secondary/10">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPreviousPage={pagination.hasPreviousPage}
                  totalItems={pagination.total}
                  pageSize={pagination.pageSize}
                  onPageChange={setPage}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-32 px-10 bg-surface-secondary/5">
              <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-6 border border-border/50">
                <Search className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-base font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-2">No results found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto font-medium">We couldn't find any verification requests matching your current filters and search criteria.</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSearchInput('');
                  setStatusFilter('');
                }}
                className="px-8"
              >
                Reset All Filters
              </Button>
            </div>
          )}
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
