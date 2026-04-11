'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  Zap,
  Globe,
  Bell,
  FileText,
  Copy,
  Trash2,
  Edit3,
  Shield,
  Info
} from 'lucide-react';

export default function IntegrationsSettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  const apiKeys = [
    {
      id: '1',
      name: 'Production API Key',
      key: 'mel_sk_1a2b3c4d5e6f7g8h9i0j',
      created: 'Jan 15, 2024',
      lastUsed: 'Jan 20, 2024',
      status: 'active'
    },
    {
      id: '2',
      name: 'Development Key',
      key: 'mel_sk_9z8y7x6w5v4u3t2s1r0q',
      created: 'Jan 10, 2024',
      lastUsed: 'Jan 18, 2024',
      status: 'active'
    }
  ];

  const integrations = [
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      description: 'Export data automatically to Google Sheets',
      icon: FileText,
      status: 'connected',
      lastSync: 'Jan 20, 10:30 AM',
      features: ['Auto-export reports', 'Real-time sync', 'Custom templates']
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications in your Slack workspace',
      icon: Bell,
      status: 'disconnected',
      lastSync: null,
      features: ['Metric alerts', 'Report notifications', 'Team updates']
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Automate workflows with 5000+ apps',
      icon: Zap,
      status: 'connected',
      lastSync: 'Jan 19, 3:45 PM',
      features: ['Trigger actions', 'Data sync', 'Custom workflows']
    },
    {
      id: 'webhook',
      name: 'Custom Webhooks',
      description: 'Send data to your custom endpoints',
      icon: Globe,
      status: 'configured',
      lastSync: 'Jan 20, 9:15 AM',
      features: ['Real-time events', 'Custom payloads', 'Retry logic']
    }
  ];

  const webhooks = [
    {
      id: '1',
      url: 'https://api.example.com/webhooks/melon',
      events: ['metric.updated', 'report.submitted'],
      status: 'active',
      lastTriggered: 'Jan 20, 9:15 AM'
    },
    {
      id: '2',
      url: 'https://hooks.example.org/data/import',
      events: ['project.created', 'project.updated'],
      status: 'active',
      lastTriggered: 'Jan 19, 2:30 PM'
    }
  ];

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handleCreateApiKey = () => {
    if (newApiKeyName.trim()) {
      console.log('Creating API key:', newApiKeyName);
      setNewApiKeyName('');
      setShowCreateKey(false);
    }
  };

  const handleDeleteApiKey = (keyId: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      console.log('Deleting API key:', keyId);
    }
  };

  const handleToggleIntegration = (integrationId: string) => {
    console.log('Toggling integration:', integrationId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500';
      case 'disconnected':
        return 'bg-red-500/10 border-red-500/30 text-red-500';
      case 'configured':
        return 'bg-primary/10 border-primary/30 text-primary';
      default:
        return 'bg-gray-200 dark:bg-gray-800 text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'configured':
        return 'Configured';
      case 'active':
        return 'Active';
      default:
        return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 font-sans px-4 sm:px-8 space-y-16">
      {/* Header */}
      <div className="pt-6">
        <Link
          href="/settings"
          className="inline-flex items-center gap-3 text-[10px] font-black text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary mb-10 cursor-pointer uppercase tracking-[0.2em] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Return to Settings
        </Link>

        <div>
          <h1 className="text-5xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight leading-tight mb-4">
            Integrations
          </h1>
          <p className="text-lg font-bold text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
            Connect Melon with your favorite tools and manage API access for custom integrations.
          </p>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="bg-surface rounded-[3rem] border border-border/60 p-12 shadow-xl">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl shadow-lg">
              <Key className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase">API Keys</h2>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">Manage keys for programmatic access to your data</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateKey(true)}
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 font-black text-[11px] uppercase tracking-[0.15em]"
          >
            <Plus className="w-4 h-4" />
            Create API Key
          </button>
        </div>

        {showCreateKey && (
          <div className="mb-10 bg-surface-secondary/30 p-8 rounded-[2rem] border border-border/40">
            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-6 uppercase tracking-tight">Create New API Key</h3>
            <input
              type="text"
              value={newApiKeyName}
              onChange={(e) => setNewApiKeyName(e.target.value)}
              placeholder="Enter key name (e.g., Production API Key)"
              className="w-full px-5 py-4 border border-border/60 rounded-xl bg-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all duration-300 mb-6 text-sm font-bold placeholder:text-gray-400 dark:placeholder:text-gray-600"
            />
            <div className="flex gap-4">
              <button
                onClick={handleCreateApiKey}
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.15em] shadow-lg"
              >
                Create Key
              </button>
              <button
                onClick={() => setShowCreateKey(false)}
                className="px-8 py-3 border-2 border-border rounded-xl text-gray-600 dark:text-gray-400 hover:bg-surface-secondary transition-all duration-300 font-black text-[10px] uppercase tracking-[0.15em]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {apiKeys.map((key) => (
            <div key={key.id} className="bg-surface-secondary/20 p-8 rounded-[2rem] border border-border/40 hover:border-primary/30 transition-all duration-500 group">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2 uppercase tracking-tight">{key.name}</h3>
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                    <span>Created: {key.created}</span>
                    <span>•</span>
                    <span>Last Used: {key.lastUsed}</span>
                  </div>
                </div>
                <span className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border-2 shadow-lg ${getStatusBadge(key.status)}`}>
                  {getStatusText(key.status)}
                </span>
              </div>

              <div className="bg-surface p-5 rounded-xl border border-border/40 mb-6">
                <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                  {showApiKey ? key.key : '••••••••••••••••••••••••••••••••'}
                </code>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => copyToClipboard(key.key, key.id)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-black text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary cursor-pointer uppercase tracking-widest transition-all duration-300 rounded-lg hover:bg-surface-secondary"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedKey === key.id ? 'Copied!' : 'Copy Key'}
                </button>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-black text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary cursor-pointer uppercase tracking-widest transition-all duration-300 rounded-lg hover:bg-surface-secondary"
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => console.log('Editing API key:', key.id)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-black text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary cursor-pointer uppercase tracking-widest transition-all duration-300 rounded-lg hover:bg-surface-secondary"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteApiKey(key.id)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-black text-red-500 hover:text-red-600 cursor-pointer uppercase tracking-widest transition-all duration-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-gradient-to-br from-primary/10 to-emerald-500/5 border border-primary/20 rounded-[2rem] p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 group-hover:scale-125 transition-transform duration-1000 blur-3xl"></div>
          <div className="flex items-start gap-5 relative z-10">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl shadow-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight mb-2">Security Best Practices</h4>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 leading-relaxed">
                Keep your API keys secure. Never expose them in client-side code or public repositories. Rotate keys regularly and use environment variables in production.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations Section */}
      <div className="space-y-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Available Integrations</h2>
          </div>
          <p className="text-sm font-bold text-gray-600 dark:text-gray-400 leading-relaxed">
            Connect your favorite tools and services to automate workflows
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {integrations.map((integration) => (
            <div key={integration.id} className="bg-surface rounded-[2rem] border border-border/60 p-8 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-1000 blur-3xl"></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                      <integration.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{integration.name}</h3>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">{integration.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <span className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border-2 shadow-lg ${getStatusBadge(integration.status)}`}>
                    {getStatusText(integration.status)}
                  </span>
                  {integration.lastSync && (
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Last Sync: {integration.lastSync}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {integration.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-xs font-bold text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleToggleIntegration(integration.id)}
                  className={`w-full px-6 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 shadow-lg ${
                    integration.status === 'connected' || integration.status === 'configured'
                      ? 'bg-red-500/10 border-2 border-red-500/30 text-red-500 hover:bg-red-500/20'
                      : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20 hover:shadow-xl hover:shadow-primary/30'
                  }`}
                >
                  {integration.status === 'connected' || integration.status === 'configured' ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhooks Section */}
      <div className="bg-surface rounded-[3rem] border border-border/60 p-12 shadow-xl">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-2xl shadow-lg">
              <Globe className="w-7 h-7 text-violet-500" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase">Webhooks</h2>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">Configure webhooks to receive real-time updates</p>
            </div>
          </div>
          <button
            onClick={() => console.log('Creating new webhook')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-violet-500 text-white rounded-xl hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 shadow-xl shadow-violet-500/20 hover:shadow-2xl hover:shadow-violet-500/30 transition-all duration-300 font-black text-[11px] uppercase tracking-[0.15em]"
          >
            <Plus className="w-4 h-4" />
            Create Webhook
          </button>
        </div>

        <div className="space-y-6">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="bg-surface-secondary/20 p-8 rounded-[2rem] border border-border/40 hover:border-violet-500/30 transition-all duration-500">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <code className="text-sm font-mono font-bold text-gray-900 dark:text-gray-100 bg-surface px-4 py-2 rounded-lg border border-border inline-block">
                      {webhook.url}
                    </code>
                  </div>
                  <span className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border-2 shadow-lg ml-4 ${getStatusBadge(webhook.status)}`}>
                    {getStatusText(webhook.status)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {webhook.events.map((event, index) => (
                    <span key={index} className="px-3 py-1.5 bg-surface-secondary rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 border border-border/40">
                      {event}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-4">
                  Last Triggered: {webhook.lastTriggered}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => copyToClipboard(webhook.url, webhook.id)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-black text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary cursor-pointer uppercase tracking-widest transition-all duration-300 rounded-lg hover:bg-surface-secondary"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedKey === webhook.id ? 'Copied!' : 'Copy URL'}
                </button>
                <button
                  onClick={() => console.log('Editing webhook:', webhook.id)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-black text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary cursor-pointer uppercase tracking-widest transition-all duration-300 rounded-lg hover:bg-surface-secondary"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => console.log('Deleting webhook:', webhook.id)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-black text-red-500 hover:text-red-600 cursor-pointer uppercase tracking-widest transition-all duration-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
