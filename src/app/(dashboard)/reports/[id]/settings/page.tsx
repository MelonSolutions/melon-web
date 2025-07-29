'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Save, 
  Share2, 
  Trash2, 
  Copy, 
  Globe, 
  Lock, 
  Mail,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useReport } from '@/hooks/useReports';
import { updateReport, deleteReport, getShareLink } from '@/lib/api/reports';
import { ReportCategory } from '@/types/reports';
import { ReportNavigation } from '@/components/reports/navigation/ReportNavigation';

export default function ReportSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  
  const { report, loading: reportLoading, refetch } = useReport(reportId);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [activeSection, setActiveSection] = useState('general');
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

  const sections = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'responses', label: 'Responses', icon: '📝' },
    { id: 'sharing', label: 'Sharing', icon: '🔗' },
    { id: 'danger', label: 'Advanced', icon: '⚠️' },
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
      // Show success feedback
    } catch (error) {
      console.error('Error saving settings:', error);
      // Show error feedback
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
        setLoading(false);
      }
    }
  };

  const handleGenerateShareLink = async () => {
    try {
      const { shareUrl } = await getShareLink(reportId);
      setShareUrl(shareUrl);
      navigator.clipboard.writeText(shareUrl);
    } catch (error) {
      console.error('Error generating share link:', error);
    }
  };

  if (reportLoading) {
    return (
      <div>
        <ReportNavigation currentPage="settings" />
        <div className="p-6 space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-9 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-6">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i}>
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div>
        <ReportNavigation currentPage="settings" />
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-gray-400 text-sm mb-2">Report not found</div>
            <Link href="/reports" className="text-sm text-[#5B94E5] hover:text-blue-700 font-medium">
              Back to Reports
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Integrated Navigation */}
      <ReportNavigation currentPage="settings" />
      
      {/* Page Content */}
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Configure your report settings and preferences</p>
          </div>

          <button 
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-[#5B94E5]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{section.icon}</span>
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* General Settings */}
            {activeSection === 'general' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">General Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                      placeholder="Enter report title"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                      placeholder="Enter report description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ReportCategory }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
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
            )}

            {/* Response Settings */}
            {activeSection === 'responses' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Response Settings</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">Allow Multiple Responses</h3>
                      <p className="text-sm text-gray-500">Allow respondents to submit multiple responses to this form</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={formData.allowMultipleResponses}
                        onChange={(e) => setFormData(prev => ({ ...prev, allowMultipleResponses: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5B94E5]"></div>
                    </label>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">Collect Email Addresses</h3>
                      <p className="text-sm text-gray-500">Require respondents to provide their email address</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={formData.collectEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, collectEmail: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5B94E5]"></div>
                    </label>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">Public Access</h3>
                      <p className="text-sm text-gray-500">Allow anyone with the link to respond to this form</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5B94E5]"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Sharing Settings */}
            {activeSection === 'sharing' && (
              <div className="space-y-6">
                {/* Current Status */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Sharing & Access</h2>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                    {formData.isPublic ? (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Globe className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Public Access Enabled</div>
                          <div className="text-sm text-gray-500">Anyone with the link can respond</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <Lock className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Private Access</div>
                          <div className="text-sm text-gray-500">Only invited users can respond</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Share Link */}
                  {report.status === 'published' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Share Link
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={shareUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/reports/public/${reportId}`}
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
                          />
                          <button
                            onClick={handleGenerateShareLink}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            Copy
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Share this link to collect responses from your audience
                        </p>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleGenerateShareLink}
                          className="flex items-center gap-2 px-4 py-2 text-[#5B94E5] bg-blue-50 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                          Generate New Link
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-50 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
                          <Mail className="w-4 h-4" />
                          Email Link
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Report Statistics */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Report Statistics</h3>
                  
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-gray-900">{report.responseCount}</div>
                      <div className="text-sm text-gray-500">Responses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-gray-900">{report.questions?.length || 0}</div>
                      <div className="text-sm text-gray-500">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'published' 
                          ? 'bg-green-50 text-green-700' 
                          : report.status === 'draft'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-gray-50 text-gray-700'
                      }`}>
                        {report.status === 'published' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">Status</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            {activeSection === 'danger' && (
              <div className="bg-white rounded-lg border border-red-200 p-6">
                <h2 className="text-lg font-medium text-red-600 mb-6">Advanced Settings</h2>
                
                <div className="space-y-6">
                  <div className="border border-red-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Delete Report</h3>
                        <p className="text-sm text-gray-500">
                          Permanently delete this report and all its responses. This action cannot be undone.
                        </p>
                      </div>
                      <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="ml-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
