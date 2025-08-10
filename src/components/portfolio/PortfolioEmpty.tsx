'use client';

import { Plus, FolderOpen } from 'lucide-react';
import Link from 'next/link';

export function PortfolioEmpty() {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
        <FolderOpen className="w-8 h-8 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No projects yet
      </h3>
      
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Start building your portfolio by creating your first project
      </p>
      
      <Link
        href="/portfolio/create"
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors"
      >
        <Plus className="w-4 h-4" />
        New Project
      </Link>
    </div>
  );
}