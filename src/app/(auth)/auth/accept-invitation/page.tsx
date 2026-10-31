"use client";

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { apiClient, InvitationDetails } from '@/lib/api/auth';
import { SUPPORT_EMAIL } from '@/lib/contact';

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const inputClass =
  'w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent';

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const { acceptInvitation } = useAuthContext();
  const token = searchParams.get('token') ?? '';
  const loaded = useRef(false);

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [fetchError, setFetchError] = useState('');
  const loadError = token
    ? fetchError
    : 'This invitation link is incomplete. Open the link from your invitation email again.';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (loaded.current || !token) return;
    loaded.current = true;

    apiClient
      .getInvitation(token)
      .then((details) => {
        setInvitation(details);
        // Invitations created before names were collected used the email as a placeholder
        if (details.firstName && !details.email.startsWith(`${details.firstName}@`)) {
          setFirstName(details.firstName);
        }
        setLastName(details.lastName ?? '');
      })
      .catch((err: Error) => setFetchError(err.message));
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!firstName.trim() || !lastName.trim()) {
      setError('Enter your first and last name.');
      return;
    }
    if (!PASSWORD_RULE.test(password)) {
      setError('Your password needs at least 8 characters, including an uppercase letter, a lowercase letter and a number.');
      return;
    }
    setIsSubmitting(true);
    try {
      await acceptInvitation({ token, firstName, lastName, password });
    } catch (err) {
      setError((err as Error).message);
      setIsSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Invitation unavailable</h1>
        <p className="text-sm text-gray-600">{loadError}</p>
        <p className="text-sm text-gray-600">
          Already set up your account?{' '}
          <a href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </a>
          . Need help?{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline font-medium">
            Contact us
          </a>
          .
        </p>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {invitation.organizationName ? `Join ${invitation.organizationName} on Melon` : 'Join Melon'}
        </h1>
        <p className="text-sm text-gray-600">
          Set up your account for <span className="font-medium text-gray-900">{invitation.email}</span>.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
              First name
            </label>
            <input
              id="firstName"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
              Last name
            </label>
            <input
              id="lastName"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Create a password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-10`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-gray-500">
            At least 8 characters, with an uppercase letter, a lowercase letter and a number.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Setting up your account…' : 'Create account'}
        </button>
      </form>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
