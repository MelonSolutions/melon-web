/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, Settings, Edit3, BarChart3, Loader2 } from 'lucide-react';
import { useReport } from '@/hooks/useReports';

interface ReportNavigationProps {
  showBackButton?: boolean;
  currentPage?: 'edit' | 'responses' | 'settings';
}

export function ReportNavigation({ showBackButton = true, currentPage }: ReportNavigationProps) {
  const pathname = usePathname();
  const params = useParams();
  const reportId = params?.id as string;
  
  const { report, loading } = useReport(reportId);

  const getCurrentPage = () => {
    if (currentPage) return currentPage;
    if (pathname.includes('/responses')) return 'responses';
    if (pathname.includes('/settings')) return 'settings';
    return 'edit';
  };

  const activePage = getCurrentPage();

  // Skeleton Navigation for loading state
  if (loading || !report) {
    return (
      <div className="border-b border-gray-200 bg-white">
        <div className="px-6 py-4">
          {/* Loading Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {showBackButton && (
                <Link 
                  href="/reports"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              )}
              <div>
                <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Loading Tabs */}
          <nav className="flex space-x-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </nav>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      id: 'edit',
      label: 'Edit',
      href: `/reports/${reportId}`,
      icon: Edit3,
      description: 'Edit questions and form structure'
    },
    {
      id: 'responses',
      label: 'Responses',
      href: `/reports/${reportId}/responses`,
      icon: BarChart3,
      description: 'View and analyze responses',
      count: report.responseCount
    },
    {
      id: 'settings',
      label: 'Settings',
      href: `/reports/${reportId}/settings`,
      icon: Settings,
      description: 'Configure form settings'
    }
  ];

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="px-6 py-4">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Link 
                href="/reports"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
            )}
            <div>
              <h1 className="text-lg font-medium text-gray-900">{report.title}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className={`inline-flex items-center gap-1 ${
                  report.status === 'published' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    report.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </span>
                <span>•</span>
                <span>{report.responseCount} responses</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {report.status === 'published' && (
              <a
                href={`/reports/public/${reportId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Form
              </a>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-[#5B94E5] border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {item.count !== undefined && (
                  <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}