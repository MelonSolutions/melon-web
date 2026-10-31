"use client";

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.melon.ng';

function TrialCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshTrialUser } = useAuthContext();
  const [failed, setFailed] = useState(false);
  // The code is single-use; guard against Strict Mode running the effect twice
  const exchanged = useRef(false);

  useEffect(() => {
    if (exchanged.current) return;
    exchanged.current = true;

    const code = searchParams.get('code');

    // Drop the code from the address bar and history right away
    window.history.replaceState(null, '', window.location.pathname);

    if (!code) {
      router.replace('/auth/trial-login');
      return;
    }

    fetch(`${API_URL}/trials/exchange-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Handoff code invalid or expired');
        const data = await res.json();
        localStorage.setItem('trialToken', data.accessToken);
        await refreshTrialUser();
        router.replace('/reports');
      })
      .catch(() => setFailed(true));
  }, [searchParams, router, refreshTrialUser]);

  if (failed) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-sm">
          <p className="text-gray-900 font-medium mb-2">This link has expired</p>
          <p className="text-gray-600 text-sm mb-4">
            For your security, sign-in links work once and expire after a minute.
          </p>
          <button
            onClick={() => router.replace('/auth/trial-login')}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium"
          >
            Sign in again
          </button>
        </div>
      </div>
    );
  }

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
