'use client';

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function KYCEmpty() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 py-16 px-6">
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto bg-gray-50 rounded-lg flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-gray-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No KYC Requests Yet
        </h3>
        
        <p className="text-sm text-gray-500 mb-6">
          Get started by adding your first user to begin the verification process.
        </p>
        
        <Link href="/kyc/create" prefetch={false}>
          <Button variant="primary" size="md">
            Create New Request
          </Button>
        </Link>
      </div>
    </div>
  );
}
