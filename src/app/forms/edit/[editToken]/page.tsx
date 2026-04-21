/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  getReportByEditToken,
  updateReportByEditToken,
} from '@/lib/api/reports';
import { QuestionBuilder } from '@/components/forms/QuestionBuilder';
import { PublicFormLayout } from '@/components/forms/PublicFormLayout';

const CATEGORIES = [
  { value: 'IMPACT_ASSESSMENT', label: 'Impact Assessment' },
  { value: 'FEEDBACK', label: 'Feedback' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'AGRICULTURE', label: 'Agriculture' },
  { value: 'COMMUNITY', label: 'Community' },
  { value: 'ENVIRONMENT', label: 'Environment' },
  { value: 'ECONOMIC', label: 'Economic' },
];

export default function EditFormPage() {
  const params = useParams();
  const editToken = params.editToken as string;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>(
    'idle',
  );

  useEffect(() => {
    if (!editToken) return;

    const fetchReport = async () => {
      try {
        setLoading(true);
        const data = await getReportByEditToken(editToken);
        setReport(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load survey');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [editToken]);

  const handleSave = async () => {
    if (!report) return;

    // Validate title
    if (!report.title?.trim()) {
      setError('Survey title is required');
      return;
    }

    // Validate all questions have titles
    for (const question of report.questions || []) {
      if (!question.title?.trim()) {
        setError('All questions must have a title');
        return;
      }
    }

    setSaving(true);
    setSaveStatus('idle');
    setError(null);

    try {
      const updated = await updateReportByEditToken(editToken, {
        title: report.title,
        description: report.description,
        category: report.category,
        questions: report.questions,
      });

      setReport(updated);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <PublicFormLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-[#5B94E5] rounded-full animate-spin mb-4" />
          <p className="text-gray-500 text-sm">Loading survey editor...</p>
        </div>
      </PublicFormLayout>
    );
  }

  // ─── Error (no report) ──────────────────────────────────────
  if (error && !report) {
    return (
      <PublicFormLayout>
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center max-w-md mx-auto">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Survey Not Found
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-400">
            This edit link may have expired or been revoked. Please contact the survey creator.
          </p>
        </div>
      </PublicFormLayout>
    );
  }

  if (!report) return null;

  // ─── Editor ─────────────────────────────────────────────────
  return (
    <PublicFormLayout>
      <div className="space-y-5">
        {/* Sticky save bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">
              Editing Survey
            </span>
            {report.questions?.length > 0 && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {report.questions.length} question
                {report.questions.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {saveStatus === 'success' && (
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                <svg
                  className="w-4 h-4"
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
                Saved
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-sm text-red-500 font-medium">
                Save failed
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5B94E5] text-white text-sm font-semibold rounded-lg hover:bg-[#4A7EC9] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
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
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-500 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Survey details card */}
        <div className="bg-white rounded-xl border border-gray-200 border-t-4 border-t-[#5B94E5] p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Survey Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={report.title || ''}
              onChange={(e) =>
                setReport({ ...report, title: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 text-lg font-semibold focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors outline-none"
              placeholder="Enter survey title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={report.description || ''}
              onChange={(e) =>
                setReport({ ...report, description: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors outline-none resize-none"
              rows={3}
              placeholder="Survey description or instructions for respondents"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category
            </label>
            <select
              value={report.category || 'FEEDBACK'}
              onChange={(e) =>
                setReport({ ...report, category: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Questions section */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Questions
          </h2>
          <QuestionBuilder
            questions={report.questions || []}
            onChange={(questions) => setReport({ ...report, questions })}
          />
        </div>
      </div>
    </PublicFormLayout>
  );
}
