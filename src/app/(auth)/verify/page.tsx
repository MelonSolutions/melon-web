/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Email verified successfully! Redirecting to login...');
        
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, [searchParams, verifyEmail, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src="/images/melon-logo.svg"
            alt="Melon"
            width={120}
            height={32}
            className="mx-auto mb-8"
            priority
          />
          
          <div className="flex justify-center mb-4">
            {status === 'loading' && (
              <Loader2 className="w-16 h-16 text-[#5B94E5] animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-16 h-16 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {status === 'loading' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h2>

          <p className="text-gray-600 mb-8">
            {message}
          </p>

          {status === 'error' && (
            <div className="space-y-4">
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-[#5B94E5] hover:bg-[#4A7ABF] text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Go to Login
              </button>
              <button
                onClick={() => router.push('/signup')}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Sign Up Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}