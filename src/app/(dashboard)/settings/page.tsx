"use client";
import { useState, useEffect } from 'react';
import { 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database, 
  CreditCard,
  Users,
  Download,
  Key,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { apiClient } from '@/lib/api/auth';
import { useToast } from '@/components/ui/Toast';

export default function SettingsPage() {
  const { user, refreshUser } = useAuthContext();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Settings state
  const [notifications, setNotifications] = useState({
    emailReports: true,
    metricAlerts: true,
    deadlineReminders: true,
    weeklyDigest: false,
    projectUpdates: true,
    systemMaintenance: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'organization',
    dataSharing: false,
    analyticsOptOut: false,
    twoFactorAuth: true
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'Africa/Lagos',
    dateFormat: 'DD/MM/YYYY',
    currency: 'NGN',
    theme: 'light'
  });

  // Sync state with user context on load
  useEffect(() => {
    if (user) {
      if (user.notifications) {
        setNotifications({
          emailReports: user.notifications.emailReports ?? true,
          metricAlerts: user.notifications.metricAlerts ?? true,
          deadlineReminders: user.notifications.deadlineReminders ?? true,
          weeklyDigest: user.notifications.weeklyDigest ?? false,
          projectUpdates: user.notifications.projectUpdates ?? true,
          systemMaintenance: user.notifications.systemMaintenance ?? true,
        });
      }
      if (user.privacy) {
        setPrivacy({
          profileVisibility: user.privacy.profileVisibility || 'organization',
          dataSharing: user.privacy.dataSharing ?? false,
          analyticsOptOut: user.privacy.analyticsOptOut ?? false,
          twoFactorAuth: user.privacy.twoFactorAuth ?? false,
        });
      }
      if (user.preferences) {
        setPreferences({
          language: user.preferences.language || 'en',
          timezone: user.preferences.timezone || 'Africa/Lagos',
          dateFormat: user.preferences.dateFormat || 'DD/MM/YYYY',
          currency: user.preferences.currency || 'NGN',
          theme: user.preferences.theme || 'light',
        });
      }
    }
  }, [user]);

  const settingsTabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Database },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'team', label: 'Team Management', icon: Users }
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiClient.updateProfile({
        notifications,
        privacy,
        preferences
      });
      
      await refreshUser();
      
      addToast({
        type: 'success',
        title: 'Settings saved',
        message: 'Your preferences have been updated successfully.'
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      addToast({
        type: 'error',
        title: 'Save failed',
        message: error.message || 'An error occurred while saving your settings.'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderNotifications = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {[
            { key: 'emailReports', label: 'Report submissions', description: 'Get notified when new report responses are submitted' },
            { key: 'metricAlerts', label: 'Metric alerts', description: 'Receive alerts when metrics fall below target thresholds' },
            { key: 'deadlineReminders', label: 'Deadline reminders', description: 'Reminders for upcoming report deadlines' },
            { key: 'projectUpdates', label: 'Project updates', description: 'Updates on project milestones and progress' },
            { key: 'weeklyDigest', label: 'Weekly digest', description: 'Weekly summary of your program performance' },
            { key: 'systemMaintenance', label: 'System maintenance', description: 'Notifications about system updates and maintenance' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B94E5] focus:ring-offset-2 ${
                  notifications[item.key as keyof typeof notifications] ? 'bg-[#5B94E5]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Visibility
            </label>
            <select
              value={privacy.profileVisibility}
              onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] cursor-pointer"
            >
              <option value="public">Public</option>
              <option value="organization">Organization Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Data Sharing</p>
              <p className="text-sm text-gray-500">Allow anonymized data to be used for research</p>
            </div>
            <button
              onClick={() => setPrivacy(prev => ({ ...prev, dataSharing: !prev.dataSharing }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B94E5] focus:ring-offset-2 ${
                privacy.dataSharing ? 'bg-[#5B94E5]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.dataSharing ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Analytics</p>
              <p className="text-sm text-gray-500">Opt out of anonymous usage tracking</p>
            </div>
            <button
              onClick={() => setPrivacy(prev => ({ ...prev, analyticsOptOut: !prev.analyticsOptOut }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B94E5] focus:ring-offset-2 ${
                privacy.analyticsOptOut ? 'bg-[#5B94E5]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.analyticsOptOut ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={() => setPrivacy(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B94E5] focus:ring-offset-2 ${
                privacy.twoFactorAuth ? 'bg-[#5B94E5]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Password & Security</h3>
        <div className="space-y-4">
          <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Change Password</p>
                <p className="text-sm text-gray-500">Last changed 3 months ago</p>
              </div>
              <Key className="w-4 h-4 text-gray-400" />
            </div>
          </button>

          <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Download Account Data</p>
                <p className="text-sm text-gray-500">Export all your data</p>
              </div>
              <Download className="w-4 h-4 text-gray-400" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Regional Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] cursor-pointer"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={preferences.timezone}
              onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] cursor-pointer"
            >
              <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Format
            </label>
            <select
              value={preferences.dateFormat}
              onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] cursor-pointer"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={preferences.currency}
              onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] cursor-pointer"
            >
              <option value="NGN">Nigerian Naira (₦)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Display Settings</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <div className="flex gap-3">
            {['light', 'dark', 'auto'].map((theme) => (
              <button
                key={theme}
                onClick={() => setPreferences(prev => ({ ...prev, theme }))}
                className={`px-4 py-2 rounded-lg border transition-colors cursor-pointer ${
                  preferences.theme === theme
                    ? 'border-[#5B94E5] bg-blue-50 text-[#5B94E5]'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">API Access</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-900">API Key</p>
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="text-sm text-[#5B94E5] hover:text-blue-600 cursor-pointer"
            >
              {showApiKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-white border rounded text-sm font-mono">
              {showApiKey ? 'mel_sk_1a2b3c4d5e6f7g8h9i0j' : '••••••••••••••••••••••••'}
            </code>
            <button className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 cursor-pointer">
              Copy
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Use this API key to integrate with external systems
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Connected Services</h3>
        <div className="space-y-3">
          {[
            { name: 'Google Sheets', status: 'connected', description: 'Export data automatically' },
            { name: 'Slack', status: 'disconnected', description: 'Get notifications in Slack' },
            { name: 'Zapier', status: 'connected', description: 'Automate workflows' }
          ].map((service, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">{service.name}</p>
                <p className="text-sm text-gray-500">{service.description}</p>
              </div>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${
                  service.status === 'connected'
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-[#5B94E5] text-white hover:bg-blue-600'
                }`}
              >
                {service.status === 'connected' ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'notifications':
        return renderNotifications();
      case 'privacy':
        return renderPrivacy();
      case 'preferences':
        return renderPreferences();
      case 'integrations':
        return renderIntegrations();
      case 'billing':
        return <div className="text-center py-12 text-gray-500">Billing settings coming soon</div>;
      case 'team':
        return <div className="text-center py-12 text-gray-500">Team management coming soon</div>;
      default:
        return renderNotifications();
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Settings</h2>
            <nav className="space-y-1">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-[#5B94E5] font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  {settingsTabs.find(tab => tab.id === activeTab)?.label}
                </h2>
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
            
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}