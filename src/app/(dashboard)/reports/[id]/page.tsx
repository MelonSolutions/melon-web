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
  GripVertical
} from 'lucide-react';
import { ReportNavigation } from '@/components/reports/navigation/ReportNavigation';
import { useReport } from '@/hooks/useReports';
import { updateReport } from '@/lib/api/reports';
import { Question, QuestionType } from '@/types/reports';

export default function ReportDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = params.id as string;
  const isPublished = searchParams.get('published') === 'true';
  
  const { report, loading: reportLoading, refetch } = useReport(reportId);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [] as Question[],
  });

  const questionTypes: { value: QuestionType; label: string; icon: string }[] = [
    { value: 'multiple_choice', label: 'Multiple Choice', icon: '🔘' },
    { value: 'checkboxes', label: 'Checkboxes', icon: '☑️' },
    { value: 'dropdown', label: 'Dropdown', icon: '📝' },
    { value: 'short_answer', label: 'Short Answer', icon: '📄' },
    { value: 'paragraph', label: 'Paragraph', icon: '📝' },
    { value: 'linear_scale', label: 'Linear Scale', icon: '📊' },
    { value: 'date', label: 'Date', icon: '📅' },
    { value: 'time', label: 'Time', icon: '🕐' },
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
        status: shouldPublish ? 'published' as const : 'draft' as const,
      };
      
      await updateReport(reportId, dataToSave);
      await refetch();
    } catch (error) {
      console.error('Error saving report:', error);
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

  const addQuestion = (type: QuestionType = 'multiple_choice') => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      title: 'Untitled Question',
      description: '',
      required: false,
      ...(type === 'multiple_choice' || type === 'checkboxes' ? { options: ['Option 1'] } : {}),
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
    setFormData(prev => ({
      ...prev,
      questions: prev.questions?.filter(q => q.id !== questionId) || []
    }));
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

  if (reportLoading) {
    return (
      <div>
        <ReportNavigation currentPage="edit" />
        <div className="p-6 space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex gap-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Form Skeleton */}
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Integrated Navigation */}
      <ReportNavigation currentPage="edit" />
      
      {/* Page Content */}
      <div className="p-6">
        {/* Action Bar */}
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

        {/* Form Builder */}
        <div className="flex gap-6">
          {/* Main Editor */}
          <div className="flex-1">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Form Header */}
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
                  className="text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full resize-none"
                  placeholder="Form description"
                  rows={2}
                />
              </div>

              {/* Questions */}
              {formData.questions?.map((question, index) => (
                <div key={question.id} className="bg-white rounded-lg border border-gray-200 relative group">
                  {/* Question Header */}
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
                          className="text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full mt-2 resize-none"
                          placeholder="Question description (optional)"
                          rows={1}
                        />
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

                  {/* Question Content */}
                  <div className="p-6">
                    {/* Multiple Choice & Checkboxes */}
                    {(question.type === 'multiple_choice' || question.type === 'checkboxes') && (
                      <div className="space-y-3">
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-3">
                            <div className={`w-4 h-4 border-2 border-gray-300 flex-shrink-0 ${
                              question.type === 'multiple_choice' ? 'rounded-full' : 'rounded'
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
                        <button
                          onClick={() => addOption(question.id)}
                          className="flex items-center gap-3 text-[#5B94E5] hover:text-blue-700 transition-colors"
                        >
                          <div className={`w-4 h-4 border-2 border-gray-300 ${
                            question.type === 'multiple_choice' ? 'rounded-full' : 'rounded'
                          }`}></div>
                          <span className="text-sm">Add option</span>
                        </button>
                      </div>
                    )}

                    {/* Short Answer */}
                    {question.type === 'short_answer' && (
                      <div>
                        <input
                          type="text"
                          disabled
                          placeholder="Short answer text"
                          className="w-full py-2 border-none border-b border-gray-200 bg-gray-50 text-gray-500"
                        />
                      </div>
                    )}

                    {/* Paragraph */}
                    {question.type === 'paragraph' && (
                      <div>
                        <textarea
                          disabled
                          placeholder="Long answer text"
                          rows={3}
                          className="w-full py-2 border-none border-b border-gray-200 bg-gray-50 text-gray-500 resize-none"
                        />
                      </div>
                    )}

                    {/* Linear Scale */}
                    {question.type === 'linear_scale' && (
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

                    {/* Date */}
                    {question.type === 'date' && (
                      <div>
                        <input
                          type="date"
                          disabled
                          className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                    )}

                    {/* Time */}
                    {question.type === 'time' && (
                      <div>
                        <input
                          type="time"
                          disabled
                          className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Question Footer */}
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
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) => handleQuestionUpdate(question.id, { required: e.target.checked })}
                        className="rounded border-gray-300 text-[#5B94E5] focus:ring-[#5B94E5]"
                      />
                      <span className="text-sm text-gray-600">Required</span>
                    </label>
                  </div>

                  {/* Drag Handle */}
                  <div className="absolute left-2 top-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}

              {/* Add Question Button */}
              <button
                onClick={() => addQuestion()}
                className="w-full py-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#5B94E5] hover:text-[#5B94E5] transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Question
              </button>
            </div>
          </div>

          {/* Sidebar - Question Types */}
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