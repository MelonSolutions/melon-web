"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Mail } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { NETWORK_ERROR_MESSAGE, userMessage } from '@/lib/api/user-message';
import { LANDING_URL } from '@/lib/contact';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.melon.ng';
const RESEND_SECONDS = 60;

type Step = 'email' | 'code';
interface FailedState {
  message: string;
  reason?: string;
}

async function postTrialLogin(path: string, body: object) {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/trials/login/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, context: 'dashboard' }),
    });
  } catch {
    throw { message: NETWORK_ERROR_MESSAGE } as FailedState;
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw { message: userMessage(response.status, data), reason: data?.reason } as FailedState;
  }
  return data;
}

function TrialLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshTrialUser } = useAuthContext();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<FailedState | null>(null);
  const [message, setMessage] = useState('');
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (searchParams.get('reason') === 'payment_required') {
      setMessage('Add a payment method on the Melon website to unlock your reports dashboard.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const requestCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError({ message: 'Enter a valid email address, like you@example.com.' });
      return;
    }
    setIsLoading(true);
    try {
      const result = await postTrialLogin('request-code', { email: email.trim() });
      setEmail(result.email);
      setCode('');
      setStep('code');
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      setError(err as FailedState);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const trial = await postTrialLogin('verify', { email, code });
      localStorage.setItem('trialToken', trial.accessToken);
      await refreshTrialUser();
      router.push('/reports');
    } catch (err) {
      setError(err as FailedState);
      setIsLoading(false);
    }
  };

  const errorBlock = error && (
    <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
      <p className="text-red-600 text-sm">{error.message}</p>
      {(error.reason === 'PAYMENT_METHOD_REQUIRED' || error.reason === 'TRIAL_EXPIRED') && (
        <a href={`${LANDING_URL}/upgrade`} className="text-sm text-primary hover:underline font-medium">
          Add a payment method
        </a>
      )}
      {error.reason === 'NO_TRIAL' && (
        <a href={`${LANDING_URL}/surveys/create`} className="text-sm text-primary hover:underline font-medium">
          Create a free survey
        </a>
      )}
      {error.reason === 'FULL_ACCOUNT' && (
        <a href="/login" className="text-sm text-primary hover:underline font-medium">
          Sign in to your organization
        </a>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Survey Reports</h1>
        <p className="text-sm text-gray-600">
          {step === 'email'
            ? "Sign in with the email you used on Melon. We'll send you a code."
            : `Enter the 6-digit code we sent to ${email}.`}
        </p>
      </div>

      {message && step === 'email' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-600 text-sm">{message}</p>
        </div>
      )}

      {step === 'email' ? (
        <form onSubmit={requestCode} className="space-y-4" noValidate>
          {errorBlock}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="you@example.com"
                autoComplete="email"
                className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  error ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending code…' : 'Email me a sign-in code'}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="space-y-4" noValidate>
          {errorBlock}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1.5">
              Sign-in code
            </label>
            <input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, ''));
                setError(null);
              }}
              placeholder="123456"
              className="w-full px-3 py-2.5 text-lg tracking-[0.5em] text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              autoFocus
              required
            />
            <p className="mt-1.5 text-xs text-gray-500">The code expires in 10 minutes.</p>
          </div>
          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
          <div className="flex justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setError(null);
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              Use a different email
            </button>
            <button
              type="button"
              onClick={() => requestCode()}
              disabled={resendIn > 0 || isLoading}
              className="text-primary hover:underline disabled:text-gray-400 disabled:no-underline"
            >
              {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
            </button>
          </div>
        </form>
      )}

      <div className="text-center pt-2">
        <p className="text-sm text-gray-600">
          Part of an organization on Melon?{' '}
          <a href="/login" className="text-primary hover:underline font-medium">
            Sign in to your organization
          </a>
        </p>
      </div>
    </div>
  );
}

function TrialLoginFallback() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Survey Reports
        </h1>
        <p className="text-sm text-gray-600">
          Sign in with the email you used on Melon
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="h-3 w-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
}

export default function TrialLoginPage() {
  return (
    <Suspense fallback={<TrialLoginFallback />}>
      <TrialLoginContent />
    </Suspense>
  );
}
