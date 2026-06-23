/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Mail } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';

function TrialLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshTrialUser } = useAuthContext();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const urlMessage = searchParams.get('message');
    const reason = searchParams.get('reason');

    if (reason === 'payment_required') {
      setMessage('Please add a payment method to access the full dashboard.');
    } else if (urlMessage === 'trial-started') {
      setMessage('Your trial has started! Enter your email to continue.');
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://melon-core.onrender.com'}/trials/initiate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, loginOnly: true }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = 'Failed to initiate trial';
        if (errorData.message) {
          errorMessage = Array.isArray(errorData.message) 
            ? errorData.message.join(', ') 
            : errorData.message;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Store trial token in localStorage
      localStorage.setItem('trialToken', data.accessToken);

      // Update AuthContext state
      await refreshTrialUser();

      // Redirect to reports page
      router.push('/reports');
    } catch (err: any) {
      console.error('Trial login error:', err);

      if (err.name === 'NetworkError') {
        setError('Connection failed. Please check your internet connection or try again later.');
      } else {
        setError(err.message || 'Failed to access trial. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Trial Access
        </h1>
        <p className="text-sm text-gray-600">
          Enter your email to access your trial dashboard
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4" noValidate>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-600 text-sm">{message}</p>
          </div>
        )}

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
              onChange={handleInputChange}
              placeholder="Enter your trial email"
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
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Accessing Trial...
            </div>
          ) : (
            'Continue'
          )}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-sm text-gray-600">
          Need full access?{' '}
          <a
            href="/login"
            className="text-primary hover:underline font-medium"
          >
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
          Trial Access
        </h1>
        <p className="text-sm text-gray-600">
          Enter your email to access your trial dashboard
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
