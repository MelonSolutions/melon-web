/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useImpactMetricActions } from '@/hooks/useImpactMetrics';
import { 
  CreateImpactMetricRequest, 
  MetricType, 
  TrackingStatus,
  getMetricTypeDisplayName 
} from '@/types/impact-metrics';

export default function CreateImpactMetricPage() {
  const router = useRouter();
  const { createMetric, loading } = useImpactMetricActions();
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [formData, setFormData] = useState<CreateImpactMetricRequest>({
    name: '',
    description: '',
    target: 0,
    metricType: 'NUMBER',
    startDate: '',
    endDate: '',
    scoringWeight: 0,
    actualValue: 0,
  });

  const metricTypes: { value: MetricType; label: string; description: string }[] = [
    { value: 'NUMBER', label: 'Number', description: 'Count of items (e.g., households, students)' },
    { value: 'PERCENTAGE', label: 'Percentage', description: 'Percentage value (e.g., 85%)' },
    { value: 'CURRENCY', label: 'Currency', description: 'Monetary amount (e.g., $10,000)' },
    { value: 'BOOLEAN', label: 'Yes/No', description: 'True/false or achieved/not achieved' },
  ];

  const handleSubmit = async (isDraft = false) => {
    try {
      // Validation
      if (!formData.name.trim()) {
        alert('Please enter a metric name');
        return;
      }

      if (!formData.startDate || !formData.endDate) {
        alert('Please select start and end dates');
        return;
      }

      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        alert('End date must be after start date');
        return;
      }

      if (formData.target <= 0) {
        alert('Please enter a valid target value');
        return;
      }

      if (formData.scoringWeight <= 0 || formData.scoringWeight > 100) {
        alert('Scoring weight must be between 1 and 100');
        return;
      }

      const metricData: CreateImpactMetricRequest = {
        ...formData,
        trackingStatus: isDraft ? 'PAUSED' : 'ON_TRACK',
      };
      
      const result = await createMetric(metricData);
      
      if (result) {
        router.push(`/impact-metrics/${result._id}?created=true`);
      }
    } catch (error) {
      console.error('Error creating metric:', error);
      alert('Failed to create metric. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
  };

  const isFormValid = formData.name && formData.target > 0 && formData.scoringWeight > 0 && 
    formData.startDate && formData.endDate && formData.metricType;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/impact-metrics" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Create Impact Metric</h1>
              <p className="text-sm text-gray-500">Define a new impact metric with auto-scoring</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/impact-metrics')}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button 
              onClick={() => handleSubmit(false)}
              disabled={!isFormValid || loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Metric
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metric Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                placeholder="e.g., Number of Households Reached"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors resize-none"
                placeholder="Brief description of what this metric measures"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metric Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.metricType}
                  onChange={(e) => setFormData(prev => ({ ...prev, metricType: e.target.value as MetricType }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] bg-white transition-colors"
                  required
                >
                  {metricTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scoring Weight (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.scoringWeight || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, scoringWeight: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                  placeholder="20"
                  min="1"
                  max="100"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Weight for auto-scoring (1-100%)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Target & Timeline */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Target & Timeline</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.target || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, target: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                  placeholder="1000"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Value
                </label>
                <input
                  type="number"
                  value={formData.actualValue || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, actualValue: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Current actual value (optional)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Report Integration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Report Integration</h2>
          <p className="text-sm text-gray-500 mb-6">Link this metric to a report question for automatic data updates</p>
          
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-2">Report integration coming soon</p>
            <p className="text-xs text-gray-400">You&rsquo;ll be able to link metrics to report questions for automatic updates</p>
          </div>
        </div>

        {/* Tags & Classification */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Tags & Classification</h2>
          
          <div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-[#5B94E5] text-white rounded-lg hover:bg-[#4A7BC8] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}