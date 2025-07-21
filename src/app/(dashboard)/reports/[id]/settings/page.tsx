'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Share2, Trash2, Copy, Globe, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useReport } from '@/hooks/useReports';
import { updateReport, deleteReport, getShareLink } from '@/lib/api/reports';
import { ReportCategory } from '@/types/reports';

export default function ReportSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  
  const { report, loading: reportLoading, refetch } = useReport(reportId);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Impact Assessment' as ReportCategory,
    allowMultipleResponses: false,
    collectEmail: false,
    isPublic: false,
  });

  const categories: ReportCategory[] = [
    'Impact Assessment',
    'Feedback',
    'Health',
    'Education',
    'Agriculture',
    'Community',
  ];

  useEffect(() => {
    if (report) {
      setFormData({
        title: report.title,
        description: report.description || '',
        category: report.category as ReportCategory,
        allowMultipleResponses: false, 
        collectEmail: false,
        isPublic: false,
      });
    }
  }, [report]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateReport(reportId, formData);
      await refetch();
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      try {
        setLoading(true);
        await deleteReport(reportId);
        router.push('/reports');
      } catch (error) {
        console.error('Error deleting report:', error);
        alert('Failed to delete report');
        setLoading(false);
      }
    }
  };

  const handleGenerateShareLink = async () => {
    try {
      const { shareUrl } = await getShareLink(reportId);
      setShareUrl(shareUrl);
      navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error generating share link:', error);
      alert('Failed to generate share link');
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
            <Link href={`/reports/${reportId}`} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Report Settings</h1>
              <p className="text-sm text-gray-500">{report.title}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2 inline" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* General Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h2>
          
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter report title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter report description"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ReportCategory }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Response Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Response Settings</h2>
          
          <div className="space-y-4">
            {/* Allow Multiple Responses */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Allow Multiple Responses</h3>
                <p className="text-sm text-gray-500">Allow respondents to submit multiple responses</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowMultipleResponses}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowMultipleResponses: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Collect Email */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Collect Email Addresses</h3>
                <p className="text-sm text-gray-500">Require respondents to provide their email address</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.collectEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, collectEmail: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Public Access */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Public Access</h3>
                <p className="text-sm text-gray-500">Allow anyone with the link to respond</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Sharing */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Sharing & Access</h2>
          
          <div className="space-y-4">
            {/* Current Status */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              {formData.isPublic ? (
                <Globe className="w-5 h-5 text-green-600" />
              ) : (
                <Lock className="w-5 h-5 text-gray-600" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {formData.isPublic ? 'Public - Anyone with link can respond' : 'Private - Only invited users can respond'}
                </p>
                <p className="text-sm text-gray-500">
                  Status: <span className="capitalize">{report.status}</span> • {report.responseCount} responses
                </p>
              </div>
            </div>

            {/* Share Link */}
            {report.status === 'published' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Link
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={shareUrl || `${window.location.origin}/reports/public/${reportId}`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                  <button
                    onClick={handleGenerateShareLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Share this link to collect responses from your audience
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex space-x-3">
              <button
                onClick={handleGenerateShareLink}
                className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Generate Share Link
              </button>
              <button className="flex items-center px-4 py-2 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100">
                <Mail className="w-4 h-4 mr-2" />
                Send via Email
              </button>
            </div>
          </div>
        </div>

        {/* Report Statistics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Report Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{report.responseCount}</p>
              <p className="text-sm text-gray-500">Total Responses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{report.questions?.length || 0}</p>
              <p className="text-sm text-gray-500">Questions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{report.status === 'published' ? 'Active' : 'Inactive'}</p>
              <p className="text-sm text-gray-500">Status</p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-6">Danger Zone</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Delete Report</h3>
                <p className="text-sm text-gray-500">
                  Permanently delete this report and all its responses. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}