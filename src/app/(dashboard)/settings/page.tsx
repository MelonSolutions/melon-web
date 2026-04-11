'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
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
  Check,
  Zap,
  Lock,
  MessageSquare,
  Clock,
  Info,
  Activity,
  Layers,
  FileText,
  Settings,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const { theme: currentTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

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
    theme: currentTheme || 'light'
  });

  // Sync preferences theme with current system theme when mounted
  React.useEffect(() => {
    if (mounted && currentTheme) {
      setPreferences(prev => ({ ...prev, theme: currentTheme }));
    }
  }, [mounted, currentTheme]);

  const settingsTabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'team', label: 'Team Management', icon: Users }
  ];

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderNotifications = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em]">Email Notifications</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: 'emailReports', label: 'Report submissions', icon: Database, description: 'Get notified when new report responses are submitted' },
            { key: 'metricAlerts', label: 'Metric alerts', icon: Activity, description: 'Receive alerts when metrics fall below target thresholds' },
            { key: 'deadlineReminders', label: 'Deadline reminders', icon: Clock, description: 'Reminders for upcoming report deadlines' },
            { key: 'projectUpdates', label: 'Project updates', icon: Layers, description: 'Updates on project milestones and progress' },
            { key: 'weeklyDigest', label: 'Weekly digest', icon: FileText, description: 'Weekly summary of your program performance' },
            { key: 'systemMaintenance', label: 'System maintenance', icon: Settings, description: 'Notifications about system updates and maintenance' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-6 rounded-[1.5rem] bg-surface-secondary/30 border border-border/40 hover:border-primary/20 transition-all group font-sans">
              <div className="flex items-center gap-5 flex-1 pr-6">
                <div className="p-3 bg-surface rounded-2xl border border-border group-hover:text-primary transition-colors">
                  {/* @ts-ignore */}
                  {item.icon && <item.icon className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">{item.label}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-300 mt-1 font-bold">{item.description}</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-500 outline-none ${
                  // @ts-ignore
                  notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-800'
                  }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-xl transition-all duration-500 ${
                    // @ts-ignore
                    notifications[item.key as keyof typeof notifications] ? 'translate-x-[24px]' : 'translate-x-1'
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em]">Privacy Settings</h3>
        </div>
        <div className="space-y-6">
          <div className="p-8 rounded-[2rem] bg-surface-secondary/30 border border-border/40 font-sans">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] mb-4 block">
              Profile Visibility
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['public', 'organization', 'private'].map((v) => (
                <button
                  key={v}
                  onClick={() => setPrivacy(prev => ({ ...prev, profileVisibility: v }))}
                  className={`px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all duration-300 ${privacy.profileVisibility === v
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-surface text-gray-500 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {[
            { key: 'dataSharing', label: 'Data Sharing', icon: Info, description: 'Allow anonymized data to be used for research' },
            { key: 'twoFactorAuth', label: 'Two-Factor Authentication', icon: Shield, description: 'Add an extra layer of security to your account' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-6 rounded-[1.5rem] bg-surface-secondary/30 border border-border/40 hover:border-primary/20 transition-all group font-sans">
              <div className="flex items-center gap-5 flex-1 pr-6">
                <div className="p-3 bg-surface rounded-2xl border border-border group-hover:text-primary transition-colors">
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">{item.label}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-600 mt-1 font-bold">{item.description}</p>
                </div>
              </div>
              <button
                onClick={() => setPrivacy(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-500 outline-none ${
                  // @ts-ignore
                  privacy[item.key as keyof typeof privacy] ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-800'
                  }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-xl transition-all duration-500 ${
                    // @ts-ignore
                    privacy[item.key as keyof typeof privacy] ? 'translate-x-[24px]' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mt-12 mb-8">
          <div className="w-1.5 h-6 bg-error rounded-full"></div>
          <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em]">Password & Security</h3>
        </div>
        <div className="space-y-4">
          <button className="w-full p-6 bg-surface border border-border rounded-[1.8rem] hover:border-primary/30 transition-all duration-300 group font-sans text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-surface-secondary rounded-2xl border border-border group-hover:text-primary transition-colors">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Change Password</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-bold">Last changed 3 months ago</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
            </div>
          </button>

          <button className="w-full p-6 bg-surface border border-border rounded-[1.8rem] hover:border-primary/30 transition-all duration-300 group font-sans text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-surface-secondary rounded-2xl border border-border group-hover:text-primary transition-colors">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Download Account Data</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-bold">Export all your data</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 font-sans">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em]">Regional Settings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface-secondary/30 border border-border/40 p-10 rounded-[2.5rem]">
          {[
            { key: 'language', label: 'Language', options: [{ v: 'en', l: 'English' }, { v: 'fr', l: 'Français' }, { v: 'es', l: 'Español' }] },
            { key: 'timezone', label: 'Timezone', options: [{ v: 'Africa/Lagos', l: 'Africa/Lagos (WAT)' }, { v: 'UTC', l: 'UTC' }, { v: 'America/New_York', l: 'America/New_York (EST)' }] },
            { key: 'dateFormat', label: 'Date Format', options: [{ v: 'DD/MM/YYYY', l: 'DD/MM/YYYY' }, { v: 'MM/DD/YYYY', l: 'MM/DD/YYYY' }, { v: 'YYYY-MM-DD', l: 'YYYY-MM-DD' }] },
            { key: 'currency', label: 'Currency', options: [{ v: 'NGN', l: 'Nigerian Naira (₦)' }, { v: 'USD', l: 'US Dollar ($)' }, { v: 'EUR', l: 'Euro (€)' }] }
          ].map((field) => (
            <div key={field.key} className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.22em] flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                {field.label}
              </label>
              <select
                // @ts-ignore
                value={preferences[field.key as keyof typeof preferences]}
                onChange={(e) => setPreferences(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full px-6 py-4 bg-surface border border-border rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-[11px] font-black uppercase tracking-widest appearance-none cursor-pointer hover:border-primary/20"
              >
                {field.options.map(o => (
                  <option key={o.v} value={o.v} className="font-bold">{o.l}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mt-12 mb-8">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em]">Display Settings</h3>
        </div>
        <div className="p-8 bg-surface-secondary/30 border border-border/40 rounded-[2rem] flex flex-wrap gap-4">
          {['light', 'dark', 'system'].map((t) => (
            <button
              key={t}
              onClick={() => {
                const newTheme = t === 'system' ? 'system' : t;
                setPreferences(prev => ({ ...prev, theme: newTheme }));
                setTheme(newTheme);
              }}
              className={`px-8 py-4 rounded-xl border-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${preferences.theme === t
                ? 'border-primary bg-primary/10 text-primary shadow-xl shadow-primary/10 scale-[1.05]'
                : 'border-border bg-surface text-gray-400 hover:border-gray-400 hover:bg-surface-secondary'
                }`}
            >
              {t === 'system' ? 'Auto' : t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 font-sans">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em]">API Access</h3>
        </div>
        <div className="bg-surface rounded-[2.5rem] border border-border p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <Key className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">API Key</p>
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-[10px] font-black text-primary hover:text-primary/70 uppercase tracking-widest transition-all"
              >
                {showApiKey ? <EyeOff className="w-4 h-4 inline mr-2" /> : <Eye className="w-4 h-4 inline mr-2" />}
                {showApiKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 px-6 py-4 bg-surface-secondary/50 border border-border rounded-xl font-mono text-xs text-gray-900 dark:text-gray-100 shadow-inner flex items-center overflow-hidden">
                {showApiKey ? 'mel_sk_1a2b3c4d5e6f7g8h9i0j' : '••••••••••••••••••••••••••••••••'}
              </div>
              <Button variant="secondary" className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px]">
                Copy
              </Button>
            </div>
            <p className="text-[10px] text-gray-400 mt-4 font-bold flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              Use this API key to integrate with external systems
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mt-12 mb-8">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em]">Connected Services</h3>
        </div>
        <div className="space-y-4">
          {[
            { name: 'Google Sheets', status: 'connected', description: 'Export data automatically' },
            { name: 'Slack', status: 'disconnected', description: 'Get notifications in Slack' },
            { name: 'Zapier', status: 'connected', description: 'Automate workflows' }
          ].map((service, index) => (
            <div key={index} className="flex items-center justify-between p-6 bg-surface border border-border rounded-[1.8rem] hover:border-primary/20 transition-all group shadow-sm">
              <div className="pr-6">
                <p className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest group-hover:text-primary transition-colors">{service.name}</p>
                <p className="text-[10px] text-gray-400 mt-1 font-bold italic">{service.description}</p>
              </div>
              <Button
                variant={service.status === 'connected' ? 'secondary' : 'primary'}
                className={`rounded-xl px-10 font-black uppercase tracking-widest text-[9px] border-border/60 ${service.status === 'connected' ? 'text-error border-error/10 hover:bg-error/5 hover:text-error' : ''
                  }`}
              >
                {service.status === 'connected' ? 'Disconnect' : 'Connect'}
              </Button>
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
        return (
          <div className="flex flex-col items-center justify-center py-32 font-sans opacity-40">
            <CreditCard className="w-12 h-12 mb-6" />
            <h3 className="text-xl font-black uppercase tracking-tighter text-center">Billing settings coming soon</h3>
          </div>
        );
      case 'team':
        return (
          <div className="flex flex-col items-center justify-center py-32 font-sans opacity-40">
            <Users className="w-12 h-12 mb-6" />
            <h3 className="text-xl font-black uppercase tracking-tighter text-center">Team management coming soon</h3>
          </div>
        );
      default:
        return renderNotifications();
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 font-sans">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Authoritative Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="sticky top-10 space-y-10">
            <div>
              <div className="flex items-center gap-3 mb-2 px-3">
                <div className="w-2 h-8 bg-primary rounded-full"></div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Settings</h1>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] px-4 opacity-70">Manage your account and preferences</p>
            </div>

            <nav className="bg-surface rounded-[2.5rem] border border-border p-6 shadow-sm space-y-2">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full group flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-500 outline-none ${activeTab === tab.id
                    ? 'bg-primary text-white shadow-2xl shadow-primary/30 scale-[1.05]'
                    : 'text-gray-500 hover:bg-surface-secondary hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                  <tab.icon className={`w-4 h-4 transition-transform duration-500 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="text-[11px] font-black uppercase tracking-[0.1em]">{tab.label}</span>
                </button>
              ))}
            </nav>


          </div>
        </div>

        {/* Global Configuration Panel */}
        <div className="flex-1 min-w-0">
          <div className="bg-surface rounded-[3rem] border border-border shadow-sm overflow-hidden min-h-[800px] flex flex-col">
            <div className="px-10 py-8 border-b border-border/60 bg-surface-secondary/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-sm">
                  {/* @ts-ignore */}
                  {settingsTabs.find(tab => tab.id === activeTab)?.icon && React.createElement(settingsTabs.find(tab => tab.id === activeTab).icon, { className: "w-5 h-5 text-primary" })}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
                    {settingsTabs.find(tab => tab.id === activeTab)?.label}
                  </h2>
                </div>
              </div>
              <Button
                onClick={handleSave}
                disabled={loading}
                className={`rounded-xl px-12 py-4 shadow-xl font-black uppercase tracking-[0.2em] text-[10px] min-w-[200px] transition-all duration-500 ${saved ? 'bg-emerald-500 hover:bg-emerald-600 border-none' : 'shadow-primary/20 bg-primary'
                  } disabled:opacity-50`}
                icon={loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              >
                {loading ? 'Processing...' : saved ? 'Saved' : 'Save Changes'}
              </Button>
            </div>

            <div className="p-12 flex-1 relative overflow-hidden">
              {/* Watermark accent */}
              <div className="absolute -bottom-20 -right-20 opacity-[0.02] pointer-events-none select-none">
                {/* @ts-ignore */}
                {settingsTabs.find(tab => tab.id === activeTab)?.icon && React.createElement(settingsTabs.find(tab => tab.id === activeTab).icon, { className: "w-[500px] h-[500px]" })}
              </div>

              <div className="relative z-10 max-w-4xl">
                {renderContent()}
              </div>
            </div>

            <div className="px-10 py-6 border-t border-border/60 bg-surface-secondary/10 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gray-400">
              <div>Core OS v4.2.0-STABLE</div>
              <div className="flex items-center gap-6">
                <span className="hover:text-primary transition-colors cursor-pointer">Support Channel</span>
                <span className="hover:text-primary transition-colors cursor-pointer">Documentation Matrix</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
