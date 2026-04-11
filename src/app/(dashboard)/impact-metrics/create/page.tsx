/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Loader2, Target, Calendar, BarChart3, Info, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useImpactMetricActions } from '@/hooks/useImpactMetrics';
import { 
  CreateImpactMetricRequest, 
  MetricType, 
  getMetricTypeDisplayName 
} from '@/types/impact-metrics';
import { Button } from '@/components/ui/Button';

export default function CreateImpactMetricPage() {
  const router = useRouter();
  const { createMetric, loading } = useImpactMetricActions();
  const [formData, setFormData] = useState<CreateImpactMetricRequest>({
    name: '',
    description: '',
    target: 0,
    metricType: 'NUMBER',
    startDate: '',
    endDate: '',
    scoringWeight: 0,
    actualValue: 0,
  });

  const metricTypes: { value: MetricType; label: string; description: string }[] = [
    { value: 'NUMBER', label: 'Number', description: 'Count of items (e.g., households, students)' },
    { value: 'PERCENTAGE', label: 'Percentage', description: 'Percentage value (e.g., 85%)' },
    { value: 'CURRENCY', label: 'Currency', description: 'Monetary amount (e.g., $10,000)' },
    { value: 'BOOLEAN', label: 'Yes/No', description: 'True/false or achieved/not achieved' },
  ];

  const handleSubmit = async (isDraft = false) => {
    try {
      if (!formData.name.trim()) {
        alert('Please enter a metric name');
        return;
      }

      if (!formData.startDate || !formData.endDate) {
        alert('Please select start and end dates');
        return;
      }

      if (formData.target <= 0) {
        alert('Please enter a valid target value');
        return;
      }

      const metricData: CreateImpactMetricRequest = {
        ...formData,
        trackingStatus: isDraft ? 'PAUSED' : 'ON_TRACK',
      };
      
      const result = await createMetric(metricData);
      
      if (result) {
        router.push(`/impact-metrics?created=true`);
      }
    } catch (error) {
      console.error('Error creating metric:', error);
    }
  };

  const isFormValid = formData.name && formData.target > 0 && formData.scoringWeight > 0 && 
    formData.startDate && formData.endDate && formData.metricType;

  const inputClasses = "w-full px-6 py-4 bg-surface-secondary/30 dark:bg-white/5 border border-border dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary transition-all outline-none text-[11px] font-black uppercase tracking-widest hover:border-primary/20 placeholder:text-gray-400 dark:placeholder:text-gray-600";
  const labelClasses = "text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em] mb-3 flex items-center gap-2";

  return (
    <div className="min-h-screen font-sans pb-20">
      {/* Header */}
      <div className="border-b border-border/60 bg-surface/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link href="/impact-metrics" className="p-3 hover:bg-surface-secondary dark:hover:bg-white/5 rounded-xl border border-border transition-all group">
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Create Impact Metric</h1>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-70">Define a new impact metric with auto-scoring</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => router.push('/impact-metrics')}
              disabled={loading}
              className="rounded-xl px-8 py-4 font-black uppercase tracking-widest text-[10px] border-border/60"
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              onClick={() => handleSubmit(false)}
              disabled={!isFormValid || loading}
              className="rounded-xl px-12 py-4 shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[10px]"
              icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            >
              Create Metric
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-10 mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Basic Information */}
        <div className="bg-surface dark:bg-black/20 rounded-[2.5rem] border border-border p-10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <Info className="w-48 h-48 text-primary" />
          </div>
          
          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-8 relative z-10">
            <div className="space-y-2">
              <label className={labelClasses}>Metric Name <span className="text-primary">*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={inputClasses}
                placeholder="e.g., Number of Households Reached"
                required
              />
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className={inputClasses + " h-32 resize-none"}
                placeholder="Brief description of what this metric measures"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className={labelClasses}>Metric Type <span className="text-primary">*</span></label>
                <div className="relative">
                  <select
                    value={formData.metricType}
                    onChange={(e) => setFormData(prev => ({ ...prev, metricType: e.target.value as MetricType }))}
                    className={inputClasses + " appearance-none cursor-pointer"}
                    required
                  >
                    {metricTypes.map(type => (
                      <option key={type.value} value={type.value} className="dark:bg-gray-900 py-2">
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 pb-1">▼</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClasses}>Scoring Weight (%) <span className="text-primary">*</span></label>
                <input
                  type="number"
                  value={formData.scoringWeight || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, scoringWeight: Number(e.target.value) }))}
                  className={inputClasses}
                  placeholder="20"
                  min="1"
                  max="100"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Target & Timeline */}
        <div className="bg-surface dark:bg-black/20 rounded-[2.5rem] border border-border p-10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <Target className="w-48 h-48 text-primary" />
          </div>

          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Target & Timeline</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className={labelClasses}>Target Value <span className="text-primary">*</span></label>
                <input
                  type="number"
                  value={formData.target || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, target: Number(e.target.value) }))}
                  className={inputClasses}
                  placeholder="1000"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className={labelClasses}>Current Value</label>
                <input
                  type="number"
                  value={formData.actualValue || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, actualValue: Number(e.target.value) }))}
                  className={inputClasses}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className={labelClasses}>Start Date <span className="text-primary">*</span></label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className={inputClasses}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className={labelClasses}>End Date <span className="text-primary">*</span></label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className={inputClasses}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-10 bg-surface-secondary/20 dark:bg-white/5 rounded-[2.5rem] border border-border border-dashed">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] max-w-xs">
            Review all details carefully before creating your new impact metric record.
          </div>
          <div className="flex items-center gap-4">
             <Button 
                variant="ghost" 
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-6"
             >
               Save as Draft
             </Button>
             <Button
                variant="primary"
                onClick={() => handleSubmit(false)}
                disabled={!isFormValid || loading}
                className="rounded-xl px-12 py-5 shadow-2xl shadow-primary/20 font-black uppercase tracking-widest text-[10px]"
              >
                Create Metric
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
