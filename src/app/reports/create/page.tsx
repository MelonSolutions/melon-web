/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Plus, 
  Copy, 
  Trash2, 
  GripVertical,
  Settings2
} from 'lucide-react';
import Link from 'next/link';
import { createReport, ApiError } from '@/lib/api/reports';
import { 
  CreateReportRequest, 
  Question, 
  QuestionType, 
  ReportCategory,
  CATEGORY_DISPLAY_NAMES,
  QUESTION_TYPE_DISPLAY_NAMES,
  getCategoryDisplayName,
  getQuestionTypeDisplayName
} from '@/types/reports';
import { useToast } from '@/components/ui/Toast';
import { useModal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormField } from '@/components/ui/FormField';
import { useFormValidation } from '@/hooks/useFormValidation';

function CreateReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { openModal, closeModal } = useModal();
  const [showQuickSettings, setShowQuickSettings] = useState(false);

  const [formData, setFormData] = useState<CreateReportRequest>({
    title: '',
    description: '',
    category: 'IMPACT_ASSESSMENT',
    status: 'DRAFT',
    allowMultipleResponses: false,
    collectEmail: false,
    isPublic: false,
    questions: [
      {
        id: '1',
        type: 'MULTIPLE_CHOICE',
        title: 'Untitled Question',
        description: '',
        required: false,
        options: ['Option 1'],
      }
    ],
  });

  // Pre-fill projectId if creating report from project page
  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId) {
      setFormData(prev => ({
        ...prev,
        projectId: projectId
      }));
    }
  }, [searchParams]);

  const questionTypes: { value: QuestionType; label: string; icon: string }[] = [
    { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice', icon: '🔘' },
    { value: 'CHECKBOXES', label: 'Checkboxes', icon: '☑️' },
    { value: 'DROPDOWN', label: 'Dropdown', icon: '📝' },
    { value: 'SHORT_ANSWER', label: 'Short Answer', icon: '📄' },
    { value: 'PARAGRAPH', label: 'Paragraph', icon: '📝' },
    { value: 'LINEAR_SCALE', label: 'Linear Scale', icon: '📊' },
    { value: 'DATE', label: 'Date', icon: '📅' },
    { value: 'TIME', label: 'Time', icon: '🕐' },
  ];

  const categories: ReportCategory[] = [
    'IMPACT_ASSESSMENT',
    'FEEDBACK',
    'HEALTH',
    'EDUCATION',
    'AGRICULTURE',
    'COMMUNITY',
    'ENVIRONMENT',
    'ECONOMIC',
  ];

  // Form validation
  const { handleSubmit, isSubmitting, getFieldError, handleFieldChange, handleFieldBlur } = useFormValidation({
    schema: {
      title: { 
        required: true, 
        minLength: 3, 
        maxLength: 100,
        custom: (value) => {
          if (value && value.toLowerCase().includes('untitled')) {
            return 'Please provide a meaningful title for your report';
          }
          return null;
        }
      },
      description: { maxLength: 500 },
      questions: {
        custom: (questions) => {
          if (!questions || questions.length === 0) {
            return 'At least one question is required';
          }
          
          // Validate each question has a title
          for (const question of questions) {
            if (!question.title || question.title.trim() === '' || question.title === 'Untitled Question') {
              return 'All questions must have a title';
            }
          }
          
          return null;
        }
      }
    },
    onSubmit: async (data) => {
      // This will be called by handleSave
    }
  });

  const handleSave = async (shouldPublish = false) => {
    try {
      const dataToSave = {
        ...formData,
        status: shouldPublish ? 'PUBLISHED' as const : 'DRAFT' as const,
      };

      await handleSubmit(dataToSave);
      
      const result = await createReport(dataToSave);
      
      // Success toast
      addToast({
        type: 'success',
        title: shouldPublish ? 'Report Published!' : 'Report Saved!',
        message: shouldPublish 
          ? 'Your report is now live and ready to collect responses.'
          : 'Your report has been saved as a draft.',
      });
      
      if (shouldPublish) {
        router.push(`/reports/${result._id}?PUBLISHED=true`);
      } else {
        router.push(`/reports/${result._id}`);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        // Handle specific API errors
        if (error.code === 'DUPLICATE_TITLE' || error.message.includes('already exists')) {
          addToast({
            type: 'error',
            title: 'Title Already Exists',
            message: 'A report with this title already exists. Please choose a different title.',
          });
          
          // Focus on the title field
          const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
          if (titleInput) {
            titleInput.focus();
            titleInput.select();
          }
        } else if (error.status === 403) {
          addToast({
            type: 'error',
            title: 'Permission Denied',
            message: 'You do not have permission to create reports.',
          });
        } else if (error.status >= 500) {
          addToast({
            type: 'error',
            title: 'Server Error',
            message: 'Something went wrong on our end. Please try again in a moment.',
          });
        } else {
          addToast({
            type: 'error',
            title: 'Failed to Save Report',
            message: error.message,
          });
        }
      } else {
        // Generic error fallback
        addToast({
          type: 'error',
          title: 'Unexpected Error',
          message: 'Something went wrong. Please try again.',
        });
      }
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
      ...(type === 'MULTIPLE_CHOICE' || type === 'CHECKBOXES' ? { options: ['Option 1'] } : {}),
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
      // Use modal for confirmation
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

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({ ...prev, title: value }));
    handleFieldChange('title', value);
  };

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
    handleFieldChange('description', value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/reports" 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-medium text-gray-900">Create New Report</h1>
              <p className="text-sm text-gray-500">Build your data collection form</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQuickSettings(!showQuickSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Quick Settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleSave(false)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#5B94E5] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save Draft'}
            </button>
            <button 
              onClick={() => handleSave(true)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-3 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Publishing...' : 'Create & Publish'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Settings Panel */}
      {showQuickSettings && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Category">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ReportCategory }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {getCategoryDisplayName(category)}
                    </option>
                  ))}
                </select>
              </FormField>
              
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.collectEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, collectEmail: e.target.checked }))}
                    className="rounded border-gray-300 text-[#5B94E5] focus:ring-[#5B94E5]"
                  />
                  <span className="text-sm text-gray-700">Collect email addresses</span>
                </label>
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="rounded border-gray-300 text-[#5B94E5] focus:ring-[#5B94E5]"
                  />
                  <span className="text-sm text-gray-700">Allow public access</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex">
        {/* Form Builder */}
        <div className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Form Header */}
            <div className="bg-white rounded-lg border border-gray-200 border-l-4 border-l-[#5B94E5] p-6">
              <FormField 
                label="Report Title" 
                required 
                error={getFieldError('title')}
              >
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  onBlur={(e) => handleFieldBlur('title', e.target.value)}
                  className={`text-2xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full text-gray-900 ${
                    getFieldError('title') ? 'text-red-600' : ''
                  }`}
                  placeholder="Enter a descriptive title for your report"
                />
              </FormField>
              
              <div className="mt-4">
                <FormField 
                  label="Description" 
                  error={getFieldError('description')}
                  description="Explain what this report is for and how the data will be used"
                >
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    onBlur={(e) => handleFieldBlur('description', e.target.value)}
                    className={`text-gray-600 bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] p-3 w-full resize-none transition-colors ${
                      getFieldError('description') ? 'border-red-300' : ''
                    }`}
                    placeholder="Describe the purpose of this report..."
                    rows={3}
                  />
                </FormField>
              </div>
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
                        placeholder="Enter your question here"
                      />
                      <textarea
                        value={question.description || ''}
                        onChange={(e) => handleQuestionUpdate(question.id, { description: e.target.value })}
                        className="text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full mt-2 resize-none"
                        placeholder="Add a description to help respondents understand this question"
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
                  {(question.type === 'MULTIPLE_CHOICE' || question.type === 'CHECKBOXES') && (
                    <div className="space-y-3">
                      {question.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-3">
                          <div className={`w-4 h-4 border-2 border-gray-300 flex-shrink-0 ${
                            question.type === 'MULTIPLE_CHOICE' ? 'rounded-full' : 'rounded'
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
                          question.type === 'MULTIPLE_CHOICE' ? 'rounded-full' : 'rounded'
                        }`}></div>
                        <span className="text-sm">Add option</span>
                      </button>
                    </div>
                  )}

                  {/* Short Answer */}
                  {question.type === 'SHORT_ANSWER' && (
                    <div>
                      <input
                        type="text"
                        disabled
                        placeholder="Respondents will type their short answer here"
                        className="w-full py-2 border-none border-b border-gray-200 bg-gray-50 text-gray-500"
                      />
                    </div>
                  )}

                  {/* Paragraph */}
                  {question.type === 'PARAGRAPH' && (
                    <div>
                      <textarea
                        disabled
                        placeholder="Respondents will type their detailed answer here"
                        rows={3}
                        className="w-full py-2 border-none border-b border-gray-200 bg-gray-50 text-gray-500 resize-none"
                      />
                    </div>
                  )}

                  {/* Linear Scale */}
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

                  {/* Date */}
                  {question.type === 'DATE' && (
                    <div>
                      <input
                        type="date"
                        disabled
                        className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                  )}

                  {/* Time */}
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

                {/* Question Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => duplicateQuestion(question.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="Duplicate Question"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteQuestion(question.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Delete Question"
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

            {/* Questions Validation Error */}
            {getFieldError('questions') && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{getFieldError('questions')}</p>
              </div>
            )}

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
        <div className="w-64 bg-white rounded-lg border border-gray-200 p-4 h-fit mx-6 mt-6">
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
  );
}

export default function CreateReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#5B94E5] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CreateReportContent />
    </Suspense>
  );
}