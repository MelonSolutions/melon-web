'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { createReport, ApiError } from '@/lib/api/reports';
import { CreateReportRequest, ReportCategory, getCategoryDisplayName } from '@/types/reports';
import { useToast } from '@/components/ui/Toast';
import { useModal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  QuestionBuilder,
  QuestionTypePalette,
  cleanQuestions,
  focusQuestion,
  questionErrors,
} from '@/components/forms/QuestionBuilder';
import { newQuestion } from '@/components/forms/question-types';
import { ReportSettingsCard } from '@/components/forms/ReportSettingsCard';

const CATEGORIES: ReportCategory[] = [
  'IMPACT_ASSESSMENT',
  'FEEDBACK',
  'HEALTH',
  'EDUCATION',
  'AGRICULTURE',
  'COMMUNITY',
  'ENVIRONMENT',
  'ECONOMIC',
];

type Draft = CreateReportRequest & { projectId?: string };

function CreateReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { openModal, closeModal } = useModal();

  const [saving, setSaving] = useState<'draft' | 'publish' | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Draft>(() => ({
    title: '',
    description: '',
    category: 'IMPACT_ASSESSMENT',
    status: 'DRAFT',
    allowMultipleResponses: false,
    collectEmail: false,
    // Surveys are shared by link; a published survey that isn't public can't be opened
    isPublic: true,
    // Fixed id: a random one differs between the server and browser render
    questions: [{ ...newQuestion('MULTIPLE_CHOICE'), id: 'q-1' }],
  }));

  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId) setFormData((prev) => ({ ...prev, projectId }));
  }, [searchParams]);

  const questions = formData.questions ?? [];
  const setQuestions = (next: typeof questions) => {
    setFormData((prev) => ({ ...prev, questions: next }));
    if (Object.keys(errors).length) setErrors(questionErrors(next));
  };

  const handleSave = async (publish: boolean) => {
    const title = formData.title.trim();
    const tError = !title ? 'Give the report a title.' : title.length < 3 ? 'Use at least 3 characters.' : null;
    const qErrors = questionErrors(questions);
    setTitleError(tError);
    setErrors(qErrors);
    if (tError || Object.keys(qErrors).length) {
      const first = tError ? 'report-title' : `builder-${Object.keys(qErrors)[0]}`;
      document.getElementById(first)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const count = Object.keys(qErrors).length + (tError ? 1 : 0);
      addToast({
        type: 'warning',
        title: count === 1 ? '1 thing to fix' : `${count} things to fix`,
        message: 'They are marked in red.',
      });
      return;
    }

    try {
      setSaving(publish ? 'publish' : 'draft');
      const result = await createReport({
        ...formData,
        title,
        description: formData.description?.trim(),
        questions: cleanQuestions(questions),
        status: publish ? 'PUBLISHED' : 'DRAFT',
      } as CreateReportRequest);
      addToast({
        type: 'success',
        title: publish ? 'Report published' : 'Draft saved',
        message: publish ? 'It is live and ready to collect responses.' : 'You can keep editing it from Reports.',
      });
      router.push(publish ? `/reports/${result._id}?PUBLISHED=true` : `/reports/${result._id}`);
    } catch (error) {
      if (error instanceof ApiError && (error.code === 'DUPLICATE_TITLE' || error.message.includes('already exists'))) {
        setTitleError('A report with this title already exists.');
        document.getElementById('report-title')?.focus();
        return;
      }
      addToast({
        type: 'error',
        title: 'Not saved',
        message:
          error instanceof ApiError
            ? error.status === 403
              ? 'You don’t have permission to create reports.'
              : error.status >= 500
                ? 'Something went wrong on our side. Try again in a moment.'
                : error.message
            : 'Something went wrong. Try again.',
      });
    } finally {
      setSaving(null);
    }
  };

  const confirmDelete = (_: unknown, proceed: () => void) =>
    openModal(
      <ConfirmDialog
        title="Delete question"
        message="This removes the question from the report."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={() => {
          proceed();
          closeModal();
        }}
        onCancel={closeModal}
      />,
      { size: 'sm' },
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/reports" aria-label="Back to reports" className="rounded-lg p-2 text-gray-600 hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-gray-900">{formData.title.trim() || 'New report'}</h1>
              <p className="text-xs text-gray-500">
                Draft · {questions.length} {questions.length === 1 ? 'question' : 'questions'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave(false)}
              disabled={!!saving}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary-light disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">{saving === 'draft' ? 'Saving…' : 'Save draft'}</span>
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={!!saving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {saving === 'publish' ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6 sm:px-6">
        <main className="min-w-0 flex-1 space-y-4">
          {/* Title + description */}
          <section className="rounded-xl border border-gray-200 border-t-4 border-t-primary bg-white p-6 shadow-sm">
            <label htmlFor="report-title" className="sr-only">
              Report title
            </label>
            <input
              id="report-title"
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, title: e.target.value }));
                if (titleError) setTitleError(null);
              }}
              maxLength={100}
              placeholder="Report title, e.g. Household Access to Services Survey"
              className="w-full border-0 bg-transparent p-0 text-2xl font-bold text-gray-900 placeholder-gray-300 outline-none focus:ring-0"
            />
            {titleError && <p className="mt-1.5 text-sm text-red-600">{titleError}</p>}
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              maxLength={500}
              rows={3}
              placeholder="What is this report for? Respondents see this at the top of the form."
              className="mt-4 w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm leading-relaxed text-gray-700 placeholder-gray-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </section>

          <ReportSettingsCard
            value={formData}
            onChange={(updates) => setFormData((prev) => ({ ...prev, ...updates }) as Draft)}
            categories={CATEGORIES.map((c) => ({ value: c, label: getCategoryDisplayName(c) }))}
          />

          <QuestionBuilder questions={questions} onChange={setQuestions} confirmDelete={confirmDelete} errors={errors} />
        </main>

        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-20 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 px-2 text-sm font-semibold text-gray-900">Add a question</h2>
            <QuestionTypePalette
              onPick={(type) => {
                const q = newQuestion(type);
                setQuestions([...questions, q]);
                focusQuestion(q.id);
              }}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function CreateReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <CreateReportContent />
    </Suspense>
  );
}
