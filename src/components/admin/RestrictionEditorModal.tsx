'use client';

import { useState, useEffect } from 'react';
import { X, Shield, AlertCircle, Save, Database, FileText, BarChart3, PieChart, MessageSquare, LayoutDashboard, Users } from 'lucide-react';
import { adminApiClient, AccessLevel, OrganizationRestrictions, FeatureName } from '@/lib/api/admin';

interface RestrictionEditorModalProps {
  organizationId: string;
  organizationName: string;
  currentRestrictions?: OrganizationRestrictions;
  onSave: () => void;
  onClose: () => void;
}

interface FeatureConfig {
  key: FeatureName;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const features: FeatureConfig[] = [
  {
    key: 'kyc',
    label: 'KYC Management',
    icon: Users,
    description: 'Create, view, and manage beneficiary records',
  },
  {
    key: 'portfolio',
    label: 'Portfolio Management',
    icon: Database,
    description: 'Create, view, and manage projects',
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: FileText,
    description: 'Create forms and collect responses',
  },
  {
    key: 'impactMetrics',
    label: 'Impact Metrics',
    icon: BarChart3,
    description: 'Track and analyze impact metrics',
  },
  {
    key: 'visualizations',
    label: 'Visualizations',
    icon: PieChart,
    description: 'Create charts and data visualizations',
  },
  {
    key: 'responses',
    label: 'Responses',
    icon: MessageSquare,
    description: 'View and analyze form responses',
  },
  {
    key: 'overview',
    label: 'Overview Dashboard',
    icon: LayoutDashboard,
    description: 'View dashboard statistics and analytics',
  },
];

const accessLevels: { value: AccessLevel; label: string; description: string }[] = [
  {
    value: 'full',
    label: 'Full Access',
    description: 'Complete read and write access',
  },
  {
    value: 'read-only',
    label: 'Read Only',
    description: 'Can view but cannot create or modify',
  },
  {
    value: 'blocked',
    label: 'Blocked',
    description: 'No access to this feature',
  },
];

export default function RestrictionEditorModal({
  organizationId,
  organizationName,
  currentRestrictions,
  onSave,
  onClose,
}: RestrictionEditorModalProps) {
  const [formData, setFormData] = useState<Record<FeatureName, AccessLevel>>({
    kyc: 'full',
    portfolio: 'full',
    reports: 'full',
    impactMetrics: 'full',
    visualizations: 'full',
    responses: 'full',
    overview: 'full',
  });
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentRestrictions) {
      setFormData({
        kyc: currentRestrictions.kyc || 'full',
        portfolio: currentRestrictions.portfolio || 'full',
        reports: currentRestrictions.reports || 'full',
        impactMetrics: currentRestrictions.impactMetrics || 'full',
        visualizations: currentRestrictions.visualizations || 'full',
        responses: currentRestrictions.responses || 'full',
        overview: currentRestrictions.overview || 'full',
      });
    }
  }, [currentRestrictions]);

  const handleAccessLevelChange = (feature: FeatureName, level: AccessLevel) => {
    setFormData((prev) => ({
      ...prev,
      [feature]: level,
    }));
  };

  const hasChanges = (): boolean => {
    if (!currentRestrictions) {
      // Check if any feature is not 'full'
      return Object.values(formData).some((level) => level !== 'full');
    }

    return features.some((feature) => {
      const currentLevel = currentRestrictions[feature.key] || 'full';
      const newLevel = formData[feature.key];
      return currentLevel !== newLevel;
    });
  };

  const getChangedFeatures = (): FeatureName[] => {
    const currentLevels: Record<FeatureName, AccessLevel> = {
      kyc: currentRestrictions?.kyc || 'full',
      portfolio: currentRestrictions?.portfolio || 'full',
      reports: currentRestrictions?.reports || 'full',
      impactMetrics: currentRestrictions?.impactMetrics || 'full',
      visualizations: currentRestrictions?.visualizations || 'full',
      responses: currentRestrictions?.responses || 'full',
      overview: currentRestrictions?.overview || 'full',
    };

    return features
      .filter((feature) => currentLevels[feature.key] !== formData[feature.key])
      .map((feature) => feature.key);
  };

  const handleSave = async () => {
    try {
      setError(null);

      // Validation
      if (!hasChanges()) {
        setError('No changes detected');
        return;
      }

      if (reason.trim().length < 10) {
        setError('Reason must be at least 10 characters long');
        return;
      }

      setSaving(true);

      // Build update payload - only include changed features
      const changedFeatures = getChangedFeatures();
      const updates: any = { reason: reason.trim() };

      changedFeatures.forEach((feature) => {
        updates[feature] = formData[feature];
      });

      await adminApiClient.updateRestrictions(organizationId, updates);

      onSave();
    } catch (err: any) {
      console.error('Error updating restrictions:', err);
      setError(err.message || 'Failed to update restrictions');
    } finally {
      setSaving(false);
    }
  };

  const getAccessLevelColor = (level: AccessLevel) => {
    switch (level) {
      case 'full':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'read-only':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Manage Restrictions</h2>
              <p className="text-sm text-gray-600">{organizationName}</p>
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
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-900">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Features List */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Feature Access Levels</h3>

            {features.map((feature) => {
              const Icon = feature.icon;
              const currentLevel = formData[feature.key];
              const originalLevel = currentRestrictions?.[feature.key] || 'full';
              const hasChanged = currentLevel !== originalLevel;

              return (
                <div
                  key={feature.key}
                  className={`border rounded-lg p-4 ${hasChanged ? 'border-[#5B94E5] bg-blue-50' : 'border-gray-200'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${hasChanged ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Icon className={`w-5 h-5 ${hasChanged ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">{feature.label}</h4>
                        {hasChanged && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Modified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{feature.description}</p>

                      <div className="grid grid-cols-3 gap-2">
                        {accessLevels.map((level) => {
                          const isSelected = currentLevel === level.value;

                          return (
                            <button
                              key={level.value}
                              onClick={() => handleAccessLevelChange(feature.key, level.value)}
                              className={`
                                px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all text-left
                                ${
                                  isSelected
                                    ? `${getAccessLevelColor(level.value)} border-current`
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                                }
                              `}
                            >
                              <div className="font-medium">{level.label}</div>
                              <div className="text-xs opacity-80 mt-0.5">{level.description}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reason Input */}
          {hasChanges() && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Reason for Changes <span className="text-red-600">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide a detailed reason for these restriction changes (minimum 10 characters)..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-transparent resize-none"
              />
              <div className="flex items-center justify-between text-sm">
                <span className={`${reason.length >= 10 ? 'text-green-600' : 'text-gray-500'}`}>
                  {reason.length} / 10 characters minimum
                </span>
                {reason.length > 0 && reason.length < 10 && (
                  <span className="text-red-600">Needs {10 - reason.length} more characters</span>
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          {hasChanges() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Change Summary</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {getChangedFeatures().map((featureKey) => {
                  const feature = features.find((f) => f.key === featureKey)!;
                  const oldLevel = currentRestrictions?.[featureKey] || 'full';
                  const newLevel = formData[featureKey];

                  return (
                    <li key={featureKey}>
                      <strong>{feature.label}:</strong> {oldLevel} → {newLevel}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges() || reason.trim().length < 10 || saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
