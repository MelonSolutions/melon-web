'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Key, Eye, EyeOff, CheckCircle, Zap, Globe, Bell, FileText, Trash2, ExternalLink, Play, RefreshCw, ChevronDown, ChevronUp, Send
} from 'lucide-react';
import { listApiKeys, createApiKey, revokeApiKey, ApiKey } from '@/lib/api/api-keys';
import { getEndpoints, createEndpoint, deleteEndpoint, getEndpointHistory, testEndpoint, replayEvent, WebhookEndpoint, WebhookEventLog } from '@/lib/api/webhooks';

export default function IntegrationsSettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<'live' | 'sandbox'>('sandbox');
  const [newKeySecret, setNewKeySecret] = useState(''); // Store newly generated secret

  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Webhooks state
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState(true);
  const [showCreateWebhook, setShowCreateWebhook] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState('kyc.verified,kyc.rejected');
  const [expandedWebhookId, setExpandedWebhookId] = useState<string | null>(null);
  const [webhookHistory, setWebhookHistory] = useState<WebhookEventLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [testingEndpointId, setTestingEndpointId] = useState<string | null>(null);
  const [replayingEventId, setReplayingEventId] = useState<string | null>(null);

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
    }
  ];

  useEffect(() => {
    fetchApiKeys();
    fetchWebhooks();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setIsLoadingKeys(true);
      const keys = await listApiKeys();
      setApiKeys(keys);
    } catch (error) {
      console.error('Failed to load API keys:', error);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  const fetchWebhooks = async () => {
    try {
      setIsLoadingWebhooks(true);
      const hooks = await getEndpoints();
      setWebhooks(hooks);
    } catch (error) {
      console.error('Failed to load webhooks:', error);
    } finally {
      setIsLoadingWebhooks(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handleCreateApiKey = async () => {
    if (!newApiKeyName.trim()) return;
    try {
      const result = await createApiKey({
        name: newApiKeyName,
        environment: newKeyEnv,
        scopes: ['kyc:read', 'kyc:write']
      });
      setNewKeySecret(result.secret);
      setNewApiKeyName('');
      fetchApiKeys(); // refresh list
    } catch (error) {
      console.error('Error creating key:', error);
      alert('Failed to create API Key');
    }
  };

  const handleDeleteApiKey = async () => {
    if (keyToDelete) {
      try {
        await revokeApiKey(keyToDelete);
        fetchApiKeys();
        setKeyToDelete(null);
      } catch (error) {
        console.error('Failed to revoke API key:', error);
      }
    }
  };

  const handleCreateWebhook = async () => {
    if (!newWebhookUrl.trim()) return;
    try {
      await createEndpoint({
        url: newWebhookUrl,
        events: newWebhookEvents.split(',').map(e => e.trim())
      });
      setNewWebhookUrl('');
      setShowCreateWebhook(false);
      fetchWebhooks();
    } catch (error) {
      console.error('Failed to create webhook:', error);
      alert('Failed to create Webhook');
    }
  };

  const handleDeleteWebhook = async (hookId: string) => {
    if (confirm('Are you sure you want to delete this webhook endpoint?')) {
      try {
        await deleteEndpoint(hookId);
        fetchWebhooks();
      } catch (error) {
        console.error('Failed to delete webhook:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
      case 'disabled':
      case 'revoked':
        return 'bg-red-100 text-red-800';
      case 'configured':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* API Keys Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Key className="w-5 h-5 text-[#5B94E5]" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">API Keys</h2>
              <p className="text-sm text-gray-500">Manage your keys for programmatic access</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateKey(!showCreateKey)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white rounded-lg hover:bg-[#5B94E5]/90"
          >
            <Plus className="w-4 h-4" /> Generate Key
          </button>
        </div>

        {/* Create API Key Form */}
        {showCreateKey && !newKeySecret && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Create New API Key</h3>
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={newApiKeyName}
                onChange={(e) => setNewApiKeyName(e.target.value)}
                placeholder="Key name (e.g. Production Server)"
                className="flex-1 p-2 border border-gray-300 rounded-lg"
              />
              <select
                value={newKeyEnv}
                onChange={(e) => setNewKeyEnv(e.target.value as 'live' | 'sandbox')}
                className="p-2 border border-gray-300 rounded-lg"
              >
                <option value="sandbox">Sandbox</option>
                <option value="live">Live</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateApiKey}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateKey(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* API Key Secret Reveal */}
        {newKeySecret && (
          <div className="mb-6 bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-md font-bold text-green-900 mb-2">Save your API key secret!</h3>
            <p className="text-sm text-green-800 mb-4">
              This secret is only shown once. Please copy it and store it securely.
            </p>
            <div className="flex gap-3">
              <code className="flex-1 p-3 bg-white border border-green-300 rounded-lg text-sm font-mono text-gray-800 break-all">
                {newKeySecret}
              </code>
              <button
                onClick={() => copyToClipboard(newKeySecret, 'secret')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap"
              >
                {copiedKey === 'secret' ? 'Copied!' : 'Copy Secret'}
              </button>
            </div>
            <button
              onClick={() => { setNewKeySecret(''); setShowCreateKey(false); }}
              className="mt-4 text-sm font-medium text-green-700 hover:text-green-900 underline"
            >
              I have saved my secret
            </button>
          </div>
        )}

        <div className="space-y-4">
          {isLoadingKeys ? (
            <p className="text-sm text-gray-500">Loading keys...</p>
          ) : apiKeys.length === 0 ? (
            <p className="text-sm text-gray-500">No API keys found.</p>
          ) : (
            apiKeys.map((key) => (
              <div key={key.id} className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between hover:shadow-sm transition-shadow">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-gray-900">{key.name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(key.status)}`}>
                      {key.status}
                    </span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 uppercase border border-gray-200">
                      {key.environment}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                    <span>{key.keyId}</span>
                    <span>•</span>
                    <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setKeyToDelete(key.keyId)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Revoke Key"
                    disabled={key.status === 'revoked'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Revoke Key Modal */}
      {mounted && keyToDelete && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Revoke API Key</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to revoke this API key? Any applications using it will immediately lose access. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setKeyToDelete(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteApiKey}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Revoke Key
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Webhooks Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Globe className="w-5 h-5 text-[#5B94E5]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                Webhooks
                <a
                  href="https://docs.melon.ng/webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-normal bg-blue-50 px-2 py-1 rounded-full transition-colors"
                >
                  View Documentation <ExternalLink className="w-3 h-3" />
                </a>
              </h2>
              <p className="text-sm text-gray-500">Configure webhooks to receive real-time updates</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateWebhook(!showCreateWebhook)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white rounded-lg hover:bg-[#5B94E5]/90"
          >
            <Plus className="w-4 h-4" /> Add Endpoint
          </button>
        </div>

        {showCreateWebhook && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">New Webhook Endpoint</h3>
            <div className="space-y-4">
              <input
                type="url"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                placeholder="https://api.yourdomain.com/webhooks"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                value={newWebhookEvents}
                onChange={(e) => setNewWebhookEvents(e.target.value)}
                placeholder="Events (comma separated, e.g. kyc.verified)"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateWebhook}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowCreateWebhook(false)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {isLoadingWebhooks ? (
            <p className="text-sm text-gray-500">Loading webhooks...</p>
          ) : webhooks.length === 0 ? (
            <p className="text-sm text-gray-500">No webhooks configured.</p>
          ) : (
            webhooks.map((webhook) => (
              <div key={webhook.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900">{webhook.url}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(webhook.status)}`}>
                        {webhook.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Events: {webhook.events.join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        setTestingEndpointId(webhook.id);
                        try {
                          const result = await testEndpoint(webhook.id);
                          alert(result.statusCode >= 200 && result.statusCode < 300
                            ? `✅ Test delivered successfully (${result.statusCode})`
                            : `❌ Test failed (${result.statusCode}): ${result.body}`);
                        } catch { alert('❌ Failed to send test event'); }
                        finally { setTestingEndpointId(null); }
                      }}
                      disabled={testingEndpointId === webhook.id}
                      className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Send test event"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (expandedWebhookId === webhook.id) {
                          setExpandedWebhookId(null);
                          setWebhookHistory([]);
                          return;
                        }
                        setExpandedWebhookId(webhook.id);
                        setIsLoadingHistory(true);
                        try {
                          const history = await getEndpointHistory(webhook.id);
                          setWebhookHistory(history);
                        } catch { setWebhookHistory([]); }
                        finally { setIsLoadingHistory(false); }
                      }}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      title="View delivery history"
                    >
                      {expandedWebhookId === webhook.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteWebhook(webhook.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedWebhookId === webhook.id && (
                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Delivery History</h4>
                    {isLoadingHistory ? (
                      <p className="text-xs text-gray-400">Loading...</p>
                    ) : webhookHistory.length === 0 ? (
                      <p className="text-xs text-gray-400">No delivery events yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {webhookHistory.map((evt) => (
                          <div key={evt.id} className="flex items-center justify-between bg-white rounded-md border border-gray-100 px-3 py-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                evt.status === 'success' ? 'bg-green-500' :
                                evt.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                              }`} />
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-gray-800 truncate">{evt.eventType}</p>
                                <p className="text-[10px] text-gray-400">
                                  {new Date(evt.createdAt).toLocaleString()} · {evt.attempts} attempt(s)
                                  {evt.responseStatusCode ? ` · HTTP ${evt.responseStatusCode}` : ''}
                                </p>
                              </div>
                            </div>
                            {evt.status === 'failed' && (
                              <button
                                onClick={async () => {
                                  setReplayingEventId(evt.id);
                                  try {
                                    await replayEvent(webhook.id, evt.id);
                                    const updated = await getEndpointHistory(webhook.id);
                                    setWebhookHistory(updated);
                                  } catch { /* silently fail */ }
                                  finally { setReplayingEventId(null); }
                                }}
                                disabled={replayingEventId === evt.id}
                                className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 flex-shrink-0"
                                title="Replay event"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${replayingEventId === evt.id ? 'animate-spin' : ''}`} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Other Integrations */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">No-Code Integrations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <div key={integration.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <integration.icon className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{integration.name}</h3>
                  <p className="text-xs text-gray-500">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(integration.status)}`}>
                  {integration.status}
                </span>
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
                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {integration.status === 'connected' ? 'Configure' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}