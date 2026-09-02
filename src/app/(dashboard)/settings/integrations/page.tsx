'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Key, Eye, EyeOff, CheckCircle, Zap, Globe, Bell, FileText, Trash2, ExternalLink, Play, RefreshCw, ChevronDown, ChevronUp, Send, Copy
} from 'lucide-react';
import { listApiKeys, createApiKey, revokeApiKey, rotateApiKey, ApiKey } from '@/lib/api/api-keys';
import { getEndpoints, createEndpoint, deleteEndpoint, rotateEndpointSecret, getEndpointHistory, testEndpoint, replayEvent, WebhookEndpoint, WebhookEventLog } from '@/lib/api/webhooks';

const AVAILABLE_EVENTS_INFO = [
  { id: 'verification.completed', label: 'verification.completed', description: 'Triggered when a KYC verification check successfully completes and passes.' },
  { id: 'verification.rejected', label: 'verification.rejected', description: 'Triggered when a KYC verification check is rejected or fails verification.' },
  { id: 'verification.assigned', label: 'verification.assigned', description: 'Triggered when a verification request is assigned to a review agent.' },
  { id: 'verification.in_review', label: 'verification.in_review', description: 'Triggered when a verification enters active manual or AI review.' },
  { id: 'customer.created', label: 'customer.created', description: 'Triggered when a new KYC customer profile is created.' },
  { id: 'customer.updated', label: 'customer.updated', description: 'Triggered whenever customer profile details or status change.' },
  { id: 'address.verified', label: 'address.verified', description: 'Triggered when physical address verification is finalized.' },
];

const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  return (
    <div className="group relative inline-flex items-center">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block px-2.5 py-1 bg-gray-900 text-white text-[11px] font-medium rounded shadow-lg whitespace-nowrap z-[100] pointer-events-none animate-fadeIn">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
};

export default function IntegrationsSettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');
  const [copiedBaseUrl, setCopiedBaseUrl] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://melon-core.onrender.com';

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<'live' | 'sandbox'>('sandbox');
  const [newKeySecret, setNewKeySecret] = useState(''); // Store newly generated secret

  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [keyToRotate, setKeyToRotate] = useState<string | null>(null);
  const [webhookToRotate, setWebhookToRotate] = useState<string | null>(null);
  const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Webhooks state
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState(true);
  const [showCreateWebhook, setShowCreateWebhook] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>(['verification.completed', 'verification.rejected']);
  const [expandedWebhookId, setExpandedWebhookId] = useState<string | null>(null);
  const [webhookHistory, setWebhookHistory] = useState<WebhookEventLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [testingEndpointId, setTestingEndpointId] = useState<string | null>(null);
  const [replayingEventId, setReplayingEventId] = useState<string | null>(null);
  const [newWebhookSecret, setNewWebhookSecret] = useState('');
  const [newWebhookEnv, setNewWebhookEnv] = useState<'live' | 'sandbox' | 'all'>('all');
  const [customAlert, setCustomAlert] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    details?: string;
  } | null>(null);

  const formatEndpointResponse = (statusCode: number, body?: string): { summary: string; details?: string } => {
    if (!body) return { summary: `Endpoint responded with HTTP ${statusCode} (No response body returned by target server).` };
    
    const trimmed = body.trim();
    if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.includes('<title>')) {
      const titleMatch = trimmed.match(/<title>(.*?)<\/title>/i);
      const pageTitle = titleMatch ? titleMatch[1] : 'HTML Error Page';
      return {
        summary: `Your endpoint server rejected our POST request with HTTP ${statusCode} (${pageTitle}).`,
        details: `Raw HTML Response snippet:\n${trimmed.substring(0, 300)}...\n\n💡 Why did this happen?\nWebhook endpoints must accept HTTP POST requests containing JSON payloads. Receiving an HTML page (such as "${pageTitle}") indicates that the URL you entered only accepts GET requests (like a normal website/search page) or that your web server routed our POST request to an error page.`
      };
    }

    try {
      const parsed = JSON.parse(trimmed);
      return {
        summary: `Endpoint responded with HTTP ${statusCode}:`,
        details: JSON.stringify(parsed, null, 2)
      };
    } catch {
      return {
        summary: `Endpoint responded with HTTP ${statusCode}:`,
        details: trimmed.length > 300 ? trimmed.substring(0, 300) + '...' : trimmed
      };
    }
  };

  const getErrorMessage = (err: any): string => {
    if (!err) return 'An unexpected error occurred';
    if (typeof err === 'string') return err;
    if (err.message) {
      return Array.isArray(err.message) ? err.message.join(', ') : err.message;
    }
    return 'An unexpected error occurred';
  };

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
      setCustomAlert({
        type: 'error',
        title: 'API Key Creation Failed',
        message: getErrorMessage(error) || 'Could not create API Key.',
      });
    }
  };

  const handleRotateApiKey = async (keyId: string) => {
    setKeyToRotate(keyId);
  };

  const handleConfirmRotateApiKey = async () => {
    if (!keyToRotate) return;
    const targetKeyId = keyToRotate;
    setKeyToRotate(null);
    try {
      const result = await rotateApiKey(targetKeyId);
      setNewKeySecret(result.secret);
      fetchApiKeys();
      setCustomAlert({
        type: 'success',
        title: 'API Key Rotated',
        message: 'The API key secret was rotated successfully. Please copy and store your new secret securely right now.',
      });
    } catch (error) {
      console.error('Error rotating key:', error);
      setCustomAlert({
        type: 'error',
        title: 'API Key Rotation Failed',
        message: getErrorMessage(error) || 'Could not rotate API Key.',
      });
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
    if (newWebhookEvents.length === 0) {
      setCustomAlert({
        type: 'error',
        title: 'No Events Selected',
        message: 'Please select at least one event to subscribe to.',
      });
      return;
    }
    try {
      const { secret } = await createEndpoint({
        url: newWebhookUrl,
        events: newWebhookEvents,
        environment: newWebhookEnv,
      });
      setNewWebhookSecret(secret);
      setNewWebhookUrl('');
      setShowCreateWebhook(false);
      fetchWebhooks();
    } catch (error) {
      console.error('Failed to create webhook:', error);
      setCustomAlert({
        type: 'error',
        title: 'Webhook Creation Failed',
        message: getErrorMessage(error) || 'Could not create Webhook endpoint.',
      });
    }
  };

  const handleRotateSecret = async (hookId: string) => {
    setWebhookToRotate(hookId);
  };

  const handleConfirmRotateSecret = async () => {
    if (!webhookToRotate) return;
    const targetHookId = webhookToRotate;
    setWebhookToRotate(null);
    try {
      const { secret } = await rotateEndpointSecret(targetHookId);
      setNewWebhookSecret(secret);
      fetchWebhooks();
      setCustomAlert({
        type: 'success',
        title: 'Webhook Secret Rotated',
        message: 'The webhook signing secret was rotated successfully. Please update your verifying applications immediately.',
      });
    } catch (error) {
      console.error('Failed to rotate secret:', error);
      setCustomAlert({
        type: 'error',
        title: 'Webhook Secret Rotation Failed',
        message: getErrorMessage(error) || 'Could not rotate Webhook secret.',
      });
    }
  };

  const handleDeleteWebhook = async (hookId: string) => {
    setWebhookToDelete(hookId);
  };

  const handleConfirmDeleteWebhook = async () => {
    if (!webhookToDelete) return;
    const targetHookId = webhookToDelete;
    setWebhookToDelete(null);
    try {
      await deleteEndpoint(targetHookId);
      fetchWebhooks();
    } catch (error) {
      console.error('Failed to delete webhook:', error);
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
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                API Keys
                <a
                  href="https://docs.melon.ng/api-reference"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-normal bg-blue-50 px-2 py-1 rounded-full transition-colors"
                >
                  View Documentation <ExternalLink className="w-3 h-3" />
                </a>
              </h2>
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
            <h3 className="text-md font-bold text-green-900 mb-2">Save your API key secret and Base URL!</h3>
            <p className="text-sm text-green-800 mb-4">
              This secret is only shown once. Please copy both the secret and the Base URL and store them securely.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <code className="flex-1 p-3 bg-white border border-green-300 rounded-lg text-sm font-mono text-gray-800 break-all">
                  {newKeySecret}
                </code>
                <button
                  onClick={() => copyToClipboard(newKeySecret, 'secret')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap w-32"
                >
                  {copiedKey === 'secret' ? 'Copied!' : 'Copy Secret'}
                </button>
              </div>

              <div className="flex gap-3">
                <code className="flex-1 p-3 bg-white border border-green-300 rounded-lg text-sm font-mono text-gray-800 break-all">
                  <span className="text-gray-500 mr-2">Base URL:</span> {API_BASE_URL}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(API_BASE_URL);
                    setCopiedBaseUrl(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap w-32"
                >
                  {copiedBaseUrl ? 'Copied!' : 'Copy URL'}
                </button>
              </div>
            </div>

            <button
              onClick={() => { 
                setNewKeySecret(''); 
                setShowCreateKey(false); 
                setCopiedBaseUrl(false);
                setCopiedKey('');
              }}
              disabled={!(copiedKey === 'secret' && copiedBaseUrl)}
              className="mt-6 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-green-100 text-green-800 hover:bg-green-200 border border-green-300"
            >
              I have saved my secret and URL
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
                  <Tooltip content="Rotate API Key Secret">
                    <button
                      onClick={() => handleRotateApiKey(key.keyId)}
                      className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
                      disabled={key.status === 'revoked'}
                    >
                      <Key className="w-4 h-4" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Revoke API Key">
                    <button
                      onClick={() => setKeyToDelete(key.keyId)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      disabled={key.status === 'revoked'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Tooltip>
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

      {/* Rotate API Key Modal */}
      {mounted && keyToRotate && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Rotate API Key</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to rotate this API key? The old secret will stop working immediately and a new secret will be generated.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setKeyToRotate(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRotateApiKey}
                className="px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 font-medium shadow-sm transition-colors"
              >
                Rotate Key
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Rotate Webhook Secret Modal */}
      {mounted && webhookToRotate && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Rotate Webhook Secret</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to rotate the signing secret for this webhook? Any applications using the old secret to verify event signatures will fail immediately.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setWebhookToRotate(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRotateSecret}
                className="px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 font-medium shadow-sm transition-colors"
              >
                Rotate Secret
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Webhook Modal */}
      {mounted && webhookToDelete && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full text-red-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Webhook Endpoint</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to delete this webhook endpoint? You will stop receiving event notifications immediately.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setWebhookToDelete(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteWebhook}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium shadow-sm transition-colors"
              >
                Delete Endpoint
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Custom Alert Modal */}
      {mounted && customAlert && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 transform transition-all">
            <div className={`p-6 ${
              customAlert.type === 'error' ? 'bg-red-50/80 border-b border-red-100' :
              customAlert.type === 'success' ? 'bg-green-50/80 border-b border-green-100' :
              'bg-blue-50/80 border-b border-blue-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-full ${
                  customAlert.type === 'error' ? 'bg-red-100 text-red-600' :
                  customAlert.type === 'success' ? 'bg-green-100 text-green-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {customAlert.type === 'error' ? <Zap className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${
                    customAlert.type === 'error' ? 'text-red-900' :
                    customAlert.type === 'success' ? 'text-green-900' :
                    'text-blue-900'
                  }`}>
                    {customAlert.title}
                  </h3>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 leading-relaxed font-medium break-words">
                {customAlert.message}
              </p>
              {customAlert.details && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-700 max-h-48 overflow-y-auto whitespace-pre-wrap break-all shadow-inner">
                  {customAlert.details}
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCustomAlert(null)}
                  className={`px-6 py-2.5 rounded-xl font-semibold text-white shadow-sm transition-all duration-200 ${
                    customAlert.type === 'error' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' :
                    customAlert.type === 'success' ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20' :
                    'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  }`}
                >
                  Got it
                </button>
              </div>
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
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Select Subscribed Events <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewWebhookEvents(AVAILABLE_EVENTS_INFO.map(e => e.id))}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => setNewWebhookEvents(['verification.completed', 'verification.rejected'])}
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Reset Default
                    </button>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-xl p-3 max-h-56 overflow-y-auto space-y-2.5 bg-gray-50/50">
                  {AVAILABLE_EVENTS_INFO.map((evt) => {
                    const isSelected = newWebhookEvents.includes(evt.id);
                    return (
                      <label
                        key={evt.id}
                        onClick={() => {
                          if (isSelected) {
                            if (newWebhookEvents.length > 1) {
                              setNewWebhookEvents(newWebhookEvents.filter(e => e !== evt.id));
                            }
                          } else {
                            setNewWebhookEvents([...newWebhookEvents, evt.id]);
                          }
                        }}
                        className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300 shadow-sm'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-gray-900">{evt.label}</span>
                            {evt.id.startsWith('verification.') && (
                              <span className="px-1.5 py-0.5 text-[10px] rounded bg-purple-100 text-purple-700 font-semibold uppercase">KYC</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{evt.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
                  <span>💡</span> Select exactly which lifecycle events should trigger POST notifications to your endpoint.
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Target Environment</label>
                <select
                  value={newWebhookEnv}
                  onChange={(e) => setNewWebhookEnv(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900"
                >
                  <option value="all">All Environments (Live & Sandbox)</option>
                  <option value="live">Live Only</option>
                  <option value="sandbox">Sandbox Only</option>
                </select>
              </div>
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

        {/* Webhook Secret Reveal */}
        {newWebhookSecret && (
          <div className="mb-6 bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-md font-bold text-green-900 mb-2">Save your Webhook Signing Secret!</h3>
            <p className="text-sm text-green-800 mb-4">
              Use this secret (<code className="bg-green-100 px-1 py-0.5 rounded text-xs font-mono">whsec_...</code>) to verify HMAC-SHA256 <code className="bg-green-100 px-1 py-0.5 rounded text-xs font-mono">x-melon-signature</code> headers when receiving events. For security reasons, it will only be shown once.
            </p>
            
            <div className="flex gap-3">
              <code className="flex-1 p-3 bg-white border border-green-300 rounded-lg text-sm font-mono text-gray-800 break-all">
                {newWebhookSecret}
              </code>
              <button
                onClick={() => copyToClipboard(newWebhookSecret, 'webhook-secret')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap w-32"
              >
                {copiedKey === 'webhook-secret' ? 'Copied!' : 'Copy Secret'}
              </button>
            </div>

            <button
              onClick={() => setNewWebhookSecret('')}
              className="mt-4 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 text-sm font-medium"
            >
              I have copied and saved this secret
            </button>
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
                      {webhook.environment && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 uppercase border border-gray-200 font-mono">
                          {webhook.environment}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Events: {webhook.events.join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip content="Send Test Event">
                      <button
                        onClick={async () => {
                          setTestingEndpointId(webhook.id);
                          try {
                            const result = await testEndpoint(webhook.id);
                            if (result.statusCode >= 200 && result.statusCode < 300) {
                              setCustomAlert({
                                type: 'success',
                                title: 'Test Event Delivered',
                                message: `Test event was delivered successfully (HTTP ${result.statusCode}).`,
                                details: result.body ? `Response from your server:\n${result.body}` : undefined,
                              });
                            } else {
                              const formatted = formatEndpointResponse(result.statusCode, result.body);
                              setCustomAlert({
                                type: 'error',
                                title: 'Test Event Failed',
                                message: formatted.summary,
                                details: formatted.details,
                              });
                            }
                          } catch (error: any) {
                            setCustomAlert({
                              type: 'error',
                              title: 'Test Delivery Failed',
                              message: getErrorMessage(error) || 'Failed to send test event to the endpoint.',
                            });
                          }
                          finally { setTestingEndpointId(null); }
                        }}
                        disabled={testingEndpointId === webhook.id}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </Tooltip>
                    <Tooltip content={expandedWebhookId === webhook.id ? 'Collapse Delivery History' : 'View Delivery History'}>
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
                      >
                        {expandedWebhookId === webhook.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </Tooltip>
                    <Tooltip content="Rotate Signing Secret">
                      <button
                        onClick={() => handleRotateSecret(webhook.id)}
                        className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                    </Tooltip>
                    <Tooltip content="Delete Webhook Endpoint">
                      <button
                        onClick={() => handleDeleteWebhook(webhook.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Tooltip>
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
                              <Tooltip content="Replay Event">
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
                                >
                                  <RefreshCw className={`w-3.5 h-3.5 ${replayingEventId === evt.id ? 'animate-spin' : ''}`} />
                                </button>
                              </Tooltip>
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