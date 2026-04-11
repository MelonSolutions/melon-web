'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search,
  BookOpen,
  Video,
  MessageCircle,
  Mail,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FileText,
  Settings,
  BarChart3,
  Users,
  Zap,
  Globe
} from 'lucide-react';

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const quickLinks = [
    {
      title: 'Getting Started',
      description: 'New to Melon? Learn the basics',
      href: '/help/getting-started',
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      title: 'API Documentation',
      description: 'Technical integration guides',
      href: '/help/api-docs',
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video guides',
      href: '/help/tutorials',
      icon: Video,
      color: 'bg-purple-500'
    },
    {
      title: 'Contact Support',
      description: 'Get help from our team',
      href: '/help/contact',
      icon: MessageCircle,
      color: 'bg-orange-500'
    }
  ];

  const categories = [
    {
      title: 'Impact Metrics',
      description: 'Track and measure program effectiveness',
      icon: BarChart3,
      articles: [
        'Creating your first impact metric',
        'Understanding auto-scoring logic',
        'Linking metrics to reports',
        'Setting up target values',
        'Interpreting metric history'
      ]
    },
    {
      title: 'Portfolio Management',
      description: 'Manage your projects and programs',
      icon: Users,
      articles: [
        'Creating a new project',
        'Project status management',
        'Team assignment and roles',
        'Budget tracking',
        'Regional distribution'
      ]
    },
    {
      title: 'Reports & Data Collection',
      description: 'Build forms and collect responses',
      icon: FileText,
      articles: [
        'Building your first report',
        'Form field types and options',
        'Publishing and sharing reports',
        'Analyzing response data',
        'Exporting data'
      ]
    },
    {
      title: 'Account & Settings',
      description: 'Manage your account preferences',
      icon: Settings,
      articles: [
        'Profile settings',
        'Notification preferences',
        'Privacy and security',
        'API integrations',
        'Billing and subscriptions'
      ]
    },
    {
      title: 'Integrations',
      description: 'Connect with external tools',
      icon: Zap,
      articles: [
        'API authentication',
        'Webhook setup',
        'Google Sheets integration',
        'Slack notifications',
        'Custom integrations'
      ]
    },
    {
      title: 'Map View',
      description: 'Geospatial data visualization',
      icon: Globe,
      articles: [
        'Understanding the map interface',
        'Adding location data',
        'Layer management',
        'Spatial analysis',
        'Exporting map data'
      ]
    }
  ];

  const popularArticles = [
    'How to create effective impact metrics',
    'Setting up automated report collection',
    'Understanding the dashboard overview',
    'Integrating with Google Sheets',
    'Managing team permissions',
    'Troubleshooting common issues'
  ];

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.articles.some(article => 
      article.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-gray-900 mb-4">Help Center</h1>
        <p className="text-lg text-gray-600 mb-8">
          Find answers, learn best practices, and get the most out of Melon
        </p>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors cursor-text"
            />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className={`w-12 h-12 rounded-lg ${link.color} flex items-center justify-center mb-4`}>
              <link.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-[#5B94E5]">
              {link.title}
            </h3>
            <p className="text-gray-600 text-sm">{link.description}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Browse by Category</h2>
          
          <div className="space-y-6">
            {filteredCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <category.icon className="w-6 h-6 text-[#5B94E5]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <div className="space-y-2">
                      {category.articles.map((article, articleIndex) => (
                        <Link
                          key={articleIndex}
                          href={`/help/articles/${article.toLowerCase().replace(/\s+/g, '-')}`}
                          className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#5B94E5] transition-colors cursor-pointer"
                        >
                          <HelpCircle className="w-4 h-4" />
                          {article}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Popular Articles */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Articles</h3>
            <div className="space-y-3">
              {popularArticles.map((article, index) => (
                <Link
                  key={index}
                  href={`/help/articles/${article.toLowerCase().replace(/\s+/g, '-')}`}
                  className="block text-sm text-gray-700 hover:text-[#5B94E5] transition-colors cursor-pointer"
                >
                  {article}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Need More Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Can&rsquo;t find what you&rsquo;re looking for? Our support team is here to help.
            </p>
            <div className="space-y-3">
              <Link
                href="/help/contact"
                className="flex items-center gap-2 text-sm text-[#5B94E5] hover:text-blue-600 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Contact Support
              </Link>
              <a
                href="mailto:support@melon.com"
                className="flex items-center gap-2 text-sm text-[#5B94E5] hover:text-blue-600 transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                Email Support
              </a>
              <a
                href="https://community.melon.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[#5B94E5] hover:text-blue-600 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Community Forum
              </a>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-900">All systems operational</span>
            </div>
            <p className="text-xs text-gray-500">Last updated: 2 minutes ago</p>
            <Link
              href="https://status.melon.com"
              target="_blank"
              className="text-sm text-[#5B94E5] hover:text-blue-600 transition-colors cursor-pointer mt-2 inline-block"
            >
              View status page →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}