'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, FileText, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'kyc' | 'response';
  title: string;
  description: string;
  status: string;
  timestamp: string;
  link: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const getStatusBadge = (type: string, status: string) => {
  if (type === 'response') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
        New
      </span>
    );
  }

  const badgeStyles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    assigned: 'bg-blue-50 text-blue-700 border-blue-200',
    in_review: 'bg-violet-50 text-violet-700 border-violet-200',
    verification_submitted: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  };

  const labelMap: Record<string, string> = {
    pending: 'Pending',
    assigned: 'Assigned',
    in_review: 'In Review',
    verification_submitted: 'Submitted',
    verified: 'Verified',
    rejected: 'Rejected',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border ${badgeStyles[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      {labelMap[status] || status}
    </span>
  );
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Clock className="w-10 h-10 text-gray-300 mb-3" />
        <p className="text-sm text-gray-400 font-medium">No recent activity</p>
        <p className="text-xs text-gray-400 mt-1">Actions will appear here as they happen</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, index) => {
        const Icon = activity.type === 'kyc' ? Shield : FileText;
        const iconBg = activity.type === 'kyc' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600';

        let timeAgo = '';
        try {
          timeAgo = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true });
        } catch {
          timeAgo = '';
        }

        return (
          <Link key={`${activity.type}-${activity.id}-${index}`} href={activity.link}>
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
              <div className={`p-1.5 rounded-lg flex-shrink-0 ${iconBg}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[var(--color-primary)]">
                    {activity.title}
                  </p>
                  {getStatusBadge(activity.type, activity.status)}
                </div>
                <p className="text-xs text-gray-500 truncate">{activity.description}</p>
              </div>
              <span className="text-[11px] text-gray-400 flex-shrink-0 whitespace-nowrap mt-0.5">
                {timeAgo}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
