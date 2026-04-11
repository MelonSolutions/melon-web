'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  Save,
  Shield,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  Lock,
  Database
} from 'lucide-react';

export default function PrivacySettingsPage() {
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [settings, setSettings] = useState({
    profileVisibility: 'organization',
    dataSharing: false,
    analyticsOptOut: false,
    cookieConsent: true,
    twoFactorAuth: true,
    sessionTimeout: '24hours',
    dataRetention: '2years',
    exportFormat: 'json'
  });

  const visibilityOptions = [
    { value: 'public', label: 'Public', description: 'Visible to everyone' },
    { value: 'organization', label: 'Organization Only', description: 'Visible to your organization members' },
    { value: 'private', label: 'Private', description: 'Only visible to you' }
  ];

  const sessionTimeoutOptions = [
    { value: '1hour', label: '1 Hour' },
    { value: '8hours', label: '8 Hours' },
    { value: '24hours', label: '24 Hours' },
    { value: '7days', label: '7 Days' },
    { value: '30days', label: '30 Days' }
  ];

  const dataRetentionOptions = [
    { value: '6months', label: '6 Months' },
    { value: '1year', label: '1 Year' },
    { value: '2years', label: '2 Years' },
    { value: '5years', label: '5 Years' },
    { value: 'indefinite', label: 'Indefinite' }
  ];

  const exportFormatOptions = [
    { value: 'json', label: 'JSON', description: 'Machine-readable format' },
    { value: 'csv', label: 'CSV', description: 'Spreadsheet-compatible format' },
    { value: 'pdf', label: 'PDF', description: 'Human-readable format' }
  ];

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Show success message
    } catch (error) {
      console.error('Error saving privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataExport = async () => {
    try {
      // Simulate data export
      const data = {
        profile: { /* user profile data */ },
        projects: { /* project data */ },
        metrics: { /* metrics data */ },
        reports: { /* reports data */ }
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `melon-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleAccountDeletion = async () => {
    try {
      // Simulate account deletion
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Redirect to confirmation page
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link 
          href="/settings"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Privacy & Security</h1>
            <p className="text-gray-600 mt-1">Manage your privacy preferences and security settings</p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Eye className="w-5 h-5 text-[#5B94E5]" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Privacy Settings</h2>
            <p className="text-sm text-gray-500">Control who can see your information</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Profile Visibility
            </label>
            <div className="space-y-3">
              {visibilityOptions.map((option) => (
                <label key={option.value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="profileVisibility"
                    value={option.value}
                    checked={settings.profileVisibility === option.value}
                    onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                    className="h-4 w-4 text-[#5B94E5] border-gray-300 focus:ring-[#5B94E5] cursor-pointer"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Anonymous Data Sharing</p>
                <p className="text-sm text-gray-500">Allow anonymized data to be used for research and platform improvement</p>
              </div>
              <button
                onClick={() => handleSettingChange('dataSharing', !settings.dataSharing)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B94E5] focus:ring-offset-2 ${
                  settings.dataSharing ? 'bg-[#5B94E5]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.dataSharing ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Analytics Opt-out</p>
                <p className="text-sm text-gray-500">Opt out of usage analytics and tracking</p>
              </div>
              <button
                onClick={() => handleSettingChange('analyticsOptOut', !settings.analyticsOptOut)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B94E5] focus:ring-offset-2 ${
                  settings.analyticsOptOut ? 'bg-[#5B94E5]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.analyticsOptOut ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Cookie Consent</p>
                <p className="text-sm text-gray-500">Allow non-essential cookies for enhanced features</p>
              </div>
              <button
                onClick={() => handleSettingChange('cookieConsent', !settings.cookieConsent)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B94E5] focus:ring-offset-2 ${
                  settings.cookieConsent ? 'bg-[#5B94E5]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.cookieConsent ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
            <p className="text-sm text-gray-500">Enhance your account security</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                settings.twoFactorAuth ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {settings.twoFactorAuth ? 'Enabled' : 'Disabled'}
              </span>
              <button
                onClick={() => handleSettingChange('twoFactorAuth', !settings.twoFactorAuth)}
                className="px-3 py-1 text-sm text-[#5B94E5] border border-[#5B94E5] rounded hover:bg-blue-50 transition-colors cursor-pointer"
              >
                {settings.twoFactorAuth ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout
              </label>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] cursor-pointer"
              >
                {sessionTimeoutOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Retention Period
              </label>
              <select
                value={settings.dataRetention}
                onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] cursor-pointer"
              >
                {dataRetentionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Security Status</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Your account security is strong. Consider enabling two-factor authentication 
                  for additional protection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Database className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Data Management</h2>
            <p className="text-sm text-gray-500">Export or delete your data</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Export Your Data</h3>
                <p className="text-sm text-gray-500">Download a copy of all your data</p>
              </div>
              <Download className="w-5 h-5 text-gray-400" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <div className="space-y-2">
                {exportFormatOptions.map((option) => (
                  <label key={option.value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="exportFormat"
                      value={option.value}
                      checked={settings.exportFormat === option.value}
                      onChange={(e) => handleSettingChange('exportFormat', e.target.value)}
                      className="h-4 w-4 text-[#5B94E5] border-gray-300 focus:ring-[#5B94E5] cursor-pointer"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleDataExport}
              className="px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Export Data
            </button>
          </div>

          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="text-lg font-medium text-red-900">Delete Account</h3>
                <p className="text-sm text-red-700">Permanently delete your account and all associated data</p>
              </div>
            </div>

            <div className="bg-white border border-red-200 rounded p-3 mb-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Warning:</strong> This action cannot be undone. All your projects, metrics, 
                reports, and data will be permanently deleted.
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>All projects and associated data</li>
                <li>Impact metrics and historical data</li>
                <li>Reports and response data</li>
                <li>Team collaborations and permissions</li>
              </ul>
            </div>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Confirm Account Deletion</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you absolutely sure you want to delete your account? This action cannot be undone 
              and all your data will be permanently lost.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAccountDeletion}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}