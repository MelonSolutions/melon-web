

'use client';

import { useState, useEffect } from 'react'; import { X, Shield, AlertCircle, Save, Database, FileText, BarChart3, PieChart, MessageSquare, LayoutDashboard, Users, Activity } from 'lucide-react';
import { adminApiClient, AccessLevel, OrganizationRestrictions, FeatureName, OrganizationStatus } from '@/lib/api/admin';

interface RestrictionEditorModalProps {
  organizationId: string;
  organizationName: string;
  currentStatus: OrganizationStatus;
  currentRestrictions?: OrganizationRestrictions;
  onSave: () => void;
  onClose: () => void;
}

interface FeatureConfig {
  key: FeatureName;
  label: string;
  icon: React.ComponentType<{ className?: string; }>;
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

const accessLevels: { value: AccessLevel; label: string; description: string; }[] = [
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

const statusOptions: { value: OrganizationStatus; label: string; description: string; color: string; }[] = [
  {
    value: OrganizationStatus.ACTIVE,
    label: 'Active',
    description: 'Full operational access for the organization',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  {
    value: OrganizationStatus.TRIAL,
    label: 'Trial',
    description: 'Temporary access for evaluation purposes',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  {
    value: OrganizationStatus.SUSPENDED,
    label: 'Suspended',
    description: 'Temporarily disabled due to policy or payment',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
  {
    value: OrganizationStatus.EXPIRED,
    label: 'Expired',
    description: 'Trial or subscription period has ended',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
];

export default function RestrictionEditorModal({
  organizationId,
  organizationName,
  currentStatus,
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
  const [selectedStatus, setSelectedStatus] = useState<OrganizationStatus>(currentStatus);
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
    const statusChanged = selectedStatus !== currentStatus;
    if (statusChanged) return true;

    if (!currentRestrictions) {
      return Object.values(formData).some((level) => level !== 'full');
    }

    return features.some((feature) => {
      const currentLevel = currentRestrictions[feature.key] || 'full';
      const newLevel = formData[feature.key];
      return currentLevel !== newLevel;
    });
  };

  const getChangedItems = () => {
    const changes: { type: 'status' | 'feature'; label: string; old: string; new: string; }[] = [];

    if (selectedStatus !== currentStatus) {
      changes.push({
        type: 'status',
        label: 'Organization Status',
        old: currentStatus,
        new: selectedStatus,
      });
    }

    const currentLevels: Record<FeatureName, AccessLevel> = {
      kyc: currentRestrictions?.kyc || 'full',
      portfolio: currentRestrictions?.portfolio || 'full',
      reports: currentRestrictions?.reports || 'full',
      impactMetrics: currentRestrictions?.impactMetrics || 'full',
      visualizations: currentRestrictions?.visualizations || 'full',
      responses: currentRestrictions?.responses || 'full',
      overview: currentRestrictions?.overview || 'full',
    };

    features.forEach((feature) => {
      if (currentLevels[feature.key] !== formData[feature.key]) {
        changes.push({
          type: 'feature',
          label: feature.label,
          old: currentLevels[feature.key],
          new: formData[feature.key],
        });
      }
    });

    return changes;
  };

  const handleSave = async () => {
    try {
      setError(null);

      if (!hasChanges()) {
        setError('No changes detected');
        return;
      }

      if (reason.trim().length < 10) {
        setError('Reason must be at least 10 characters long');
        return;
      }

      setSaving(true);

      const changes = getChangedItems();
      const updates: any = { reason: reason.trim() };

      changes.forEach((change) => {
        if (change.type === 'status') {
          updates.status = change.new;
        } else {
          // Find feature key from label
          const feature = features.find(f => f.label === change.label);
          if (feature) {
            updates[feature.key] = change.new;
          }
        }
      });

      await adminApiClient.updateRestrictions(organizationId, updates);
      onSave();
    } catch (err: any) {
      console.error('Error updating status/restrictions:', err);
      setError(err.message || 'Failed to update organization settings');
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
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
              <h2 className="text-xl font-semibold text-gray-900">Manage Organization Settings</h2>
              <p className="text-sm text-gray-600">{organizationName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
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

          {/* Status Management */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-700" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Organization Status</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {statusOptions.map((option) => {
                const isSelected = selectedStatus === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedStatus(option.value)}
                    className={`
                      px-4 py-3 rounded-xl text-left border-2 transition-all
                      ${isSelected ? `${option.color} border-current ring-2 ring-offset-1 ring-blue-500` : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'}
                    `}
                  >
                    <div className="font-bold text-sm mb-1">{option.label}</div>
                    <div className="text-[10px] leading-tight opacity-70">{option.description}</div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Features List */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-700" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Feature Restrictions</h3>
            </div>

            <div className="space-y-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                const currentLevel = formData[feature.key];
                const originalLevel = currentRestrictions?.[feature.key] || 'full';
                const hasChanged = currentLevel !== originalLevel;

                return (
                  <div key={feature.key} className={`border rounded-xl p-4 transition-colors ${hasChanged ? 'border-blue-200 bg-blue-50/50' : 'border-gray-100 bg-gray-50/30'}`}>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1 flex gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${hasChanged ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-400 border border-gray-100'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-gray-900">{feature.label}</h4>
                            {hasChanged && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase">Changed</span>}
                          </div>
                          <p className="text-xs text-gray-500">{feature.description}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {accessLevels.map((level) => (
                          <button
                            key={level.value}
                            onClick={() => handleAccessLevelChange(feature.key, level.value)}
                            className={`
                              px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border-2 transition-all
                              ${currentLevel === level.value ? `${getAccessLevelColor(level.value)} border-current` : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}
                            `}
                          >
                            {level.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Reason Input */}
          {(hasChanges()) && (
            <section className="space-y-3 pt-4 border-t border-gray-100">
              <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider">Reason for Audit Log <span className="text-red-500">*</span></label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly explain why these changes are being made..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
              <div className="flex items-center justify-between">
                <p className={`text-xs ${reason.length >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                  {reason.length >= 10 ? 'Minimum requirement met' : `${10 - reason.length} more characters required`}
                </p>
              </div>
            </section>
          )}

          {/* Final Summary Card */}
          {hasChanges() && (
            <div className="rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-3">
                <Activity className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-bold uppercase tracking-widest">Change Preview</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getChangedItems().map((change, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase font-black">{change.label}</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="line-through text-gray-600 lowercase">{change.old}</span>
                      <span className="text-blue-400 font-bold">→</span>
                      <span className="font-bold text-gray-900 lowercase">{change.new}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50/50">
          <button onClick={onClose} disabled={saving} className="px-5 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-gray-800 disabled:opacity-50">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!hasChanges() || reason.trim().length < 10 || saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary/80 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-lg"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Save className="w-3.5 h-3.5" /> Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
