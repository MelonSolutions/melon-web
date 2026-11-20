'use client';

import React, { useRef } from 'react';
import { ChevronDown, ChevronUp, Copy, GripVertical, Plus, Trash2, X } from 'lucide-react';
import type { Question, QuestionType } from '@/types/reports';
import { QuestionInput } from './QuestionRenderer';
import { IMPACT_METRIC_TYPE, QUESTION_TYPES, isChoiceType, typeInfo, withTypeDefaults } from './question-types';

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20';

/** Grows a textarea with its content. */
const autosize = (el: HTMLTextAreaElement | null) => {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
};

/**
 * Edits a list of labels (options, matrix rows or columns). Pasting several
 * lines into any field adds one item per line, so a questionnaire's option
 * list can be pasted in one go.
 */
function ListEditor({
  items,
  onChange,
  marker,
  placeholder,
  addLabel,
  min = 1,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  marker?: 'radio' | 'checkbox' | 'number';
  placeholder: (i: number) => string;
  addLabel: string;
  min?: number;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const focus = (i: number) => requestAnimationFrame(() => refs.current[i]?.focus());

  const handlePaste = (i: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const lines = e.clipboardData
      .getData('text')
      .split(/\r?\n/)
      .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)]|[a-zA-Z][.)])\s+/, '').trim())
      .filter(Boolean);
    if (lines.length < 2) return;
    e.preventDefault();
    // Pasted lines replace this field if it is empty; leftover empty fields go
    const keep = (list: string[]) => list.filter((v) => v.trim());
    const head = [...keep(items.slice(0, i)), ...(items[i]?.trim() ? [items[i]] : [])];
    onChange([...head, ...lines, ...keep(items.slice(i + 1))]);
    focus(head.length + lines.length - 1);
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="group/item flex items-center gap-2.5">
          {marker === 'number' ? (
            <span className="w-5 shrink-0 text-right text-xs font-medium tabular-nums text-gray-400">{i + 1}</span>
          ) : marker ? (
            <span
              aria-hidden
              className={cx('h-4 w-4 shrink-0 border-2 border-gray-300', marker === 'radio' ? 'rounded-full' : 'rounded')}
            />
          ) : null}
          <input
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="text"
            value={item}
            onChange={(e) => onChange(items.map((v, j) => (j === i ? e.target.value : v)))}
            onPaste={(e) => handlePaste(i, e)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const next = [...items];
                next.splice(i + 1, 0, '');
                onChange(next);
                focus(i + 1);
              } else if (e.key === 'Backspace' && !item && items.length > min) {
                e.preventDefault();
                onChange(items.filter((_, j) => j !== i));
                focus(Math.max(0, i - 1));
              }
            }}
            className={inputClass}
            placeholder={placeholder(i)}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            disabled={items.length <= min}
            title="Remove"
            aria-label={`Remove ${item || placeholder(i)}`}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:invisible"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          onChange([...items, '']);
          focus(items.length);
        }}
        className="inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-sm font-medium text-primary hover:text-primary-hover"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700 select-none">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="relative h-5 w-9 rounded-full bg-gray-200 transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4"
      />
      {label}
    </label>
  );
}

function NumberSetting({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  options?: number[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500">{label}</span>
      {options ? (
        <select value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))} className={cx(inputClass, 'w-24')}>
          {options.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
          placeholder="None"
          className={cx(inputClass, 'w-28')}
        />
      )}
    </label>
  );
}

interface QuestionEditorProps {
  question: Question;
  index: number;
  total: number;
  onChange: (next: Question) => void;
  onMove: (direction: 'up' | 'down') => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canDelete?: boolean;
  error?: string;
}

/** One question in the builder: wording, type, type-specific settings, preview. */
export function QuestionEditor({
  question,
  index,
  total,
  onChange,
  onMove,
  onDuplicate,
  onDelete,
  canDelete = true,
  error,
}: QuestionEditorProps) {
  const type = question.type.toUpperCase() as QuestionType;
  const info = typeInfo(type);
  const settings = question.settings ?? {};
  const set = (updates: Partial<Question>) => onChange({ ...question, ...updates });
  const setSettings = (updates: Record<string, unknown>) => set({ settings: { ...settings, ...updates } });

  const typeOptions = type === 'IMPACT_METRIC' ? [...QUESTION_TYPES, IMPACT_METRIC_TYPE] : QUESTION_TYPES;
  const groups = Array.from(new Set(typeOptions.map((t) => t.group)));

  const scaleMin = Number(settings.min ?? 1);
  const scaleMax = Number(settings.max ?? 5);

  return (
    <section
      className={cx(
        'group relative rounded-xl border bg-white shadow-sm transition-shadow focus-within:shadow-md',
        error ? 'border-red-300' : 'border-gray-200 focus-within:border-primary/60',
      )}
    >
      {/* Wording + type */}
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:gap-4">
        <div className="flex min-w-0 flex-1 gap-3">
          <span className="mt-1 flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg bg-primary-light px-1.5 text-xs font-bold tabular-nums text-primary">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <textarea
              ref={autosize}
              value={question.title}
              onChange={(e) => {
                autosize(e.target);
                set({ title: e.target.value });
              }}
              rows={1}
              aria-label={`Question ${index + 1}`}
              placeholder="Type the question"
              className="w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-base font-semibold leading-snug text-gray-900 placeholder-gray-400 outline-none focus:ring-0"
            />
            <textarea
              ref={autosize}
              value={question.description || ''}
              onChange={(e) => {
                autosize(e.target);
                set({ description: e.target.value });
              }}
              rows={1}
              aria-label={`Question ${index + 1} help text`}
              placeholder="Help text for the respondent (optional)"
              className="mt-1.5 w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-sm leading-relaxed text-gray-600 placeholder-gray-400 outline-none focus:ring-0"
            />
          </div>
        </div>
        <label className="relative shrink-0 sm:w-52">
          <span className="sr-only">Question type</span>
          <info.icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <select
            value={type}
            onChange={(e) => onChange(withTypeDefaults(question, e.target.value as QuestionType))}
            className={cx(inputClass, 'pl-9')}
          >
            {groups.map((group) => (
              <optgroup key={group} label={group}>
                {typeOptions
                  .filter((t) => t.group === group)
                  .map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
      </div>

      {/* Type-specific settings */}
      <div className="border-t border-gray-100 px-5 py-5 sm:pl-[3.75rem]">
        {isChoiceType(type) && (
          <div className="space-y-4">
            <ListEditor
              items={question.options?.length ? question.options : ['']}
              onChange={(options) => set({ options })}
              marker={type === 'MULTIPLE_CHOICE' ? 'radio' : type === 'CHECKBOXES' ? 'checkbox' : 'number'}
              placeholder={(i) => `Option ${i + 1}`}
              addLabel="Add option"
            />
            <p className="text-xs text-gray-400">Tip: paste a list to add one option per line. Enter adds the next option.</p>
          </div>
        )}

        {type === 'LINEAR_SCALE' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <NumberSetting label="From" value={scaleMin} onChange={(v) => setSettings({ min: v })} options={[0, 1]} />
              <NumberSetting
                label="To"
                value={scaleMax}
                onChange={(v) => setSettings({ max: v })}
                options={[2, 3, 4, 5, 6, 7, 8, 9, 10]}
              />
            </div>
            <Preview question={question} />
          </div>
        )}

        {type === 'NUMBER' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <NumberSetting label="Lowest allowed" value={settings.min} onChange={(v) => setSettings({ min: v })} />
              <NumberSetting label="Highest allowed" value={settings.max} onChange={(v) => setSettings({ max: v })} />
            </div>
            <Preview question={question} />
          </div>
        )}

        {type === 'MATRIX' && (
          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Rows (what is rated)</p>
                <ListEditor
                  items={settings.rows?.length ? settings.rows : ['']}
                  onChange={(rows) => setSettings({ rows })}
                  marker="number"
                  placeholder={(i) => `Row ${i + 1}`}
                  addLabel="Add row"
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Columns (the scale)</p>
                <ListEditor
                  items={settings.columns?.length ? settings.columns : ['']}
                  onChange={(columns) => setSettings({ columns })}
                  marker="radio"
                  placeholder={(i) => `Column ${i + 1}`}
                  addLabel="Add column"
                />
              </div>
            </div>
            <Preview question={question} />
          </div>
        )}

        {!isChoiceType(type) && !['LINEAR_SCALE', 'NUMBER', 'MATRIX'].includes(type) && <Preview question={question} />}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3">
        <div className="flex items-center gap-1">
          <IconButton label="Move up" onClick={() => onMove('up')} disabled={index === 0}>
            <ChevronUp className="h-4 w-4" />
          </IconButton>
          <IconButton label="Move down" onClick={() => onMove('down')} disabled={index === total - 1}>
            <ChevronDown className="h-4 w-4" />
          </IconButton>
          <span className="mx-1 h-5 w-px bg-gray-200" />
          <IconButton label="Duplicate" onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
          </IconButton>
          <IconButton label="Delete" onClick={onDelete} disabled={!canDelete} danger>
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          {isChoiceType(type) && (
            <Toggle checked={!!settings.allowOther} onChange={(v) => setSettings({ allowOther: v })} label="Add “Other”" />
          )}
          <Toggle checked={question.required} onChange={(v) => set({ required: v })} label="Required" />
        </div>
      </div>

      {error && <p className="px-5 pb-4 text-sm text-red-600">{error}</p>}

      <GripVertical aria-hidden className="absolute left-1 top-6 h-4 w-4 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100" />
    </section>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cx(
        'rounded-lg p-2 text-gray-400 transition-colors disabled:opacity-30 disabled:hover:bg-transparent',
        danger ? 'hover:bg-red-50 hover:text-red-500' : 'hover:bg-gray-100 hover:text-gray-700',
      )}
    >
      {children}
    </button>
  );
}

/** What the respondent will see, not interactive. */
function Preview({ question }: { question: Question }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Respondent sees</p>
      <div className="pointer-events-none select-none opacity-70" aria-hidden inert>
        <QuestionInput question={question} value={undefined} onChange={() => undefined} />
      </div>
    </div>
  );
}
