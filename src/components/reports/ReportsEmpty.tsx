'use client';

import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';

export function ReportsEmpty() {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <FileText className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No reports yet</h3>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Get started by creating your first report to collect data and measure impact.
      </p>
      <Link
        href="/reports/create"
        className="inline-flex items-center px-6 py-3 bg-[#5B94E5] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-5 h-5 mr-2" />
        Create Your First Report
      </Link>
    </div>
  );
}
