'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { EyeOff, Save, Send } from 'lucide-react';
import { ReportNavigation } from '@/components/reports/navigation/ReportNavigation';
import { useReport } from '@/hooks/useReports';
import { publishReport, unpublishReport, updateReport } from '@/lib/api/reports';
import { Question } from '@/types/reports';
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

export default function ReportDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { openModal, closeModal } = useModal();

  const rawId = params.id as string;
  const reportId = rawId && rawId !== 'undefined' && rawId !== 'null' ? rawId : '';
  const justPublished = searchParams.get('PUBLISHED') === 'true';

  const { report, loading: reportLoading, refetch } = useReport(reportId);
  const [saving, setSaving] = useState<'save' | 'publish' | 'unpublish' | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [titleError, setTitleError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', questions: [] as Question[] });

  useEffect(() => {
    if (report) {
      setFormData({
        title: report.title,
        description: report.description || '',
        questions: (report.questions as Question[]) || [],
      });
    }
  }, [report]);

  useEffect(() => {
    if (justPublished && reportId) {
      const t = setTimeout(() => router.replace(`/reports/${reportId}`), 100);
      return () => clearTimeout(t);
    }
  }, [justPublished, reportId, router]);

  const dirty = useMemo(() => {
    if (!report) return false;
    return (
      formData.title !== report.title ||
      formData.description !== (report.description || '') ||
      JSON.stringify(formData.questions) !== JSON.stringify(report.questions || [])
    );
  }, [formData, report]);

  // Warn before leaving with unsaved edits
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const setQuestions = (questions: Question[]) => {
    setFormData((prev) => ({ ...prev, questions }));
    if (Object.keys(errors).length) setErrors(questionErrors(questions));
  };

  const handleSave = async (publish: boolean) => {
    if (!report) return;
    const title = formData.title.trim();
    const tError = title.length < 3 ? 'Give the report a title of at least 3 characters.' : null;
    const qErrors = questionErrors(formData.questions);
    setTitleError(tError);
    setErrors(qErrors);
    if (tError || Object.keys(qErrors).length) {
      const first = tError ? 'report-title' : `builder-${Object.keys(qErrors)[0]}`;
      document.getElementById(first)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      addToast({ type: 'warning', title: 'Not saved yet', message: 'Fix the items marked in red.' });
      return;
    }

    try {
      setSaving(publish ? 'publish' : 'save');
      await updateReport(reportId, {
        title,
        description: formData.description.trim(),
        questions: cleanQuestions(formData.questions),
        // Saving never takes a live report offline; Publish uses the publish endpoint so isPublic + shareToken are restored
        status: report.status,
      });
      if (publish) {
        await publishReport(reportId);
      }
      await refetch();
      addToast({
        type: 'success',
        title: publish ? 'Report published' : 'Changes saved',
        message: publish
          ? 'It is live and ready to collect responses.'
          : report.status === 'PUBLISHED'
            ? 'The live form now shows these changes.'
            : 'Your draft is up to date.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Not saved',
        message: error instanceof Error ? error.message : 'Try again in a moment.',
      });
    } finally {
      setSaving(null);
    }
  };

  const handleUnpublish = async () => {
    if (!report) return;
    try {
      setSaving('unpublish');
      await unpublishReport(reportId);
      await refetch();
      addToast({
        type: 'success',
        title: 'Report unpublished',
        message: 'Moved back to draft. The public form link is now offline.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Could not unpublish',
        message: error instanceof Error ? error.message : 'Try again in a moment.',
      });
    } finally {
      setSaving(null);
    }
  };

  const confirmUnpublish = () => {
    if (!report) return;
    openModal(
      <ConfirmDialog
        title="Unpublish report"
        message={
          report.responseCount > 0
            ? `This takes the form offline and moves it back to Draft. Your ${report.responseCount} existing ${report.responseCount === 1 ? 'response stays' : 'responses stay'} safe, and you can publish it again whenever you’re ready.`
            : 'This takes the form offline and moves it back to Draft. Anyone opening the share link won’t be able to respond until you publish it again.'
        }
        confirmText="Unpublish"
        cancelText="Cancel"
        type="warning"
        onConfirm={() => {
          closeModal();
          void handleUnpublish();
        }}
        onCancel={closeModal}
      />,
      { size: 'sm' },
    );
  };

  const confirmDelete = (_: unknown, proceed: () => void) =>
    openModal(
      <ConfirmDialog
        title="Delete question"
        message={
          report?.status === 'PUBLISHED'
            ? 'This report is live. Answers already collected for this question stay in your responses, but new respondents won’t see it.'
            : 'This removes the question from the report.'
        }
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

  if (!reportId || (!reportLoading && !report)) {
    return (
      <div>
        <ReportNavigation currentPage="edit" />
        <div className="p-6 py-16 text-center">
          <p className="mb-2 text-sm text-gray-500">{reportId ? 'Report not found' : 'Invalid report link'}</p>
          <button onClick={() => router.push('/reports')} className="text-sm font-medium text-primary hover:underline">
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  if (reportLoading || !report) {
    return (
      <div>
        <ReportNavigation currentPage="edit" />
        <div className="mx-auto max-w-3xl space-y-4 p-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200" />
              <div className="h-16 w-full animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isLive = report.status === 'PUBLISHED';

  return (
    <div>
      <ReportNavigation currentPage="edit" report={report} />

      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-6 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <p className="truncate text-sm text-gray-500">
              {formData.questions.length} {formData.questions.length === 1 ? 'question' : 'questions'}
              {dirty ? ' · Unsaved changes' : ' · All changes saved'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isLive && (
              <button
                onClick={confirmUnpublish}
                disabled={!!saving}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <EyeOff className="h-4 w-4" />
                {saving === 'unpublish' ? 'Unpublishing…' : 'Unpublish'}
              </button>
            )}
            <button
              onClick={() => handleSave(false)}
              disabled={!!saving || !dirty}
              className={
                isLive
                  ? 'inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50'
                  : 'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary-light disabled:opacity-50'
              }
            >
              <Save className="h-4 w-4" />
              {saving === 'save' ? 'Saving…' : isLive ? 'Save changes' : 'Save draft'}
            </button>
            {!isLive && (
              <button
                onClick={() => handleSave(true)}
                disabled={!!saving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {saving === 'publish' ? 'Publishing…' : 'Publish'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-6 p-6">
        <main className="mx-auto min-w-0 max-w-3xl flex-1 space-y-4">
          {isLive && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {report.isPublic === false
                ? 'This report is published, but public access is turned off in Settings. Use Unpublish to move it back to Draft.'
                : 'This report is live. Saved changes appear on the form straight away; changing a question’s type or options can make earlier answers harder to compare.'}
            </p>
          )}

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
              placeholder="Report title"
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

          <QuestionBuilder
            questions={formData.questions}
            onChange={setQuestions}
            confirmDelete={confirmDelete}
            errors={errors}
          />
        </main>

        <aside className="hidden w-60 shrink-0 xl:block">
          <div className="sticky top-20 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 px-2 text-sm font-semibold text-gray-900">Add a question</h2>
            <QuestionTypePalette
              onPick={(type) => {
                const q = newQuestion(type);
                setQuestions([...formData.questions, q]);
                focusQuestion(q.id);
              }}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
