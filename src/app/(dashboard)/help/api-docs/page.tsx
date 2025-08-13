'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  Copy,
  ExternalLink,
  Key,
  Code,
  Database,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function ApiDocsPage() {
  const [activeSection, setActiveSection] = useState('authentication');
  const [copiedCode, setCopiedCode] = useState('');

  const navigationItems = [
    { id: 'authentication', label: 'Authentication', icon: Shield },
    { id: 'endpoints', label: 'API Endpoints', icon: Database },
    { id: 'webhooks', label: 'Webhooks', icon: Zap },
    { id: 'examples', label: 'Code Examples', icon: Code },
    { id: 'rate-limits', label: 'Rate Limits', icon: AlertTriangle },
    { id: 'errors', label: 'Error Handling', icon: AlertTriangle }
  ];

  const endpoints = [
    {
      method: 'GET',
      path: '/api/portfolio',
      description: 'Retrieve all projects in your portfolio',
      parameters: [
        { name: 'page', type: 'number', description: 'Page number for pagination' },
        { name: 'limit', type: 'number', description: 'Number of items per page' },
        { name: 'status', type: 'string', description: 'Filter by project status' }
      ]
    },
    {
      method: 'POST',
      path: '/api/portfolio',
      description: 'Create a new project',
      parameters: [
        { name: 'title', type: 'string', required: true, description: 'Project title' },
        { name: 'description', type: 'string', description: 'Project description' },
        { name: 'sector', type: 'string', required: true, description: 'Project sector' }
      ]
    },
    {
      method: 'GET',
      path: '/api/impact-metrics',
      description: 'Retrieve all impact metrics',
      parameters: [
        { name: 'sector', type: 'string', description: 'Filter by sector' },
        { name: 'status', type: 'string', description: 'Filter by status' }
      ]
    },
    {
      method: 'POST',
      path: '/api/impact-metrics',
      description: 'Create a new impact metric',
      parameters: [
        { name: 'label', type: 'string', required: true, description: 'Metric label' },
        { name: 'unit', type: 'string', required: true, description: 'Measurement unit' },
        { name: 'targetValue', type: 'number', required: true, description: 'Target value' }
      ]
    },
    {
      method: 'GET',
      path: '/api/reports',
      description: 'Retrieve all reports',
      parameters: [
        { name: 'status', type: 'string', description: 'Filter by status' },
        { name: 'category', type: 'string', description: 'Filter by category' }
      ]
    }
  ];

  const codeExamples = {
    javascript: `// Authentication
const apiKey = 'your-api-key';
const headers = {
  'Authorization': \`Bearer \${apiKey}\`,
  'Content-Type': 'application/json'
};

// Get all projects
const response = await fetch('https://api.melon.com/api/portfolio', {
  method: 'GET',
  headers: headers
});

const projects = await response.json();
console.log(projects);`,

    python: `import requests

# Authentication
api_key = 'your-api-key'
headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

# Get all projects
response = requests.get('https://api.melon.com/api/portfolio', headers=headers)
projects = response.json()
print(projects)`,

    curl: `# Authentication with API key
curl -X GET "https://api.melon.com/api/portfolio" \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json"`
  };

  const copyToClipboard = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const renderAuthentication = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Authentication</h2>
        <p className="text-gray-600 mb-6">
          The Melon API uses API keys for authentication. You can generate and manage your API keys 
          in your account settings.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Getting Your API Key</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-600">
          <li>Go to your <Link href="/settings/integrations" className="text-[#5B94E5] hover:text-blue-600 cursor-pointer">Settings → Integrations</Link></li>
          <li>Click &rdquo;Generate API Key&rdquo;</li>
          <li>Copy your key and store it securely</li>
          <li>Include it in the Authorization header of your requests</li>
        </ol>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900">Authorization Header</h4>
          <button
            onClick={() => copyToClipboard('Authorization: Bearer your-api-key', 'auth')}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            {copiedCode === 'auth' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedCode === 'auth' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <code className="text-sm text-gray-800">Authorization: Bearer your-api-key</code>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Security Best Practices</h4>
            <p className="text-sm text-blue-800 mt-1">
              Keep your API key secure and never expose it in client-side code. Rotate your keys regularly 
              and use environment variables in production.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEndpoints = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">API Endpoints</h2>
        <p className="text-gray-600 mb-6">
          All API endpoints are available at <code className="bg-gray-100 px-2 py-1 rounded">https://api.melon.com</code>
        </p>
      </div>

      <div className="space-y-4">
        {endpoints.map((endpoint, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {endpoint.method}
              </span>
              <code className="text-gray-800 font-mono">{endpoint.path}</code>
            </div>
            
            <p className="text-gray-600 mb-4">{endpoint.description}</p>
            
            {endpoint.parameters.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Parameters</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {endpoint.parameters.map((param, paramIndex) => (
                        <tr key={paramIndex}>
                          <td className="px-4 py-2 text-sm font-mono text-gray-900">{param.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{param.type}</td>
                          <td className="px-4 py-2 text-sm">
                            {param.required ? (
                              <span className="text-red-600">Yes</span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">{param.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderExamples = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Code Examples</h2>
        <p className="text-gray-600 mb-6">
          Here are examples of how to use the Melon API in different programming languages.
        </p>
      </div>

      {Object.entries(codeExamples).map(([language, code]) => (
        <div key={language} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-medium text-gray-900 capitalize">{language}</h3>
            <button
              onClick={() => copyToClipboard(code, language)}
              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              {copiedCode === language ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedCode === language ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="p-6 overflow-x-auto">
            <code className="text-sm text-gray-800">{code}</code>
          </pre>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'authentication':
        return renderAuthentication();
      case 'endpoints':
        return renderEndpoints();
      case 'examples':
        return renderExamples();
      case 'webhooks':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Webhooks</h2>
            <p className="text-gray-600">
              Webhooks allow you to receive real-time notifications when events occur in your Melon account.
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600">Webhook documentation coming soon...</p>
            </div>
          </div>
        );
      case 'rate-limits':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Rate Limits</h2>
            <p className="text-gray-600">
              The Melon API has rate limits to ensure fair usage and system stability.
            </p>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Limits</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 1000 requests per hour for authenticated requests</li>
                <li>• 100 requests per hour for unauthenticated requests</li>
                <li>• Burst limit of 20 requests per minute</li>
              </ul>
            </div>
          </div>
        );
      case 'errors':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Error Handling</h2>
            <p className="text-gray-600">
              The API uses conventional HTTP response codes to indicate success or failure.
            </p>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Common Error Codes</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <code className="bg-red-100 text-red-800 px-2 py-1 rounded">400</code>
                  <span className="text-gray-600">Bad Request - Invalid parameters</span>
                </div>
                <div className="flex items-center gap-3">
                  <code className="bg-red-100 text-red-800 px-2 py-1 rounded">401</code>
                  <span className="text-gray-600">Unauthorized - Invalid API key</span>
                </div>
                <div className="flex items-center gap-3">
                  <code className="bg-red-100 text-red-800 px-2 py-1 rounded">404</code>
                  <span className="text-gray-600">Not Found - Resource doesn&rsquo;t exist</span>
                </div>
                <div className="flex items-center gap-3">
                  <code className="bg-red-100 text-red-800 px-2 py-1 rounded">429</code>
                  <span className="text-gray-600">Too Many Requests - Rate limit exceeded</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return renderAuthentication();
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/help"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </Link>
        
        <h1 className="text-3xl font-semibold text-gray-900 mb-4">API Documentation</h1>
        <p className="text-lg text-gray-600">
          Integrate Melon&rsquo;s impact measurement capabilities into your applications using our REST API.
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Documentation</h3>
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                    activeSection === item.id
                      ? 'bg-blue-50 text-[#5B94E5] font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Links</h4>
              <div className="space-y-2">
                <Link
                  href="/settings/integrations"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  API Keys
                </Link>
                <a
                  href="https://postman.melon.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  Postman Collection
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}