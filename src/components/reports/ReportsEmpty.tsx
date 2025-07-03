'use client';

import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';

export function ReportsEmpty() {
  return (
    <div className="text-center py-16 px-4">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-8">
        <FileText className="w-12 h-12 text-gray-400" />
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        No reports yet
      </h2>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Create your first data collection form to start gathering insights about your program performance and impact metrics.
      </p>

      <Link
        href="/reports/create"
        className="inline-flex items-center px-6 py-3 bg-[#5B94E5] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors mb-12"
      >
        <Plus className="w-5 h-5 mr-2" />
        Create Your First Report
      </Link>

    </div>
  );
}