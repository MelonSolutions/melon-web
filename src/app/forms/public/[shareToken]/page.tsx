/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getPublicReport } from '@/lib/api/reports';
import { submitResponse } from '@/lib/api/responses';
import { QuestionRenderer } from '@/components/forms/QuestionRenderer';
import { PublicFormLayout } from '@/components/forms/PublicFormLayout';

export default function PublicFormPage() {
  const params = useParams();
  const shareToken = params.shareToken as string;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [respondentName, setRespondentName] = useState('');
  const [respondentEmail, setRespondentEmail] = useState('');

  useEffect(() => {
    if (!shareToken) return;

    const fetchReport = async () => {
      try {
        setLoading(true);
        const data = await getPublicReport(shareToken);
        setReport(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load survey');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [shareToken]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    // Clear validation error on interaction
    if (validationErrors[questionId]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    report.questions.forEach((question: any) => {
      const answer = answers[question.id];
      const type = question.type?.toUpperCase();

      // Required field validation
      if (question.required) {
        if (answer === undefined || answer === null || answer === '') {
          errors[question.id] = 'This field is required';
        } else if (
          type === 'CHECKBOXES' &&
          (!Array.isArray(answer) || answer.length === 0)
        ) {
          errors[question.id] = 'Please select at least one option';
        } else if (
          (type === 'MULTIPLE_CHOICE' || type === 'DROPDOWN') &&
          typeof answer === 'object' &&
          answer?.option === '- Others' &&
          (!answer.customText || answer.customText.trim() === '')
        ) {
          errors[question.id] = 'Please specify your answer for Others';
        } else if (
          type === 'CHECKBOXES' &&
          Array.isArray(answer)
        ) {
          // Check if "Others" is selected in checkboxes and has no custom text
          const othersItem = answer.find((item: any) =>
            typeof item === 'object' && item?.option === '- Others'
          );
          if (othersItem && (!othersItem.customText || othersItem.customText.trim() === '')) {
            errors[question.id] = 'Please specify your answer for Others';
          }
        } else if (type === 'MATRIX') {
          // Matrix validation: check if all rows have been answered
          const rows = question.settings?.rows || [];
          const matrixAnswer = answer || {};
          const unansweredRows = rows.filter((row: string) => !matrixAnswer[row]);
          if (unansweredRows.length > 0) {
            errors[question.id] = `Please answer all rows`;
          }
        }
      }

      // Email format validation (regardless of required)
      if (type === 'EMAIL' && answer) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(answer)) {
          errors[question.id] = 'Please enter a valid email address';
        }
      }

      // Phone format validation
      if (type === 'PHONE' && answer) {
        const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/;
        if (!phoneRegex.test(answer)) {
          errors[question.id] = 'Please enter a valid phone number';
        }
      }
    });

    // Respondent email if collect is required
    if (report.collectEmail && !respondentEmail) {
      errors['__respondentEmail'] = 'Email address is required';
    } else if (respondentEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(respondentEmail)) {
        errors['__respondentEmail'] = 'Please enter a valid email address';
      }
    }

    setValidationErrors(errors);

    // Scroll to first error
    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0];
      const el = document.getElementById(`question-${firstErrorKey}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report || !validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formattedResponses = report.questions.map((question: any) => {
        const answer = answers[question.id];
        const type = question.type?.toUpperCase();

        if (type === 'IMPACT_METRIC') {
          return {
            questionId: question.id,
            impactMetricId: question.impactMetricId,
            actualValue: typeof answer === 'number' ? answer : parseFloat(answer) || 0,
          };
        }

        // Handle "Others" object for multiple choice
        if (type === 'MULTIPLE_CHOICE' && typeof answer === 'object' && answer?.option === '- Others') {
          return {
            questionId: question.id,
            answer: `- Others: ${answer.customText || ''}`,
          };
        }

        // Handle "Others" object for dropdown
        if (type === 'DROPDOWN' && typeof answer === 'object' && answer?.option === '- Others') {
          return {
            questionId: question.id,
            answer: `- Others: ${answer.customText || ''}`,
          };
        }

        // For checkboxes, process array and handle "Others" objects
        if (type === 'CHECKBOXES' && Array.isArray(answer)) {
          const formattedValues = answer.map((item: any) => {
            if (typeof item === 'object' && item?.option === '- Others') {
              return `- Others: ${item.customText || ''}`;
            }
            return item;
          });
          return {
            questionId: question.id,
            answer: formattedValues.join(', '),
          };
        }

        // For matrix, convert object to JSON string
        if (type === 'MATRIX' && typeof answer === 'object') {
          return {
            questionId: question.id,
            answer: JSON.stringify(answer),
          };
        }

        return {
          questionId: question.id,
          answer: answer ?? null,
        };
      });

      await submitResponse({
        reportId: report._id,
        respondentName: respondentName || undefined,
        respondentEmail: respondentEmail || undefined,
        responses: formattedResponses,
      });

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Failed to submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <PublicFormLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-[#5B94E5] rounded-full animate-spin mb-4" />
          <p className="text-gray-500 text-sm">Loading survey...</p>
        </div>
      </PublicFormLayout>
    );
  }

  // ─── Error State ────────────────────────────────────────────
  if (error && !report) {
    return (
      <PublicFormLayout>
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center max-w-md mx-auto">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Form Not Available
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-400">
            If you believe this is an error, please contact the form creator.
          </p>
        </div>
      </PublicFormLayout>
    );
  }

  // ─── Success State ──────────────────────────────────────────
  if (isSubmitted) {
    return (
      <PublicFormLayout>
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your response has been submitted successfully.
          </p>
          {report?.allowMultipleResponses && (
            <button
              onClick={() => {
                setIsSubmitted(false);
                setAnswers({});
                setRespondentName('');
                setRespondentEmail('');
                setError(null);
              }}
              className="px-5 py-2.5 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7EC9] transition-colors"
            >
              Submit Another Response
            </button>
          )}
        </div>
      </PublicFormLayout>
    );
  }

  // ─── No Report ──────────────────────────────────────────────
  if (!report) {
    return (
      <PublicFormLayout>
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center max-w-md mx-auto">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Form Not Found
          </h1>
          <p className="text-gray-600">
            The form you&rsquo;re looking for doesn&rsquo;t exist or has been removed.
          </p>
        </div>
      </PublicFormLayout>
    );
  }

  // ─── Form ───────────────────────────────────────────────────
  return (
    <PublicFormLayout>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 border-t-4 border-t-[#5B94E5] p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{report.title}</h1>
          {report.description && (
            <p className="text-gray-600 leading-relaxed">{report.description}</p>
          )}
          <div className="mt-4 text-sm text-gray-400">
            <span className="text-red-500">*</span> indicates a required field
          </div>
        </div>

        {/* Respondent Info */}
        <div
          className="bg-white rounded-xl border border-gray-200 p-6"
          id="question-__respondentEmail"
        >
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
            Your Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Name <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                value={respondentName}
                onChange={(e) => setRespondentName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors outline-none"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address{' '}
                {report.collectEmail ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-gray-400">(Optional)</span>
                )}
              </label>
              <input
                type="email"
                value={respondentEmail}
                onChange={(e) => {
                  setRespondentEmail(e.target.value);
                  if (validationErrors['__respondentEmail']) {
                    setValidationErrors((prev) => {
                      const next = { ...prev };
                      delete next['__respondentEmail'];
                      return next;
                    });
                  }
                }}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors outline-none"
                placeholder="your@email.com"
              />
              {validationErrors['__respondentEmail'] && (
                <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {validationErrors['__respondentEmail']}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Questions */}
        {report.questions.map((question: any, index: number) => (
          <div key={question.id} id={`question-${question.id}`}>
            <div className="flex items-start gap-3">
              <div className="mt-6 shrink-0">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#5B94E5] text-white text-xs font-bold">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1">
                <QuestionRenderer
                  question={question}
                  value={answers[question.id]}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                  error={validationErrors[question.id]}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Submit Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              <span className="text-red-500">*</span> Required fields
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2.5 px-7 py-3 bg-[#5B94E5] text-white font-semibold rounded-lg hover:bg-[#4A7EC9] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Submit Response
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </PublicFormLayout>
  );
}
