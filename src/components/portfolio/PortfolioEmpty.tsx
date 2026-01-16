'use client';

import { Plus, FolderOpen } from 'lucide-react';
import Link from 'next/link';

export function PortfolioEmpty() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12">
      <div className="text-center max-w-md mx-auto">
        <div className="mx-auto w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mb-6">
          <FolderOpen className="w-8 h-8 text-gray-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No projects yet
        </h3>
        
        <p className="text-sm text-gray-600 mb-6">
          Start building your portfolio by creating your first project. Track progress, manage budgets, and measure impact all in one place.
        </p>
        
        <Link
          href="/portfolio/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>
    </div>
  );
}