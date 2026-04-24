/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Save,
  Send,
  Plus,
  Copy,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { ReportNavigation } from '@/components/reports/navigation/ReportNavigation';
import { useReport } from '@/hooks/useReports';
import { updateReport } from '@/lib/api/reports';
import { Question, QuestionType, QUESTION_TYPE_DISPLAY_NAMES } from '@/types/reports';
import { useToast } from '@/components/ui/Toast';
import { useModal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function ReportDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { openModal, closeModal } = useModal();
  
  const reportId = params.id as string;
  
  if (!reportId || reportId === 'undefined' || reportId === 'null') {
    return (
      <div>
        <ReportNavigation currentPage="edit" />
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-gray-400 text-sm mb-2">Invalid report ID</div>
            <button 
              onClick={() => router.push('/reports')}
              className="text-sm text-[#5B94E5] hover:text-blue-700 font-medium"
            >
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const isPublished = searchParams.get('PUBLISHED') === 'true';
  
  const { report, loading: reportLoading, refetch } = useReport(reportId);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [] as Question[],
  });

  const questionTypes: { value: QuestionType; label: string; icon: string }[] = [
    { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice', icon: '🔘' },
    { value: 'CHECKBOXES', label: 'Checkboxes', icon: '☑️' },
    { value: 'DROPDOWN', label: 'Dropdown', icon: '📝' },
    { value: 'SHORT_ANSWER', label: 'Short Answer', icon: '📄' },
    { value: 'PARAGRAPH', label: 'Paragraph', icon: '📝' },
    { value: 'LINEAR_SCALE', label: 'Linear Scale', icon: '📊' },
    { value: 'MATRIX', label: 'Matrix / Likert', icon: '📋' },
    { value: 'DATE', label: 'Date', icon: '📅' },
    { value: 'TIME', label: 'Time', icon: '🕐' },
  ];

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
    if (isPublished) {
      setTimeout(() => {
        router.replace(`/reports/${reportId}`);
      }, 100);
    }
  }, [isPublished, reportId, router]);

  const handleSave = async (shouldPublish = false) => {
    try {
      setLoading(true);
      const dataToSave = {
        ...formData,
        status: shouldPublish ? 'PUBLISHED' as const : 'DRAFT' as const,
      };
      
      await updateReport(reportId, dataToSave);
      await refetch();

      addToast({
        type: 'success',
        title: shouldPublish ? 'Report Published!' : 'Changes Saved!',
        message: shouldPublish 
          ? 'Your report is now live and ready to collect responses.'
          : 'Your changes have been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving report:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to save changes. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionUpdate = (questionId: string, updates: Partial<Question>) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions?.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      ) || []
    }));
  };

  const addQuestion = (type: QuestionType = 'MULTIPLE_CHOICE') => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      title: 'Untitled Question',
      description: '',
      required: false,
      ...(type === 'MULTIPLE_CHOICE' || type === 'CHECKBOXES' || type === 'DROPDOWN' ? { options: ['Option 1'] } : {}),
      ...(type === 'MATRIX' ? {
        settings: {
          rows: ['Row 1', 'Row 2'],
          columns: ['Column 1', 'Column 2']
        }
      } : {}),
    };

    setFormData(prev => ({
      ...prev,
      questions: [...(prev.questions || []), newQuestion]
    }));
  };

  const duplicateQuestion = (questionId: string) => {
    const questionToDuplicate = formData.questions?.find(q => q.id === questionId);
    if (questionToDuplicate) {
      const duplicatedQuestion: Question = {
        ...questionToDuplicate,
        id: Date.now().toString(),
        title: `${questionToDuplicate.title} (Copy)`,
      };

      setFormData(prev => ({
        ...prev,
        questions: [...(prev.questions || []), duplicatedQuestion]
      }));
    }
  };

  const deleteQuestion = (questionId: string) => {
    if (formData.questions && formData.questions.length > 1) {
      openModal(
        <ConfirmDialog
          title="Delete Question"
          message="Are you sure you want to delete this question? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          onConfirm={() => {
            setFormData(prev => ({
              ...prev,
              questions: prev.questions?.filter(q => q.id !== questionId) || []
            }));
            closeModal();
            addToast({
              type: 'info',
              title: 'Question Deleted',
              message: 'The question has been removed from your report.',
            });
          }}
          onCancel={closeModal}
        />,
        { size: 'sm' }
      );
    } else {
      addToast({
        type: 'warning',
        title: 'Cannot Delete',
        message: 'You must have at least one question in your report.',
      });
    }
  };

  const addOption = (questionId: string) => {
    const question = formData.questions?.find(q => q.id === questionId);
    const optionCount = question?.options?.length || 0;
    handleQuestionUpdate(questionId, {
      options: [...(question?.options || []), `Option ${optionCount + 1}`]
    });
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = formData.questions?.find(q => q.id === questionId);
    if (question?.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      handleQuestionUpdate(questionId, { options: newOptions });
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = formData.questions?.find(q => q.id === questionId);
    if (question?.options && question.options.length > 1) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      handleQuestionUpdate(questionId, { options: newOptions });
    }
  };

  // Matrix question helpers
  const addMatrixRow = (questionId: string) => {
    const question = formData.questions?.find(q => q.id === questionId);
    const rowCount = question?.settings?.rows?.length || 0;
    handleQuestionUpdate(questionId, {
      settings: {
        ...question?.settings,
        rows: [...(question?.settings?.rows || []), `Row ${rowCount + 1}`]
      }
    });
  };

  const updateMatrixRow = (questionId: string, rowIndex: number, value: string) => {
    const question = formData.questions?.find(q => q.id === questionId);
    if (question?.settings?.rows) {
      const newRows = [...question.settings.rows];
      newRows[rowIndex] = value;
      handleQuestionUpdate(questionId, {
        settings: { ...question.settings, rows: newRows }
      });
    }
  };

  const removeMatrixRow = (questionId: string, rowIndex: number) => {
    const question = formData.questions?.find(q => q.id === questionId);
    if (question?.settings?.rows && question.settings.rows.length > 1) {
      const newRows = question.settings.rows.filter((_, index) => index !== rowIndex);
      handleQuestionUpdate(questionId, {
        settings: { ...question.settings, rows: newRows }
      });
    }
  };

  const addMatrixColumn = (questionId: string) => {
    const question = formData.questions?.find(q => q.id === questionId);
    const colCount = question?.settings?.columns?.length || 0;
    handleQuestionUpdate(questionId, {
      settings: {
        ...question?.settings,
        columns: [...(question?.settings?.columns || []), `Column ${colCount + 1}`]
      }
    });
  };

  const updateMatrixColumn = (questionId: string, colIndex: number, value: string) => {
    const question = formData.questions?.find(q => q.id === questionId);
    if (question?.settings?.columns) {
      const newColumns = [...question.settings.columns];
      newColumns[colIndex] = value;
      handleQuestionUpdate(questionId, {
        settings: { ...question.settings, columns: newColumns }
      });
    }
  };

  const removeMatrixColumn = (questionId: string, colIndex: number) => {
    const question = formData.questions?.find(q => q.id === questionId);
    if (question?.settings?.columns && question.settings.columns.length > 1) {
      const newColumns = question.settings.columns.filter((_, index) => index !== colIndex);
      handleQuestionUpdate(questionId, {
        settings: { ...question.settings, columns: newColumns }
      });
    }
  };

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    const currentIndex = formData.questions?.findIndex(q => q.id === questionId) ?? -1;
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= (formData.questions?.length || 0)) return;

    const newQuestions = [...(formData.questions || [])];
    [newQuestions[currentIndex], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[currentIndex]];

    setFormData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  if (reportLoading) {
    return (
      <div>
        <ReportNavigation currentPage="edit" />
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex gap-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-20 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div>
        <ReportNavigation currentPage="edit" />
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-gray-400 text-sm mb-2">Report not found</div>
            <button 
              onClick={() => router.push('/reports')}
              className="text-sm text-[#5B94E5] hover:text-blue-700 font-medium"
            >
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ReportNavigation currentPage="edit" />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="text-xl font-medium bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-gray-900"
              placeholder="Report title"
            />
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleSave(false)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#5B94E5] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button 
              onClick={() => handleSave(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Publish
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 border-l-4 border-l-[#5B94E5] p-6">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="text-2xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full text-gray-900 mb-2"
                  placeholder="Form title"
                />
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full resize-y min-h-[60px] whitespace-pre-wrap"
                  placeholder="Form description"
                  rows={2}
                />
              </div>

              {formData.questions?.map((question, index) => (
                <div key={question.id} className="bg-white rounded-lg border border-gray-200 relative group">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={question.title}
                          onChange={(e) => handleQuestionUpdate(question.id, { title: e.target.value })}
                          className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full text-gray-900"
                          placeholder="Question title"
                        />
                        <textarea
                          value={question.description || ''}
                          onChange={(e) => handleQuestionUpdate(question.id, { description: e.target.value })}
                          className="text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full mt-2 resize-y min-h-[40px] whitespace-pre-wrap"
                          placeholder="Question description (optional)"
                          rows={1}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-1 border border-gray-200 rounded-lg bg-gray-50 p-1">
                          <button
                            onClick={() => moveQuestion(question.id, 'up')}
                            disabled={index === 0}
                            title="Move up"
                            className="p-1 text-gray-500 hover:text-white hover:bg-[#5B94E5] rounded disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveQuestion(question.id, 'down')}
                            disabled={index === formData.questions.length - 1}
                            title="Move down"
                            className="p-1 text-gray-500 hover:text-white hover:bg-[#5B94E5] rounded disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>

                        <select
                          value={question.type}
                          onChange={(e) => handleQuestionUpdate(question.id, { type: e.target.value as QuestionType })}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                        >
                          {questionTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {(question.type === 'MULTIPLE_CHOICE' || question.type === 'CHECKBOXES' || question.type === 'DROPDOWN') && (
                      <div className="space-y-3">
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-3">
                            <div className={`w-4 h-4 border-2 border-gray-300 flex-shrink-0 ${
                              question.type === 'MULTIPLE_CHOICE' ? 'rounded-full' : question.type === 'DROPDOWN' ? 'hidden' : 'rounded'
                            }`}></div>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                              className="flex-1 py-1 border-none border-b border-gray-200 focus:outline-none focus:border-[#5B94E5] transition-colors"
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            {question.options && question.options.length > 1 && (
                              <button
                                onClick={() => removeOption(question.id, optionIndex)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        {question.settings?.allowOther && (
                          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2 border border-gray-200">
                            <div className={`w-4 h-4 border-2 border-gray-400 flex-shrink-0 ${
                              question.type === 'MULTIPLE_CHOICE' ? 'rounded-full' : question.type === 'DROPDOWN' ? 'hidden' : 'rounded'
                            }`}></div>
                            <input
                              type="text"
                              value="- Others"
                              disabled
                              className="flex-1 py-1 border-none bg-transparent text-gray-600 cursor-not-allowed"
                            />
                            <div className="w-8" />
                          </div>
                        )}
                        <button
                          onClick={() => addOption(question.id)}
                          className="flex items-center gap-3 text-[#5B94E5] hover:text-blue-700 transition-colors"
                        >
                          <div className={`w-4 h-4 border-2 border-gray-300 ${
                            question.type === 'MULTIPLE_CHOICE' ? 'rounded-full' : question.type === 'DROPDOWN' ? 'hidden' : 'rounded'
                          }`}></div>
                          <span className="text-sm">Add option</span>
                        </button>
                      </div>
                    )}

                    {question.type === 'SHORT_ANSWER' && (
                      <div>
                        <input
                          type="text"
                          disabled
                          placeholder="Short answer text"
                          className="w-full py-2 border-none border-b border-gray-200 bg-gray-50 text-gray-500"
                        />
                      </div>
                    )}

                    {question.type === 'PARAGRAPH' && (
                      <div>
                        <textarea
                          disabled
                          placeholder="Long answer text"
                          rows={3}
                          className="w-full py-2 border-none border-b border-gray-200 bg-gray-50 text-gray-500 resize-none"
                        />
                      </div>
                    )}

                    {question.type === 'LINEAR_SCALE' && (
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">1</span>
                        <div className="flex gap-2">
                          {[1,2,3,4,5].map(num => (
                            <div key={num} className="w-8 h-8 border-2 border-gray-300 rounded-full flex items-center justify-center text-sm text-gray-600">
                              {num}
                            </div>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">5</span>
                      </div>
                    )}

                    {question.type === 'MATRIX' && (
                      <div className="space-y-6">
                        {/* Rows */}
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Rows (Questions)</label>
                          <div className="space-y-2">
                            {question.settings?.rows?.map((row, rowIndex) => (
                              <div key={rowIndex} className="flex items-center gap-3">
                                <input
                                  type="text"
                                  value={row}
                                  onChange={(e) => updateMatrixRow(question.id, rowIndex, e.target.value)}
                                  className="flex-1 py-1 px-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5B94E5] transition-colors"
                                  placeholder={`Row ${rowIndex + 1}`}
                                />
                                {question.settings?.rows && question.settings.rows.length > 1 && (
                                  <button
                                    onClick={() => removeMatrixRow(question.id, rowIndex)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              onClick={() => addMatrixRow(question.id)}
                              className="text-sm text-[#5B94E5] hover:text-blue-700 transition-colors"
                            >
                              + Add row
                            </button>
                          </div>
                        </div>

                        {/* Columns */}
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Columns (Options)</label>
                          <div className="space-y-2">
                            {question.settings?.columns?.map((col, colIndex) => (
                              <div key={colIndex} className="flex items-center gap-3">
                                <input
                                  type="text"
                                  value={col}
                                  onChange={(e) => updateMatrixColumn(question.id, colIndex, e.target.value)}
                                  className="flex-1 py-1 px-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5B94E5] transition-colors"
                                  placeholder={`Column ${colIndex + 1}`}
                                />
                                {question.settings?.columns && question.settings.columns.length > 1 && (
                                  <button
                                    onClick={() => removeMatrixColumn(question.id, colIndex)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              onClick={() => addMatrixColumn(question.id)}
                              className="text-sm text-[#5B94E5] hover:text-blue-700 transition-colors"
                            >
                              + Add column
                            </button>
                          </div>
                        </div>

                        {/* Preview table */}
                        {question.settings?.rows && question.settings?.columns && (
                          <div className="mt-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Preview</label>
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                  <tr>
                                    <th className="border border-gray-300 bg-gray-50 p-2 text-left text-sm font-medium"></th>
                                    {question.settings.columns.map((col, idx) => (
                                      <th key={idx} className="border border-gray-300 bg-gray-50 p-2 text-center text-sm font-medium">
                                        {col}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {question.settings.rows.map((row, rowIdx) => (
                                    <tr key={rowIdx}>
                                      <td className="border border-gray-300 p-2 text-sm">{row}</td>
                                      {question.settings?.columns?.map((_, colIdx) => (
                                        <td key={colIdx} className="border border-gray-300 p-2 text-center">
                                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full inline-block"></div>
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {question.type === 'DATE' && (
                      <div>
                        <input
                          type="date"
                          disabled
                          className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                    )}

                    {question.type === 'TIME' && (
                      <div>
                        <input
                          type="time"
                          disabled
                          className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => duplicateQuestion(question.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteQuestion(question.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) => handleQuestionUpdate(question.id, { required: e.target.checked })}
                          className="rounded border-gray-300 text-[#5B94E5] focus:ring-[#5B94E5]"
                        />
                        <span className="text-sm text-gray-600">Required</span>
                      </label>

                      {(question.type === 'MULTIPLE_CHOICE' || question.type === 'CHECKBOXES' || question.type === 'DROPDOWN') && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={question.settings?.allowOther || false}
                            onChange={(e) => handleQuestionUpdate(question.id, {
                              settings: { ...question.settings, allowOther: e.target.checked }
                            })}
                            className="rounded border-gray-300 text-[#5B94E5] focus:ring-[#5B94E5]"
                          />
                          <span className="text-sm text-gray-600">Allow &apos;Others&apos;</span>
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="absolute left-2 top-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}

              <button
                onClick={() => addQuestion()}
                className="w-full py-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#5B94E5] hover:text-[#5B94E5] transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Question
              </button>
            </div>
          </div>

          <div className="w-64 bg-white rounded-lg border border-gray-200 p-4 h-fit">
            <h3 className="font-medium text-gray-900 mb-4">Add Questions</h3>
            
            <div className="space-y-2">
              {questionTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => addQuestion(type.value)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span>{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}