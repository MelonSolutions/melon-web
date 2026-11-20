'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import type { Question, QuestionType } from '@/types/reports';
import { QuestionEditor } from './QuestionEditor';
import { QUESTION_TYPES, duplicateOf, newQuestion } from './question-types';

/** After a render, scroll a question into view and put the cursor in its title. */
export function focusQuestion(id: string) {
  requestAnimationFrame(() => {
    const el = document.getElementById(`builder-${id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el?.querySelector('textarea')?.focus({ preventScroll: true });
  });
}

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

/** Type buttons; used in the builder sidebar and the add-question menu. */
export function QuestionTypePalette({
  onPick,
  compact = false,
}: {
  onPick: (type: QuestionType) => void;
  compact?: boolean;
}) {
  const groups = Array.from(new Set(QUESTION_TYPES.map((t) => t.group)));
  return (
    <div className={compact ? 'grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2' : 'space-y-4'}>
      {groups.map((group) => (
        <div key={group}>
          <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{group}</p>
          <div className="space-y-0.5">
            {QUESTION_TYPES.filter((t) => t.group === group).map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => onPick(t.value)}
                title={t.hint}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm text-gray-700 transition-colors hover:bg-primary-light hover:text-primary"
              >
                <t.icon className="h-4 w-4 shrink-0 text-gray-400" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface QuestionBuilderProps {
  questions: Question[];
  onChange: (questions: Question[]) => void;
  /** Ask before deleting; call proceed() to delete. Defaults to window.confirm. */
  confirmDelete?: (question: Question, proceed: () => void) => void;
  /** Per-question errors keyed by question id. */
  errors?: Record<string, string>;
  minQuestions?: number;
}

/**
 * The question list of a survey: edit, reorder, duplicate, delete, add.
 * Every survey editor (create, edit, shared edit link) uses this one.
 */
export function QuestionBuilder({ questions, onChange, confirmDelete, errors, minQuestions = 1 }: QuestionBuilderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [menuOpen]);

  const add = (type: QuestionType) => {
    const q = newQuestion(type);
    onChange([...questions, q]);
    setMenuOpen(false);
    focusQuestion(q.id);
  };

  const replace = (index: number, next: Question) => onChange(questions.map((q, i) => (i === index ? next : q)));

  const move = (index: number, direction: 'up' | 'down') => {
    const to = direction === 'up' ? index - 1 : index + 1;
    if (to < 0 || to >= questions.length) return;
    const next = [...questions];
    [next[index], next[to]] = [next[to], next[index]];
    onChange(next);
  };

  const duplicate = (index: number) => {
    const copy = duplicateOf(questions[index]);
    const next = [...questions];
    next.splice(index + 1, 0, copy);
    onChange(next);
    focusQuestion(copy.id);
  };

  const remove = (index: number) => {
    const target = questions[index];
    const proceed = () => onChange(questions.filter((q) => q.id !== target.id));
    if (confirmDelete) confirmDelete(target, proceed);
    else if (window.confirm('Delete this question?')) proceed();
  };

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <div key={question.id} id={`builder-${question.id}`} className="scroll-mt-24">
          <QuestionEditor
            question={question}
            index={index}
            total={questions.length}
            onChange={(next) => replace(index, next)}
            onMove={(d) => move(index, d)}
            onDuplicate={() => duplicate(index)}
            onDelete={() => remove(index)}
            canDelete={questions.length > minQuestions}
            error={errors?.[question.id]}
          />
        </div>
      ))}

      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          className={cx(
            'flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-5 font-medium transition-colors',
            menuOpen
              ? 'border-primary bg-primary-light/50 text-primary'
              : 'border-gray-300 text-gray-500 hover:border-primary hover:text-primary',
          )}
        >
          <Plus className="h-5 w-5" />
          Add question
        </button>
        {menuOpen && (
          <div className="absolute inset-x-0 bottom-full z-20 mb-2 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
            <QuestionTypePalette onPick={add} compact />
          </div>
        )}
      </div>
    </div>
  );
}

/** Problems that would stop a survey being saved, keyed by question id. */
export function questionErrors(questions: Question[]): Record<string, string> {
  const errors: Record<string, string> = {};
  questions.forEach((q) => {
    const type = q.type.toUpperCase();
    if (!q.title?.trim()) errors[q.id] = 'Type the question.';
    else if (['MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN'].includes(type) && !q.options?.some((o) => o.trim()))
      errors[q.id] = 'Add at least one option.';
    else if (type === 'MATRIX' && (!q.settings?.rows?.some((r) => r.trim()) || !q.settings?.columns?.some((c) => c.trim())))
      errors[q.id] = 'Add at least one row and one column.';
  });
  return errors;
}

/** Drop blank options, rows and columns before saving. */
export function cleanQuestions(questions: Question[]): Question[] {
  const tidy = (list?: string[]) => list?.map((s) => s.trim()).filter(Boolean);
  return questions.map((q) => ({
    ...q,
    title: q.title.trim(),
    ...(q.options ? { options: tidy(q.options) } : {}),
    ...(q.settings?.rows || q.settings?.columns
      ? { settings: { ...q.settings, rows: tidy(q.settings.rows), columns: tidy(q.settings.columns) } }
      : {}),
  }));
}
