/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useKYCUsers } from '@/hooks/useKYC';
import { UserPlus, Search, Download, Grid3x3, List, RefreshCw, FileText } from 'lucide-react';
import Link from 'next/link';
import { KYCEmpty } from '@/components/kyc/KYCEmpty';
import KYCLoading from '@/components/kyc/KYCLoading';
import { KYCCard } from '@/components/kyc/KYCCard';
import { DailyReportModal } from '@/components/kyc/DailyReportModal';
import { exportKYCData, getKYCUsers } from '@/lib/api/kyc';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
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
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [exporting, setExporting] = useState(false);
  const [isDailyReportModalOpen, setIsDailyReportModalOpen] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('list');

  const debouncedSearch = useDebounce(searchInput, 500);

  const filters = {
    search: debouncedSearch,
    status: statusFilter,
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
  } = useKYCUsers(filters);

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Address Verification</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage address and business verification requests
          </p>
        </div>
        <Link href="/kyc/create" prefetch={false}>
          <Button variant="primary" icon={<UserPlus className="w-4 h-4" />}>
            Create New Request
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <StatCard
          label="Total Requests"
          value={dashboardStats.totalUsers}
          description="All verification requests"
        />
        <StatCard
          label="Pending"
          value={dashboardStats.pending}
          description="Awaiting assignment"
        />
        <StatCard
          label="Assigned"
          value={dashboardStats.assigned}
          description="Agent claimed"
        />
        <StatCard
          label="In Review"
          value={dashboardStats.inReview}
          description="Being verified"
        />
        <StatCard
          label="Verified"
          value={dashboardStats.verified}
          description="Completed successfully"
        />
        <StatCard
          label="Rejected"
          value={dashboardStats.rejected}
          description="Failed verification"
        />
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
              >
                Refresh
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
                loading={exporting}
                icon={<Download className="w-4 h-4" />}
              >
                Export
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDailyReportModalOpen(true)}
                icon={<FileText className="w-4 h-4" />}
              >
                Daily Report
              </Button>

              <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 transition-colors ${view === 'grid'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  title="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 transition-colors ${view === 'list'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

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

              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <button
                  onClick={() => setStatusFilter('')}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors border ${statusFilter === ''
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('PENDING')}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors border ${statusFilter === 'PENDING'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setStatusFilter('ASSIGNED')}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors border ${statusFilter === 'ASSIGNED'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  Assigned
                </button>
                <button
                  onClick={() => setStatusFilter('IN_REVIEW')}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors border ${statusFilter === 'IN_REVIEW'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  In Review
                </button>
                <button
                  onClick={() => setStatusFilter('VERIFICATION_SUBMITTED')}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors border ${statusFilter === 'VERIFICATION_SUBMITTED'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  Pending Approval
                </button>
                <button
                  onClick={() => setStatusFilter('VERIFIED')}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors border ${statusFilter === 'VERIFIED'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  Verified
                </button>
                <button
                  onClick={() => setStatusFilter('REJECTED')}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors border ${statusFilter === 'REJECTED'
                    ? 'bg-gray-900 text-white border-gray-900'
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
                      />
                    ) : null;
                  })}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-full inline-block align-middle">
                    <div className="hidden lg:block px-6 py-3 bg-gray-50 border-b border-gray-200">
                      <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="col-span-4">Customer</div>
                        <div className="col-span-3">Contact</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2">Addresses</div>
                        <div className="col-span-1 text-right">Actions</div>
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
