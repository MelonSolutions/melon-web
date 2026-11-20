/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Send, CheckCircle2, Clock, ListChecks, AlertCircle, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';
import { QuestionInput } from '@/components/forms/QuestionRenderer';
import {
  FormQuestion,
  estimateMinutes,
  formatAnswer,
  isAnswered,
  validateAnswer,
} from '@/components/forms/answers';

interface Report {
  _id: string;
  title: string;
  description?: string;
  questions: FormQuestion[];
  collectEmail: boolean;
  isPublic: boolean;
  status: string;
  allowMultipleResponses?: boolean;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A random id kept on this device for this form. The API uses it to refuse a
 * second response when the form accepts one response per person.
 */
function respondentKey(shareToken: string): string | undefined {
  try {
    const name = `melon_respondent_${shareToken}`;
    let key = localStorage.getItem(name);
    if (!key) {
      key = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      localStorage.setItem(name, key);
    }
    return key;
  } catch {
    return undefined;
  }
}
const RESPONDENT_EMAIL = '__respondentEmail';

/** Centered card for loading, error and thank-you states. */
function StateCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <BrandBar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-10 max-w-md w-full text-center">
          {children}
        </div>
      </div>
      <PoweredBy />
    </div>
  );
}

function BrandBar({ dark = false }: { dark?: boolean }) {
  return (
    <div className={dark ? '' : 'bg-[#12182B]'}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
        <Image src="/images/melon-logo-white.png" alt="Melon" width={84} height={16} priority />
      </div>
    </div>
  );
}

function PoweredBy() {
  return (
    <p className="text-center text-xs text-gray-400 py-8">
      Powered by <span className="font-semibold text-gray-500">Melon</span> · Your answers are sent securely
    </p>
  );
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [respondentName, setRespondentName] = useState('');
  const [respondentEmail, setRespondentEmail] = useState('');
  const [draftRestored, setDraftRestored] = useState(false);
  // This device already sent a response (remembered locally, or refused by the API)
  const [respondedHere, setRespondedHere] = useState(false);
  const [alreadyResponded, setAlreadyResponded] = useState(false);

  const storageKey = `melon_draft_${shareToken}`;
  const respondedKey = `melon_responded_${shareToken}`;

  // Restore an unfinished draft saved on this device
  useEffect(() => {
    if (!shareToken) return;
    try {
      if (localStorage.getItem(respondedKey)) setRespondedHere(true);
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (parsed.responses && Object.keys(parsed.responses).length) {
        setResponses(parsed.responses);
        setDraftRestored(true);
      }
      if (parsed.respondentName) setRespondentName(parsed.respondentName);
      if (parsed.respondentEmail) setRespondentEmail(parsed.respondentEmail);
    } catch {
      // Storage blocked or draft unreadable: start fresh
    }
  }, [shareToken, storageKey, respondedKey]);

  // Keep the draft on this device until it is submitted
  useEffect(() => {
    if (!shareToken) return;
    if (!Object.keys(responses).length && !respondentName && !respondentEmail) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ responses, respondentName, respondentEmail }));
    } catch {
      // Storage full or blocked: the form still works, the draft just isn't kept
    }
  }, [responses, respondentName, respondentEmail, shareToken, storageKey]);

  useEffect(() => {
    if (!shareToken) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/reports/public/${shareToken}`);
        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? 'We couldn’t find this form. Check the link you were sent.'
              : response.status === 403
                ? 'This form isn’t open to the public.'
                : 'The form didn’t load. Check your connection and refresh the page.',
          );
        }
        setReport(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'The form didn’t load.');
      } finally {
        setLoading(false);
      }
    })();
  }, [shareToken]);

  const setAnswer = useCallback((questionId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => {
      if (!prev[questionId]) return prev;
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }, []);

  const answeredCount = useMemo(
    () => (report ? report.questions.filter((q) => isAnswered(q, responses[q.id])).length : 0),
    [report, responses],
  );
  const progress = report?.questions.length ? (answeredCount / report.questions.length) * 100 : 0;

  const validate = (): Record<string, string> => {
    const found: Record<string, string> = {};
    if (report?.collectEmail && !respondentEmail.trim()) {
      found[RESPONDENT_EMAIL] = 'Enter your email address.';
    } else if (respondentEmail.trim() && !EMAIL.test(respondentEmail.trim())) {
      found[RESPONDENT_EMAIL] = 'Enter a valid email address.';
    }
    report?.questions.forEach((q) => {
      const message = validateAnswer(q, responses[q.id]);
      if (message) found[q.id] = message;
    });
    return found;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!report) return;

    const found = validate();
    setErrors(found);
    const keys = Object.keys(found);
    if (keys.length) {
      document.getElementById(`question-${keys[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      addToast({
        type: 'warning',
        title: keys.length === 1 ? '1 question needs attention' : `${keys.length} questions need attention`,
        message: 'They are marked in red.',
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/responses/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: report._id,
          responses: report.questions.map((q) => formatAnswer(q, responses[q.id])).filter(Boolean),
          respondentName: respondentName.trim() || undefined,
          respondentEmail: respondentEmail.trim() || undefined,
          respondentKey: respondentKey(shareToken),
        }),
      });

      if (response.status === 409) {
        // One response per person, and this device or email already answered
        setAlreadyResponded(true);
        markResponded();
        window.scrollTo({ top: 0 });
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const raw: string = data.message || '';
        const unavailable = response.status === 402 || raw.toLowerCase().includes('payment method');
        throw new Error(
          unavailable
            ? 'This survey is temporarily unavailable. Please contact the survey owner.'
            : raw || 'Your response wasn’t sent. Check your connection and try again; your answers are still here.',
        );
      }

      setSubmitted(true);
      window.scrollTo({ top: 0 });
      markResponded();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Your response wasn’t sent.';
      setSubmitError(message);
      addToast({ type: 'error', title: 'Not sent', message });
    } finally {
      setSubmitting(false);
    }
  };

  const markResponded = () => {
    try {
      localStorage.removeItem(storageKey);
      if (!report?.allowMultipleResponses) localStorage.setItem(respondedKey, new Date().toISOString());
    } catch {
      // Storage blocked: the API still refuses a second response by email
    }
  };

  const startAnother = () => {
    setResponses({});
    setErrors({});
    setRespondentName('');
    setRespondentEmail('');
    setDraftRestored(false);
    setSubmitted(false);
  };

  // ─── States ───────────────────────────────────────────────
  if (loading) {
    return (
      <StateCard>
        <div className="mx-auto mb-5 h-10 w-10 rounded-full border-4 border-gray-100 border-t-primary animate-spin" />
        <p className="text-gray-500 font-medium">Loading the form…</p>
      </StateCard>
    );
  }

  if (error || !report || report.status !== 'PUBLISHED' || !report.isPublic) {
    return (
      <StateCard>
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">This form isn’t available</h1>
        <p className="text-gray-600 leading-relaxed">
          {error || 'It may have been closed by its owner, or the link may be incomplete.'}
        </p>
      </StateCard>
    );
  }

  if (alreadyResponded || (respondedHere && !submitted && !report.allowMultipleResponses)) {
    return (
      <StateCard>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
          <CheckCircle2 className="h-9 w-9 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You’ve already responded</h1>
        <p className="text-gray-600 leading-relaxed">
          <span className="font-medium text-gray-800">{report.title}</span> accepts one response per person, and we
          already have yours. Thank you for taking part.
        </p>
      </StateCard>
    );
  }

  if (submitted) {
    return (
      <StateCard>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-9 w-9 text-green-500" />
          </div>
        </motion.div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Response received</h1>
        <p className="text-gray-600 leading-relaxed">
          Thank you for taking part in <span className="font-medium text-gray-800">{report.title}</span>.
          {report.allowMultipleResponses ? '' : ' You can close this page.'}
        </p>
        {report.allowMultipleResponses && (
          <button
            onClick={startAnother}
            className="mt-7 w-full rounded-xl bg-primary py-3.5 font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Submit another response
          </button>
        )}
      </StateCard>
    );
  }

  // ─── Form ─────────────────────────────────────────────────
  const minutes = estimateMinutes(report.questions);
  const errorCount = Object.keys(errors).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-[#12182B] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#5B94E5]/25 via-transparent to-transparent" />
        <div className="relative">
          <BrandBar dark />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-20">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight text-balance">{report.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-4 text-sm text-blue-100/90">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                  <Clock className="h-3.5 w-3.5" />
                  About {minutes} min
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                  <ListChecks className="h-3.5 w-3.5" />
                  {report.questions.length} questions
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 -mt-12 pb-28 md:pb-16 relative">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* About + progress */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            {report.description && (
              <p className="text-gray-700 text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap mb-6">
                {report.description}
              </p>
            )}
            {draftRestored && (
              <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-primary-light px-4 py-3 text-sm text-gray-700">
                <Save className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  We restored the answers you started on this device.{' '}
                  <button type="button" onClick={startAnother} className="font-semibold text-primary hover:underline">
                    Start over
                  </button>
                </span>
              </div>
            )}
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="font-medium text-gray-700">
                {answeredCount} of {report.questions.length} answered
              </span>
              <span className="font-semibold text-primary tabular-nums">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-4 text-xs text-gray-400">
              Questions marked <span className="text-red-500">*</span> are required. Your answers are saved on this device until you submit.
            </p>
          </section>

          {/* Respondent */}
          <section
            id={`question-${RESPONDENT_EMAIL}`}
            className={`bg-white rounded-2xl border shadow-sm p-6 sm:p-8 ${errors[RESPONDENT_EMAIL] ? 'border-red-300' : 'border-gray-200'}`}
          >
            <h2 className="text-base font-semibold text-gray-900 mb-4">About you</h2>
            <div className={`grid grid-cols-1 gap-4 ${report.collectEmail ? 'sm:grid-cols-2' : ''}`}>
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full name <span className="font-normal text-gray-400">(optional)</span>
                </span>
                <input
                  type="text"
                  autoComplete="name"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base sm:text-[15px] text-gray-900 placeholder-gray-400 outline-none transition hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. Amaka Okafor"
                />
              </label>
              {report.collectEmail && (
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email address <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={respondentEmail}
                    onChange={(e) => {
                      setRespondentEmail(e.target.value);
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next[RESPONDENT_EMAIL];
                        return next;
                      });
                    }}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-base sm:text-[15px] text-gray-900 placeholder-gray-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors[RESPONDENT_EMAIL] ? 'border-red-300' : 'border-gray-200 hover:border-gray-300'}`}
                    placeholder="name@example.com"
                  />
                </label>
              )}
            </div>
            {errors[RESPONDENT_EMAIL] && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors[RESPONDENT_EMAIL]}
              </p>
            )}
          </section>

          {/* Questions */}
          {report.questions.map((question, index) => {
            const message = errors[question.id];
            return (
              <section
                key={question.id}
                id={`question-${question.id}`}
                className={`bg-white rounded-2xl border shadow-sm p-6 sm:p-8 scroll-mt-6 transition-colors ${message ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200'}`}
              >
                <div className="flex items-start gap-3 sm:gap-4 mb-5">
                  <span className="mt-0.5 flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg bg-primary-light px-1.5 text-xs font-bold text-primary tabular-nums">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-snug">
                      {question.title}
                      {question.required && (
                        <span className="text-red-500 ml-1" aria-label="required">
                          *
                        </span>
                      )}
                    </h3>
                    {question.description && (
                      <p className="text-sm text-gray-500 mt-1.5 leading-relaxed whitespace-pre-wrap">{question.description}</p>
                    )}
                  </div>
                </div>
                <div className="sm:pl-11">
                  <QuestionInput
                    question={question}
                    value={responses[question.id]}
                    onChange={(value) => setAnswer(question.id, value)}
                    invalid={!!message}
                  />
                  {message && (
                    <p className="mt-2.5 flex items-center gap-1.5 text-sm text-red-600" role="alert">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {message}
                    </p>
                  )}
                </div>
              </section>
            );
          })}

          {/* Submit */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            {submitError && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            )}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm text-gray-500 text-center sm:text-left">
                {errorCount > 0
                  ? `${errorCount} ${errorCount === 1 ? 'question needs' : 'questions need'} attention.`
                  : `${answeredCount} of ${report.questions.length} answered.`}
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-8 py-3.5 font-semibold text-white transition-colors hover:bg-primary-hover active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit response
                  </>
                )}
              </button>
            </div>
          </section>
        </form>
        <PoweredBy />
      </main>

      {/* Phones: progress stays visible while scrolling */}
      <div className="fixed bottom-0 inset-x-0 md:hidden bg-white/90 backdrop-blur border-t border-gray-200 px-4 py-3 z-40">
        <div className="flex items-center justify-between mb-1.5 text-xs">
          <span className="font-medium text-gray-500">
            {answeredCount} of {report.questions.length} answered
          </span>
          <span className="font-semibold text-primary tabular-nums">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
