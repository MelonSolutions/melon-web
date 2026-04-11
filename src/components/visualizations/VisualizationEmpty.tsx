/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import { BarChart3, Plus, Upload, Database, PieChart, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface VisualizationEmptyProps {
  activeTab: 'chart-builder' | 'data-sources' | 'saved-charts';
  onImportData?: () => void;
  onConnectReport?: () => void;
  onCreateChart?: () => void;
  onSwitchToChartBuilder?: () => void;
}

export function VisualizationEmpty({ 
  activeTab, 
  onImportData, 
  onConnectReport, 
  onCreateChart,
  onSwitchToChartBuilder 
}: VisualizationEmptyProps) {
  if (activeTab === 'data-sources') {
    return (
      <div className="bg-surface rounded-[4rem] border border-border p-32 shadow-sm text-center relative overflow-hidden group font-sans">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-surface-secondary mb-10 border border-border group-hover:rotate-12 transition-transform duration-700">
             <Database className="w-12 h-12 text-gray-300 dark:text-gray-700 group-hover:text-primary transition-colors" />
          </div>
          
          <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight mb-4">
            Data Vault Empty
          </h3>
          
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-12 max-w-sm mx-auto leading-relaxed">
            No active datasets detected. Initialize your intelligence stack by importing CSV structures or connecting live protocol reports.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Button 
              variant="primary"
              onClick={onImportData}
              className="px-10 py-5 rounded-2xl shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[11px]"
              icon={<Upload className="w-4 h-4" />}
            >
              Initialize CSV
            </Button>
            <Button
              variant="secondary"
              onClick={onConnectReport}
              className="px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] border-border/60"
              icon={<Database className="w-4 h-4" />}
            >
              Link Reports
            </Button>
          </div>
        </div>
        
        {/* Visual Accents */}
        <div className="absolute bottom-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
           <Database className="w-64 h-64 text-primary" />
        </div>
      </div>
    );
  }

  if (activeTab === 'saved-charts') {
    return (
      <div className="bg-surface rounded-[4rem] border border-border p-32 shadow-sm text-center relative overflow-hidden group font-sans">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-surface-secondary mb-10 border border-border group-hover:scale-110 transition-transform duration-700">
             <PieChart className="w-12 h-12 text-gray-300 dark:text-gray-700 group-hover:text-primary transition-colors" />
          </div>
          
          <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight mb-4">
            Asset Inventory Clean
          </h3>
          
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-12 max-w-sm mx-auto leading-relaxed">
            No visualization assets have been forged. Deploy the Visualizer Lab to synthesize your first intelligence data point.
          </p>
          
          <Button 
            variant="primary"
            onClick={onSwitchToChartBuilder}
            className="px-12 py-6 rounded-2xl shadow-2xl shadow-primary/20 font-black uppercase tracking-widest text-[11px]"
            icon={<Plus className="w-4 h-4" />}
          >
            Launch Lab Module
          </Button>
        </div>
        
        {/* Visual Accents */}
        <div className="absolute top-0 left-0 p-12 opacity-[0.03] pointer-events-none -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
           <BarChart3 className="w-64 h-64 text-primary" />
        </div>
      </div>
    );
  }

  // Chart Builder empty state
  return (
    <div className="bg-surface rounded-[4rem] border border-border p-32 shadow-sm text-center relative overflow-hidden group font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50"></div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-surface-secondary mb-10 border border-border">
           <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-700 animate-pulse" />
        </div>
        
        <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight mb-4">
          Ready for Synthesis
        </h3>
        
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-12 max-w-sm mx-auto leading-relaxed">
          The visualization lab is online. Select an active data source profile from the synchronization panel to initiate rendering.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Button 
            variant="secondary"
            onClick={onImportData}
            className="px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] border-border/60"
            icon={<Upload className="w-4 h-4" />}
          >
            Forge New Source
          </Button>
          <Button
            variant="primary"
            onClick={onConnectReport}
            className="px-10 py-5 rounded-2xl shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[11px]"
            icon={<Database className="w-4 h-4" />}
          >
            Access Archives
          </Button>
        </div>
      </div>
    </div>
  );
}