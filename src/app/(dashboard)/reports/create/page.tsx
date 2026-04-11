'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, FileText, Layout, ListTodo, Settings, Info, Loader2, ChevronDown, Type, CheckSquare, AlignLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface Question {
  id: string;
  type: 'TEXT' | 'NUMBER' | 'SELECT' | 'DATE';
  label: string;
  required: boolean;
  options?: string[];
}

export default function CreateReportPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });

  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', type: 'TEXT', label: 'Primary Feedback', required: true }
  ]);

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: '',
      required: false,
      options: type === 'SELECT' ? ['Option 1'] : undefined
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.category) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide a title and category for the report.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addToast({
        type: 'success',
        title: 'Report Published',
        message: 'The new report has been successfully created.',
      });
      
      router.push('/reports');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'An error occurred while publishing the report.',
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
            <Link href="/reports" className="p-3 hover:bg-surface-secondary dark:hover:bg-white/5 rounded-xl border border-border transition-all group">
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Create New Report</h1>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-70">Design a new data collection form</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => router.push('/reports')}
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
              Publish Report
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 mt-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Report Identification */}
        <div className="bg-surface dark:bg-black/20 rounded-[2.5rem] border border-border p-10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <FileText className="w-48 h-48 text-primary" />
          </div>
          
          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
              <Layout className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Report Identity</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-8 relative z-10">
            <div className="space-y-3">
              <label className={labelClasses}>Report Title <span className="text-primary">*</span></label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={inputClasses}
                placeholder="e.g. Community Health Assessment 2024"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className={labelClasses}>Category <span className="text-primary">*</span></label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className={inputClasses + " appearance-none cursor-pointer"}
                    required
                  >
                    <option value="" className="dark:bg-gray-900">Select Category</option>
                    <option value="Impact" className="dark:bg-gray-900">Impact Assessment</option>
                    <option value="Health" className="dark:bg-gray-900">Health Monitoring</option>
                    <option value="Agric" className="dark:bg-gray-900">Agriculture Feed</option>
                    <option value="Education" className="dark:bg-gray-900">Education Pulse</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className={labelClasses}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={inputClasses + " h-32 resize-none"}
                placeholder="Provide context and instructions for survey respondents"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Question Builder */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em] flex items-center gap-3">
              <ListTodo className="w-4 h-4 text-primary" />
              Report Structure
            </h3>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-surface px-4 py-2 rounded-full border border-border">
              {questions.length} Question{questions.length !== 1 ? 's' : ''} Defined
            </div>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-surface dark:bg-black/20 rounded-[2.5rem] border border-border p-10 shadow-sm transition-all hover:border-primary/20 group relative">
                <div className="flex items-start justify-between gap-8 mb-8">
                  <div className="flex-1 space-y-3">
                    <label className={labelClasses}>Question {index + 1} Label</label>
                    <input
                      type="text"
                      value={question.label}
                      onChange={(e) => updateQuestion(question.id, { label: e.target.value })}
                      className={inputClasses}
                      placeholder="Enter the query text..."
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 pt-8">
                    <div className={`p-4 rounded-2xl border transition-all ${question.required ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-surface-secondary dark:bg-white/5 border-border text-gray-400'}`}>
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                        className="hidden"
                        id={`req-${question.id}`}
                      />
                      <label htmlFor={`req-${question.id}`} className="cursor-pointer text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                        {question.required ? 'Required' : 'Optional'}
                      </label>
                    </div>
                    <button
                      onClick={() => removeQuestion(question.id)}
                      className="p-4 bg-error/10 text-error rounded-2xl border border-error/20 hover:bg-error transition-all hover:text-white"
                      title="Remove Question"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-surface-secondary dark:bg-white/5 rounded-2xl border border-border flex items-center gap-3">
                    <div className="p-2 bg-surface rounded-xl border border-border">
                      {question.type === 'TEXT' && <AlignLeft className="w-4 h-4 text-primary" />}
                      {question.type === 'SELECT' && <Layout className="w-4 h-4 text-primary" />}
                      {question.type === 'NUMBER' && <Type className="w-4 h-4 text-primary" />}
                      {question.type === 'DATE' && <Calendar className="w-4 h-4 text-primary" />}
                    </div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Type: {question.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Question Type Shortcuts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <button
              onClick={() => addQuestion('TEXT')}
              className="p-6 bg-surface dark:bg-black/20 rounded-3xl border border-border border-dashed hover:border-primary/40 hover:bg-primary/5 transition-all text-center group"
            >
              <AlignLeft className="w-6 h-6 mx-auto mb-4 text-gray-400 group-hover:text-primary transition-colors" />
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">Add Text field</span>
            </button>
            <button
              onClick={() => addQuestion('NUMBER')}
              className="p-6 bg-surface dark:bg-black/20 rounded-3xl border border-border border-dashed hover:border-primary/40 hover:bg-primary/5 transition-all text-center group"
            >
              <Type className="w-6 h-6 mx-auto mb-4 text-gray-400 group-hover:text-primary transition-colors" />
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">Add Numeric field</span>
            </button>
            <button
              onClick={() => addQuestion('SELECT')}
              className="p-6 bg-surface dark:bg-black/20 rounded-3xl border border-border border-dashed hover:border-primary/40 hover:bg-primary/5 transition-all text-center group"
            >
              <Layout className="w-6 h-6 mx-auto mb-4 text-gray-400 group-hover:text-primary transition-colors" />
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">Add Selection field</span>
            </button>
            <button
              onClick={() => addQuestion('DATE')}
              className="p-6 bg-surface dark:bg-black/20 rounded-3xl border border-border border-dashed hover:border-primary/40 hover:bg-primary/5 transition-all text-center group"
            >
              <Calendar className="w-6 h-6 mx-auto mb-4 text-gray-400 group-hover:text-primary transition-colors" />
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">Add Date field</span>
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-amber-500/5 rounded-[2.5rem] border border-amber-500/20 p-10 flex items-start gap-6">
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-amber-900 dark:text-amber-100 uppercase tracking-widest mb-2">Publishing Information</h4>
            <p className="text-xs font-bold text-amber-700/70 dark:text-amber-400/70 uppercase tracking-[0.05em] leading-relaxed">
              Upon publishing, this report will be instantly available to all data collection agents. 
              Existing responses will be maintained if the structure is modified later, but destructive changes should be avoided.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
