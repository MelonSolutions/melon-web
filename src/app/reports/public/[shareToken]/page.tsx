/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader2, Send } from 'lucide-react';
import { getPublicReport } from '@/lib/api/reports';
import { useResponseSubmission } from '@/hooks/useResponses';

interface Question {
  id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  impactMetricId?: string;
  settings?: any;
}

interface Report {
  _id: string;
  title: string;
  description?: string;
  questions: Question[];
  collectEmail: boolean;
  allowMultipleResponses: boolean;
}

export default function PublicResponseForm() {
  const params = useParams();
  const router = useRouter();
  const shareToken = params.shareToken as string;
  
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState<{
    respondentName?: string;
    respondentEmail?: string;
    responses: Record<string, any>;
  }>({
    responses: {},
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { submitResponse, loading: submitting, error: submitError } = useResponseSubmission();

  // Fetch the public report
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const reportData = await getPublicReport(shareToken);
        setReport(reportData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load form';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (shareToken) {
      fetchReport();
    }
  }, [shareToken]);

  const handleInputChange = (questionId: string, value: any, isImpactMetric = false) => {
    setFormData(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [questionId]: isImpactMetric ? { actualValue: value } : { answer: value },
      },
    }));

    // Clear validation error when user starts typing
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (report?.collectEmail && !formData.respondentEmail) {
      errors.email = 'Email is required';
    }

    report?.questions.forEach(question => {
      if (question.required) {
        const response = formData.responses[question.id];
        if (!response || (response.answer === '' && response.actualValue === undefined)) {
          errors[question.id] = 'This field is required';
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const responseData = {
        reportId: report!._id,
        respondentName: formData.respondentName,
        respondentEmail: formData.respondentEmail,
        responses: Object.entries(formData.responses).map(([questionId, response]) => ({
          questionId,
          answer: response.answer,
          actualValue: response.actualValue,
          impactMetricId: report!.questions.find(q => q.id === questionId)?.impactMetricId,
        })),
      };

      await submitResponse(responseData);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit response:', err);
    }
  };

  const renderQuestionInput = (question: Question) => {
    const response = formData.responses[question.id];
    const hasError = validationErrors[question.id];
    const isImpactMetric = question.type === 'impact_metric';

    const inputClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      hasError ? 'border-red-300' : 'border-gray-300'
    }`;

    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={response?.answer === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(response?.answer) && response.answer.includes(option)}
                  onChange={(e) => {
                    const currentAnswers = Array.isArray(response?.answer) ? response.answer : [];
                    const newAnswers = e.target.checked
                      ? [...currentAnswers, option]
                      : currentAnswers.filter((a: string) => a !== option);
                    handleInputChange(question.id, newAnswers);
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={response?.answer || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className={inputClasses}
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
            value={response?.answer || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.settings?.placeholder || 'Your answer'}
            className={inputClasses}
          />
        );

      case 'paragraph':
        return (
          <textarea
            value={response?.answer || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.settings?.placeholder || 'Your answer'}
            rows={4}
            className={inputClasses}
          />
        );

      case 'linear_scale':
        const min = question.settings?.min || 1;
        const max = question.settings?.max || 5;
        return (
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{min}</span>
              <span>{max}</span>
            </div>
            <div className="flex space-x-2">
              {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((value) => (
                <label key={value} className="flex flex-col items-center space-y-1">
                  <input
                    type="radio"
                    name={question.id}
                    value={value}
                    checked={response?.answer === value}
                    onChange={(e) => handleInputChange(question.id, parseInt(e.target.value))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">{value}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={response?.answer || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className={inputClasses}
          />
        );

      case 'time':
        return (
          <input
            type="time"
            value={response?.answer || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className={inputClasses}
          />
        );

      case 'impact_metric':
        return (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Impact Metric:</strong> This question tracks measurable impact data.
              </p>
              <p className="text-xs text-blue-600">
                Please enter the actual value achieved for this metric.
              </p>
            </div>
            <input
              type="number"
              value={response?.actualValue || ''}
              onChange={(e) => handleInputChange(question.id, parseFloat(e.target.value), true)}
              placeholder="Enter actual value achieved"
              step="any"
              className={inputClasses}
            />
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={response?.answer || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className={inputClasses}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Form Not Available</h1>
          <p className="text-gray-600 mb-4">{error || 'This form could not be loaded.'}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h1>
          <p className="text-gray-600 mb-6">
            Your response has been submitted successfully. We appreciate your participation.
          </p>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">
              Your submission helps us track impact and improve our programs.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Form Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{report.title}</h1>
          {report.description && (
            <p className="text-gray-600">{report.description}</p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Respondent Information */}
          {report.collectEmail && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.respondentName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, respondentName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.respondentEmail || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, respondentEmail: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {validationErrors.email && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Questions */}
          {report.questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {index + 1}. {question.title}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </h3>
                {question.description && (
                  <p className="text-gray-600 text-sm mt-1">{question.description}</p>
                )}
              </div>

              {renderQuestionInput(question)}

              {validationErrors[question.id] && (
                <p className="text-red-600 text-sm mt-2">{validationErrors[question.id]}</p>
              )}
            </div>
          ))}

          {/* Submit Button */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{submitError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Response
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}