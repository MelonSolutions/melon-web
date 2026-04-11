/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  Save,
  Bell,
  Mail,
  Smartphone,
  Clock,
  Users,
  BarChart3,
  FileText,
  AlertTriangle,
  Check,
  Zap,
  Shield,
  Clock3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotificationSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    email: {
      projectUpdates: true,
      metricAlerts: true,
      reportSubmissions: false,
      teamActivity: true,
      deadlineReminders: true,
      weeklyDigest: true,
      systemUpdates: false,
      securityAlerts: true
    },
    push: {
      projectUpdates: false,
      metricAlerts: true,
      reportSubmissions: false,
      teamActivity: false,
      deadlineReminders: true,
      weeklyDigest: false,
      systemUpdates: false,
      securityAlerts: true
    },
    inApp: {
      projectUpdates: true,
      metricAlerts: true,
      reportSubmissions: true,
      teamActivity: true,
      deadlineReminders: true,
      weeklyDigest: false,
      systemUpdates: true,
      securityAlerts: true
    },
    frequency: {
      digestFrequency: 'weekly',
      reminderTiming: '24hours',
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '07:00'
      }
    }
  });

  const notificationTypes = [
    {
      id: 'projectUpdates',
      label: 'Project Updates',
      description: 'Updates on project milestones, status changes, and progress',
      icon: Users,
      category: 'Projects'
    },
    {
      id: 'metricAlerts',
      label: 'Metric Alerts',
      description: 'Alerts when metrics fall below target thresholds or achieve goals',
      icon: BarChart3,
      category: 'Impact Metrics'
    },
    {
      id: 'reportSubmissions',
      label: 'Report Submissions',
      description: 'New form responses and data collection updates',
      icon: FileText,
      category: 'Reports'
    },
    {
      id: 'teamActivity',
      label: 'Team Activity',
      description: 'When team members comment, edit, or share content',
      icon: Users,
      category: 'Collaboration'
    },
    {
      id: 'deadlineReminders',
      label: 'Deadline Reminders',
      description: 'Upcoming deadlines for reports and project milestones',
      icon: Clock,
      category: 'Reminders'
    },
    {
      id: 'weeklyDigest',
      label: 'Weekly Digest',
      description: 'Summary of your account activity and performance',
      icon: Mail,
      category: 'Digest'
    },
    {
      id: 'systemUpdates',
      label: 'System Updates',
      description: 'Platform updates, maintenance notifications, and new features',
      icon: Bell,
      category: 'System'
    },
    {
      id: 'securityAlerts',
      label: 'Security Alerts',
      description: 'Important security notifications and account access alerts',
      icon: AlertTriangle,
      category: 'Security'
    }
  ];

  const handleToggle = (channel: 'email' | 'push' | 'inApp', type: string) => {
    setSettings(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: !prev[channel][type as keyof (typeof prev)['email']]
      }
    }));
  };

  const handleFrequencyChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      frequency: {
        ...prev.frequency,
        [key]: value
      }
    }));
  };

  const handleQuietHoursChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      frequency: {
        ...prev.frequency,
        quietHours: {
          ...prev.frequency.quietHours,
          [key]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAllForChannel = (channel: 'email' | 'push' | 'inApp', enabled: boolean) => {
    const newChannelSettings = Object.keys(settings[channel]).reduce((acc, key) => {
      acc[key as keyof typeof settings[typeof channel]] = enabled;
      return acc;
    }, {} as any);

    setSettings(prev => ({
      ...prev,
      [channel]: newChannelSettings
    }));
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div>
            <Link 
              href="/settings"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 hover:text-primary transition-colors mb-6 group"
            >
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
              Back to Settings
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-2 h-10 bg-primary rounded-full"></div>
              <div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Notification Settings</h1>
                <p className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em] mt-1 opacity-70">Manage how and when you receive notifications</p>
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

        {/* Quick Actions Card */}
        <div className="bg-surface-secondary/20 dark:bg-white/5 border border-border/60 dark:border-white/10 rounded-[2.5rem] p-8 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 text-primary">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Quick Actions</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">Manage global notification channels</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="secondary" 
              size="sm" 
              className="rounded-xl px-6 font-black uppercase tracking-widest text-[9px] border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
              onClick={() => {
                toggleAllForChannel('email', true);
                toggleAllForChannel('push', true);
                toggleAllForChannel('inApp', true);
              }}
            >
              Enable All
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="rounded-xl px-6 font-black uppercase tracking-widest text-[9px] border-error/20 text-error dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
              onClick={() => {
                toggleAllForChannel('email', false);
                toggleAllForChannel('push', false);
                toggleAllForChannel('inApp', false);
              }}
            >
              Disable All
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="rounded-xl px-6 font-black uppercase tracking-widest text-[9px] border-primary/20 text-primary dark:text-primary-light"
              onClick={() => {
                toggleAllForChannel('email', false);
                toggleAllForChannel('push', false);
                setSettings(prev => ({
                  ...prev,
                  inApp: { ...prev.inApp, securityAlerts: true, metricAlerts: true, deadlineReminders: true }
                }));
              }}
            >
              Essential Only
            </Button>
          </div>
        </div>

        {/* Notification Matrix Card */}
        <div className="bg-surface dark:bg-black/20 rounded-[3rem] border border-border dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
          <div className="px-10 py-8 border-b border-border/60 dark:border-white/10 bg-surface-secondary/30 dark:bg-white/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-surface dark:bg-white/10 rounded-2xl border border-border dark:border-white/10 shadow-sm">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Notification Preferences</h2>
                <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 opacity-80">Choose how you want to be notified for each type of activity</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-surface-secondary/10 dark:bg-white/5">
                  <th className="px-10 py-6 text-left text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] border-b border-border/40 dark:border-white/10">
                    Notification Type
                  </th>
                  <th className="px-6 py-6 text-center text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] border-b border-border/40 min-w-[120px] dark:border-white/10">
                    <div className="flex flex-col items-center gap-1">
                      <Mail className="w-3.5 h-3.5 mb-1" />
                      Email
                    </div>
                  </th>
                  <th className="px-6 py-6 text-center text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] border-b border-border/40 min-w-[120px] dark:border-white/10">
                    <div className="flex flex-col items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 mb-1" />
                      Push
                    </div>
                  </th>
                  <th className="px-6 py-6 text-center text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] border-b border-border/40 min-w-[120px] dark:border-white/10">
                    <div className="flex flex-col items-center gap-1">
                      <Bell className="w-3.5 h-3.5 mb-1" />
                      In-App
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 dark:divide-white/10">
                {notificationTypes.map((type) => (
                  <tr key={type.id} className="group hover:bg-primary/[0.02] dark:hover:bg-primary/5 transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-start gap-5">
                        <div className="p-3 bg-surface-secondary/50 dark:bg-white/5 rounded-2xl border border-border dark:border-white/10 group-hover:border-primary/20 transition-all">
                          <type.icon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">{type.label}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-bold leading-relaxed max-w-md">{type.description}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <span className="px-3 py-1 bg-surface-secondary dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 rounded-full border border-border/40 dark:border-white/10">
                              {type.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    {(['email', 'push', 'inApp'] as const).map((channel) => (
                      <td key={channel} className="px-6 py-8 text-center">
                        <button
                          onClick={() => handleToggle(channel, type.id)}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-500 outline-none ${
                            settings[channel][type.id as keyof typeof settings.email] ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-gray-200 dark:bg-gray-800'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-all duration-500 ${
                              settings[channel][type.id as keyof typeof settings.email] ? 'translate-x-[24px]' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Timing & Quiet Hours Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Scheduling Card */}
          <div className="bg-surface dark:bg-black/20 rounded-[2.5rem] border border-border dark:border-white/10 p-10 shadow-sm flex flex-col">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Clock3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase tracking-widest text-sm">Timing & Frequency</h3>
                <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 opacity-80">Configure how often you receive updates</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.22em] flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  Digest Frequency
                </label>
                <select
                  value={settings.frequency.digestFrequency}
                  onChange={(e) => handleFrequencyChange('digestFrequency', e.target.value)}
                  className="w-full px-6 py-4 bg-surface-secondary/30 dark:bg-white/5 border border-border dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-[11px] font-black uppercase tracking-widest appearance-none cursor-pointer hover:border-primary/20"
                >
                  <option value="daily" className="dark:bg-gray-900">Daily</option>
                  <option value="weekly" className="dark:bg-gray-900">Weekly</option>
                  <option value="monthly" className="dark:bg-gray-900">Monthly</option>
                  <option value="never" className="dark:bg-gray-900">Never</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.22em] flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  Reminder Timing
                </label>
                <select
                  value={settings.frequency.reminderTiming}
                  onChange={(e) => handleFrequencyChange('reminderTiming', e.target.value)}
                  className="w-full px-6 py-4 bg-surface-secondary/30 dark:bg-white/5 border border-border dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-[11px] font-black uppercase tracking-widest appearance-none cursor-pointer hover:border-primary/20"
                >
                  <option value="1hour" className="dark:bg-gray-900">1 hour before</option>
                  <option value="24hours" className="dark:bg-gray-900">24 hours before</option>
                  <option value="3days" className="dark:bg-gray-900">3 days before</option>
                  <option value="1week" className="dark:bg-gray-900">1 week before</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quiet Hours Card */}
          <div className="bg-surface dark:bg-black/20 rounded-[2.5rem] border border-border dark:border-white/10 p-10 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase tracking-widest text-sm">Quiet Hours</h3>
                  <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 opacity-80">Disable push notifications during specified hours</p>
                </div>
              </div>
              <button
                onClick={() => handleQuietHoursChange('enabled', !settings.frequency.quietHours.enabled)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-500 outline-none ${
                  settings.frequency.quietHours.enabled ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-gray-200 dark:bg-gray-800'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-all duration-500 ${
                    settings.frequency.quietHours.enabled ? 'translate-x-[24px]' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className={`space-y-8 transition-all duration-500 ${settings.frequency.quietHours.enabled ? 'opacity-100 translate-y-0' : 'opacity-30 pointer-events-none'}`}>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.22em] flex items-center gap-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={settings.frequency.quietHours.start}
                    onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                    className="w-full px-6 py-4 bg-surface-secondary/30 dark:bg-white/5 border border-border dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary transition-all outline-none font-black text-xs"
                    />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.22em] flex items-center gap-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={settings.frequency.quietHours.end}
                    onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                    className="w-full px-6 py-4 bg-surface-secondary/30 dark:bg-white/5 border border-border dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary transition-all outline-none font-black text-xs"
                  />
                </div>
              </div>
              <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-[1.5rem] border border-amber-200/50 dark:border-amber-900/30">
                <p className="text-[9px] font-bold text-amber-700 dark:text-amber-400 leading-relaxed italic flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Note: Security alerts and critical threshold breaches bypass quiet hour settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}