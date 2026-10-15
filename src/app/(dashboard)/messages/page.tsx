'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { PageHeader } from '@/components/layouts/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { useAuthContext } from '@/context/AuthContext';
import { isMelonPlatformUser } from '@/lib/melon-admin';
import { useJobIssueList, useIssueCounts } from '@/hooks/useJobIssues';
import {
  JobIssue,
  JobIssueStatus,
  ISSUE_CATEGORY_LABELS,
} from '@/types/job-issues';
import { cn } from '@/lib/utils';

type TabStatus = JobIssueStatus | '';

interface TabItem {
  id: TabStatus;
  label: string;
}

const TABS: TabItem[] = [
  { id: 'OPEN', label: 'Waiting on you' },
  { id: 'RESOLVED', label: 'Fixed' },
  { id: 'CLOSED_UNRESOLVED', label: 'Closed, not fixed' },
  { id: '', label: 'All' },
];

function formatLastMessagePreview(issue: JobIssue, isMelon: boolean): string {
  if (!issue.messages || issue.messages.length === 0) return '';
  const last = issue.messages[issue.messages.length - 1];
  let prefix = '';
  if (last.from === 'agent') {
    prefix = 'Agent: ';
  } else if (last.from === 'system') {
    prefix = '';
  } else if (isMelon) {
    if (last.from === 'melon') {
      prefix = 'You: ';
    } else if (last.from === 'client') {
      prefix = `${issue.organization?.name || 'Client'}: `;
    }
  } else {
    if (last.from === 'client') {
      prefix = 'You: ';
    } else if (last.from === 'melon') {
      prefix = 'Melon: ';
    }
  }
  return `${prefix}${last.text}`;
}

function formatRightSide(issue: JobIssue) {
  if (issue.status === 'OPEN') {
    if (!issue.resolveBy) {
      return <span className="text-sm text-gray-500">Waiting on you</span>;
    }
    const resolveDate = new Date(issue.resolveBy);
    const msLeft = resolveDate.getTime() - Date.now();
    if (msLeft <= 0) {
      return <span className="text-sm font-medium text-red-600">Closing soon</span>;
    }
    const hoursLeft = Math.floor(msLeft / (60 * 60 * 1000));
    if (hoursLeft < 24) {
      const displayHours = Math.max(1, hoursLeft);
      return (
        <span className="text-sm font-medium text-red-600">
          Closes in {displayHours} {displayHours === 1 ? 'hour' : 'hours'}
        </span>
      );
    }
    const daysLeft = Math.max(1, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
    return (
      <span className="text-sm font-medium text-gray-700">
        {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
      </span>
    );
  }

  if (issue.status === 'RESOLVED') {
    const timeAgo = issue.resolvedAt
      ? formatDistanceToNow(new Date(issue.resolvedAt), { addSuffix: false })
      : '';
    return (
      <span className="text-sm font-medium text-emerald-600">
        Fixed {timeAgo} ago
      </span>
    );
  }

  const closedDate = issue.closedAt
    ? format(new Date(issue.closedAt), 'd MMM yyyy')
    : '';
  return (
    <span className="text-sm font-medium text-gray-500">
      Closed {closedDate}
    </span>
  );
}

export default function MessagesPage() {
  const { user, organization, isTrial } = useAuthContext();
  const isMelon = isMelonPlatformUser(user, organization);
  const { open } = useIssueCounts({ skip: isTrial });

  const [statusFilter, setStatusFilter] = useState<TabStatus>('OPEN');
  const [page, setPage] = useState(1);

  // Deep links from the issue metrics: /messages?status=RESOLVED, ?status=all
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('status');
    if (param === 'all') {
      setStatusFilter('');
    } else if (param && TABS.some((tab) => tab.id === param)) {
      setStatusFilter(param as TabStatus);
    }
  }, []);

  const { data, loading, error, refetch } = useJobIssueList({
    status: statusFilter || undefined,
    page,
    limit: 20,
  });

  const handleTabChange = (newStatus: TabStatus) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / 20) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Problems field agents reported on your verification requests. Fix the request, reply to the agent, then mark it as fixed."
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {TABS.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id || 'all'}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer',
                isActive
                  ? 'bg-gray-900 border-gray-900 text-white shadow-xs'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <span>{tab.label}</span>
              {tab.id === 'OPEN' && typeof open === 'number' && open > 0 && (
                <span
                  className={cn(
                    'ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-semibold',
                    isActive ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'
                  )}
                >
                  {open}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 shadow-sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-2 h-2 rounded-full bg-gray-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-24 shrink-0" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 p-8">
          <p className="text-sm text-gray-700 mb-4">Couldn't load messages.</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          {statusFilter === 'OPEN' ? (
            <EmptyState
              icon={<MessageSquare className="w-8 h-8 text-gray-400" />}
              title="Nothing needs your attention"
              description="When a field agent can't complete a verification, their report shows up here."
            />
          ) : (
            <EmptyState
              icon={<MessageSquare className="w-8 h-8 text-gray-400" />}
              title="No messages here yet"
              description=""
            />
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 shadow-sm overflow-hidden">
            {data.items.map((issue) => (
              <Link
                key={issue.id}
                href={`/kyc/${issue.kycId}?issue=${issue.id}#issues`}
                className="block p-4 sm:p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="pt-1.5 shrink-0">
                      {issue.unread ? (
                        <span className="block w-2 h-2 rounded-full bg-red-500" />
                      ) : (
                        <span className="block w-2 h-2" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'text-sm text-gray-900',
                            issue.unread ? 'font-semibold' : 'font-normal'
                          )}
                        >
                          {issue.job
                            ? `${issue.job.firstName} ${issue.job.lastName}`.trim()
                            : 'Verification Job'}
                        </span>
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                            issue.status === 'OPEN'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          )}
                        >
                          {ISSUE_CATEGORY_LABELS[issue.category] || issue.category}
                        </span>
                      </div>

                      {issue.job?.loanId && (
                        <p className="text-xs text-gray-500">Loan ID {issue.job.loanId}</p>
                      )}

                      {isMelon && issue.organization?.name && (
                        <p className="text-xs text-gray-500">{issue.organization.name}</p>
                      )}

                      {issue.addressLabel && (
                        <p className="text-xs text-gray-500">{issue.addressLabel}</p>
                      )}

                      <p className="text-sm text-gray-600 truncate max-w-2xl">
                        {formatLastMessagePreview(issue, isMelon)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end justify-center shrink-0 pl-5 md:pl-0">
                    {formatRightSide(issue)}
                    {issue.lastMessageAt && (
                      <span className="text-xs text-gray-400 mt-0.5">
                        {formatDistanceToNow(new Date(issue.lastMessageAt), {
                          addSuffix: false,
                        })}{' '}
                        ago
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                hasNextPage={page < totalPages}
                hasPreviousPage={page > 1}
                totalItems={data.total}
                pageSize={20}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
