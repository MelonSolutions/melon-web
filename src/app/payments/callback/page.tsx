'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyPaymentSetup, getPaymentStatus } from '@/lib/api/payments';
import { useAuthContext } from '@/context/AuthContext';
import { PaymentStatus } from '@/types/payments';

export default function PaymentCallbackPage() {
  const router = useRouter();
  const { organization, refreshOrganization } = useAuthContext();
  const [status, setStatus] = useState<'verifying' | 'polling' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Verifying payment setup...');

  useEffect(() => {
    const reference = sessionStorage.getItem('paymentSetupRef');

    if (!reference || !organization) {
      setStatus('failed');
      setMessage('Invalid payment setup session');
      return;
    }

    // Verify payment setup (optimistic)
    verifyPaymentSetup(reference)
      .then((result) => {
        if (result.success && result.status === 'processing') {
          setStatus('polling');
          setMessage('Processing payment method setup...');
          startPolling();
        } else {
          setStatus('failed');
          setMessage(result.message);
        }
      })
      .catch((err) => {
        setStatus('failed');
        setMessage(err.message || 'Failed to verify payment setup');
      });

    function startPolling() {
      let attempts = 0;
      const maxAttempts = 15; // 30 seconds (2 second intervals)

      const interval = setInterval(async () => {
        attempts++;

        try {
          const paymentStatus = await getPaymentStatus(organization!.id);

          if (paymentStatus.status === PaymentStatus.ACTIVE) {
            clearInterval(interval);
            setStatus('success');
            setMessage('Payment method added successfully!');
            sessionStorage.removeItem('paymentSetupRef');

            // Refresh org data
            await refreshOrganization();

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              router.push('/overview');
            }, 2000);
          } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            setStatus('success');
            setMessage('Payment setup in progress. You can continue using the dashboard.');
            setTimeout(() => {
              router.push('/overview');
            }, 2000);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization, router]);

  return (
    <div className="max-w-md mx-auto p-6 mt-20">
      <div className="bg-white rounded-lg shadow p-6 text-center">
        {status === 'verifying' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700">{message}</p>
          </div>
        )}

        {status === 'polling' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700">{message}</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few seconds...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h2 className="text-xl font-bold mb-2">Success!</h2>
            <p className="text-gray-700">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
          </div>
        )}

        {status === 'failed' && (
          <div>
            <div className="text-red-600 text-5xl mb-4">✗</div>
            <h2 className="text-xl font-bold mb-2">Setup Failed</h2>
            <p className="text-red-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/payments/setup')}
              className="text-blue-600 hover:underline font-medium"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
