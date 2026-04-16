'use client';

import { useState, useEffect } from 'react';
import { Search, Settings, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { adminApiClient, Organization, OrganizationRestrictions, AccessLevel } from '@/lib/api/admin';
import RestrictionEditorModal from './RestrictionEditorModal';

export default function RestrictionsTab() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [restrictions, setRestrictions] = useState<Map<string, OrganizationRestrictions>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [showEditorModal, setShowEditorModal] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    fetchOrganizations();
  }, [currentPage, searchTerm]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminApiClient.getOrganizations({
        search: searchTerm || undefined,
        page: currentPage,
        limit: pageSize,
      });

      setOrganizations(response.organizations);
      setTotalPages(response.totalPages);

      // Fetch restrictions for each organization
      await fetchRestrictionsForOrganizations(response.organizations);
    } catch (err: any) {
      console.error('Error fetching organizations:', err);
      setError(err.message || 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const fetchRestrictionsForOrganizations = async (orgs: Organization[]) => {
    const restrictionsMap = new Map<string, OrganizationRestrictions>();

    await Promise.all(
      orgs.map(async (org) => {
        try {
          const orgRestrictions = await adminApiClient.getRestrictions(org._id);
          restrictionsMap.set(org._id, orgRestrictions);
        } catch (err) {
          console.error(`Error fetching restrictions for org ${org._id}:`, err);
          // If restrictions don't exist, they'll default to 'full' on the backend
        }
      })
    );

    setRestrictions(restrictionsMap);
  };

  const handleEditRestrictions = (orgId: string) => {
    setSelectedOrgId(orgId);
    setShowEditorModal(true);
  };

  const handleRestrictionsSaved = async () => {
    // Refresh the restrictions for all organizations
    await fetchRestrictionsForOrganizations(organizations);
    setShowEditorModal(false);
    setSelectedOrgId(null);
  };

  const handleCloseModal = () => {
    setShowEditorModal(false);
    setSelectedOrgId(null);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const getAccessLevelBadge = (level: AccessLevel) => {
    const styles = {
      full: 'bg-green-100 text-green-800 border-green-200',
      'read-only': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blocked: 'bg-red-100 text-red-800 border-red-200',
    };

    const labels = {
      full: 'Full Access',
      'read-only': 'Read Only',
      blocked: 'Blocked',
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[level]}`}>
        {labels[level]}
      </span>
    );
  };

  const getRestrictedFeaturesCount = (orgId: string): number => {
    const orgRestrictions = restrictions.get(orgId);
    if (!orgRestrictions) return 0;

    const features = ['kyc', 'portfolio', 'reports', 'impactMetrics', 'visualizations', 'responses', 'overview'] as const;
    return features.filter((feature) => orgRestrictions[feature] !== 'full').length;
  };

  if (loading && organizations.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#5B94E5] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading organizations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-900">Error Loading Organizations</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchOrganizations}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search organizations by name..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-transparent"
          />
        </div>
        <button
          onClick={fetchOrganizations}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Organizations Table */}
      {organizations.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms' : 'No organizations available'}
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restrictions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {organizations.map((org) => {
                const restrictedCount = getRestrictedFeaturesCount(org._id);

                return (
                  <tr key={org._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{org.name}</div>
                        {org.domain && <div className="text-sm text-gray-500">{org.domain}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {org.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          org.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : org.status === 'TRIAL'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {org.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {restrictedCount > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {restrictedCount} restricted
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">No restrictions</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{org.userCount || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEditRestrictions(org._id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#5B94E5] hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
              className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || loading}
              className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Restriction Editor Modal */}
      {showEditorModal && selectedOrgId && (
        <RestrictionEditorModal
          organizationId={selectedOrgId}
          organizationName={organizations.find((o) => o._id === selectedOrgId)?.name || ''}
          currentRestrictions={restrictions.get(selectedOrgId)}
          onSave={handleRestrictionsSaved}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
