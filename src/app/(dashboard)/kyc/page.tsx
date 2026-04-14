/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useKYCUsers } from '@/hooks/useKYC';
import { Search, Download, Grid3x3, List, RefreshCw, FileText, Plus, BarChart3, TrendingUp, LayoutGrid, MapPin, Upload, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { KYCEmpty } from '@/components/kyc/KYCEmpty';
import KYCLoading from '@/components/kyc/KYCLoading';
import { KYCCard } from '@/components/kyc/KYCCard';
import { DailyReportModal } from '@/components/kyc/DailyReportModal';
import { VerificationTrends } from '@/components/kyc/analysis/VerificationTrends';
import { OrgBreakdown } from '@/components/kyc/analysis/OrgBreakdown';
import { GeographicDistribution } from '@/components/kyc/analysis/GeographicDistribution';
import { exportKYCData, getKYCUsers, getOrganizations, bulkDeleteKYCUsers } from '@/lib/api/kyc';
import { useToast } from '@/components/ui/Toast';
import { useModal } from '@/components/ui/Modal';
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const { openConfirmModal } = useModal();

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

  const handleToggleSelect = (userId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredUsers.map(u => getUserId(u)).filter(Boolean) as string[];
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const allSelected = filteredUsers.length > 0 && selectedIds.size === filteredUsers.length;

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;

    openConfirmModal({
      title: 'Bulk Delete Requests',
      description: `Are you sure you want to delete ${selectedIds.size} verification request(s)? Only pending requests can be deleted. This action cannot be undone.`,
      confirmText: 'Delete Selected',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setIsDeletingBulk(true);
          const response = await bulkDeleteKYCUsers(Array.from(selectedIds));
          
          addToast({
            type: 'success',
            title: 'Bulk Delete Successful',
            message: response.message || `Successfully deleted ${response.deletedCount} requests.`,
          });

          setSelectedIds(new Set());
          refetch();
        } catch (error: any) {
          addToast({
            type: 'error',
            title: 'Bulk Delete Failed',
            message: error.message || 'Failed to delete selected requests. Please try again.',
          });
        } finally {
          setIsDeletingBulk(false);
        }
      }
    });
  };

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
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">Address Verification</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage address and business verification requests
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {isMelonAdmin && (
            <div className="w-full sm:w-72 lg:w-80 transition-all">
              <select
                className="w-full truncate px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer hover:border-gray-300 font-medium pr-8"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.25rem'
                }}
              >
                <option value="">All Organizations</option>
                {organizations.map((org) => (
                  <option key={org._id || org.id} value={org._id || org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <Link href="/kyc/bulk-upload" prefetch={false} className="w-full sm:w-auto">
            <Button variant="secondary" icon={<Upload className="w-4 h-4" />} className="w-full sm:w-auto">
              Bulk Upload CSV
            </Button>
          </Link>
          <Link href="/kyc/create" prefetch={false} className="w-full sm:w-auto">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} className="w-full sm:w-auto">
              Create New Request
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 flex-1">
          <StatCard
            label="Total"
            value={dashboardStats.totalUsers}
            description="All requests"
          />
          <StatCard
            label="Pending"
            value={dashboardStats.pending}
            description="Unassigned"
          />
          <StatCard
            label="Assigned"
            value={dashboardStats.assigned}
            description="Claimed"
          />
          <StatCard
            label="In Review"
            value={dashboardStats.inReview}
            description="Ongoing"
          />
          <StatCard
            label="Verified"
            value={dashboardStats.verified}
            description="Completed"
          />
          <StatCard
            label="Rejected"
            value={dashboardStats.rejected}
            description="Failed"
          />
        </div>
      </div>

      {/* Insights & Analysis Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-all">
        <div 
          className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50 gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <div onClick={() => setShowAnalysis(!showAnalysis)} className="cursor-pointer min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-widest truncate">Insights & Analysis</h2>
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">Visualizing {organizationId ? 'organization' : 'platform'} performance & trends</p>
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
              <span className="hidden xs:inline">{showAnalysis ? 'Hide' : 'Show'} details</span>
              <span className="xs:hidden">{showAnalysis ? 'Hide' : 'Show'}</span>
            </Button>
          </div>
        </div>
        
        {showAnalysis && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Verification Trends (30d)
                  </h3>
                </div>
                <VerificationTrends data={dashboardStats.timeSeries || []} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    Geographic Distribution
                  </h3>
                </div>
                <GeographicDistribution data={dashboardStats.geographicBreakdown || []} />
              </div>
            </div>
          </div>
        )}
      </div>

      {!hasUsers && !hasFilters ? (
        <KYCEmpty />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-gray-200 gap-4">
            <h2 className="text-base font-semibold text-gray-900">
              Verification Requests
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={refetch}
                loading={loading}
                icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
                className="order-1"
              >
                <span>Refresh</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
                loading={exporting}
                icon={<Download className="w-4 h-4" />}
                className="order-2"
              >
                <span>Export</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDailyReportModalOpen(true)}
                icon={<FileText className="w-4 h-4" />}
                className="order-3"
              >
                <span>Daily Report</span>
              </Button>

              <div className="flex items-center border border-gray-200 rounded-lg bg-white order-last sm:order-4">
                <button
                  onClick={() => setView('grid')}
                  className={`px-3 py-2 transition-colors border-r border-gray-100 flex items-center gap-2 ${view === 'grid'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  title="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span className="text-xs font-medium">Grid</span>
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-2 transition-colors border-gray-100 flex items-center gap-2 ${view === 'list'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                  <span className="text-xs font-medium">List</span>
                </button>
              </div>
            </div>
          </div>

          {selectedIds.size > 0 && isMelonAdmin && (
            <div className="bg-primary/5 px-4 sm:px-6 py-3 border-b border-primary/10 flex items-center justify-between">
              <div className="text-sm font-medium text-primary">
                {selectedIds.size} request(s) selected
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={handleBulkDelete}
                  loading={isDeletingBulk}
                  icon={<Trash2 className="w-4 h-4" />}
                >
                  Delete Selected
                </Button>
              </div>
            </div>
          )}

          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 w-full max-w-md">
                <Input
                  placeholder="Search by name, email, loan ID..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
                {searchInput !== debouncedSearch && (
                  <p className="text-xs text-gray-400 mt-1">Searching...</p>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide no-scrollbar">
                <button
                  onClick={() => setStatusFilter('')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border whitespace-nowrap ${statusFilter === ''
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('PENDING')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border whitespace-nowrap ${statusFilter === 'PENDING'
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setStatusFilter('ASSIGNED')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border whitespace-nowrap ${statusFilter === 'ASSIGNED'
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  Assigned
                </button>
                <button
                  onClick={() => setStatusFilter('IN_REVIEW')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border whitespace-nowrap ${statusFilter === 'IN_REVIEW'
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  In Review
                </button>
                <button
                  onClick={() => setStatusFilter('VERIFICATION_SUBMITTED')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border whitespace-nowrap ${statusFilter === 'VERIFICATION_SUBMITTED'
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  Pending Approval
                </button>
                <button
                  onClick={() => setStatusFilter('VERIFIED')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border whitespace-nowrap ${statusFilter === 'VERIFIED'
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  Verified
                </button>
                <button
                  onClick={() => setStatusFilter('REJECTED')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border whitespace-nowrap ${statusFilter === 'REJECTED'
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  Rejected
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <>
              {view === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {filteredUsers.map((user) => {
                    const userId = getUserId(user);
                    return userId ? (
                      <KYCCard
                        key={userId}
                        user={user}
                        view="grid"
                        onRefetch={refetch}
                        selectable={isMelonAdmin}
                        isSelected={selectedIds.has(userId)}
                        onToggleSelect={handleToggleSelect}
                      />
                    ) : null;
                  })}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-full inline-block align-middle">
                    <div className="hidden lg:block px-6 py-3 bg-gray-50 border-b border-gray-200">
                      <div 
                        className="grid gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest items-center"
                        style={{ gridTemplateColumns: isMelonAdmin ? '40px minmax(200px, 2fr) minmax(120px, 1fr) 120px 80px 80px 80px 80px 60px' : 'minmax(200px, 2fr) minmax(120px, 1fr) 120px 80px 80px 80px 80px 60px' }}
                      >
                        {isMelonAdmin && (
                          <div className="flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              checked={allSelected}
                              onChange={(e) => handleSelectAll(e.target.checked)}
                              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                            />
                          </div>
                        )}
                        <div>Customer</div>
                        <div>Source</div>
                        <div>Status</div>
                        <div className="text-center">Logged</div>
                        <div className="text-center">Assigned</div>
                        <div className="text-center">Submitted</div>
                        <div className="text-center">Decision</div>
                        <div className="text-right">Action</div>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {filteredUsers.map((user) => {
                        const userId = getUserId(user);
                        return userId ? (
                          <KYCCard
                            key={userId}
                            user={user}
                            view="list"
                            onRefetch={refetch}
                            selectable={isMelonAdmin}
                            isSelected={selectedIds.has(userId)}
                            onToggleSelect={handleToggleSelect}
                          />
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              )}
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={pagination.hasPreviousPage}
                totalItems={pagination.total}
                pageSize={pagination.pageSize}
                onPageChange={setPage}
              />
            </>
          ) : (
            <div className="text-center py-12 px-6">
              <p className="text-sm text-gray-500 mb-3">No requests found matching your criteria</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchInput('');
                  setStatusFilter('');
                }}
              >
                Clear filters
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
