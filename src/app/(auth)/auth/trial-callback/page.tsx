"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';

function TrialCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshTrialUser } = useAuthContext();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Store the token
      localStorage.setItem('trialToken', token);
      
      // Update AuthContext state
      refreshTrialUser().then(() => {
        // Redirect to reports
        router.replace('/reports');
      });
    } else {
      // If no token, send them to login
      router.replace('/auth/trial-login');
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Authenticating your trial...</p>
      </div>
    </div>
  );
}

export default function TrialCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <TrialCallbackContent />
    </Suspense>
  );
}
