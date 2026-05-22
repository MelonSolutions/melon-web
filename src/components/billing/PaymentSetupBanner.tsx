'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function PaymentSetupBanner() {
  const router = useRouter();

  const handleSetupPayment = () => {
    router.push('/payments/setup');
  };

  return (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-yellow-900">Payment Method Required</h4>
          <p className="text-sm text-yellow-800 mt-1">
            Add a payment method to continue collecting survey responses.
            You'll be charged ₦2,600 per response, billed monthly.
          </p>
          <Button
            onClick={handleSetupPayment}
            variant="primary"
            size="sm"
            className="mt-3"
          >
            Add Payment Method
          </Button>
        </div>
      </div>
    </div>
  );
}
