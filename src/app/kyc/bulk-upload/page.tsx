'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { BulkUploadCSV } from '@/components/kyc/BulkUploadCSV';

export default function BulkUploadKYCPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/kyc"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-medium text-gray-900">Bulk Upload KYC Requests</h1>
            <p className="text-sm text-gray-500">Upload a CSV file to create multiple KYC requests</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-6">
        <BulkUploadCSV />
      </div>
    </div>
  );
}
