/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

async function verifyEmailToken(token: string): Promise<{ message: string }> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://melon-core.onrender.com';
  
  const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Verification failed');
  }

  return response.json();
}

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
        
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
      return;
    }

    const verify = async () => {
      try {
        const response = await verifyEmailToken(token);
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
                
        setTimeout(() => {
          window.location.href = '/login?verified=true';
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="space-y-6 w-full">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            {status === 'loading' && (
              <Loader2 className="w-16 h-16 text-[#5B94E5] animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-16 h-16 text-[#10B981]" />
            )}
            {status === 'error' && (
              <XCircle className="w-16 h-16 text-[#EF4444]" />
            )}
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {status === 'loading' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h1>

          <p className="text-sm text-gray-600">
            {message}
          </p>
        </div>

        {status === 'error' && (
          <div className="space-y-3 pt-4">
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-[#5B94E5] hover:bg-[#4A7EC9] text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors"
            >
              Go to Login
            </button>
            <button
              onClick={() => window.location.href = '/signup'}
              className="w-full border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Sign Up Again
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="pt-4">
            <p className="text-sm text-gray-500 text-center">
              Redirecting to login page...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
