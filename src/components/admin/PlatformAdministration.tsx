'use client';

import { useState } from 'react';
import { Shield, FileText, Building2 } from 'lucide-react';
import RestrictionsTab from './RestrictionsTab';
import AuditLogTab from './AuditLogTab';

type TabType = 'restrictions' | 'audit';

export default function PlatformAdministration() {
  const [activeTab, setActiveTab] = useState<TabType>('restrictions');

  const tabs = [
    {
      id: 'restrictions' as TabType,
      label: 'Organization Restrictions',
      icon: Shield,
      description: 'Manage feature access for customer organizations',
    },
    {
      id: 'audit' as TabType,
      label: 'Audit Log',
      icon: FileText,
      description: 'View restriction change history',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Platform Administration</h1>
            <p className="text-gray-600 mt-1">
              Manage organization-level feature restrictions and view audit logs
            </p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-900">Administrator Access Required</h3>
              <p className="text-sm text-red-700 mt-1">
                This area is restricted to Melon platform administrators. Changes here affect
                customer organization access to features across the entire platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors
                    ${
                      isActive
                        ? 'border-[#5B94E5] text-[#5B94E5]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'restrictions' && <RestrictionsTab />}
          {activeTab === 'audit' && <AuditLogTab />}
        </div>
      </div>
    </div>
  );
}
