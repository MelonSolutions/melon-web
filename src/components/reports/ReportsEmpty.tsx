'use client';

import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';

export function ReportsEmpty() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-6">
        <FileText className="w-8 h-8 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No reports yet
      </h3>
      
      <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
        Get started by creating your first report to collect data and measure impact.
      </p>
      
      <Link
        href="/reports/create"
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Create Your First Report
      </Link>
    </div>
  );
}