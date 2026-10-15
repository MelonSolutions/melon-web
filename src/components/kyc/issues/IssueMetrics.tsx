'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, MessageSquare, XCircle } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { useAuthContext } from '@/context/AuthContext';
import { useIssueStats } from '@/hooks/useJobIssues';
import { ISSUE_STATUS_LABELS, JobIssueStats, JobIssueStatus } from '@/types/job-issues';

interface IssueMetricsProps {
  /** Melon admins: limit counts to one organization ('' = all organizations) */
  organizationId?: string;
  className?: string;
}

const METRICS: {
  key: keyof JobIssueStats;
  status: JobIssueStatus | '';
  label: string;
  icon: React.ReactNode;
}[] = [
  { key: 'open', status: 'OPEN', label: ISSUE_STATUS_LABELS.OPEN, icon: <Clock className="text-amber-600" /> },
  { key: 'resolved', status: 'RESOLVED', label: ISSUE_STATUS_LABELS.RESOLVED, icon: <CheckCircle2 className="text-emerald-600" /> },
  { key: 'closedUnresolved', status: 'CLOSED_UNRESOLVED', label: ISSUE_STATUS_LABELS.CLOSED_UNRESOLVED, icon: <XCircle className="text-gray-500" /> },
  { key: 'all', status: '', label: 'All issues', icon: <MessageSquare className="text-sky-600" /> },
];

export function IssueMetrics({ organizationId, className }: IssueMetricsProps) {
  const { isTrial } = useAuthContext();
  const { stats, loading, forbidden } = useIssueStats({ organizationId, skip: isTrial });

  // Trial accounts and roles without issue access never see the section
  if (isTrial || forbidden) return null;

  return (
    <section className={className} aria-labelledby="issue-metrics-heading">
      <div className="flex items-center justify-between mb-2">
        <h2 id="issue-metrics-heading" className="text-sm font-semibold text-gray-900">
          Agent issues
        </h2>
        <Link
          href="/messages"
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          View messages
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {METRICS.map((metric) => (
          <Link
            key={metric.key}
            href={metric.status ? `/messages?status=${metric.status}` : '/messages?status=all'}
            className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <StatCard
              label={metric.label}
              value={loading && !stats ? '–' : (stats?.[metric.key] ?? 0).toLocaleString()}
              icon={metric.icon}
              className="h-full"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
