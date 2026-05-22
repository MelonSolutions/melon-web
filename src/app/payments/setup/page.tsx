'use client';

import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { initializePaymentSetup } from '@/lib/api/payments';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

export default function PaymentSetupPage() {
  const { organization } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetupPayment = async () => {
    if (!organization) return;

    setLoading(true);
    setError(null);

    try {
      const { authorizationUrl, reference } = await initializePaymentSetup(
        organization.id
      );

      // Store reference for callback verification
      sessionStorage.setItem('paymentSetupRef', reference);

      // Redirect to Paystack
      window.location.href = authorizationUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment setup');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Add Payment Method</h1>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-gray-600">
            You'll be redirected to Paystack to securely add your payment method.
            We use Paystack's hosted checkout for maximum security.
          </p>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2 text-gray-900">Pricing:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>₦2,600 per survey response</li>
              <li>Billed monthly on the 1st</li>
              <li>Only charged for responses you collect</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleSetupPayment}
            disabled={loading}
            variant="primary"
            fullWidth
          >
            {loading ? 'Redirecting...' : 'Continue to Paystack'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
