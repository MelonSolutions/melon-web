'use client';

import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ReportsEmpty() {
  return (
    <div className="bg-surface rounded-[4rem] border border-border p-32 shadow-sm text-center relative overflow-hidden group font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50"></div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-surface-secondary mb-10 border border-border group-hover:rotate-12 transition-transform duration-700">
           <FileText className="w-12 h-12 text-gray-300 dark:text-gray-700 group-hover:text-primary transition-colors" />
        </div>
        
        <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight mb-4">
          Inventory Empty
        </h3>
        
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-12 max-w-sm mx-auto leading-relaxed">
          The intelligence vault is currently empty. Initialize your first collection protocol to begin harvesting impact data.
        </p>
        
        <Link href="/reports/create">
          <Button
            variant="primary"
            className="px-12 py-6 rounded-2xl shadow-2xl shadow-primary/20 font-black uppercase tracking-widest text-[11px]"
            icon={<Plus className="w-4 h-4" />}
          >
            Forge Initial Record
          </Button>
        </Link>
      </div>
      
      {/* Visual Accents */}
      <div className="absolute bottom-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
         <FileText className="w-64 h-64 text-primary" />
      </div>
    </div>
  );
}