'use client';

import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { adminApiClient, OnboardOrganizationResponse, PlatformPlan } from '@/lib/api/admin';

const PLANS: { value: PlatformPlan; label: string; description: string }[] = [
  { value: 'TRIAL', label: 'Trial', description: '8 weeks, up to 2 users' },
  { value: 'STARTER', label: 'Starter', description: '1 user' },
  { value: 'REGULAR', label: 'Regular', description: 'Up to 5 users' },
  { value: 'PREMIUM', label: 'Premium', description: 'Unlimited users' },
];

const EMPTY = {
  organizationName: '',
  plan: 'TRIAL' as PlatformPlan,
  ownerFirstName: '',
  ownerLastName: '',
  ownerEmail: '',
};

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-transparent outline-none';

/**
 * Onboards an organization onto the full Melon platform. This replaces public
 * signup: the owner gets an invitation email and sets their own password.
 */
export default function OnboardOrganizationTab() {
  const [form, setForm] = useState(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<OnboardOrganizationResponse | null>(null);

  const update = (field: keyof typeof EMPTY) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      setResult(await adminApiClient.onboardOrganization(form));
      setForm(EMPTY);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Onboard an organization</h2>
        <p className="text-sm text-gray-600 mt-1">
          Creates the organization on the full platform and emails its owner an invitation to set
          their password. The owner can then invite their team. Invitations expire after 7 days.
        </p>
      </div>

      {result && (
        <div role="status" className="flex gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{result.message}</p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-1.5">
            Organization name
          </label>
          <input
            id="organizationName"
            value={form.organizationName}
            onChange={update('organizationName')}
            placeholder="Sycamore"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-1.5">
            Plan
          </label>
          <select id="plan" value={form.plan} onChange={update('plan')} className={inputClass}>
            {PLANS.map((plan) => (
              <option key={plan.value} value={plan.value}>
                {plan.label} ({plan.description})
              </option>
            ))}
          </select>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-gray-700 mb-1.5">Owner</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              aria-label="Owner first name"
              value={form.ownerFirstName}
              onChange={update('ownerFirstName')}
              placeholder="First name"
              className={inputClass}
              required
            />
            <input
              aria-label="Owner last name"
              value={form.ownerLastName}
              onChange={update('ownerLastName')}
              placeholder="Last name"
              className={inputClass}
              required
            />
          </div>
          <input
            type="email"
            aria-label="Owner email"
            value={form.ownerEmail}
            onChange={update('ownerEmail')}
            placeholder="owner@organization.com"
            className={inputClass}
            required
          />
          <p className="text-xs text-gray-500">
            With a work email (e.g. @sycamore.ng), the owner can invite colleagues on that domain.
            With a personal email (Gmail, Yahoo…), the organization stays private and the owner can
            invite any address.
          </p>
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white rounded-lg text-sm font-medium hover:bg-[#4A83D4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Onboarding…' : 'Onboard and send invitation'}
        </button>
      </form>
    </div>
  );
}
