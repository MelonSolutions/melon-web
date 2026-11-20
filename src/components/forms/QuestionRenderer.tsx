/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { Check, MapPin } from 'lucide-react';
import FileUploadField from '@/components/reports/FileUploadField';
import { FormQuestion, OTHERS, matrixAxes } from './answers';

interface QuestionInputProps {
  question: FormQuestion;
  value: any;
  onChange: (value: any) => void;
  invalid?: boolean;
}

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

// 16px text on phones stops iOS zooming into the field
const fieldClass = (invalid?: boolean) =>
  cx(
    'w-full rounded-xl border bg-white px-4 py-3 text-base sm:text-[15px] text-gray-900 placeholder-gray-400 outline-none transition',
    'focus:border-primary focus:ring-2 focus:ring-primary/20',
    invalid ? 'border-red-300' : 'border-gray-200 hover:border-gray-300',
  );

/** A tappable option row: big enough for a thumb, clear when selected. */
const OptionTile: React.FC<{
  type: 'radio' | 'checkbox';
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}> = ({ type, name, label, checked, onChange }) => (
  <label
    className={cx(
      'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
      checked ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
    )}
  >
    <input type={type} name={name} checked={checked} onChange={onChange} className="sr-only peer" />
    <span
      aria-hidden
      className={cx(
        'flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-colors',
        'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-1',
        type === 'radio' ? 'rounded-full' : 'rounded-md',
        checked ? 'border-primary bg-primary' : 'border-gray-300 bg-white',
      )}
    >
      {checked &&
        (type === 'radio' ? (
          <span className="h-2 w-2 rounded-full bg-white" />
        ) : (
          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
        ))}
    </span>
    <span className="text-[15px] leading-snug text-gray-800">{label}</span>
  </label>
);

/**
 * The answer control for one survey question, without its card or title.
 * Accepts backend (UPPERCASE) and legacy lowercase type strings.
 */
export const QuestionInput: React.FC<QuestionInputProps> = ({ question, value, onChange, invalid }) => {
  const type = question.type.toUpperCase();
  const options = (question.options ?? []).filter((o: any) => typeof o === 'string') as string[];
  const allowOther = !!question.settings?.allowOther;

  switch (type) {
    case 'MULTIPLE_CHOICE': {
      const othersSelected = typeof value === 'object' && value?.option === OTHERS;
      return (
        <div className="space-y-2">
          {options.map((option) => (
            <OptionTile
              key={option}
              type="radio"
              name={`q-${question.id}`}
              label={option}
              checked={!othersSelected && value === option}
              onChange={() => onChange(option)}
            />
          ))}
          {allowOther && (
            <>
              <OptionTile
                type="radio"
                name={`q-${question.id}`}
                label="Other"
                checked={othersSelected}
                onChange={() => onChange({ option: OTHERS, customText: othersSelected ? value.customText : '' })}
              />
              {othersSelected && (
                <input
                  type="text"
                  value={value?.customText || ''}
                  onChange={(e) => onChange({ option: OTHERS, customText: e.target.value })}
                  placeholder="Type your answer"
                  aria-label="Other, please specify"
                  className={fieldClass(invalid)}
                  autoFocus
                />
              )}
            </>
          )}
        </div>
      );
    }

    case 'CHECKBOXES': {
      const current: any[] = Array.isArray(value) ? value : [];
      const chosen = current.filter((v) => typeof v === 'string') as string[];
      const others = current.find((v) => typeof v === 'object' && v?.option === OTHERS);
      const set = (nextChosen: string[], nextOthers = others) =>
        onChange(nextOthers ? [...nextChosen, nextOthers] : nextChosen);
      return (
        <div className="space-y-2">
          {options.map((option) => (
            <OptionTile
              key={option}
              type="checkbox"
              name={`q-${question.id}-${option}`}
              label={option}
              checked={chosen.includes(option)}
              onChange={() =>
                set(chosen.includes(option) ? chosen.filter((v) => v !== option) : [...chosen, option])
              }
            />
          ))}
          {allowOther && (
            <>
              <OptionTile
                type="checkbox"
                name={`q-${question.id}-others`}
                label="Other"
                checked={!!others}
                onChange={() => set(chosen, others ? undefined : { option: OTHERS, customText: '' })}
              />
              {others && (
                <input
                  type="text"
                  value={others.customText || ''}
                  onChange={(e) => set(chosen, { option: OTHERS, customText: e.target.value })}
                  placeholder="Type your answer"
                  aria-label="Other, please specify"
                  className={fieldClass(invalid)}
                  autoFocus
                />
              )}
            </>
          )}
        </div>
      );
    }

    case 'DROPDOWN': {
      const othersSelected = typeof value === 'object' && value?.option === OTHERS;
      return (
        <div className="space-y-2">
          <select
            value={othersSelected ? OTHERS : value || ''}
            onChange={(e) =>
              onChange(e.target.value === OTHERS ? { option: OTHERS, customText: '' } : e.target.value)
            }
            className={cx(fieldClass(invalid), !value && 'text-gray-400')}
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option} value={option} className="text-gray-900">
                {option}
              </option>
            ))}
            {allowOther && (
              <option value={OTHERS} className="text-gray-900">
                Other (please specify)
              </option>
            )}
          </select>
          {othersSelected && (
            <input
              type="text"
              value={value?.customText || ''}
              onChange={(e) => onChange({ option: OTHERS, customText: e.target.value })}
              placeholder="Type your answer"
              aria-label="Other, please specify"
              className={fieldClass(invalid)}
              autoFocus
            />
          )}
        </div>
      );
    }

    case 'PARAGRAPH':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.settings?.placeholder || 'Your answer'}
          rows={4}
          className={cx(fieldClass(invalid), 'resize-y min-h-[112px]')}
        />
      );

    case 'LINEAR_SCALE': {
      const min = Number(question.settings?.min ?? 1);
      const max = Number(question.settings?.max ?? 5);
      const step = Math.max(1, Number(question.settings?.step ?? 1));
      const points: number[] = [];
      for (let i = min; i <= max && points.length < 21; i += step) points.push(i);
      return (
        <div>
          <div
            role="radiogroup"
            className="grid gap-1.5 sm:gap-2"
            style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}
          >
            {points.map((num) => {
              const selected = String(value) === String(num);
              return (
                <label key={num} className="cursor-pointer">
                  <input
                    type="radio"
                    name={`q-${question.id}`}
                    checked={selected}
                    onChange={() => onChange(num)}
                    className="sr-only peer"
                  />
                  <span
                    className={cx(
                      'flex h-11 items-center justify-center rounded-lg border text-sm font-semibold tabular-nums transition-colors',
                      'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40',
                      selected
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary',
                    )}
                  >
                    {num}
                  </span>
                </label>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>Lowest</span>
            <span>Highest</span>
          </div>
        </div>
      );
    }

    case 'MATRIX': {
      const { rows, columns } = matrixAxes(question);
      const answer: Record<string, string> = (value && typeof value === 'object' ? value : {}) as any;
      const pick = (row: string, col: string) => onChange({ ...answer, [row]: col });
      return (
        <>
          {/* Phones: one block per row, options as tiles */}
          <div className="space-y-5 sm:hidden">
            {rows.map((row, r) => (
              <fieldset key={row}>
                <legend className="mb-2 text-sm font-semibold text-gray-800">{row}</legend>
                <div className="space-y-2">
                  {columns.map((col) => (
                    <OptionTile
                      key={col}
                      type="radio"
                      name={`m-${question.id}-${r}`}
                      label={col}
                      checked={answer[row] === col}
                      onChange={() => pick(row, col)}
                    />
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
          {/* Wider screens: a grid */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3" />
                  {columns.map((col) => (
                    <th key={col} className="p-3 text-center text-xs font-semibold text-gray-600 min-w-[72px]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, r) => (
                  <tr key={row} className="border-t border-gray-100 hover:bg-gray-50/60">
                    <td className="p-3 font-medium text-gray-800 min-w-[140px]">{row}</td>
                    {columns.map((col) => (
                      <td key={col} className="p-0 text-center">
                        <label className="flex h-12 cursor-pointer items-center justify-center">
                          <input
                            type="radio"
                            name={`t-${question.id}-${r}`}
                            checked={answer[row] === col}
                            onChange={() => pick(row, col)}
                            aria-label={`${row}: ${col}`}
                            className="h-[18px] w-[18px] cursor-pointer accent-[#5B94E5]"
                          />
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    }

    case 'DATE':
    case 'TIME':
      return (
        <input
          type={type === 'DATE' ? 'date' : 'time'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={cx(fieldClass(invalid), 'sm:max-w-xs')}
        />
      );

    case 'EMAIL':
      return (
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="name@example.com"
          className={fieldClass(invalid)}
        />
      );

    case 'PHONE':
      return (
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0803 000 0000"
          className={cx(fieldClass(invalid), 'sm:max-w-xs')}
        />
      );

    case 'NUMBER':
    case 'IMPACT_METRIC':
      return (
        <input
          type="number"
          inputMode="decimal"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : e.target.valueAsNumber)}
          min={type === 'IMPACT_METRIC' ? 0 : question.settings?.min}
          max={question.settings?.max}
          step={question.settings?.step || 'any'}
          placeholder={question.settings?.placeholder || 'Enter a number'}
          className={cx(fieldClass(invalid), 'sm:max-w-xs')}
        />
      );

    case 'GPS_LOCATION':
      return <GpsLocationInput value={value} onChange={onChange} />;

    case 'FILE_UPLOAD':
      return (
        <FileUploadField
          questionId={question.id}
          currentValue={typeof value === 'string' ? value : ''}
          onUpload={(_, url) => onChange(url)}
        />
      );

    case 'SHORT_ANSWER':
    default:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.settings?.placeholder || 'Your answer'}
          className={fieldClass(invalid)}
        />
      );
  }
};

interface GpsAnswer {
  lat: number;
  lng: number;
  accuracy?: number;
  capturedAt?: string;
}

const isGpsAnswer = (v: unknown): v is GpsAnswer =>
  !!v && typeof v === 'object' && typeof (v as GpsAnswer).lat === 'number' && typeof (v as GpsAnswer).lng === 'number';

/**
 * Captures the device's location. The answer is stored as
 * { lat, lng, accuracy, capturedAt }, the shape the export and
 * analytics already read ('lat' and 'lng').
 */
const GpsLocationInput: React.FC<{ value: unknown; onChange: (value: GpsAnswer | null) => void }> = ({
  value,
  onChange,
}) => {
  const [status, setStatus] = React.useState<'idle' | 'locating'>('idle');
  const [message, setMessage] = React.useState<string | null>(null);
  const captured = isGpsAnswer(value) ? value : null;

  const capture = () => {
    setMessage(null);
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setMessage('This device or browser cannot share its location.');
      return;
    }
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setMessage('Location only works when the survey is opened over https.');
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus('idle');
        onChange({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy),
          capturedAt: new Date(pos.timestamp).toISOString(),
        });
      },
      (err) => {
        setStatus('idle');
        if (err.code === err.PERMISSION_DENIED) {
          setMessage('Location permission was refused. Allow location for this site in the browser settings, then try again.');
        } else if (err.code === err.TIMEOUT) {
          setMessage('Finding the location took too long. Move to an open spot and try again.');
        } else {
          setMessage('The location could not be found. Check that location is turned on, then try again.');
        }
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 },
    );
  };

  return (
    <div className="space-y-3">
      {captured ? (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-green-800">Location captured</p>
            <p className="mt-0.5 tabular-nums text-green-700">
              {captured.lat}, {captured.lng}
              {captured.accuracy !== undefined && <span className="text-green-600"> · within about {captured.accuracy} m</span>}
            </p>
          </div>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={capture}
          disabled={status === 'locating'}
          className={cx(
            'inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-60',
            captured
              ? 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              : 'bg-primary text-white hover:bg-primary-hover',
          )}
        >
          <MapPin className="h-4 w-4" />
          {status === 'locating' ? 'Finding location…' : captured ? 'Capture again' : 'Capture location'}
        </button>
        {captured && status !== 'locating' && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      {message && (
        <p className="text-sm text-red-600" role="alert">
          {message}
        </p>
      )}
    </div>
  );
};
