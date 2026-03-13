'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Layers,
  Briefcase,
  Shield,
  Activity,
  FileText,
  BarChart3,
  MapIcon,
  Bot,
  User,
  Settings,
  Bell,
  HelpCircle,
  Lock,
  Plus,
  ArrowRight,
  Command,
  X,
} from 'lucide-react';

interface SearchItem {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  category: 'Pages' | 'Actions' | 'Settings';
  keywords: string[];
}

const SEARCH_ITEMS: SearchItem[] = [
  // Pages
  {
    id: 'overview',
    name: 'Overview',
    description: 'Program impact dashboard',
    href: '/overview',
    icon: <Layers className="w-4 h-4" />,
    category: 'Pages',
    keywords: ['dashboard', 'home', 'summary', 'overview'],
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Manage your portfolio',
    href: '/portfolio',
    icon: <Briefcase className="w-4 h-4" />,
    category: 'Pages',
    keywords: ['portfolio', 'projects', 'investments'],
  },
  {
    id: 'kyc',
    name: 'KYC Management',
    description: 'Address and business verification',
    href: '/kyc',
    icon: <Shield className="w-4 h-4" />,
    category: 'Pages',
    keywords: ['kyc', 'verification', 'address', 'identity', 'know your customer'],
  },
  {
    id: 'impact-metrics',
    name: 'Impact Metrics',
    description: 'Track and measure impact',
    href: '/impact-metrics',
    icon: <Activity className="w-4 h-4" />,
    category: 'Pages',
    keywords: ['impact', 'metrics', 'measurement', 'data'],
  },
  {
    id: 'reports',
    name: 'Reports',
    description: 'View and create reports',
    href: '/reports',
    icon: <FileText className="w-4 h-4" />,
    category: 'Pages',
    keywords: ['reports', 'analytics', 'insights'],
  },
  {
    id: 'visualizations',
    name: 'Visualizations',
    description: 'Data visualizations and charts',
    href: '/visualizations',
    icon: <BarChart3 className="w-4 h-4" />,
    category: 'Pages',
    keywords: ['visualizations', 'charts', 'graphs', 'data'],
  },
  {
    id: 'map-view',
    name: 'Map View',
    description: 'Geographic data view',
    href: '/map-view',
    icon: <MapIcon className="w-4 h-4" />,
    category: 'Pages',
    keywords: ['map', 'geographic', 'location', 'geo'],
  },
  {
    id: 'profile',
    name: 'Profile',
    description: 'Manage your account',
    href: '/profile',
    icon: <User className="w-4 h-4" />,
    category: 'Settings',
    keywords: ['profile', 'account', 'user', 'me'],
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'App preferences',
    href: '/settings',
    icon: <Settings className="w-4 h-4" />,
    category: 'Settings',
    keywords: ['settings', 'preferences', 'config'],
  },
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'Notification preferences',
    href: '/settings/notifications',
    icon: <Bell className="w-4 h-4" />,
    category: 'Settings',
    keywords: ['notifications', 'alerts', 'emails'],
  },
  {
    id: 'help',
    name: 'Help & Support',
    description: 'Documentation and support',
    href: '/help',
    icon: <HelpCircle className="w-4 h-4" />,
    category: 'Settings',
    keywords: ['help', 'support', 'docs', 'documentation', 'faq'],
  },
  {
    id: 'privacy',
    name: 'Privacy & Security',
    description: 'Security settings',
    href: '/settings/privacy',
    icon: <Lock className="w-4 h-4" />,
    category: 'Settings',
    keywords: ['privacy', 'security', 'password'],
  },
  {
    id: 'billing',
    name: 'Billing',
    description: 'Subscription and billing',
    href: '/billing',
    icon: <FileText className="w-4 h-4" />,
    category: 'Settings',
    keywords: ['billing', 'subscription', 'payment', 'plan', 'pricing'],
  },

  // Quick Actions
  {
    id: 'create-kyc',
    name: 'Create KYC Request',
    description: 'Start a new verification request',
    href: '/kyc/create',
    icon: <Plus className="w-4 h-4" />,
    category: 'Actions',
    keywords: ['create', 'new', 'kyc', 'verification', 'request'],
  },
  {
    id: 'create-report',
    name: 'Create Report',
    description: 'Start a new report',
    href: '/reports/create',
    icon: <Plus className="w-4 h-4" />,
    category: 'Actions',
    keywords: ['create', 'new', 'report'],
  },
  {
    id: 'create-portfolio',
    name: 'Create Portfolio',
    description: 'Start a new portfolio',
    href: '/portfolio/create',
    icon: <Plus className="w-4 h-4" />,
    category: 'Actions',
    keywords: ['create', 'new', 'portfolio'],
  },
  {
    id: 'create-metric',
    name: 'Create Impact Metric',
    description: 'Define a new impact metric',
    href: '/impact-metrics/create',
    icon: <Plus className="w-4 h-4" />,
    category: 'Actions',
    keywords: ['create', 'new', 'metric', 'impact'],
  },
];

export function SearchModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter results
  const filteredItems = query.trim()
    ? SEARCH_ITEMS.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.keywords.some((kw) => kw.includes(q))
        );
      })
    : SEARCH_ITEMS;

  // Group by category
  const grouped = filteredItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, SearchItem[]>
  );

  const flatItems = Object.values(grouped).flat();

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector('[data-selected="true"]');
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const navigateTo = useCallback(
    (href: string) => {
      setIsOpen(false);
      router.push(href);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems[selectedIndex]) {
        navigateTo(flatItems[selectedIndex].href);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div 
        className="relative flex items-start justify-center min-h-screen pt-[15vh] px-4 cursor-default"
        onClick={() => setIsOpen(false)}
      >
        <div 
          className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center px-4 border-b border-gray-200">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search pages, actions..."
              className="w-full px-3 py-4 text-sm text-gray-900 placeholder-gray-400 bg-transparent border-0 focus:outline-none focus:ring-0"
            />
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded">
              ESC
            </kbd>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
            {flatItems.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500">No results for &ldquo;{query}&rdquo;</p>
              </div>
            ) : (
              Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <div className="px-4 py-1.5">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {category}
                    </p>
                  </div>
                  {items.map((item) => {
                    const globalIndex = flatItems.indexOf(item);
                    const isSelected = globalIndex === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        data-selected={isSelected}
                        onClick={() => navigateTo(item.href)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span
                          className={`flex-shrink-0 ${
                            isSelected ? 'text-blue-500' : 'text-gray-400'
                          }`}
                        >
                          {item.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-gray-400 truncate">{item.description}</p>
                        </div>
                        {isSelected && (
                          <ArrowRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/80">
            <div className="flex items-center gap-3 text-[11px] text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-gray-200/80 text-gray-500 rounded text-[10px] font-medium">↑</kbd>
                <kbd className="px-1 py-0.5 bg-gray-200/80 text-gray-500 rounded text-[10px] font-medium">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-200/80 text-gray-500 rounded text-[10px] font-medium">↵</kbd>
                open
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <Command className="w-3 h-3" />
              <span>K to toggle</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
