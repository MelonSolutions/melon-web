/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Create this file: app/reports/public/[shareToken]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Send, CheckCircle } from 'lucide-react';

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

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!report) return;

  const missingRequired = report.questions
    .filter(q => q.required)
    .filter(q => !responses[q.id] || responses[q.id] === '');
  
  if (missingRequired.length > 0) {
    alert('Please fill in all required fields');
    return;
  }

  if (report.collectEmail && !respondentEmail) {
    alert('Email address is required');
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

    console.log('Submitting data:', submitData);

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
    setError(err instanceof Error ? err.message : 'Failed to submit response');
  } finally {
    setSubmitting(false);
  }
};

  const renderQuestion = (question: Question) => {
    const value = responses[question.id] || '';

    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="w-4 h-4 text-[#5B94E5] focus:ring-[#5B94E5]"
                />
                <span className="text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-3 cursor-pointer">
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
                  className="w-4 h-4 text-[#5B94E5] focus:ring-[#5B94E5] rounded"
                />
                <span className="text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
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
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
            placeholder="Your answer"
          />
        );

      case 'paragraph':
        return (
          <textarea
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors resize-none"
            placeholder="Your answer"
          />
        );

      case 'linear_scale':
        return (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">1</span>
            <div className="flex gap-2">
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
                  <div className={`w-8 h-8 border-2 rounded-full flex items-center justify-center text-sm transition-colors ${
                    value === num.toString()
                      ? 'border-[#5B94E5] bg-[#5B94E5] text-white'
                      : 'border-gray-300 text-gray-600 hover:border-[#5B94E5]'
                  }`}>
                    {num}
                  </div>
                </label>
              ))}
            </div>
            <span className="text-sm text-gray-600">5</span>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
          />
        );

      case 'time':
        return (
          <input
            type="time"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
          />
        );

      case 'impact_metric':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleResponseChange(question.id, parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
            placeholder="Your answer"
          />
        );
    }
  };

  // Show loading if shareToken is not available yet
  if (!shareToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B94E5] mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B94E5] mx-auto mb-4"></div>
          <p className="text-gray-500">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md w-full mx-4 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Form Not Available</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-[#5B94E5] text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
          <p className="text-sm text-gray-500 mt-4">
            If you believe this is an error, please contact the form creator.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md w-full mx-4 text-center">
          <div className="text-green-500 mb-4">
            <CheckCircle className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-6">
            Your response has been submitted successfully.
          </p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-[#5B94E5] text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md w-full mx-4 text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Form Not Found</h1>
          <p className="text-gray-600 mb-6">
            The form you&rsquo;re looking for doesn&rsquo;t exist or has been removed.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-[#5B94E5] text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (report.status !== 'PUBLISHED' || !report.isPublic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md w-full mx-4 text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Form Not Available</h1>
          <p className="text-gray-600 mb-6">
            This form is not currently accepting responses.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-[#5B94E5] text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Header */}
          <div className="bg-white rounded-lg border border-gray-200 border-l-4 border-l-[#5B94E5] p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{report.title}</h1>
            {report.description && (
              <p className="text-gray-600 text-lg leading-relaxed">{report.description}</p>
            )}
          </div>

          {/* Respondent Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                  placeholder="Your name"
                />
              </div>
              
              {report.collectEmail && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={respondentEmail}
                    onChange={(e) => setRespondentEmail(e.target.value)}
                    required={report.collectEmail}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Questions */}
          {report.questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <span className="text-sm bg-[#5B94E5] text-white rounded-full w-6 h-6 flex items-center justify-center">
                    {index + 1}
                  </span>
                  {question.title}
                  {question.required && <span className="text-red-500">*</span>}
                </h3>
                {question.description && (
                  <p className="text-gray-600 mt-2">{question.description}</p>
                )}
              </div>
              
              <div className="mt-4">
                {renderQuestion(question)}
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <span className="text-red-500">*</span> Required fields
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#5B94E5] text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Response
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}