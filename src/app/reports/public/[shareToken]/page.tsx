/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader2, Send, ArrowLeft, Shield } from 'lucide-react';
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
  category?: string;
  organization?: {
    name: string;
    domain: string;
  };
}

export default function PublicResponseForm() {
  const params = useParams();
  const router = useRouter();
  const shareToken = params.shareToken as string;
  
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
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

    if (report?.collectEmail && formData.respondentEmail && !/\S+@\S+\.\S+/.test(formData.respondentEmail)) {
      errors.email = 'Please enter a valid email address';
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
      // Scroll to first error
      const firstErrorElement = document.querySelector('.error-field');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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

    const inputClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
      hasError ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
    }`;

    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={response?.answer === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700 group-hover:text-gray-900 flex-1">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg hover:bg-gray-50 transition-colors">
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
                <span className="text-gray-700 group-hover:text-gray-900 flex-1">{option}</span>
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
            placeholder={question.settings?.placeholder || 'Type your answer here...'}
            className={inputClasses}
          />
        );

      case 'paragraph':
        return (
          <textarea
            value={response?.answer || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.settings?.placeholder || 'Type your detailed answer here...'}
            rows={4}
            className={inputClasses}
          />
        );

      case 'linear_scale':
        const min = question.settings?.min || 1;
        const max = question.settings?.max || 5;
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Strongly Disagree ({min})</span>
              <span>Strongly Agree ({max})</span>
            </div>
            <div className="flex space-x-2 justify-center bg-gray-50 p-4 rounded-lg">
              {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((value) => (
                <label key={value} className="flex flex-col items-center space-y-2 cursor-pointer group">
                  <input
                    type="radio"
                    name={question.id}
                    value={value}
                    checked={response?.answer === value}
                    onChange={(e) => handleInputChange(question.id, parseInt(e.target.value))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium group-hover:text-blue-600 bg-white px-3 py-1 rounded-full border group-hover:border-blue-300 transition-colors">
                    {value}
                  </span>
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
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-semibold text-blue-800">Impact Metric Question</h4>
              </div>
              <p className="text-sm text-blue-700">
                This question tracks measurable impact data. Please enter the actual value achieved for this metric.
              </p>
            </div>
            <input
              type="number"
              value={response?.actualValue || ''}
              onChange={(e) => handleInputChange(question.id, parseFloat(e.target.value) || 0, true)}
              placeholder="Enter actual value achieved"
              step="any"
              min="0"
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
            placeholder="Type your answer here..."
            className={inputClasses}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Form</h3>
          <p className="text-gray-600">Please wait while we prepare your form...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Form Not Available</h1>
          <p className="text-gray-600 mb-6">{error || 'This form could not be loaded or may no longer be available.'}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            <p className="text-xs text-gray-500">
              If you believe this is an error, please contact the form creator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
          <p className="text-lg text-gray-600 mb-6">
            Your response has been submitted successfully. We appreciate your time and participation.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              <strong>What happens next?</strong> Your submission helps us track impact and improve our programs. 
              The data you provided will be analyzed to measure progress toward our goals.
            </p>
          </div>

          {report.allowMultipleResponses && (
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ responses: {} });
                  setValidationErrors({});
                  setCurrentQuestionIndex(0);
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Submit Another Response
              </button>
              <p className="text-xs text-gray-500">This form allows multiple submissions</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const progressPercentage = report.questions.length > 0 
    ? (Object.keys(formData.responses).length / report.questions.length) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{report.title}</h1>
            {report.description && (
              <p className="text-lg text-gray-600 mb-6">{report.description}</p>
            )}
            
            {report.organization && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <Shield className="w-4 h-4" />
                {report.organization.name}
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          {report.questions.length > 1 && (
            <div className="mt-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {Object.keys(formData.responses).length} of {report.questions.length} questions answered
              </p>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Respondent Information */}
          {report.collectEmail && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">i</span>
                </div>
                Your Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.respondentName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, respondentName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className={validationErrors.email ? 'error-field' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.respondentEmail || ''}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, respondentEmail: e.target.value }));
                      if (validationErrors.email) {
                        setValidationErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.email;
                          return newErrors;
                        });
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      validationErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {validationErrors.email && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Questions */}
          {report.questions.map((question, index) => (
            <div 
              key={question.id} 
              className={`bg-white rounded-xl shadow-sm border transition-all duration-200 p-6 ${
                validationErrors[question.id] ? 'error-field border-red-200 bg-red-50' : 'border-gray-200'
              }`}
            >
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-start gap-3 mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 text-sm font-bold rounded-full flex-shrink-0 mt-1">
                    {index + 1}
                  </span>
                  <span className="flex-1">
                    {question.title}
                    {question.required && <span className="text-red-500 ml-2">*</span>}
                  </span>
                </h3>
                {question.description && (
                  <p className="text-gray-600 ml-11 text-sm">{question.description}</p>
                )}
              </div>

              <div className="ml-11">
                {renderQuestionInput(question)}
              </div>

              {validationErrors[question.id] && (
                <p className="text-red-600 text-sm mt-3 ml-11 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors[question.id]}
                </p>
              )}
            </div>
          ))}

          {/* Submit Button */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">Submission Failed</h4>
                  <p className="text-red-700 text-sm">{submitError}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-3" />
                  Submitting Your Response...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-3" />
                  Submit Response
                </>
              )}
            </button>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                🔒 Your response is securely encrypted and will be used to measure impact and improve programs.
              </p>
              {report.category && (
                <p className="text-xs text-gray-400 mt-1">
                  Category: {report.category}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}