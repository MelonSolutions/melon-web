'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { addReviewNote, ApiError } from '@/lib/api/kyc';
import { ReviewNote } from '@/types/kyc';

const MAX_LENGTH = 2000;

interface ReviewNotesProps {
  kycId: string;
  addressIndex: number;
  notes?: ReviewNote[];
  /** Melon staff only; the API enforces this too */
  canAdd: boolean;
  onAdded: () => void;
}

/**
 * Melon's context on an agent's report, kept apart from the agent's own notes.
 * Notes can only be added, never edited or removed, and the client sees them
 * on the report and PDF.
 */
export function ReviewNotes({ kycId, addressIndex, notes = [], canAdd, onAdded }: ReviewNotesProps) {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  if (!notes.length && !canAdd) return null;

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await addReviewNote(kycId, addressIndex, trimmed);
      setText('');
      setOpen(false);
      addToast({ type: 'success', title: 'Note added', message: 'The client will see it on this report.' });
      onAdded();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Could not add note',
        message: error instanceof ApiError ? error.message : 'Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="text-xs font-medium text-blue-800 uppercase tracking-wider">Melon Review Notes</div>
        {canAdd && !open && (
          <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
            Add note
          </Button>
        )}
      </div>

      {notes.length > 0 && (
        <ul className="space-y-3">
          {notes.map((note, i) => (
            <li key={`${note.createdAt}-${i}`}>
              <p className="text-xs text-gray-500">
                {note.authorName} · {format(new Date(note.createdAt), 'dd MMM yyyy, h:mm a')}
              </p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{note.text}</p>
            </li>
          ))}
        </ul>
      )}

      {canAdd && open && (
        <div className="mt-3 space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Residency not confirmed: gate locked, customer unreachable, security could not identify the customer by name."
            rows={3}
            maxLength={MAX_LENGTH}
            showCharCount
            disabled={saving}
            autoFocus
          />
          <p className="text-xs text-gray-500">
            The client sees this on the report and PDF. Notes can&apos;t be edited or deleted after saving.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={saving}
              onClick={() => {
                setOpen(false);
                setText('');
              }}
            >
              Cancel
            </Button>
            <Button size="sm" loading={saving} disabled={!text.trim()} onClick={submit}>
              Save note
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
