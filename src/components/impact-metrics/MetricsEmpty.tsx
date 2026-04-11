'use client';

import { Plus, BarChart3, Activity } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function MetricsEmpty() {
  return (
    <div className="text-center py-24 bg-surface dark:bg-black/20 rounded-[3rem] border border-border border-dashed dark:border-white/10 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 bg-surface-secondary dark:bg-white/5 rounded-3xl flex items-center justify-center mb-10 border border-border dark:border-white/10 group-hover:rotate-12 transition-transform duration-700 shadow-xl">
          <Activity className="w-10 h-10 text-primary animate-pulse" />
        </div>
        
        <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-4">
          No Impact Metrics Found
        </h3>
        
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-12 max-w-lg mx-auto leading-relaxed">
          Start tracking your organization&rsquo;s impact by creating your first metric. Set targets, monitor progress, and measure success with auto-scoring metrics.
        </p>
        
        <Link href="/impact-metrics/create">
          <Button
            variant="primary"
            className="px-12 py-5 rounded-2xl shadow-2xl shadow-primary/20 font-black uppercase tracking-[0.2em] text-[11px] flex items-center gap-3"
          >
            <Plus className="w-5 h-5" />
            New Metric Protocol
          </Button>
        </Link>
      </div>
    </div>
  );
}