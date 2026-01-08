'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FileText, User, History } from 'lucide-react';

interface KYCNavigationProps {
  currentPage: 'details' | 'edit' | 'documents' | 'audit';
}

export function ReportNavigation({ currentPage }: KYCNavigationProps) {
  const params = useParams();
  const pathname = usePathname();
  const userId = params.id as string;

  if (!userId) {
    return null;
  }

  const tabs = [
    {
      id: 'details',
      label: 'Details',
      icon: User,
      href: `/kyc/${userId}`,
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      href: `/kyc/${userId}/documents`,
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: History,
      href: `/kyc/${userId}/audit`,
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6">
        <nav className="flex gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPage === tab.id || pathname === tab.href;
            
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`
                  flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors
                  ${isActive 
                    ? 'border-[#5B94E5] text-[#5B94E5]' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
