/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Create this file: app/reports/public/[shareToken]/page.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Send, CheckCircle, Clock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

interface Question {
  id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  impactMetricId?: string;
}

interface Report {
  _id: string;
  title: string;
  description?: string;
  questions: Question[];
  collectEmail: boolean;
  isPublic: boolean;
  status: string;
}

export default function PublicFormPage() {
  const params = useParams();
  const shareToken = params?.shareToken as string;
  const { addToast } = useToast();
  
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [respondentName, setRespondentName] = useState('');
  const [respondentEmail, setRespondentEmail] = useState('');

  useEffect(() => {
    if (shareToken) {
      fetchPublicReport();
    }
  }, [shareToken]);

  const fetchPublicReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/reports/public/${shareToken}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Form not found');
        } else if (response.status === 403) {
          throw new Error('This form is not publicly accessible');
        } else {
          throw new Error('Failed to load form');
        }
      }
      
      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.error('Error fetching public report:', err);
      setError(err instanceof Error ? err.message : 'Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const progress = useMemo(() => {
    if (!report) return 0;
    const answeredCount = Object.keys(responses).filter(id => {
      const val = responses[id];
      return val !== undefined && val !== '' && (!Array.isArray(val) || val.length > 0);
    }).length;
    return (answeredCount / report.questions.length) * 100;
  }, [responses, report]);

  const estimatedTime = useMemo(() => {
    if (!report) return 0;
    return Math.max(1, Math.ceil(report.questions.length / 3));
  }, [report]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!report) return;

  const missingRequired = report.questions
    .filter(q => q.required)
    .filter(q => !responses[q.id] || responses[q.id] === '');
  
  if (missingRequired.length > 0) {
    addToast({
      type: 'warning',
      title: 'Missing Required Fields',
      message: 'Please fill in all required fields before submitting.',
    });
    return;
  }

  if (report.collectEmail && !respondentEmail) {
    addToast({
      type: 'warning',
      title: 'Email Required',
      message: 'Please provide your email address to submit this form.',
    });
    return;
  }

  try {
    setSubmitting(true);
    
    const formattedResponses = Object.entries(responses).map(([questionId, value]) => {
      const question = report.questions.find(q => q.id === questionId);
      
      if (question?.type === 'impact_metric') {
        return {
          questionId,
          impactMetricId: question.impactMetricId,
          actualValue: parseFloat(value) || 0
        };
      }

      return {
        questionId,
        answer: Array.isArray(value) ? value.join(', ') : value.toString()
      };
    });

    const submitData = {
      reportId: report._id,
      responses: formattedResponses,
      respondentName: respondentName || undefined,
      respondentEmail: respondentEmail || undefined,
    };

    const response = await fetch('/api/responses/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submitData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to submit' }));
      throw new Error(errorData.message || 'Failed to submit response');
    }

    setSubmitted(true);
  } catch (err) {
    console.error('Error submitting response:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to submit response';
    setError(errorMessage);
    addToast({
      type: 'error',
      title: 'Submission Failed',
      message: errorMessage,
    });
  } finally {
    setSubmitting(false);
  }
};

  const renderQuestion = (question: Question) => {
    const value = responses[question.id] || '';

    switch (question.type) {
      case 'multiple_choice':
      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="w-4 h-4 text-[#5B94E5] focus:ring-[#5B94E5] border-gray-300"
                />
                <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
      case 'CHECKBOXES':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) ? value.includes(option) : false}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      handleResponseChange(question.id, [...currentValues, option]);
                    } else {
                      handleResponseChange(question.id, currentValues.filter(v => v !== option));
                    }
                  }}
                  className="w-4 h-4 text-[#5B94E5] focus:ring-[#5B94E5] rounded border-gray-300"
                />
                <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'dropdown':
      case 'DROPDOWN':
        return (
          <select
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B94E5]/20 focus:border-[#5B94E5] outline-none transition-all bg-white text-gray-900"
          >
            <option value="">Select an option</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'short_answer':
      case 'SHORT_ANSWER':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B94E5]/20 focus:border-[#5B94E5] outline-none transition-all bg-white text-gray-900"
            placeholder="Your answer"
          />
        );

      case 'paragraph':
      case 'PARAGRAPH':
        return (
          <textarea
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B94E5]/20 focus:border-[#5B94E5] outline-none transition-all bg-white text-gray-900 resize-none"
            placeholder="Your answer"
          />
        );

      case 'linear_scale':
      case 'LINEAR_SCALE':
        return (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-medium text-gray-400">Strongly Disagree</span>
              <span className="text-xs font-medium text-gray-400">Strongly Agree</span>
            </div>
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5].map(num => (
                <label key={num} className="cursor-pointer">
                  <input
                    type="radio"
                    name={question.id}
                    value={num}
                    checked={value === num.toString()}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    className="sr-only"
                  />
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-12 h-12 border-2 rounded-2xl flex items-center justify-center text-base font-semibold transition-all ${
                    value === num.toString()
                      ? 'border-[#5B94E5] bg-[#5B94E5] text-white shadow-lg shadow-blue-200'
                      : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-[#5B94E5] hover:bg-white hover:text-[#5B94E5]'
                  }`}>
                    {num}
                  </motion.div>
                </label>
              ))}
            </div>
          </div>
        );

      case 'date':
      case 'DATE':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full md:w-auto px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B94E5]/20 focus:border-[#5B94E5] outline-none transition-all bg-white text-gray-900"
          />
        );

      case 'time':
      case 'TIME':
        return (
          <input
            type="time"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full md:w-auto px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B94E5]/20 focus:border-[#5B94E5] outline-none transition-all bg-white text-gray-900"
          />
        );

      case 'impact_metric':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleResponseChange(question.id, parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B94E5]/20 focus:border-[#5B94E5] outline-none transition-all bg-white text-gray-900"
            placeholder="Enter numeric value"
            min="0"
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B94E5]/20 focus:border-[#5B94E5] outline-none transition-all bg-white text-gray-900"
            placeholder="Your answer"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#5B94E5] rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-500 font-medium">Loading form details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-10 max-w-md w-full text-center border border-gray-100"
        >
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-500 text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Form Not Available</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="w-full py-4 bg-[#5B94E5] text-white font-semibold rounded-2xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-[0.98]"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-12 max-w-md w-full text-center border border-gray-100"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Thank You!</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your response has been successfully submitted to the system.
          </p>
          <button
            onClick={() => window.close()}
            className="w-full py-4 bg-[#5B94E5] text-white font-semibold rounded-2xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-[0.98]"
          >
            Finish
          </button>
        </motion.div>
      </div>
    );
  }

  if (!report || report.status !== 'PUBLISHED' || !report.isPublic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-10 max-w-md w-full text-center border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Form Not Found</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            The form you&rsquo;re looking for is either closed, restricted, or doesn&rsquo;t exist.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full py-4 bg-[#5B94E5] text-white font-semibold rounded-2xl hover:bg-blue-600 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Header */}
      <div className="bg-[#12182B] relative overflow-hidden h-64 flex items-end pb-12">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#5B94E5]/20 to-transparent opacity-60"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#5B94E5]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 mix-blend-overlay"></div>
        
        <div className="max-w-3xl mx-auto w-full px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
              {report.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <Badge variant="primary" className="bg-white/10 text-blue-200 border-white/10">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                {estimatedTime} min read
              </Badge>
              <Badge variant="info" className="bg-white/10 text-blue-200 border-white/10">
                {report.questions.length} questions
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-10 pb-24 relative z-20">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Form Description Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 p-8 border border-white"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold text-[#5B94E5] uppercase tracking-widest">About this form</span>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Info className="w-5 h-5 text-[#5B94E5]" />
              </div>
            </div>
            {report.description ? (
              <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                {report.description}
              </p>
            ) : (
              <p className="text-gray-400 italic">No description provided.</p>
            )}
            
            <div className="mt-8 pt-8 border-t border-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Completion Progress</span>
                <span className="text-sm font-bold text-[#5B94E5]">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2.5 bg-gray-100" />
            </div>
          </motion.div>

          {/* Respondent Info Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 p-8 border border-white"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5B94E5]/20 focus:border-[#5B94E5] outline-none transition-all text-gray-900"
                  placeholder="e.g. John Doe"
                />
              </div>
              
              {report.collectEmail && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-wider">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={respondentEmail}
                    onChange={(e) => setRespondentEmail(e.target.value)}
                    required={report.collectEmail}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5B94E5]/20 focus:border-[#5B94E5] outline-none transition-all text-gray-900"
                    placeholder="john@example.com"
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Questions */}
          <div className="space-y-6">
            {report.questions.map((question, index) => (
              <motion.div 
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-[2rem] shadow-lg shadow-gray-200/40 p-8 border border-white hover:shadow-xl transition-shadow"
              >
                <div className="mb-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-bold text-gray-900 leading-snug">
                      <span className="text-[#5B94E5] font-mono mr-3 text-lg">{(index + 1).toString().padStart(2, '0')}.</span>
                      {question.title}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                  </div>
                  {question.description && (
                    <p className="text-gray-500 mt-3 text-base leading-relaxed whitespace-pre-wrap ml-10">
                      {question.description}
                    </p>
                  )}
                </div>
                
                <div className="ml-0 md:ml-10">
                  {renderQuestion(question)}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Submit Footer */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 p-8 border border-white flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-3 text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-sm font-medium">Fields with * are mandatory</span>
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 bg-[#5B94E5] text-white font-bold rounded-2xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Responses
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>

      {/* Sticky Footer Progress (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 z-50">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progress</span>
            <span className="text-[10px] font-bold text-[#5B94E5]">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </div>
    </div>
  );
}