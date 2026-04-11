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
  Globe,
  Terminal,
  Activity,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const quickLinks = [
    {
      title: 'Getting Started',
      description: 'Step-by-step guide to using Melon',
      href: '/help/getting-started',
      icon: BookOpen,
      color: 'bg-primary',
      exists: true
    },
    {
      title: 'API Documentation',
      description: 'Technical integration guide',
      href: '/help/api-docs',
      icon: Terminal,
      color: 'bg-emerald-500',
      exists: true
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video guides',
      href: '/help/tutorials',
      icon: Video,
      color: 'bg-violet-500',
      exists: false
    },
    {
      title: 'Contact Support',
      description: 'Get help from our team',
      href: '/help/contact',
      icon: MessageCircle,
      color: 'bg-amber-500',
      exists: false
    }
  ];

  const categories = [
    {
      title: 'Impact Metrics',
      description: 'Track and measure program effectiveness',
      icon: BarChart3,
      articles: [
        { title: 'Creating your first metric', exists: false },
        { title: 'Understanding scoring', exists: false },
        { title: 'Linking metrics to reports', exists: false },
        { title: 'Setting target values', exists: false },
        { title: 'Viewing metric history', exists: false }
      ]
    },
    {
      title: 'Project Management',
      description: 'Manage your projects and programs',
      icon: Users,
      articles: [
        { title: 'Creating a new project', exists: false },
        { title: 'Managing project status', exists: false },
        { title: 'Assigning team members', exists: false },
        { title: 'Tracking budgets', exists: false },
        { title: 'Regional distribution', exists: false }
      ]
    },
    {
      title: 'Data Collection',
      description: 'Build forms and collect responses',
      icon: FileText,
      articles: [
        { title: 'Building your first report', exists: false },
        { title: 'Form field types', exists: false },
        { title: 'Publishing reports', exists: false },
        { title: 'Analyzing responses', exists: false },
        { title: 'Exporting data', exists: false }
      ]
    },
    {
      title: 'Account Settings',
      description: 'Manage your account preferences',
      icon: Settings,
      articles: [
        { title: 'Profile settings', exists: false },
        { title: 'Notification preferences', exists: false },
        { title: 'Privacy and security', exists: false },
        { title: 'API integrations', exists: false },
        { title: 'Billing information', exists: false }
      ]
    },
    {
      title: 'Integrations',
      description: 'Connect with external tools',
      icon: Zap,
      articles: [
        { title: 'API authentication', exists: false },
        { title: 'Webhook setup', exists: false },
        { title: 'Google Sheets integration', exists: false },
        { title: 'Slack notifications', exists: false },
        { title: 'Custom integrations', exists: false }
      ]
    },
    {
      title: 'Maps & Locations',
      description: 'Geospatial data visualization',
      icon: Globe,
      articles: [
        { title: 'Understanding the map', exists: false },
        { title: 'Adding location data', exists: false },
        { title: 'Managing layers', exists: false },
        { title: 'Spatial analysis', exists: false },
        { title: 'Exporting map data', exists: false }
      ]
    }
  ];

  const popularArticles = [
    { title: 'Getting started with metrics', exists: false },
    { title: 'Creating your first project', exists: false },
    { title: 'Dashboard overview', exists: false },
    { title: 'Connecting integrations', exists: false },
    { title: 'Managing permissions', exists: false },
    { title: 'Troubleshooting guide', exists: false }
  ];

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.articles.some(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-24 font-sans px-4 sm:px-8">
      {/* Header */}
      <div className="text-center space-y-10 pt-10">
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight leading-tight">Help Center</h1>
          <p className="text-lg font-bold text-gray-500 dark:text-gray-400 max-w-3xl mx-auto opacity-70">
            Find answers, learn best practices, and get the most out of Melon
          </p>
        </div>

        {/* Search */}
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute inset-x-0 -bottom-2 -left-2 h-full bg-primary/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          <div className="relative group">
            <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-all duration-300 w-6 h-6" />
            <input
              type="text"
              placeholder="Search for help articles, guides, and documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-7 bg-surface border-2 border-border rounded-3xl text-xl font-black text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none shadow-2xl shadow-black/5 placeholder:text-gray-400 dark:placeholder:text-gray-600 tracking-tight"
            />
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-secondary border border-border rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">
              CMD + K
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {quickLinks.map((link, index) => (
          link.exists ? (
            <Link
              key={index}
              href={link.href}
              className="bg-surface rounded-3xl border border-border p-10 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className={`w-16 h-16 rounded-2xl ${link.color} flex items-center justify-center mb-8 shadow-2xl shadow-black/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                <link.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-tight group-hover:text-primary transition-colors">
                {link.title}
              </h3>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">{link.description}</p>
            </Link>
          ) : (
            <div
              key={index}
              className="bg-surface rounded-3xl border border-border/40 p-10 cursor-not-allowed opacity-50 relative overflow-hidden"
            >
              <div className={`w-16 h-16 rounded-2xl ${link.color} opacity-50 flex items-center justify-center mb-8 shadow-lg`}>
                <link.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-400 mb-3 uppercase tracking-tight">
                {link.title}
              </h3>
              <p className="text-sm font-bold text-gray-400 leading-relaxed">{link.description} (Coming Soon)</p>
            </div>
          )
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Category Matrix */}
        <div className="lg:col-span-2 space-y-12">
          <div className="flex items-center gap-3 border-b border-border/60 pb-8">
            <div className="w-2 h-8 bg-primary rounded-full"></div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Browse by Category</h2>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {filteredCategories.map((category, index) => (
              <div key={index} className="bg-surface rounded-[2.5rem] border border-border p-10 hover:border-primary/30 transition-all group relative overflow-hidden group/cat hover:shadow-2xl hover:shadow-primary/5">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 transition-transform group-hover/cat:scale-110 duration-1000"></div>
                <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
                  <div className="p-5 bg-surface-secondary/50 rounded-2xl border border-border group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500 group-hover:scale-105">
                    <category.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-6 mb-3">
                      <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase">
                        {category.title}
                      </h3>
                      <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-primary transition-all group-hover:translate-x-2" />
                    </div>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-10 opacity-70 italic">"{category.description}"</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-10">
                      {category.articles.map((article, articleIndex) => (
                        article.exists ? (
                          <Link
                            key={articleIndex}
                            href={`/help/articles/${article.title.toLowerCase().replace(/\s+/g, '-')}`}
                            className="flex items-center gap-3.5 text-xs text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-all cursor-pointer font-black uppercase tracking-widest group/link py-1"
                          >
                            <div className="w-2 h-2 rounded-full bg-primary/20 group-hover/link:bg-primary transition-all group-hover/link:scale-125"></div>
                            {article.title}
                          </Link>
                        ) : (
                          <div
                            key={articleIndex}
                            className="flex items-center gap-3.5 text-xs text-gray-400 cursor-not-allowed font-black uppercase tracking-widest py-1 opacity-50"
                          >
                            <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                            {article.title}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tactical Sidebar */}
        <div className="space-y-12">
          {/* Neural Pulse Feed */}
          <div className="bg-surface rounded-3xl border border-border p-10 shadow-sm relative overflow-hidden group hover:border-amber-500/20 transition-all duration-500">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000 rotate-12">
              <Zap className="w-24 h-24 text-amber-500" />
            </div>
            <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 mb-8 uppercase tracking-[0.2em] flex items-center gap-3">
              <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
              Popular Articles
            </h3>
            <div className="space-y-6">
              {popularArticles.map((article, index) => (
                article.exists ? (
                  <Link
                    key={index}
                    href={`/help/articles/${article.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center gap-4 text-[11px] font-black text-gray-500 uppercase tracking-widest hover:text-primary transition-all cursor-pointer group/node"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-300 dark:text-gray-700 group-hover/node:text-primary transition-colors" />
                    {article.title}
                  </Link>
                ) : (
                  <div
                    key={index}
                    className="flex items-center gap-4 text-[11px] font-black text-gray-400 uppercase tracking-widest cursor-not-allowed opacity-50"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                    {article.title}
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Support Section */}
          <div className="bg-primary/5 rounded-3xl border border-primary/10 p-10 relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mb-16 -mr-16 group-hover:scale-125 transition-transform duration-1000"></div>
            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-4 relative z-10 uppercase tracking-tight leading-7">Need More Help?</h3>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-10 relative z-10 leading-relaxed italic opacity-80">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] cursor-not-allowed opacity-50">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center shadow-sm">
                  <MessageCircle className="w-4 h-4" />
                </div>
                Contact Support (Soon)
              </div>
              <a href="mailto:support@melon.com" className="flex items-center gap-4 text-[10px] font-black text-primary hover:text-primary-hover uppercase tracking-[0.15em] transition-all group/dispatch">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover/dispatch:bg-primary group-hover/dispatch:text-white transition-all shadow-xl shadow-primary/5">
                  <Mail className="w-4 h-4" />
                </div>
                Email Support
              </a>
              <a href="https://community.melon.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-[10px] font-black text-primary hover:text-primary-hover uppercase tracking-[0.15em] transition-all group/dispatch">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover/dispatch:bg-primary group-hover/dispatch:text-white transition-all shadow-xl shadow-primary/5">
                  <Globe className="w-4 h-4" />
                </div>
                Community Forum
              </a>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-surface rounded-3xl border border-border p-10 shadow-sm relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-500">
            <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 mb-8 uppercase tracking-[0.2em] flex items-center gap-3">
              <Activity className="w-4 h-4 text-emerald-500" />
              System Status
            </h3>
            <div className="flex items-center gap-5 p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl mb-6 relative z-10">
              <div className="relative">
                <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping absolute opacity-50"></div>
                <div className="w-4 h-4 bg-emerald-500 rounded-full relative border-2 border-surface shadow-lg"></div>
              </div>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">All Systems Operational</span>
            </div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter opacity-60">Last checked: 2 minutes ago</p>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-8 flex items-center gap-3 cursor-not-allowed opacity-50">
              Status Dashboard (Soon)
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}