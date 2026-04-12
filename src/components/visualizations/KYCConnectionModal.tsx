'use client';

import { useState } from 'react';
import { X, Database, CheckCircle } from 'lucide-react';

interface KYCConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (data: {
    name: string;
    description?: string;
    type: 'kyc';
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

export function KYCConnectionModal({ isOpen, onClose, onConnect }: KYCConnectionModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionData, setConnectionData] = useState({
    name: 'KYC Data Source',
    description: 'Visualization data source from KYC records',
    selectedFields: KYC_FIELDS.map(f => f.name),
  });

  if (!isOpen) return null;

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await onConnect({
        name: connectionData.name,
        description: connectionData.description,
        type: 'kyc',
        kycDataSourceConfig: {
          availableFields: connectionData.selectedFields,
        },
      });

      if (result.success) {
        resetModal();
        onClose();
      }
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const resetModal = () => {
    setConnectionData({
      name: 'KYC Data Source',
      description: 'Visualization data source from KYC records',
      selectedFields: KYC_FIELDS.map(f => f.name),
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
              <p className="text-sm text-gray-500">Use your KYC records for visualizations</p>
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
          {/* Data Source Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Source Name
              </label>
              <input
                type="text"
                value={connectionData.name}
                onChange={(e) => setConnectionData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe this data source..."
                rows={2}
              />
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
                  onClick={handleSelectAllFields}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={handleDeselectAllFields}
                  className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-60 overflow-y-auto">
              {KYC_FIELDS.map((field) => {
                const isSelected = connectionData.selectedFields.includes(field.name);
                return (
                  <div
                    key={field.name}
                    onClick={() => handleFieldToggle(field.name)}
                    className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {field.displayName}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {field.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {field.name}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Database className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">About KYC Data Source</p>
                <p>
                  This data source provides access to all KYC records in your organization.
                  You can create visualizations using any of the selected fields above.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isConnecting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={isConnecting || connectionData.selectedFields.length === 0 || !connectionData.name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? 'Connecting...' : 'Connect KYC Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
