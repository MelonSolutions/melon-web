'use client';

import { useEffect, useState } from 'react';
import {
  ApiError,
  revealKYCIdentifier,
  RevealableKYCField,
  RevealReason,
} from '@/lib/api/kyc';

const REASONS: { value: RevealReason; label: string }[] = [
  { value: 'dispute', label: 'Dispute' },
  { value: 'client_request', label: 'Client request' },
  { value: 'verification_recheck', label: 'Verification re-check' },
];

/** How long a revealed value stays on screen before it is masked again. */
const REVEAL_SECONDS = 30;

interface RevealIdentifierProps {
  kycId: string;
  field: RevealableKYCField;
  label: string;
  /** The masked value from the API, e.g. ***4821 */
  maskedValue: string;
}

/**
 * Shows a masked identifier with an audited Reveal. The full value is held in
 * memory only and cleared after REVEAL_SECONDS.
 */
export function RevealIdentifier({ kycId, field, label, maskedValue }: RevealIdentifierProps) {
  const [choosingReason, setChoosingReason] = useState(false);
  const [reason, setReason] = useState<RevealReason>('verification_recheck');
  const [revealed, setRevealed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!revealed) return;
    const timer = setTimeout(() => setRevealed(null), REVEAL_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [revealed]);

  const reveal = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await revealKYCIdentifier(kycId, field, reason);
      setRevealed(result.value);
      setChoosingReason(false);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 403
          ? 'Only organization owners and admins can reveal this.'
          : 'Could not reveal this value. Try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-900 font-mono">{revealed ?? maskedValue}</span>
        {revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(null)}
            className="text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            Hide
          </button>
        ) : (
          !choosingReason && (
            <button
              type="button"
              onClick={() => setChoosingReason(true)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Reveal
            </button>
          )
        )}
      </div>

      {choosingReason && !revealed && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label htmlFor={`reveal-reason-${field}`} className="sr-only">
            Reason for revealing {label}
          </label>
          <select
            id={`reveal-reason-${field}`}
            value={reason}
            onChange={(e) => setReason(e.target.value as RevealReason)}
            className="text-xs border border-gray-300 rounded-md px-2 py-1"
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={reveal}
            disabled={loading}
            className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md px-2 py-1"
          >
            {loading ? 'Revealing…' : 'Confirm'}
          </button>
          <button
            type="button"
            onClick={() => setChoosingReason(false)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          <p className="w-full text-xs text-gray-400">This reveal is logged with your name and reason.</p>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
