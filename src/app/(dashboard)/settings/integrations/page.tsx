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
  FileText
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
      created: '2024-01-15',
      lastUsed: '2024-01-20',
      status: 'active'
    },
    {
      id: '2',
      name: 'Development Key',
      key: 'mel_sk_9z8y7x6w5v4u3t2s1r0q',
      created: '2024-01-10',
      lastUsed: '2024-01-18',
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
      lastSync: '2024-01-20 10:30 AM',
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
      lastSync: '2024-01-19 3:45 PM',
      features: ['Trigger actions', 'Data sync', 'Custom workflows']
    },
    {
      id: 'webhook',
      name: 'Custom Webhooks',
      description: 'Send data to your custom endpoints',
      icon: Globe,
      status: 'configured',
      lastSync: '2024-01-20 9:15 AM',
      features: ['Real-time events', 'Custom payloads', 'Retry logic']
    }
  ];

  const webhooks = [
    {
      id: '1',
      url: 'https://api.example.com/webhooks/melon',
      events: ['metric.updated', 'report.submitted'],
      status: 'active',
      lastTriggered: '2024-01-20 9:15 AM'
    },
    {
      id: '2',
      url: 'https://hooks.example.org/data/import',
      events: ['project.created', 'project.updated'],
      status: 'active',
      lastTriggered: '2024-01-19 2:30 PM'
    }
  ];

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handleCreateApiKey = () => {
    if (newApiKeyName.trim()) {
      // Simulate API key creation
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
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      case 'configured':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link 
          href="/settings"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>
        
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Integrations</h1>
          <p className="text-gray-600 mt-1">Connect Melon with your favorite tools and services</p>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Key className="w-5 h-5 text-[#5B94E5]" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">API Keys</h2>
              <p className="text-sm text-gray-500">Manage your API keys for programmatic access</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateKey(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create API Key
          </button>
        </div>
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div key={key.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{key.name}</h3>
                <p className="text-xs text-gray-500">Created: {key.created} | Last Used: {key.lastUsed}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => copyToClipboard(key.key, key.name)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {copiedKey === key.name ? 'Copied!' : 'Copy Key'}
                </button>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => handleDeleteApiKey(key.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete Key
                </button>
                <button
                  onClick={() => console.log('Editing API key:', key.id)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Edit Key
                </button>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(key.status)}`}>
                  {getStatusText(key.status)}
                </span>
                </div>
                {showApiKey && (
                    <div className="mt-2">
                        <p className="text-sm text-gray-900">{key.key}</p>
                    </div>
                    )}
                </div>
            ))}
            {showCreateKey && (
              <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Create New API Key</h3>
                <input
                  type="text"
                  value={newApiKeyName}
                  onChange={(e) => setNewApiKeyName(e.target.value)}
                  placeholder="Enter key name"
                  className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                />
                <button
                  onClick={handleCreateApiKey}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Create Key
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Integrations Section */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">Integrations</h2>
          <p className="text-sm text-gray-500">Connect your favorite tools and services</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <integration.icon className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{integration.name}</h3>
                  <p className="text-xs text-gray-500">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(integration.status)}`}>
                  {getStatusText(integration.status)}
                </span>
                {integration.lastSync && (
                  <span className="text-xs text-gray-500">Last Sync: {integration.lastSync}</span>
                )}
              </div>
              <ul className="text-xs text-gray-600 space-y-1 mb-4">
                {integration.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleToggleIntegration(integration.id)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
        {/* Webhooks Section */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Webhooks</h2>
          <p className="text-sm text-gray-500">Configure webhooks to receive real-time updates</p>
          <div className="mt-4 space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{webhook.url}</h3>
                  <p className="text-xs text-gray-500">Events: {webhook.events.join(', ')}</p>
                  <p className="text-xs text-gray-500">Last Triggered: {webhook.lastTriggered}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => copyToClipboard(webhook.url, webhook.id)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {copiedKey === webhook.id ? 'Copied!' : 'Copy URL'}
                  </button>
                  <button
                    onClick={() => console.log('Editing webhook:', webhook.id)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => console.log('Deleting webhook:', webhook.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Create Webhook Button */}
        <div className="mt-6">
          <button
            onClick={() => console.log('Creating new webhook')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4" />
            Create Webhook
          </button>
        </div>
        <div className="mt-6">
          <button
            onClick={() => console.log('Creating new webhook')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4" />
            Create Webhook
          </button>
        </div>
      </div>     
  );
}