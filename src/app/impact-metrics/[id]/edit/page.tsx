'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Calendar, ChevronDown, Loader2 } from 'lucide-react';
import Link from 'next/link';

const sectorOptions = [
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'energy', label: 'Energy' },
  { value: 'finance', label: 'Finance' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'environment', label: 'Environment' },
];

const reportQuestions = [
  { value: 'q1', label: 'How many households were reached this month?' },
  { value: 'q2', label: 'Number of students enrolled in programs' },
  { value: 'q3', label: 'Total beneficiaries served' },
  { value: 'q4', label: 'Amount of funds disbursed' },
];

export default function EditImpactMetricPage() {
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    unit: '',
    description: '',
    targetValue: '',
    weight: '',
    sector: '',
    startDate: '',
    endDate: '',
    reportQuestion: '',
    notes: '',
    tags: [] as string[],
  });

  useEffect(() => {
    // Simulate API call to fetch metric data
    const fetchMetric = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data based on metric ID
        const mockData = {
          label: 'Households Reached',
          unit: 'households',
          description: 'Number of households reached through our health programs',
          targetValue: '1000',
          weight: '20',
          sector: 'health',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          reportQuestion: 'q1',
          notes: 'This metric tracks the primary reach of our health intervention programs.',
          tags: ['health', 'reach', 'primary-indicator'],
        };
        
        setFormData(mockData);
      } catch (err) {
        setError('Failed to load metric data');
        console.error('Error fetching metric:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetric();
  }, [params.id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect back to metric details
      router.push(`/impact-metrics/${params.id}`);
    } catch (error) {
      console.error('Error updating metric:', error);
      setError('Failed to update metric');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mb-8"></div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Metric</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link
              href="/impact-metrics"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Metrics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isFormValid = formData.label && formData.unit && formData.targetValue && 
    formData.weight && formData.sector && formData.startDate && formData.endDate;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href={`/impact-metrics/${params.id}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Edit Impact Metric</h1>
              <p className="text-sm text-gray-500">Update your impact metric configuration</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/impact-metrics/${params.id}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </Link>
            <button 
              type="submit"
              form="edit-metric-form"
              disabled={!isFormValid || isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Updating...' : 'Update Metric'}
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <form id="edit-metric-form" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metric Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => handleInputChange('label', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors cursor-text"
                    placeholder="e.g., Households Reached"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors cursor-text"
                    placeholder="e.g., households, students"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors resize-none cursor-text"
                  placeholder="Brief description of what this metric measures"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sector <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.sector}
                      onChange={(e) => handleInputChange('sector', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] bg-white appearance-none transition-colors cursor-pointer"
                      required
                    >
                      <option value="">Select sector</option>
                      {sectorOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scoring Weight (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors cursor-text"
                    placeholder="20"
                    min="1"
                    max="100"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Target & Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Target & Timeline</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => handleInputChange('targetValue', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors cursor-text"
                  placeholder="1000"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors cursor-pointer"
                      required
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors cursor-pointer"
                      required
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Report Integration */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Report Integration</h2>
            <p className="text-sm text-gray-500 mb-6">Link this metric to a report question for automatic data updates</p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link to Report Question (Optional)
              </label>
              <div className="relative">
                <select
                  value={formData.reportQuestion}
                  onChange={(e) => handleInputChange('reportQuestion', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] bg-white appearance-none transition-colors cursor-pointer"
                >
                  <option value="">Select a report question to auto-populate data</option>
                  {reportQuestions.map(question => (
                    <option key={question.value} value={question.value}>
                      {question.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Linking to a report question will automatically update the actual value based on form responses
              </p>
            </div>
          </div>

          {/* Tags & Classification */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Tags & Classification</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a tag"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors cursor-text"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const target = e.target as HTMLInputElement;
                      addTag(target.value.trim());
                      target.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add a tag"]') as HTMLInputElement;
                    if (input?.value.trim()) {
                      addTag(input.value.trim());
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-[#5B94E5] text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Additional Notes</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes & Instructions
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors resize-none cursor-text"
                placeholder="Add any additional notes, instructions, or context for this metric"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}