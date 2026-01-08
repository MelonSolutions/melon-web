/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useKYCUsers } from '@/hooks/useKYC';
import { UserPlus, Search, Download, Grid3x3, List } from 'lucide-react';
import Link from 'next/link';
import { KYCEmpty } from '@/components/kyc/KYCEmpty';
import KYCLoading from '@/components/kyc/KYCLoading';
import { KYCCard } from '@/components/kyc/KYCCard';
import { exportKYCData } from '@/lib/api/kyc';
import { useToast } from '@/components/ui/Toast';

interface KYCUser {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  identityType: string;
  identityNumber?: string;
  status: 'PENDING' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED';
  documents: Array<{ _id: string }>;
  submittedAt: string;
  updatedAt: string;
}

function KYCContent() {
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    identityType: searchParams.get('identityType') || '',
  });
  const [exporting, setExporting] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('list');

  const { 
    users, 
    dashboardStats, 
    loading, 
    error,
    refetch 
  } = useKYCUsers(filters);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportKYCData({
        status: filters.status || undefined,
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kyc-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      addToast({
        type: 'success',
        title: 'Export Successful',
        message: 'KYC data has been exported successfully.',
      });
    } catch (error) {
      console.error('Export error:', error);
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export KYC data. Please try again.',
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <KYCLoading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="text-gray-400 text-sm mb-2">Something went wrong</div>
          <button 
            onClick={refetch}
            className="text-sm text-[#5B94E5] hover:text-blue-700 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const hasUsers = users && users.length > 0;
  const hasFilters = filters.search || filters.status || filters.identityType;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">KYC Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track user verification status
          </p>
        </div>
        <Link
          href="/kyc/create"
          prefetch={false}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Create New Request
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-2xl font-semibold text-gray-900 mb-1">
            {dashboardStats.totalUsers}
          </div>
          <div className="text-sm text-gray-500">Total Customers</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-2xl font-semibold text-gray-900 mb-1">
            {dashboardStats.verified}
          </div>
          <div className="text-sm text-gray-500">Verified</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-2xl font-semibold text-gray-900 mb-1">
            {dashboardStats.inReview}
          </div>
          <div className="text-sm text-gray-500">In Review</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-2xl font-semibold text-gray-900 mb-1">
            {dashboardStats.pending}
          </div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-2xl font-semibold text-gray-900 mb-1">
            {dashboardStats.rejected}
          </div>
          <div className="text-sm text-gray-500">Rejected</div>
        </div>
      </div>

      {/* Content */}
      {!hasUsers && !hasFilters ? (
        <KYCEmpty />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Section Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              All Users
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Export'}
              </button>

              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 ${
                    view === 'grid'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  } transition-colors`}
                  title="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 ${
                    view === 'list'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  } transition-colors`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors w-full"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filters.status === '' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleFilterChange('status', 'VERIFIED')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filters.status === 'VERIFIED' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Verified
                </button>
                <button
                  onClick={() => handleFilterChange('status', 'IN_REVIEW')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filters.status === 'IN_REVIEW' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  In Review
                </button>
                <button
                  onClick={() => handleFilterChange('status', 'PENDING')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filters.status === 'PENDING' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>
          </div>

          {/* Users Grid/List */}
          {hasUsers ? (
            view === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 pt-0">
                {users.map((user) => {
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
              <div className="border-t border-gray-200">
                {users.map((user) => {
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
              <div className="text-gray-500 mb-4">No users found matching your criteria</div>
              <button
                onClick={() => setFilters({ search: '', status: '', identityType: '' })}
                className="text-sm text-[#5B94E5] hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
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
