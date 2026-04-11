/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  Save,
  Shield,
  Eye,
  Download,
  AlertTriangle,
  Lock,
  Database,
  Check,
  Zap,
  Trash2,
  Key,
  Smartphone,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PrivacySettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
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
    { value: 'organization', label: 'Organization Only', description: 'Visible to members of your organization' },
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
    { value: 'json', label: 'JSON', description: 'Web-standard format' },
    { value: 'csv', label: 'CSV', description: 'Spreadsheet compatible' },
    { value: 'pdf', label: 'PDF', description: 'Document format' }
  ];

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataExport = async () => {
    try {
      const data = {
        profile: { username: 'test_user', organization: 'Melon' },
        projects: [],
        metrics: [],
        reports: []
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
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div>
            <Link 
              href="/settings"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 hover:text-primary transition-colors mb-6 group cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
              Portal Access
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-2 h-10 bg-primary rounded-full"></div>
              <div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Privacy & Security</h1>
                <p className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em] mt-1 opacity-70">Manage your data preferences and security settings</p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={loading}
            className={`rounded-xl px-12 py-4 shadow-xl font-black uppercase tracking-[0.2em] text-[10px] min-w-[220px] transition-all duration-500 ${saved ? 'bg-emerald-500 hover:bg-emerald-600 border-none' : 'shadow-primary/20 bg-primary'}`}
            icon={loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          >
            {loading ? 'Saving...' : saved ? 'Changes Saved' : 'Save Changes'}
          </Button>
        </div>

        {/* Security Status Card */}
        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-[2.5rem] p-8 flex items-center gap-6">
          <div className="p-4 bg-primary/10 rounded-2xl text-primary border border-primary/20">
            <Shield className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest text-sm">Account Protection Status: Robust</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-1 leading-relaxed">Your account data is protected by industry-standard encryption and multi-factor authentication.</p>
          </div>
        </div>

        {/* Core Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Privacy Controls */}
          <div className="bg-surface dark:bg-black/20 rounded-[3rem] border border-border dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
            <div className="px-10 py-8 border-b border-border/60 dark:border-white/10 bg-surface-secondary/30 dark:bg-white/5 flex items-center gap-4">
              <div className="p-3 bg-surface dark:bg-white/10 rounded-2xl border border-border dark:border-white/10 shadow-sm">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase tracking-widest text-sm">Privacy Controls</h2>
                <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5 opacity-80">Control your visibility and data usage</p>
              </div>
            </div>
            
            <div className="p-10 space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  Profile Visibility
                </label>
                <div className="space-y-3">
                  {visibilityOptions.map((option) => (
                    <label 
                      key={option.value} 
                      className={`flex items-center p-5 rounded-2xl border transition-all cursor-pointer group hover:border-primary/40 ${
                        settings.profileVisibility === option.value 
                        ? 'border-primary bg-primary/[0.03] dark:bg-primary/5' 
                        : 'border-border dark:border-white/10 bg-surface-secondary/20 dark:bg-white/5'
                      }`}
                    >
                      <input
                        type="radio"
                        name="profileVisibility"
                        value={option.value}
                        checked={settings.profileVisibility === option.value}
                        onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                        className="h-4 w-4 text-primary border-border focus:ring-primary cursor-pointer"
                      />
                      <div className="ml-5">
                        <p className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">{option.label}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-0.5">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-border/60 dark:border-white/10">
                {[
                  { key: 'dataSharing', label: 'Anonymous Usage Sharing', description: 'Contribute anonymized data to help us improve the platform' },
                  { key: 'analyticsOptOut', label: 'Research Opt-Out', description: 'Prevent your usage data from being processed for platform analytics' },
                  { key: 'cookieConsent', label: 'Essential Cookies', description: 'Enable persistent session management and essential state' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between group">
                    <div className="flex-1">
                      <p className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">{item.label}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-1 leading-relaxed max-w-[280px]">{item.description}</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange(item.key, !settings[item.key as keyof typeof settings])}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-500 outline-none ${
                        settings[item.key as keyof typeof settings] ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-gray-200 dark:bg-gray-800'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-all duration-500 ${
                          settings[item.key as keyof typeof settings] ? 'translate-x-[24px]' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Security & Access */}
          <div className="space-y-10">
            <div className="bg-surface dark:bg-black/20 rounded-[3rem] border border-border dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
              <div className="px-10 py-8 border-b border-border/60 dark:border-white/10 bg-surface-secondary/30 dark:bg-white/5 flex items-center gap-4">
                <div className="p-3 bg-surface dark:bg-white/10 rounded-2xl border border-border dark:border-white/10 shadow-sm">
                  <Lock className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase tracking-widest text-sm">Security Settings</h2>
                  <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5 opacity-80">Manage authentication and account security</p>
                </div>
              </div>

              <div className="p-10 space-y-8">
                <div className="flex items-center justify-between p-6 rounded-[1.5rem] bg-surface-secondary/20 dark:bg-white/5 border border-border dark:border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 border border-emerald-500/20">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Two-Factor Authentication</p>
                      <span className={`text-[9px] font-black uppercase tracking-widest mt-1 block ${settings.twoFactorAuth ? 'text-emerald-500' : 'text-error'}`}>
                        {settings.twoFactorAuth ? 'Status: Active' : 'Status: Inactive'}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="rounded-xl px-6 font-black uppercase tracking-widest text-[9px] border-border dark:border-white/10 text-gray-700 dark:text-gray-300"
                    onClick={() => handleSettingChange('twoFactorAuth', !settings.twoFactorAuth)}
                  >
                    {settings.twoFactorAuth ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.22em] flex items-center gap-2 text-sm">
                      Session Timeout
                    </label>
                    <select
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                      className="w-full px-6 py-4 bg-surface-secondary/30 dark:bg-white/5 border border-border dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary transition-all outline-none text-[11px] font-black uppercase tracking-widest appearance-none cursor-pointer"
                    >
                      {sessionTimeoutOptions.map(opt => <option key={opt.value} value={opt.value} className="dark:bg-gray-900">{opt.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.22em] flex items-center gap-2 text-sm">
                      Data Retention
                    </label>
                    <select
                      value={settings.dataRetention}
                      onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
                      className="w-full px-6 py-4 bg-surface-secondary/30 dark:bg-white/5 border border-border dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary transition-all outline-none text-[11px] font-black uppercase tracking-widest appearance-none cursor-pointer"
                    >
                      {dataRetentionOptions.map(opt => <option key={opt.value} value={opt.value} className="dark:bg-gray-900">{opt.label}</option>)}
                    </select>
                  </div>
                </div>

                <Button variant="secondary" className="w-full rounded-[1.5rem] py-6 border border-border dark:border-white/10 hover:bg-surface-secondary transition-all font-black uppercase tracking-widest text-[10px] text-gray-700 dark:text-gray-300 gap-3">
                  <Key className="w-4 h-4" />
                  Change Password
                </Button>
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-surface dark:bg-black/20 rounded-[3rem] border border-border dark:border-white/10 shadow-sm overflow-hidden">
               <div className="px-10 py-8 border-b border-border/60 dark:border-white/10 bg-surface-secondary/30 dark:bg-white/5 flex items-center gap-4">
                <div className="p-3 bg-surface dark:bg-white/10 rounded-2xl border border-border dark:border-white/10 shadow-sm">
                  <Database className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase tracking-widest text-sm">Data Management</h2>
                  <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5 opacity-80">Export or delete your account data</p>
                </div>
              </div>

              <div className="p-10 space-y-8">
                <div className="grid grid-cols-3 gap-3">
                  {exportFormatOptions.map(opt => (
                    <button 
                      key={opt.value}
                      onClick={() => handleSettingChange('exportFormat', opt.value)}
                      className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                        settings.exportFormat === opt.value 
                        ? 'border-primary bg-primary text-white' 
                        : 'border-border dark:border-white/10 bg-surface-secondary/20 dark:bg-white/5 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <Button className="w-full rounded-[1.5rem] py-5 gap-3 font-black uppercase tracking-widest text-[10px]" onClick={handleDataExport}>
                  <Download className="w-4 h-4" />
                  Export My Data
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-10 bg-error/5 dark:bg-error/10 border border-error/20 rounded-[3rem]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-error/10 rounded-2xl text-error border border-error/20">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-error uppercase tracking-tight">Danger Zone</h3>
                <p className="text-[11px] text-error/80 font-bold mt-1 max-w-md">Deleting your account will permanently remove all associated data, including reports, impact metrics, and project history. This action is irreversible.</p>
              </div>
            </div>
            <Button 
              variant="danger" 
              className="rounded-2xl px-10 py-5 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-error/20 shrink-0"
              onClick={() => setShowDeleteModal(true)}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Delete Account
            </Button>
          </div>
        </div>

        {/* Deletion Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
            <div className="bg-surface dark:bg-gray-900 rounded-[3rem] p-12 max-w-xl w-full border border-border dark:border-white/10 shadow-2xl overflow-hidden relative">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-8 right-8 p-2 hover:bg-surface-secondary/50 dark:hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              <div className="flex flex-col items-center text-center gap-6">
                <div className="p-5 bg-error/10 rounded-3xl text-error border border-error/20">
                  <AlertTriangle className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Confirm Account Deletion</h3>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-2">This action is permanent and irreversible</p>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mt-4 max-w-md font-bold">
                  All your synchronized data, reports, and team collaborations will be permanently removed from our nodes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full mt-8">
                  <Button variant="secondary" className="flex-1 rounded-2xl py-4 font-black uppercase tracking-widest text-[10px]" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" className="flex-1 rounded-2xl py-4 font-black uppercase tracking-widest text-[10px]" onClick={handleAccountDeletion}>
                    Confirm Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}