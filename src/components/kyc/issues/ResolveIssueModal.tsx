'use client';

import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { resolveIssue, ApiError } from '@/lib/api/job-issues';
import { notifyIssuesChanged } from '@/hooks/useJobIssues';

interface ResolveIssueModalProps {
  issueId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ResolveIssueModal({
  issueId,
  onClose,
  onSuccess,
}: ResolveIssueModalProps) {
  const { addToast } = useToast();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await resolveIssue(issueId, note.trim() || undefined);
      addToast({
        type: 'success',
        title: 'Issue fixed',
        message: 'Marked as fixed. The agent has been told to continue.',
      });
      onSuccess();
      notifyIssuesChanged();
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        addToast({
          type: 'error',
          title: 'Issue closed',
          message: 'This issue is already closed.',
        });
        onSuccess();
        onClose();
      } else {
        const message = err instanceof ApiError ? err.message : 'Failed to mark issue as fixed.';
        addToast({
          type: 'error',
          title: 'Error',
          message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* The modal shell renders the close button */}
      <div className="flex items-center gap-2 p-6 pr-14 border-b border-gray-200">
        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-semibold text-gray-900">Mark as fixed</h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <p className="text-sm text-gray-600 leading-relaxed">
          The agent will be told to continue the job. If the phone number or address was wrong, edit the request first so the agent gets the correct details.
        </p>

        <div>
          <Textarea
            label="What did you fix? (optional)"
            placeholder="e.g. Corrected the phone number to 0803 123 4567"
            maxLength={2000}
            showCharCount
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={loading}
            rows={3}
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            Mark as fixed
          </Button>
        </div>
      </form>
    </div>
  );
}
