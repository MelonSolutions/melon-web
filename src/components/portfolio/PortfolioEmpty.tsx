'use client';

import { Plus, FolderOpen } from 'lucide-react';
import Link from 'next/link';

export function PortfolioEmpty() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <FolderOpen className="w-12 h-12 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No projects yet
      </h3>
      
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Start building your portfolio by creating your first project. Track progress, 
        measure impact, and manage your initiatives all in one place.
      </p>
      
      <Link
        href="/portfolio/create"
        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-5 h-5 mr-2" />
        Create Your First Project
      </Link>
    </div>
  );
}