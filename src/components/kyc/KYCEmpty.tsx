'use client';

import Link from 'next/link';
import { ShieldCheck, Plus } from 'lucide-react';

export function KYCEmpty() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-6">
        <ShieldCheck className="w-8 h-8 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No users yet
      </h3>
      
      <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
        Get started by adding your first user to begin the verification process.
      </p>
      
      <Link
        href="/kyc/create"
        prefetch={false}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Your First User
      </Link>
    </div>
  );
}
