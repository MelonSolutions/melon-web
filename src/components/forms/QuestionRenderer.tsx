'use client';

import React from 'react';
import { Question } from '@/types/reports';

interface QuestionRendererProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

/**
 * Renders a single survey question based on its type.
 * Supports both UPPERCASE (backend enum) and lowercase type strings.
 */
export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
  error,
}) => {
  const normalizedType = question.type.toUpperCase();

  const inputStyles =
    'w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors outline-none';

  const renderInput = () => {
    switch (normalizedType) {
      case 'MULTIPLE_CHOICE': {
        const isOthersSelected = typeof value === 'object' && value?.option === '- Others';
        const currentValue = isOthersSelected ? '- Others' : value;

        return (
          <div className="space-y-2.5">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center gap-3 cursor-pointer group p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={currentValue === option}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-[18px] h-[18px] text-[#5B94E5] focus:ring-[#5B94E5] focus:ring-offset-0 border-gray-300 cursor-pointer"
                  />
                </div>
                <span className="text-gray-800 text-[15px]">{option}</span>
              </label>
            ))}
            {question.settings?.allowOther && (
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value="- Others"
                      checked={isOthersSelected}
                      onChange={() => onChange({ option: '- Others', customText: '' })}
                      className="w-[18px] h-[18px] text-[#5B94E5] focus:ring-[#5B94E5] focus:ring-offset-0 border-gray-300 cursor-pointer"
                    />
                  </div>
                  <span className="text-gray-800 text-[15px]">- Others</span>
                </label>
                {isOthersSelected && (
                  <input
                    type="text"
                    value={value?.customText || ''}
                    onChange={(e) => onChange({ option: '- Others', customText: e.target.value })}
                    placeholder="Please specify..."
                    className="ml-9 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors outline-none text-sm"
                    autoFocus
                  />
                )}
              </div>
            )}
          </div>
        );
      }

      case 'CHECKBOXES': {
        const currentValues = Array.isArray(value) ? value : [];
        const othersObject = currentValues.find((v: any) => typeof v === 'object' && v?.option === '- Others');
        const isOthersChecked = !!othersObject;
        const regularValues = currentValues.filter((v: any) => typeof v === 'string');

        return (
          <div className="space-y-2.5">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center gap-3 cursor-pointer group p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  value={option}
                  checked={regularValues.includes(option)}
                  onChange={(e) => {
                    const newValues = currentValues.filter((v: any) => typeof v === 'object');
                    if (e.target.checked) {
                      onChange([...regularValues, option, ...newValues]);
                    } else {
                      onChange([...regularValues.filter((v: string) => v !== option), ...newValues]);
                    }
                  }}
                  className="w-[18px] h-[18px] text-[#5B94E5] focus:ring-[#5B94E5] focus:ring-offset-0 border-gray-300 rounded cursor-pointer"
                />
                <span className="text-gray-800 text-[15px]">{option}</span>
              </label>
            ))}
            {question.settings?.allowOther && (
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={isOthersChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...regularValues, { option: '- Others', customText: '' }]);
                      } else {
                        onChange(regularValues);
                      }
                    }}
                    className="w-[18px] h-[18px] text-[#5B94E5] focus:ring-[#5B94E5] focus:ring-offset-0 border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-gray-800 text-[15px]">- Others</span>
                </label>
                {isOthersChecked && (
                  <input
                    type="text"
                    value={othersObject?.customText || ''}
                    onChange={(e) => {
                      const newValues = regularValues.filter((v: any) => typeof v === 'string');
                      onChange([...newValues, { option: '- Others', customText: e.target.value }]);
                    }}
                    placeholder="Please specify..."
                    className="ml-9 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors outline-none text-sm"
                    autoFocus
                  />
                )}
              </div>
            )}
          </div>
        );
      }

      case 'DROPDOWN': {
        const isOthersSelected = typeof value === 'object' && value?.option === '- Others';
        const currentValue = isOthersSelected ? '- Others' : (value || '');

        return (
          <div className="space-y-3">
            <select
              value={currentValue}
              onChange={(e) => {
                if (e.target.value === '- Others') {
                  onChange({ option: '- Others', customText: '' });
                } else {
                  onChange(e.target.value);
                }
              }}
              className={inputStyles}
            >
              <option value="">— Select an option —</option>
              {question.options?.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
              {question.settings?.allowOther && (
                <option value="- Others">- Others (please specify)</option>
              )}
            </select>
            {isOthersSelected && (
              <input
                type="text"
                value={value?.customText || ''}
                onChange={(e) => onChange({ option: '- Others', customText: e.target.value })}
                placeholder="Please specify..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors outline-none"
                autoFocus
              />
            )}
          </div>
        );
      }

      case 'SHORT_ANSWER':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.settings?.placeholder || 'Your answer'}
            className={inputStyles}
          />
        );

      case 'PARAGRAPH':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.settings?.placeholder || 'Your answer'}
            rows={4}
            className={`${inputStyles} resize-none`}
          />
        );

      case 'LINEAR_SCALE': {
        const min = question.settings?.min ?? 1;
        const max = question.settings?.max ?? 5;
        const step = question.settings?.step ?? 1;
        const scaleValues: number[] = [];
        for (let i = min; i <= max; i += step) {
          scaleValues.push(i);
        }
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm text-gray-500 mr-1">{min}</span>
            {scaleValues.map((num) => (
              <label key={num} className="cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={num}
                  checked={String(value) === String(num)}
                  onChange={() => onChange(num)}
                  className="sr-only"
                />
                <div
                  className={`w-10 h-10 border-2 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    String(value) === String(num)
                      ? 'border-[#5B94E5] bg-[#5B94E5] text-white shadow-md scale-110'
                      : 'border-gray-300 text-gray-600 hover:border-[#5B94E5] hover:text-[#5B94E5]'
                  }`}
                >
                  {num}
                </div>
              </label>
            ))}
            <span className="text-sm text-gray-500 ml-1">{max}</span>
          </div>
        );
      }

      case 'MATRIX': {
        const rows = question.settings?.rows || [];
        const columns = question.settings?.columns || [];
        const matrixValue = value || {};

        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 bg-gray-50 p-3 text-left text-sm font-medium"></th>
                  {columns.map((col, colIndex) => (
                    <th key={colIndex} className="border border-gray-300 bg-gray-50 p-3 text-center text-sm font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 text-sm font-medium text-gray-900">
                      {row}
                    </td>
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="border border-gray-300 p-3 text-center">
                        <input
                          type="radio"
                          name={`matrix-${question.id}-row-${rowIndex}`}
                          value={col}
                          checked={matrixValue[row] === col}
                          onChange={() => {
                            const newValue = { ...matrixValue, [row]: col };
                            onChange(newValue);
                          }}
                          className="w-4 h-4 text-[#5B94E5] focus:ring-[#5B94E5] focus:ring-offset-0 border-gray-300 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case 'DATE':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputStyles}
          />
        );

      case 'TIME':
        return (
          <input
            type="time"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputStyles}
          />
        );

      case 'EMAIL':
        return (
          <input
            type="email"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="email@example.com"
            className={inputStyles}
          />
        );

      case 'PHONE':
        return (
          <input
            type="tel"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="+234-800-000-0000"
            className={inputStyles}
          />
        );

      case 'NUMBER':
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value === '' ? '' : e.target.valueAsNumber)}
            min={question.settings?.min}
            max={question.settings?.max}
            step={question.settings?.step || 1}
            placeholder={question.settings?.placeholder || 'Enter a number'}
            className={inputStyles}
          />
        );

      case 'IMPACT_METRIC':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">
              Actual Value
            </label>
            <input
              type="number"
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value === '' ? '' : e.target.valueAsNumber)}
              placeholder="Enter numeric value"
              min={0}
              className={inputStyles}
            />
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Your answer"
            className={inputStyles}
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 transition-shadow hover:shadow-sm">
      <div className="mb-4">
        <h3 className="text-[15px] font-semibold text-gray-900 leading-snug">
          {question.title}
          {question.required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </h3>
        {question.description && (
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
            {question.description}
          </p>
        )}
      </div>
      <div className="mt-3">{renderInput()}</div>
      {error && (
        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
