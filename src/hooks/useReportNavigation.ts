'use client';

import { useParams, usePathname } from 'next/navigation';
import { useReport } from './useReports';

export function useReportNavigation() {
  const params = useParams();
  const pathname = usePathname();
  const reportId = params?.id as string;
  
  const { report, loading } = useReport(reportId);

  const getCurrentSection = () => {
    if (pathname.includes('/responses')) return 'responses';
    if (pathname.includes('/settings')) return 'settings';
    return 'edit';
  };

  const getNavigationItems = () => [
    {
      id: 'edit',
      label: 'Edit',
      href: `/reports/${reportId}`,
      current: getCurrentSection() === 'edit'
    },
    {
      id: 'responses',
      label: 'Responses',
      href: `/reports/${reportId}/responses`,
      current: getCurrentSection() === 'responses',
      count: report?.responseCount || 0
    },
    {
      id: 'settings',
      label: 'Settings',
      href: `/reports/${reportId}/settings`,
      current: getCurrentSection() === 'settings'
    }
  ];

  return {
    report,
    loading,
    currentSection: getCurrentSection(),
    navigationItems: getNavigationItems(),
    reportId
  };
}