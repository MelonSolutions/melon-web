/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useKYCUsers } from '@/hooks/useKYC';
import { UserPlus, Search, Download, Grid3x3, List } from 'lucide-react';
import Link from 'next/link';
import { KYCEmpty } from '@/components/kyc/KYCEmpty';
import KYCLoading from '@/components/kyc/KYCLoading';
import { KYCCard } from '@/components/kyc/KYCCard';
import { exportKYCData } from '@/lib/api/kyc';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import Input from '@/components/ui/Input';

interface KYCUser {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'PENDING' | 'AGENT_ASSIGNED' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED';
  agentName?: string;
  documents: Array<{ _id: string }>;
  submittedAt: string;
  updatedAt: string;
}

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
    loading, 
    error,
    refetch 
  } = useKYCUsers(filters);

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportKYCData({
        status: statusFilter || undefined,
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `verification-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      addToast({
        type: 'success',
        title: 'Export Successful',
        message: 'Verification data has been exported successfully.',
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

  if (loading && !users) {
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">
              Verification Requests
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
                loading={exporting}
                icon={<Download className="w-4 h-4" />}
              >
                Export
              </Button>

              <div className="flex items-center border border-gray-200 rounded-lg">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 transition-colors ${
                    view === 'grid'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 transition-colors ${
                    view === 'list'
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

          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 max-w-md">
                <Input
                  placeholder="Search by name or email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
                {searchInput !== debouncedSearch && (
                  <p className="text-xs text-gray-400 mt-1">Searching...</p>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setStatusFilter('')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === '' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('PENDING')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === 'PENDING' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setStatusFilter('AGENT_ASSIGNED')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === 'AGENT_ASSIGNED' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Assigned
                </button>
                <button
                  onClick={() => setStatusFilter('IN_REVIEW')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === 'IN_REVIEW' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  In Review
                </button>
                <button
                  onClick={() => setStatusFilter('VERIFIED')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === 'VERIFIED' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Verified
                </button>
              </div>
            </div>
          </div>

          {filteredUsers.length > 0 ? (
            view === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {filteredUsers.map((user) => {
                  const userId = user.id || user._id;
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
              <div>
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="col-span-4">Customer</div>
                    <div className="col-span-3">Contact</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Documents</div>
                    <div className="col-span-1">Actions</div>
                  </div>
                </div>

                {filteredUsers.map((user) => {
                  const userId = user.id || user._id;
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
            )
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
