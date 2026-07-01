"use client";
import { useState, useEffect, useMemo } from 'react';
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
  Save,
  Building2,
  Paintbrush
} from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { apiClient } from '@/lib/api/auth';
import { useToast } from '@/components/ui/Toast';
import dynamic from 'next/dynamic';
import IntegrationsSettingsPage from './integrations/page';

// Dynamically import PlatformAdministration to avoid SSR issues
const PlatformAdministration = dynamic(
  () => import('@/components/admin/PlatformAdministration'),
  { ssr: false }
);

export default function SettingsPage() {
  const { user, refreshUser, organization, refreshOrganization, isMelonAdmin, isTrial } = useAuthContext();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Branding Form State
  const [brandingForm, setBrandingForm] = useState({
    brandName: '',
    brandColor: '#5B94E5',
    logoUrl: '',
  });

  // Sync branding form with organization details
  useEffect(() => {
    if (organization) {
      setBrandingForm({
        brandName: organization.brandName || organization.name || '',
        brandColor: organization.brandColor || '#5B94E5',
        logoUrl: organization.logoUrl || '',
      });
    }
  }, [organization]);

  // Settings state
  const [notifications, setNotifications] = useState({
    emailReports: true,
    metricAlerts: true,
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

  // Check if user is from Melon organization (platform admin)
  const isAdmin = useMemo(() => isMelonAdmin(), [isMelonAdmin]);

  // Sync state with user context on load
  useEffect(() => {
    if (user) {
      if (user.notifications) {
        setNotifications({
          emailReports: user.notifications.emailReports ?? true,
          metricAlerts: user.notifications.metricAlerts ?? true,
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

  const settingsTabs = useMemo(() => {
    const baseTabs = [
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'privacy', label: 'Privacy & Security', icon: Shield },
      { id: 'preferences', label: 'Preferences', icon: Palette },
      { id: 'branding', label: 'Branding', icon: Paintbrush, requiresUpgrade: !organization?.isWhiteLabel && !isAdmin },
      { id: 'integrations', label: 'Integrations', icon: Database, requiresUpgrade: isTrial },
      { id: 'billing', label: 'Billing', icon: CreditCard, requiresUpgrade: isTrial },
      { id: 'team', label: 'Team Management', icon: Users, requiresUpgrade: isTrial }
    ];

    // Add admin tab only for Melon organization users
    if (isAdmin) {
      baseTabs.push({
        id: 'admin',
        label: 'Platform Administration',
        icon: Building2
      });
    }

    return baseTabs;
  }, [isAdmin, organization?.isWhiteLabel, isTrial]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (activeTab === 'branding') {
        await apiClient.updateBranding(brandingForm);
        await refreshOrganization();
      } else {
        await apiClient.updateProfile({
          notifications,
          privacy,
          preferences
        });
        await refreshUser();
      }

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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B94E5] focus:ring-offset-2 ${notifications[item.key as keyof typeof notifications] ? 'bg-[#5B94E5]' : 'bg-gray-200'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
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
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B94E5] focus:ring-offset-2 ${privacy.dataSharing ? 'bg-[#5B94E5]' : 'bg-gray-200'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacy.dataSharing ? 'translate-x-6' : 'translate-x-1'
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
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B94E5] focus:ring-offset-2 ${privacy.analyticsOptOut ? 'bg-[#5B94E5]' : 'bg-gray-200'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacy.analyticsOptOut ? 'translate-x-6' : 'translate-x-1'
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
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B94E5] focus:ring-offset-2 ${privacy.twoFactorAuth ? 'bg-[#5B94E5]' : 'bg-gray-200'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacy.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
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
                className={`px-4 py-2 rounded-lg border transition-colors cursor-pointer ${preferences.theme === theme
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



  const renderUpgradeCTA = (title: string, description: string, isWhiteLabelLock = false) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <Shield className="w-8 h-8 text-blue-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {isWhiteLabelLock ? 'White-Label Branding is locked' : `${title} is locked for Trial Accounts`}
      </h3>
      <p className="text-gray-500 max-w-md mb-8">
        {isWhiteLabelLock
          ? "White-label branding is an Enterprise-level feature. Customize the application logo, branding color scheme, and title to align completely with your organization's brand identity."
          : description}
      </p>
      <button 
        onClick={() => window.location.href = 'mailto:admin@melon.ng'}
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Contact Support to Upgrade
      </button>
    </div>
  );

  const renderBranding = () => {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">White-Label Branding</h3>
          <p className="text-sm text-gray-500 mb-6">
            Customize the look and feel of the platform and report PDFs to match your organization's brand identity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Name
              </label>
              <input
                type="text"
                value={brandingForm.brandName}
                onChange={(e) => setBrandingForm(prev => ({ ...prev, brandName: e.target.value }))}
                placeholder="Enter display name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Color (Primary accent)
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={brandingForm.brandColor}
                  onChange={(e) => setBrandingForm(prev => ({ ...prev, brandColor: e.target.value }))}
                  className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer p-0 bg-transparent flex-shrink-0"
                />
                <input
                  type="text"
                  value={brandingForm.brandColor}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.startsWith('#') || val.length === 0) {
                      setBrandingForm(prev => ({ ...prev, brandColor: val }));
                    } else {
                      setBrandingForm(prev => ({ ...prev, brandColor: `#${val}` }));
                    }
                  }}
                  placeholder="#5B94E5"
                  maxLength={7}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all text-sm uppercase"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">This color is used for active state headers, sidebar icons, and buttons.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL (Horizontal orientation)
              </label>
              <input
                type="text"
                value={brandingForm.logoUrl}
                onChange={(e) => setBrandingForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">URL of a PNG or SVG logo. Recommended dimensions: ~240x60px.</p>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Branding Live Preview</h4>
              
              {/* Preview Box mimicking part of layout */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col h-48">
                {/* Header preview */}
                <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {brandingForm.logoUrl ? (
                      <img 
                        src={brandingForm.logoUrl} 
                        alt="Logo preview" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="max-h-5 object-contain"
                      />
                    ) : (
                      <span className="text-sm font-bold" style={{ color: brandingForm.brandColor }}>
                        {brandingForm.brandName || 'melon'}
                      </span>
                    )}
                  </div>
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: brandingForm.brandColor }}></div>
                </div>
                
                {/* Content area preview */}
                <div className="p-4 flex-1 flex gap-3 bg-gray-50/30">
                  <div className="w-20 border-r border-gray-100 flex flex-col gap-1.5 pr-2">
                    <div className="h-5 rounded px-2 py-0.5 text-[8px] font-medium flex items-center gap-1.5" style={{ backgroundColor: `${brandingForm.brandColor}1A`, color: brandingForm.brandColor }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brandingForm.brandColor }}></div>
                      Overview
                    </div>
                    <div className="h-5 rounded px-2 py-0.5 text-[8px] text-gray-400 flex items-center">
                      KYC
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-6 rounded-md w-1/3 flex items-center justify-center text-[8px] font-bold text-white shadow-sm" style={{ backgroundColor: brandingForm.brandColor }}>
                      Button
                    </div>
                    <div className="h-10 border border-dashed border-gray-200 rounded flex items-center justify-center text-[8px] text-gray-400">
                      Dashboard Panel
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 mt-4 leading-normal">
              Note: Changes here will take effect immediately for all members of your organization on save. Generated PDF reports will also be updated automatically.
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'notifications':
        return renderNotifications();
      case 'privacy':
        return renderPrivacy();
      case 'preferences':
        return renderPreferences();
      case 'branding':
        if (!organization?.isWhiteLabel && !isAdmin) return renderUpgradeCTA('White-Label Branding', '', true);
        return renderBranding();
      case 'integrations':
        if (isTrial) return renderUpgradeCTA('API & Integrations', 'Connect Melon with your existing tools, automate workflows, and access our robust API.');
        return <IntegrationsSettingsPage />;
      case 'billing':
        if (isTrial) return renderUpgradeCTA('Organization Billing', 'Manage invoices, payment methods, and subscription plans for your entire organization.');
        return <div className="text-center py-12 text-gray-500">Billing settings coming soon</div>;
      case 'team':
        if (isTrial) return renderUpgradeCTA('Team Management', 'Invite team members, assign roles, and collaborate on data collection projects.');
        return <div className="text-center py-12 text-gray-500">Team management coming soon</div>;
      case 'admin':
        return <PlatformAdministration />;
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
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${activeTab === tab.id
                    ? 'bg-blue-50 text-[#5B94E5] font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </div>
                  {tab.requiresUpgrade && (
                    <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Lock
                    </span>
                  )}
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
                {activeTab !== 'admin' && (
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
                )}
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