/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';

interface Question {
  id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  allowOthers?: boolean;
  settings?: any;
}

interface QuestionBuilderProps {
  questions: Question[];
  onChange: (questions: Question[]) => void;
}

const QUESTION_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice', icon: '🔘' },
  { value: 'CHECKBOXES', label: 'Checkboxes', icon: '☑️' },
  { value: 'DROPDOWN', label: 'Dropdown', icon: '📋' },
  { value: 'SHORT_ANSWER', label: 'Short Answer', icon: '📄' },
  { value: 'PARAGRAPH', label: 'Paragraph', icon: '📝' },
  { value: 'LINEAR_SCALE', label: 'Linear Scale', icon: '📊' },
  { value: 'DATE', label: 'Date', icon: '📅' },
  { value: 'TIME', label: 'Time', icon: '🕐' },
  { value: 'EMAIL', label: 'Email', icon: '✉️' },
  { value: 'PHONE', label: 'Phone', icon: '📞' },
  { value: 'NUMBER', label: 'Number', icon: '🔢' },
  { value: 'IMPACT_METRIC', label: 'Impact Metric', icon: '📈' },
];

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * Interactive question builder for creating/editing survey questions.
 * Supports all 12 question types, re-ordering, options management, and inline editing.
 */
export const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  questions,
  onChange,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: generateId(),
      type: 'SHORT_ANSWER',
      title: '',
      required: false,
    };
    onChange([...questions, newQuestion]);
    setEditingIndex(questions.length);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };

    // Auto-add empty options when switching to a choice-based type
    if (updates.type && needsOptions(updates.type) && !(updated[index].options?.length)) {
      updated[index].options = ['Option 1'];
    }

    onChange(updated);
  };

  const deleteQuestion = (index: number) => {
    if (confirm('Are you sure you want to delete this question?')) {
      onChange(questions.filter((_, i) => i !== index));
      if (editingIndex === index) setEditingIndex(null);
    }
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const updated = [...questions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
    setEditingIndex(newIndex);
  };

  const needsOptions = (type: string) =>
    ['MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN'].includes(type);

  const addOption = (questionIndex: number) => {
    const question = questions[questionIndex];
    const options = question.options || [];
    updateQuestion(questionIndex, {
      options: [...options, `Option ${options.length + 1}`],
    });
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    const options = [...(questions[questionIndex].options || [])];
    options[optionIndex] = value;
    updateQuestion(questionIndex, { options });
  };

  const deleteOption = (questionIndex: number, optionIndex: number) => {
    const options = (questions[questionIndex].options || []).filter(
      (_, i) => i !== optionIndex,
    );
    updateQuestion(questionIndex, { options });
  };

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <div
          key={question.id}
          className={`border rounded-xl bg-white transition-shadow ${
            editingIndex === index
              ? 'border-[#5B94E5] shadow-md ring-1 ring-[#5B94E5]/20'
              : 'border-gray-200 hover:shadow-sm'
          }`}
        >
          {/* Collapsed view */}
          {editingIndex !== index ? (
            <div
              onClick={() => setEditingIndex(index)}
              className="flex items-center gap-3 p-4 cursor-pointer"
            >
              <div className="flex flex-col gap-1 border border-gray-200 rounded-lg bg-gray-50 p-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveQuestion(index, 'up');
                  }}
                  disabled={index === 0}
                  title="Move up"
                  className="px-2 py-1 text-sm text-gray-500 hover:text-white hover:bg-[#5B94E5] rounded disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors"
                >
                  ▲
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveQuestion(index, 'down');
                  }}
                  disabled={index === questions.length - 1}
                  title="Move down"
                  className="px-2 py-1 text-sm text-gray-500 hover:text-white hover:bg-[#5B94E5] rounded disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors"
                >
                  ▼
                </button>
              </div>

              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                {index + 1}
              </span>

              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {question.title || (
                    <span className="text-gray-400 italic">Untitled Question</span>
                  )}
                  {question.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {QUESTION_TYPES.find((t) => t.value === question.type)?.icon}{' '}
                  {QUESTION_TYPES.find((t) => t.value === question.type)?.label}
                  {needsOptions(question.type) &&
                    ` · ${(question.options || []).length} options`}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteQuestion(index);
                }}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ) : (
            /* Expanded edit view */
            <div className="p-5 space-y-5">
              {/* Header row with number badge and controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#5B94E5] text-white text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    Editing Question
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveQuestion(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-20"
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveQuestion(index, 'down')}
                    disabled={index === questions.length - 1}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-20"
                    title="Move down"
                  >
                    ▼
                  </button>
                </div>
              </div>

              {/* Question Type selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Question Type
                </label>
                <select
                  value={question.type}
                  onChange={(e) =>
                    updateQuestion(index, { type: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors outline-none"
                >
                  {QUESTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Question Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={question.title}
                  onChange={(e) =>
                    updateQuestion(index, { title: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors outline-none"
                  placeholder="Enter your question"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description{' '}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={question.description || ''}
                  onChange={(e) =>
                    updateQuestion(index, { description: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors outline-none resize-none"
                  rows={2}
                  placeholder="Additional context or instructions"
                />
              </div>

              {/* Required toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) =>
                    updateQuestion(index, { required: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-300 text-[#5B94E5] focus:ring-[#5B94E5]"
                />
                <span className="text-sm font-medium text-gray-700">
                  Required
                </span>
              </label>

              {/* Allow Others toggle - only for choice-based questions */}
              {needsOptions(question.type) && (
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={question.allowOthers || false}
                    onChange={(e) =>
                      updateQuestion(index, { allowOthers: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-[#5B94E5] focus:ring-[#5B94E5]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Allow &apos;Others&apos; option with text input
                  </span>
                </label>
              )}

              {/* Options editor for choice-based types */}
              {needsOptions(question.type) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  <div className="space-y-2">
                    {(question.options || []).map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 flex-shrink-0 border-2 border-gray-300 ${
                            question.type === 'MULTIPLE_CHOICE'
                              ? 'rounded-full'
                              : 'rounded'
                          }`}
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            updateOption(index, optIndex, e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors outline-none text-sm"
                          placeholder={`Option ${optIndex + 1}`}
                        />
                        <button
                          onClick={() => deleteOption(index, optIndex)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {/* Show "- Others" option if allowOthers is enabled */}
                    {question.allowOthers && (
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-gray-200">
                        <div
                          className={`w-4 h-4 flex-shrink-0 border-2 border-gray-400 ${
                            question.type === 'MULTIPLE_CHOICE'
                              ? 'rounded-full'
                              : 'rounded'
                          }`}
                        />
                        <input
                          type="text"
                          value="- Others"
                          disabled
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 text-sm cursor-not-allowed"
                        />
                        <div className="p-1.5 w-6 h-6" />
                      </div>
                    )}
                    <button
                      onClick={() => addOption(index)}
                      className="text-sm text-[#5B94E5] hover:text-[#4A7EC9] font-medium flex items-center gap-1 mt-1"
                    >
                      <span className="text-lg leading-none">+</span> Add Option
                    </button>
                  </div>
                </div>
              )}

              {/* Action bar */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  onClick={() => deleteQuestion(index)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
                <button
                  onClick={() => setEditingIndex(null)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7EC9] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add Question button */}
      <button
        onClick={addQuestion}
        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#5B94E5] hover:text-[#5B94E5] transition-colors flex items-center justify-center gap-2 font-medium"
      >
        <span className="text-xl leading-none">+</span> Add Question
      </button>
    </div>
  );
};
