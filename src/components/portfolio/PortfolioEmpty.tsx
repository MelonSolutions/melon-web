'use client';

import { Plus, FolderOpen } from 'lucide-react';
import Link from 'next/link';

export function PortfolioEmpty() {
  return (
    <div className="bg-surface rounded-xl border border-border p-12 shadow-sm">
      <div className="text-center max-w-md mx-auto">
        <div className="mx-auto w-20 h-20 bg-surface-secondary rounded-2xl border border-border flex items-center justify-center mb-6 shadow-sm">
          <FolderOpen className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          No projects yet
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium italic">
          Start building your portfolio by creating your first project. Track progress, manage budgets, and measure impact all in one place.
        </p>
        
        <Link
          href="/portfolio/create"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>
    </div>
  );
}