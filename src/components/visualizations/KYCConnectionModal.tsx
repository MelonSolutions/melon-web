'use client';

import { useState, useEffect } from 'react';
import { X, Database, CheckCircle, Building2, Filter, Calendar, Hash } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { getOrganizations } from '@/lib/api/kyc';

interface KYCConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (data: {
    name: string;
    description?: string;
    limit?: number;
    organizationId?: string;
    targetOrganizationName?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    kycDataSourceConfig: {
      availableFields: string[];
    };
  }) => Promise<{ success: boolean; error?: string }>;
}

const KYC_FIELDS = [
  { name: 'verificationStatus', displayName: 'Verification Status', type: 'string' },
  { name: 'loanType', displayName: 'Loan Type', type: 'string' },
  { name: 'rejectionReason', displayName: 'Rejection Reason', type: 'string' },
  { name: 'state', displayName: 'State', type: 'string' },
  { name: 'lga', displayName: 'LGA', type: 'string' },
  { name: 'city', displayName: 'City', type: 'string' },
  { name: 'country', displayName: 'Country', type: 'string' },
  { name: 'submissionDate', displayName: 'Submission Date', type: 'date' },
  { name: 'verificationDate', displayName: 'Verification Date', type: 'date' },
  { name: 'createdDate', displayName: 'Created Date', type: 'date' },
  { name: 'assignmentDate', displayName: 'Assignment Date', type: 'date' },
  { name: 'occupation', displayName: 'Occupation', type: 'string' },
  { name: 'deviceType', displayName: 'Device Type', type: 'string' },
  { name: 'browser', displayName: 'Browser', type: 'string' },
  { name: 'operatingSystem', displayName: 'Operating System', type: 'string' },
  { name: 'requestCity', displayName: 'Request City', type: 'string' },
  { name: 'requestRegion', displayName: 'Request Region', type: 'string' },
  { name: 'requestCountry', displayName: 'Request Country', type: 'string' },
  { name: 'assignedAgent', displayName: 'Assigned Agent', type: 'string' },
];

const LIMIT_PRESETS = [
  { label: '100', value: 100 },
  { label: '250', value: 250 },
  { label: '500', value: 500 },
  { label: '1,000', value: 1000 },
  { label: '5,000', value: 5000 },
  { label: 'All', value: 0 },
];

export function KYCConnectionModal({ isOpen, onClose, onConnect }: KYCConnectionModalProps) {
  const { user, isMelonAdmin } = useAuthContext();
  const isMelon =
    (isMelonAdmin && isMelonAdmin()) ||
    user?.email?.toLowerCase() === 'dev@melon.ng' ||
    user?.email?.toLowerCase().endsWith('@melon.ng');

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [connectionData, setConnectionData] = useState({
    name: 'KYC Data Source',
    description: 'Visualization data source from KYC records',
    selectedFields: KYC_FIELDS.map(f => f.name),
    limit: 500,
    selectedOrgId: '',
    startDate: '',
    endDate: '',
    status: 'ALL',
  });

  useEffect(() => {
    if (isOpen && isMelon) {
      const loadOrgs = async () => {
        setLoadingOrgs(true);
        try {
          const orgs = await getOrganizations(true);
          setOrganizations(orgs || []);
        } catch (err) {
          console.error('Failed to load organizations for KYC connection:', err);
        } finally {
          setLoadingOrgs(false);
        }
      };
      loadOrgs();
    }
  }, [isOpen, isMelon]);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      const selectedOrg = organizations.find(o => o._id === connectionData.selectedOrgId);
      const targetOrganizationName = isMelon
        ? (selectedOrg?.name || (connectionData.selectedOrgId ? 'Selected Org' : 'All Organizations'))
        : undefined;

      const result = await onConnect({
        name: connectionData.name,
        description: connectionData.description,
        limit: connectionData.limit,
        organizationId: isMelon ? (connectionData.selectedOrgId || 'all') : undefined,
        targetOrganizationName,
        startDate: connectionData.startDate || undefined,
        endDate: connectionData.endDate || undefined,
        status: connectionData.status !== 'ALL' ? connectionData.status : undefined,
        kycDataSourceConfig: {
          availableFields: connectionData.selectedFields,
        },
      });

      if (result.success) {
        resetModal();
        onClose();
      } else {
        setErrorMessage(result.error || 'Failed to connect KYC data source');
      }
    } catch (error: any) {
      console.error('Connection failed:', error);
      setErrorMessage(error?.message || 'An unexpected error occurred');
    } finally {
      setIsConnecting(false);
    }
  };

  const resetModal = () => {
    setErrorMessage(null);
    setConnectionData({
      name: 'KYC Data Source',
      description: 'Visualization data source from KYC records',
      selectedFields: KYC_FIELDS.map(f => f.name),
      limit: 500,
      selectedOrgId: '',
      startDate: '',
      endDate: '',
      status: 'ALL',
    });
  };

  const handleFieldToggle = (fieldName: string) => {
    setConnectionData(prev => ({
      ...prev,
      selectedFields: prev.selectedFields.includes(fieldName)
        ? prev.selectedFields.filter(f => f !== fieldName)
        : [...prev.selectedFields, fieldName],
    }));
  };

  const handleSelectAllFields = () => {
    setConnectionData(prev => ({
      ...prev,
      selectedFields: KYC_FIELDS.map(f => f.name),
    }));
  };

  const handleDeselectAllFields = () => {
    setConnectionData(prev => ({
      ...prev,
      selectedFields: [],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Connect KYC Data</h2>
              <p className="text-sm text-gray-500">Configure range and filters for KYC visualizations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-500 hover:text-red-700 font-bold ml-2"
              >
                ×
              </button>
            </div>
          )}

          {/* Data Source Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Source Name
              </label>
              <input
                type="text"
                value={connectionData.name}
                onChange={(e) => setConnectionData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter data source name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={connectionData.description}
                onChange={(e) => setConnectionData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Describe this data source..."
                rows={2}
              />
            </div>
          </div>

          {/* Organization Filter - Melon Admin Only */}
          {isMelon && (
            <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2">
              <div className="flex items-center gap-2 text-purple-900 font-medium text-sm">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>Organization Scope (Melon Admin Only)</span>
              </div>
              <p className="text-xs text-purple-700">
                Filter KYC records by partner organization or aggregate across all partner organizations.
              </p>
              <select
                value={connectionData.selectedOrgId}
                onChange={(e) => setConnectionData(prev => ({ ...prev, selectedOrgId: e.target.value }))}
                disabled={loadingOrgs}
                className="w-full px-3 py-2 border border-purple-300 rounded-lg bg-white text-sm font-medium text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">🌐 All Organizations (Cross-Partner Aggregate)</option>
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name} {org.domain ? `(${org.domain})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Range Selection & Limit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-gray-500" />
                Number of KYC Requests to Import
              </label>
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {connectionData.limit === 0 ? 'All Records' : `${connectionData.limit.toLocaleString()} records`}
              </span>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {LIMIT_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setConnectionData(prev => ({ ...prev, limit: preset.value }))}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                    connectionData.limit === preset.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range & Status Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                From Date
              </label>
              <input
                type="date"
                value={connectionData.startDate}
                onChange={(e) => setConnectionData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                To Date
              </label>
              <input
                type="date"
                value={connectionData.endDate}
                onChange={(e) => setConnectionData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-gray-500" />
                Status
              </label>
              <select
                value={connectionData.status}
                onChange={(e) => setConnectionData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Statuses</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Field Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Available KYC Fields ({connectionData.selectedFields.length}/{KYC_FIELDS.length} selected)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllFields}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAllFields}
                  className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-52 overflow-y-auto">
              {KYC_FIELDS.map((field) => {
                const isSelected = connectionData.selectedFields.includes(field.name);
                return (
                  <div
                    key={field.name}
                    onClick={() => handleFieldToggle(field.name)}
                    className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/70 hover:bg-blue-100/70' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {field.displayName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {field.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {field.name}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5">
            <div className="flex gap-2.5">
              <Database className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-0.5">Live Dataset Sync</p>
                <p>
                  Charts connected to this data source will dynamically visualize the selected KYC dataset based on your chosen range, organization scope, and field filters.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isConnecting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConnect}
            disabled={isConnecting || connectionData.selectedFields.length === 0 || !connectionData.name.trim()}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isConnecting ? 'Connecting...' : 'Connect KYC Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
