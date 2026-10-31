'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';

/**
 * Entry point: send signed-in users to the dashboard, everyone else to login.
 *
 * Decided client-side because the session cookie belongs to the API origin
 * (httpOnly, path /auth), so this app's server can't see it.
 */
export default function RootPage() {
  const router = useRouter();
  const { isLoading, isOrg, isTrial } = useAuthContext();

  useEffect(() => {
    if (isLoading) return;
    if (isOrg) router.replace('/overview');
    else if (isTrial) router.replace('/reports');
    else router.replace('/login');
  }, [isLoading, isOrg, isTrial, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
