/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
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
  AlertTriangle
} from 'lucide-react';

export default function NotificationSettingsPage() {
  const [loading, setLoading] = useState(false);
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
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Show success message
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
            <h1 className="text-2xl font-semibold text-gray-900">Notification Settings</h1>
            <p className="text-gray-600 mt-1">Manage how and when you receive notifications</p>
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

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              toggleAllForChannel('email', true);
              toggleAllForChannel('push', true);
              toggleAllForChannel('inApp', true);
            }}
            className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg hover:bg-green-200 transition-colors cursor-pointer"
          >
            Enable All Notifications
          </button>
          <button
            onClick={() => {
              toggleAllForChannel('email', false);
              toggleAllForChannel('push', false);
              toggleAllForChannel('inApp', false);
            }}
            className="px-4 py-2 bg-red-100 text-red-800 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors cursor-pointer"
          >
            Disable All Notifications
          </button>
          <button
            onClick={() => {
              toggleAllForChannel('email', false);
              toggleAllForChannel('push', false);
              setSettings(prev => ({
                ...prev,
                inApp: { ...prev.inApp, securityAlerts: true, metricAlerts: true, deadlineReminders: true }
              }));
            }}
            className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors cursor-pointer"
          >
            Essential Only
          </button>
        </div>
      </div>

      {/* Notification Matrix */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
          <p className="text-sm text-gray-500 mt-1">Choose how you want to be notified for each type of activity</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notification Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Push
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-2">
                    <Bell className="w-4 h-4" />
                    In-App
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notificationTypes.map((type) => (
                <tr key={type.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg mt-1">
                        <type.icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{type.label}</p>
                        <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {type.category}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggle('email', type.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B94E5] focus:ring-offset-2 ${
                        settings.email[type.id as keyof typeof settings.email] ? 'bg-[#5B94E5]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.email[type.id as keyof typeof settings.email] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggle('push', type.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B94E5] focus:ring-offset-2 ${
                        settings.push[type.id as keyof typeof settings.push] ? 'bg-[#5B94E5]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.push[type.id as keyof typeof settings.push] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggle('inApp', type.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B94E5] focus:ring-offset-2 ${
                        settings.inApp[type.id as keyof typeof settings.inApp] ? 'bg-[#5B94E5]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.inApp[type.id as keyof typeof settings.inApp] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timing & Frequency */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Timing & Frequency</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Digest Frequency
            </label>
            <select
              value={settings.frequency.digestFrequency}
              onChange={(e) => handleFrequencyChange('digestFrequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] cursor-pointer"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="never">Never</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Timing
            </label>
            <select
              value={settings.frequency.reminderTiming}
              onChange={(e) => handleFrequencyChange('reminderTiming', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] cursor-pointer"
            >
              <option value="1hour">1 hour before</option>
              <option value="24hours">24 hours before</option>
              <option value="3days">3 days before</option>
              <option value="1week">1 week before</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Quiet Hours</h2>
            <p className="text-sm text-gray-500 mt-1">Disable push notifications during specified hours</p>
          </div>
          <button
            onClick={() => handleQuietHoursChange('enabled', !settings.frequency.quietHours.enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B94E5] focus:ring-offset-2 ${
              settings.frequency.quietHours.enabled ? 'bg-[#5B94E5]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.frequency.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {settings.frequency.quietHours.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={settings.frequency.quietHours.start}
                onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5]"
                />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={settings.frequency.quietHours.end}
                onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}