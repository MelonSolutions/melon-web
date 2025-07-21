/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Eye, Settings, Save, Send, Plus, Copy, Trash2, Share2 } from 'lucide-react';
import Link from 'next/link';
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
  const [activeTab, setActiveTab] = useState<'questions' | 'responses' | 'settings'>('questions');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [] as Question[],
  });

  const questionTypes: { value: QuestionType; label: string }[] = [
    { value: 'multiple_choice', label: 'Multiple choice' },
    { value: 'checkboxes', label: 'Checkboxes' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'short_answer', label: 'Short answer' },
    { value: 'paragraph', label: 'Paragraph' },
    { value: 'linear_scale', label: 'Linear scale' },
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
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
      // Show success message for published report
      setTimeout(() => {
        alert('Report published successfully!');
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
      
      if (shouldPublish) {
        alert('Report published successfully!');
      } else {
        alert('Report saved successfully!');
      }
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Failed to save report');
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

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'multiple_choice',
      title: 'Untitled Question',
      description: '',
      required: false,
      options: ['Option 1'],
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
    handleQuestionUpdate(questionId, {
      options: [...(formData.questions?.find(q => q.id === questionId)?.options || []), `Option ${(formData.questions?.find(q => q.id === questionId)?.options?.length || 0) + 1}`]
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Report not found</p>
        <Link href="/reports" className="text-blue-600 hover:text-blue-700">
          Back to Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/reports" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-medium text-sm">📄</span>
              </div>
              <div>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                />
                <p className="text-sm text-gray-500">
                  Status: <span className="capitalize">{report.status}</span> • {report.responseCount} responses
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href={`/reports/${reportId}/responses`}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Responses
            </Link>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Share2 className="w-5 h-5" />
            </button>
            <Link
              href={`/reports/${reportId}/settings`}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <button 
              onClick={() => handleSave(false)}
              disabled={loading}
              className="px-4 py-2 text-[#5B94E5] font-medium hover:bg-blue-50 rounded-lg disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2 inline" />
              Save
            </button>
            <button 
              onClick={() => handleSave(true)}
              disabled={loading}
              className="px-4 py-2 bg-[#5B94E5] text-white font-medium rounded-lg hover:bg-[#4A7ABF] disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2 inline" />
              Publish
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mt-4">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-3 font-medium border-b-2 ${
              activeTab === 'questions' 
                ? 'border-[#5B94E5] text-[#5B94E5]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Questions
          </button>
          <Link
            href={`/reports/${reportId}/responses`}
            className="px-6 py-3 font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700"
          >
            Responses
          </Link>
          <Link
            href={`/reports/${reportId}/settings`}
            className="px-6 py-3 font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700"
          >
            Settings
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Form Builder */}
        <div className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Form Header */}
            <div className="bg-white rounded-lg border-l-4 border-[#5B94E5] p-6">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full mb-4"
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
              <div key={question.id} className="bg-white rounded-lg border-l-4 border-blue-500 p-6 relative group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 mr-4">
                    <input
                      type="text"
                      value={question.title}
                      onChange={(e) => handleQuestionUpdate(question.id, { title: e.target.value })}
                      className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full"
                      placeholder="Question title"
                    />
                    {question.description && (
                      <textarea
                        value={question.description}
                        onChange={(e) => handleQuestionUpdate(question.id, { description: e.target.value })}
                        className="text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full mt-2 resize-none"
                        placeholder="Question description"
                        rows={1}
                      />
                    )}
                  </div>
                  
                  <select
                    value={question.type}
                    onChange={(e) => handleQuestionUpdate(question.id, { type: e.target.value as QuestionType })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {questionTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Question Options */}
                {(question.type === 'multiple_choice' || question.type === 'checkboxes') && (
                  <div className="space-y-3 mb-4">
                    {question.options?.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-3">
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                          className="flex-1 py-1 border-none border-b border-gray-200 focus:outline-none focus:border-blue-500"
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                        {question.options && question.options.length > 1 && (
                          <button
                            onClick={() => removeOption(question.id, optionIndex)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addOption(question.id)}
                      className="flex items-center space-x-3 text-blue-600 hover:text-blue-700"
                    >
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      <span>Add option or add &rdquo;Other&rdquo;</span>
                    </button>
                  </div>
                )}

                {question.type === 'short_answer' && (
                  <div className="mb-4">
                    <input
                      type="text"
                      disabled
                      placeholder="Short answer text"
                      className="w-full py-2 border-none border-b border-gray-200 bg-gray-50"
                    />
                  </div>
                )}

                {question.type === 'paragraph' && (
                  <div className="mb-4">
                    <textarea
                      disabled
                      placeholder="Long answer text"
                      rows={3}
                      className="w-full py-2 border-none border-b border-gray-200 bg-gray-50 resize-none"
                    />
                  </div>
                )}

                {/* Question Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => duplicateQuestion(question.id)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteQuestion(question.id)}
                      className="p-2 text-gray-400 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) => handleQuestionUpdate(question.id, { required: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Required</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Question Button */}
            <button
              onClick={addQuestion}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
              <Plus className="w-5 h-5 mx-auto" />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-16 bg-white border-l border-gray-200 p-4 space-y-4">
          <button
            onClick={addQuestion}
            className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200"
            title="Add question"
          >
            <Plus className="w-4 h-4" />
          </button>
          
          <button className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-200">
            📄
          </button>
          
          <button className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-200">
            Tt
          </button>
          
          <button className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-200">
            🖼️
          </button>
          
          <button className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-200">
            ▶️
          </button>
          
          <button className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-200">
            📊
          </button>
        </div>
      </div>
    </div>
  );
}