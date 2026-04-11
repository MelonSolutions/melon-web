'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, Target, Activity, MapPin, Briefcase, Info, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function CreateProjectPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sector: '',
    region: '',
    budget: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.title || !formData.sector || !formData.region) {
      addToast({
        type: 'error',
        title: 'Form Incomplete',
        message: 'Please fill in all required fields.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addToast({
        type: 'success',
        title: 'Project Created',
        message: 'Your new project has been successfully created.',
      });
      
      router.push('/portfolio');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: 'An error occurred while creating the project.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full px-6 py-4 bg-surface dark:bg-white/5 border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-sm dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600";
  const labelClasses = "text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2";

  return (
    <div className="min-h-screen bg-surface-secondary/30 pb-20">
      {/* Sticky Header */}
      <div className="border-b border-border/60 bg-surface/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link href="/portfolio" className="p-3 hover:bg-surface-secondary dark:hover:bg-white/5 rounded-xl border border-border transition-all group">
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Create New Project</h1>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-70">Add a new project to your portfolio</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => router.push('/portfolio')}
              className="rounded-xl px-8 py-4 font-black uppercase tracking-widest text-[10px] border-border/60"
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              onClick={handleSave}
              disabled={isSubmitting}
              className="rounded-xl px-12 py-4 shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[10px]"
              icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            >
              Create Project
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 mt-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Core Project Data */}
        <div className="bg-surface dark:bg-black/20 rounded-[2.5rem] border border-border p-10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <Target className="w-48 h-48 text-primary" />
          </div>
          
          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Project Details</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-8 relative z-10">
            <div className="space-y-3">
              <label className={labelClasses}>Project Title <span className="text-primary">*</span></label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={inputClasses}
                placeholder="Enter a descriptive project name"
                required
              />
            </div>

            <div className="space-y-3">
              <label className={labelClasses}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={inputClasses + " h-32 resize-none"}
                placeholder="Overview of project objectives and scope"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className={labelClasses}>Sector <span className="text-primary">*</span></label>
                <div className="relative">
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                    className={inputClasses + " appearance-none cursor-pointer"}
                    required
                  >
                    <option value="" className="dark:bg-gray-900">Select Sector</option>
                    <option value="Agriculture" className="dark:bg-gray-900">Agriculture</option>
                    <option value="Health" className="dark:bg-gray-900">Health</option>
                    <option value="Education" className="dark:bg-gray-900">Education</option>
                    <option value="Tech" className="dark:bg-gray-900">Technology</option>
                    <option value="Finance" className="dark:bg-gray-900">Finance</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                </div>
              </div>

              <div className="space-y-3">
                <label className={labelClasses}>Region <span className="text-primary">*</span></label>
                <div className="relative">
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                    className={inputClasses + " appearance-none cursor-pointer"}
                    required
                  >
                    <option value="" className="dark:bg-gray-900">Select Region</option>
                    <option value="North" className="dark:bg-gray-900">North</option>
                    <option value="South" className="dark:bg-gray-900">South</option>
                    <option value="East" className="dark:bg-gray-900">East</option>
                    <option value="West" className="dark:bg-gray-900">West</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline & Budget */}
        <div className="bg-surface dark:bg-black/20 rounded-[2.5rem] border border-border p-10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <Activity className="w-48 h-48 text-primary" />
          </div>

          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Timeline & Budget</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-3">
              <label className={labelClasses}>Estimated Budget</label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-primary">₦</div>
                <input
                  type="text"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value.replace(/\D/g, '') }))}
                  className={inputClasses + " pl-12"}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className={labelClasses}>Current Status</label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className={inputClasses + " appearance-none cursor-pointer"}
                >
                  <option value="ACTIVE" className="dark:bg-gray-900">Active</option>
                  <option value="PENDING" className="dark:bg-gray-900">Pending</option>
                  <option value="COMPLETED" className="dark:bg-gray-900">Completed</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
              </div>
            </div>

            <div className="space-y-3">
              <label className={labelClasses}>Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className={inputClasses}
              />
            </div>

            <div className="space-y-3">
              <label className={labelClasses}>End Date (Estimated)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-primary/5 rounded-[2.5rem] border border-primary/20 p-10 flex items-start gap-6">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-2">Project Updates</h4>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.05em] leading-relaxed">
              New projects will be immediately added to your portfolio. 
              Ensure all information is accurate as this data will be used for all related metrics and reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
