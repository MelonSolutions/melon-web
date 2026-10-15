'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useModal } from '@/components/ui/Modal';
import { useAuthContext } from '@/context/AuthContext';
import { isMelonPlatformUser } from '@/lib/melon-admin';
import { replyToIssue, markIssueRead, ApiError } from '@/lib/api/job-issues';
import { notifyIssuesChanged } from '@/hooks/useJobIssues';
import {
  JobIssue,
  ISSUE_CATEGORY_LABELS,
} from '@/types/job-issues';
import { ResolveIssueModal } from './ResolveIssueModal';
import { cn } from '@/lib/utils';

interface IssueThreadProps {
  issue: JobIssue;
  onRefetch: () => Promise<void>;
  hasMultipleAddresses?: boolean;
}

export function IssueThread({
  issue,
  onRefetch,
  hasMultipleAddresses = false,
}: IssueThreadProps) {
  const { user, organization } = useAuthContext();
  const isMelon = isMelonPlatformUser(user, organization);
  const { addToast } = useToast();
  const { openModal, closeModal } = useModal();

  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const markedReadRef = useRef(false);

  useEffect(() => {
    if (issue.unread && !markedReadRef.current) {
      markedReadRef.current = true;
      markIssueRead(issue.id)
        .then(() => {
          notifyIssuesChanged();
        })
        .catch(() => {
          // Fail silently
        });
    }
  }, [issue.id, issue.unread]);

  const handleSendReply = async () => {
    if (!replyText.trim() || sending) return;
    try {
      setSending(true);
      await replyToIssue(issue.id, replyText.trim());
      setReplyText('');
      await onRefetch();
      notifyIssuesChanged();
      addToast({
        type: 'success',
        title: 'Reply sent',
        message: 'Reply sent to the agent.',
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        addToast({
          type: 'error',
          title: 'Issue closed',
          message: 'This issue is already closed.',
        });
        await onRefetch();
      } else {
        const message = err instanceof ApiError ? err.message : 'Failed to send reply.';
        addToast({
          type: 'error',
          title: 'Error',
          message,
        });
      }
    } finally {
      setSending(false);
    }
  };

  const handleOpenResolveModal = () => {
    openModal(
      <ResolveIssueModal
        issueId={issue.id}
        onClose={closeModal}
        onSuccess={onRefetch}
      />,
      { size: 'md' }
    );
  };

  const isOpen = issue.status === 'OPEN';
  const isResolved = issue.status === 'RESOLVED';

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all',
        isOpen ? 'border-2 border-red-200' : 'border border-gray-200'
      )}
    >
      <CardHeader
        className={cn(
          'p-4 sm:p-5 border-b border-gray-200',
          isOpen ? 'bg-red-50/40' : 'bg-white'
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertTriangle
              className={cn(
                'w-5 h-5 shrink-0',
                isOpen ? 'text-red-600' : 'text-gray-500'
              )}
            />
            <CardTitle className="text-base font-semibold text-gray-900 truncate">
              {ISSUE_CATEGORY_LABELS[issue.category] || issue.category}
              {hasMultipleAddresses && issue.addressLabel ? ` • ${issue.addressLabel}` : ''}
            </CardTitle>
          </div>
          <div>
            {isOpen ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                Waiting on you
              </span>
            ) : isResolved ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Fixed
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                Closed, not fixed
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      {isOpen && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-3 text-xs sm:text-sm text-amber-800 leading-relaxed">
          The agent is waiting for you. Fix the request with Edit Request, reply below if you need to, then mark it as fixed. If it isn't fixed by{' '}
          {issue.resolveBy ? format(new Date(issue.resolveBy), 'd MMM, h:mm a') : 'the deadline'}
          , this request will expire.
        </div>
      )}

      <CardContent className="p-4 sm:p-6 space-y-4">
        {issue.messages && issue.messages.length > 0 ? (
          <div className="space-y-4">
            {issue.messages.map((m) => {
              if (m.from === 'system') {
                return (
                  <div key={m.id} className="text-center py-2">
                    <span className="text-xs text-gray-500 italic">
                      {m.text}
                    </span>
                  </div>
                );
              }

              const isOwnSide =
                (isMelon && m.from === 'melon') ||
                (!isMelon && m.from === 'client');

              if (m.from === 'agent') {
                return (
                  <div key={m.id} className="flex flex-col items-start max-w-[85%]">
                    <span className="text-xs text-gray-500 font-medium mb-1">
                      {m.authorName || 'Field agent'}
                    </span>
                    <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-2xs">
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {m.text}
                      </p>
                      {m.photos && m.photos.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {m.photos.map((p, pIdx) => (
                            <a
                              key={pIdx}
                              href={p.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-16 h-16 rounded overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity"
                            >
                              <img
                                src={p.url}
                                alt={p.tag || 'Evidence photo'}
                                className="w-16 h-16 object-cover rounded"
                              />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    {m.createdAt && (
                      <span className="text-[11px] text-gray-400 mt-1 pl-1">
                        {format(new Date(m.createdAt), 'd MMM, h:mm a')}
                      </span>
                    )}
                  </div>
                );
              }

              // Client or Melon messages
              const otherLabel = m.authorName || (isMelon ? (issue.organization?.name || 'Client') : 'Melon');

              return (
                <div
                  key={m.id}
                  className={cn(
                    'flex flex-col max-w-[85%] ml-auto',
                    isOwnSide ? 'items-end' : 'items-end'
                  )}
                >
                  <span className="text-xs text-gray-500 font-medium mb-1 text-right">
                    {isOwnSide ? 'You' : otherLabel}
                  </span>
                  <div
                    className={cn(
                      'rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-2xs',
                      isOwnSide
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {m.text}
                    </p>
                    {m.photos && m.photos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {m.photos.map((p, pIdx) => (
                          <a
                            key={pIdx}
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-16 h-16 rounded overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity"
                          >
                            <img
                              src={p.url}
                              alt={p.tag || 'Evidence photo'}
                              className="w-16 h-16 object-cover rounded"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  {m.createdAt && (
                    <span className="text-[11px] text-gray-400 mt-1 pr-1">
                      {format(new Date(m.createdAt), 'd MMM, h:mm a')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}

        {isOpen ? (
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <div className="relative">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value.slice(0, 2000))}
                placeholder="Reply to the agent"
                rows={3}
                disabled={sending}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:opacity-60 resize-y"
              />
              {replyText.length > 1800 && (
                <div className="text-right text-xs text-gray-500 mt-1">
                  {replyText.length}/2000
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-gray-500">
                The agent sees your replies in the Melon app.
              </p>
              <div className="flex items-center gap-2.5 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  onClick={handleOpenResolveModal}
                >
                  Mark as fixed
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || sending}
                  loading={sending}
                >
                  Send reply
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-gray-100 text-xs text-gray-500 text-center">
            {isResolved ? (
              <span>
                Fixed on{' '}
                {issue.resolvedAt
                  ? format(new Date(issue.resolvedAt), 'd MMM yyyy')
                  : 'recently'}
                . The agent was told to continue.
              </span>
            ) : (
              <span>
                Closed on{' '}
                {issue.closedAt
                  ? format(new Date(issue.closedAt), 'd MMM yyyy')
                  : 'recently'}{' '}
                because it wasn't fixed within 5 days. The request expired.
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface JobIssuesSectionProps {
  issues: JobIssue[];
  onRefetch: () => Promise<void>;
  hasMultipleAddresses?: boolean;
}

export function JobIssuesSection({
  issues,
  onRefetch,
  hasMultipleAddresses = false,
}: JobIssuesSectionProps) {
  const searchParams = useSearchParams();
  const targetIssueId = searchParams.get('issue');

  const openIssues = issues.filter((i) => i.status === 'OPEN');
  const earlierIssues = issues.filter((i) => i.status !== 'OPEN');

  const hasTargetInEarlier = Boolean(
    targetIssueId && earlierIssues.some((i) => i.id === targetIssueId)
  );
  const [earlierExpanded, setEarlierExpanded] = useState(hasTargetInEarlier);

  if (!issues || issues.length === 0) {
    return null;
  }

  return (
    <div id="issues" className="space-y-6">
      {openIssues.map((issue) => (
        <IssueThread
          key={issue.id}
          issue={issue}
          onRefetch={onRefetch}
          hasMultipleAddresses={hasMultipleAddresses}
        />
      ))}

      {earlierIssues.length > 0 && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setEarlierExpanded((prev) => !prev)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <span>Earlier issues ({earlierIssues.length})</span>
            {earlierExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {earlierExpanded && (
            <div className="space-y-6">
              {earlierIssues.map((issue) => (
                <IssueThread
                  key={issue.id}
                  issue={issue}
                  onRefetch={onRefetch}
                  hasMultipleAddresses={hasMultipleAddresses}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
