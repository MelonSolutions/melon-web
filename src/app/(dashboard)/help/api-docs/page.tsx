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
  AlertTriangle,
  Terminal,
  Lock
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
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Authentication Protocol</h2>
        </div>
        <p className="text-sm font-bold text-gray-600 dark:text-gray-400 leading-relaxed">
          The Melon API uses API keys for authentication. You can generate and manage your API keys
          in your account settings.
        </p>
      </div>

      <div className="bg-surface rounded-[2rem] border border-border/60 p-10 shadow-lg hover:shadow-2xl transition-shadow duration-500">
        <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-6 uppercase tracking-tight">Key Generation Sequence</h3>
        <ol className="space-y-4 text-sm font-bold text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-4">
            <span className="flex-shrink-0 w-8 h-8 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary font-black text-xs">1</span>
            <span>Go to your <Link href="/settings/integrations" className="text-primary hover:text-primary/70 cursor-pointer font-black uppercase tracking-widest">Settings → Integrations</Link></span>
          </li>
          <li className="flex items-start gap-4">
            <span className="flex-shrink-0 w-8 h-8 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary font-black text-xs">2</span>
            <span>Click &ldquo;Generate API Key&rdquo;</span>
          </li>
          <li className="flex items-start gap-4">
            <span className="flex-shrink-0 w-8 h-8 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary font-black text-xs">3</span>
            <span>Copy your key and store it securely</span>
          </li>
          <li className="flex items-start gap-4">
            <span className="flex-shrink-0 w-8 h-8 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary font-black text-xs">4</span>
            <span>Include it in the Authorization header of your requests</span>
          </li>
        </ol>
      </div>

      <div className="bg-surface-secondary/30 rounded-[1.5rem] border border-border/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Authorization Header</h4>
          <button
            onClick={() => copyToClipboard('Authorization: Bearer your-api-key', 'auth')}
            className="flex items-center gap-2 text-[10px] font-black text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary cursor-pointer uppercase tracking-widest transition-colors px-3 py-2 rounded-lg hover:bg-surface"
          >
            {copiedCode === 'auth' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedCode === 'auth' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <code className="text-sm font-mono text-gray-900 dark:text-gray-100">Authorization: Bearer your-api-key</code>
      </div>

      <div className="bg-gradient-to-br from-emerald-500/10 to-primary/5 border border-emerald-500/20 rounded-[2rem] p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full -mr-24 -mt-24 group-hover:scale-125 transition-transform duration-1000 blur-3xl"></div>
        <div className="flex items-start gap-5 relative z-10">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl shadow-lg">
            <Shield className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight mb-2">Security Protocol</h4>
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 leading-relaxed">
              Keep your API key secure and never expose it in client-side code. Rotate your keys regularly
              and use environment variables in production.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEndpoints = () => (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8 bg-primary rounded-full"></div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">API Endpoints</h2>
        </div>
        <p className="text-sm font-bold text-gray-600 dark:text-gray-400 leading-relaxed">
          All API endpoints are available at <code className="bg-surface-secondary px-3 py-1.5 rounded-lg border border-border font-mono text-xs text-primary">https://api.melon.com</code>
        </p>
      </div>

      <div className="space-y-8">
        {endpoints.map((endpoint, index) => (
          <div key={index} className="bg-surface rounded-[2rem] border border-border/60 p-8 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 group">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 shadow-lg ${
                endpoint.method === 'GET' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                endpoint.method === 'POST' ? 'bg-primary/10 border-primary/30 text-primary' :
                endpoint.method === 'PUT' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                'bg-red-500/10 border-red-500/30 text-red-500'
              }`}>
                {endpoint.method}
              </span>
              <code className="text-sm font-mono font-bold text-gray-900 dark:text-gray-100 bg-surface-secondary px-4 py-2 rounded-xl border border-border">{endpoint.path}</code>
            </div>

            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-8 leading-relaxed italic">&ldquo;{endpoint.description}&rdquo;</p>

            {endpoint.parameters.length > 0 && (
              <div>
                <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6">Request Parameters</h4>
                <div className="overflow-x-auto rounded-xl border border-border/60">
                  <table className="min-w-full divide-y divide-border/40">
                    <thead className="bg-surface-secondary/30">
                      <tr>
                        <th className="px-5 py-4 text-left text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">Name</th>
                        <th className="px-5 py-4 text-left text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">Type</th>
                        <th className="px-5 py-4 text-left text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">Required</th>
                        <th className="px-5 py-4 text-left text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {endpoint.parameters.map((param, paramIndex) => (
                        <tr key={paramIndex} className="hover:bg-surface-secondary/20 transition-colors">
                          <td className="px-5 py-4 text-xs font-mono font-bold text-gray-900 dark:text-gray-100">{param.name}</td>
                          <td className="px-5 py-4 text-xs text-gray-600 dark:text-gray-400 font-bold">{param.type}</td>
                          <td className="px-5 py-4 text-xs font-black uppercase tracking-widest">
                            {param.required ? (
                              <span className="text-red-500">Yes</span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-600 dark:text-gray-400 font-bold">{param.description}</td>
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
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8 bg-violet-500 rounded-full"></div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Code Examples</h2>
        </div>
        <p className="text-sm font-bold text-gray-600 dark:text-gray-400 leading-relaxed">
          Here are examples of how to use the Melon API in different programming languages.
        </p>
      </div>

      {Object.entries(codeExamples).map(([language, code]) => (
        <div key={language} className="bg-surface rounded-[2rem] border border-border/60 overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500">
          <div className="flex items-center justify-between px-8 py-6 bg-surface-secondary/30 border-b border-border/40">
            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 capitalize tracking-tight uppercase">{language}</h3>
            <button
              onClick={() => copyToClipboard(code, language)}
              className="flex items-center gap-3 px-5 py-3 text-[10px] font-black text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary cursor-pointer uppercase tracking-[0.15em] transition-all duration-300 rounded-xl hover:bg-surface"
            >
              {copiedCode === language ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedCode === language ? 'Synchronized' : 'Clone Code'}
            </button>
          </div>
          <pre className="p-8 overflow-x-auto bg-surface-secondary/10">
            <code className="text-sm font-mono text-gray-900 dark:text-gray-100">{code}</code>
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
          <div className="space-y-10">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Webhooks</h2>
              </div>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400 leading-relaxed">
                Webhooks allow you to receive real-time notifications when events occur in your Melon account.
              </p>
            </div>
            <div className="bg-surface-secondary/30 rounded-[2rem] border border-border/40 p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-6 shadow-lg">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Webhook documentation coming soon...</p>
            </div>
          </div>
        );
      case 'rate-limits':
        return (
          <div className="space-y-10">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-8 bg-red-500 rounded-full"></div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Rate Limits</h2>
              </div>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400 leading-relaxed">
                The Melon API has rate limits to ensure fair usage and system stability.
              </p>
            </div>
            <div className="bg-surface rounded-[2rem] border border-border/60 p-10 shadow-lg">
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-8 uppercase tracking-tight">Current Threshold Limits</h3>
              <ul className="space-y-5 text-sm font-bold text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span>1000 requests per hour for authenticated requests</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span>100 requests per hour for unauthenticated requests</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span>Burst limit of 20 requests per minute</span>
                </li>
              </ul>
            </div>
          </div>
        );
      case 'errors':
        return (
          <div className="space-y-10">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-8 bg-red-500 rounded-full"></div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Error Handling</h2>
              </div>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400 leading-relaxed">
                The API uses conventional HTTP response codes to indicate success or failure.
              </p>
            </div>
            <div className="bg-surface rounded-[2rem] border border-border/60 p-10 shadow-lg">
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-8 uppercase tracking-tight">Common Error Codes</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-5 p-5 bg-surface-secondary/30 rounded-xl border border-border/40 hover:border-red-500/30 transition-all group">
                  <code className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl font-black text-sm border border-red-500/20 shadow-lg">400</code>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">Bad Request - Invalid parameters</span>
                </div>
                <div className="flex items-center gap-5 p-5 bg-surface-secondary/30 rounded-xl border border-border/40 hover:border-red-500/30 transition-all group">
                  <code className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl font-black text-sm border border-red-500/20 shadow-lg">401</code>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">Unauthorized - Invalid API key</span>
                </div>
                <div className="flex items-center gap-5 p-5 bg-surface-secondary/30 rounded-xl border border-border/40 hover:border-red-500/30 transition-all group">
                  <code className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl font-black text-sm border border-red-500/20 shadow-lg">404</code>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">Not Found - Resource doesn&rsquo;t exist</span>
                </div>
                <div className="flex items-center gap-5 p-5 bg-surface-secondary/30 rounded-xl border border-border/40 hover:border-red-500/30 transition-all group">
                  <code className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl font-black text-sm border border-red-500/20 shadow-lg">429</code>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">Too Many Requests - Rate limit exceeded</span>
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
    <div className="max-w-7xl mx-auto pb-24 font-sans px-4 sm:px-8">
      <div className="mb-16 pt-6">
        <Link
          href="/help"
          className="inline-flex items-center gap-3 text-[10px] font-black text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary mb-10 cursor-pointer uppercase tracking-[0.2em] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Return to neural hub
        </Link>

        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-primary/5 to-violet-500/10 rounded-[3rem] border border-emerald-500/20 p-12 shadow-2xl shadow-emerald-500/10">
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full -mr-36 -mt-36 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full -ml-48 -mb-48 blur-3xl"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-8 shadow-lg shadow-emerald-500/5">
              <Terminal className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Neural API Interface</span>
            </div>

            <h1 className="text-5xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight leading-tight mb-6">
              API Documentation
            </h1>
            <p className="text-lg font-bold text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
              Integrate Melon&rsquo;s impact measurement capabilities into your applications using our REST API.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-12">
        {/* Sidebar Navigation */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-surface rounded-[2rem] border border-border/60 p-6 sticky top-4 shadow-lg">
            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-8 uppercase tracking-tight">Protocol Index</h3>
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 text-sm rounded-xl transition-all duration-300 cursor-pointer group ${
                    activeSection === item.id
                      ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-surface-secondary'
                  }`}
                >
                  <item.icon className={`w-4 h-4 transition-transform duration-300 ${activeSection === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="font-black uppercase tracking-widest text-[10px]">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-border/60">
              <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6">Quick Access</h4>
              <div className="space-y-3">
                <Link
                  href="/settings/integrations"
                  className="flex items-center gap-3 text-[10px] font-black text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary cursor-pointer uppercase tracking-widest transition-colors group/link"
                >
                  <div className="p-2 bg-surface-secondary rounded-lg border border-border group-hover/link:bg-primary/10 group-hover/link:border-primary/20 transition-all">
                    <Key className="w-3.5 h-3.5" />
                  </div>
                  API Keys
                </Link>
                <a
                  href="https://postman.melon.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[10px] font-black text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary cursor-pointer uppercase tracking-widest transition-colors group/link"
                >
                  <div className="p-2 bg-surface-secondary rounded-lg border border-border group-hover/link:bg-primary/10 group-hover/link:border-primary/20 transition-all">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                  Postman
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