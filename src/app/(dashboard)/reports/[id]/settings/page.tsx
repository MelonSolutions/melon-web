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
  AlertCircle,
  ExternalLink,
  Loader2,
  FileSpreadsheet,
  Link2,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useReport } from '@/hooks/useReports';
import { updateReport, deleteReport, getShareLink, generateEditToken } from '@/lib/api/reports';
import { ReportCategory } from '@/types/reports';
import { ReportNavigation } from '@/components/reports/navigation/ReportNavigation';
import { useToast } from '@/components/ui/Toast';
import { EmailSharingModal } from '@/components/reports/EmailSharingModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://melon-core.onrender.com';

export default function ReportSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  const { addToast } = useToast();
  
  const { report, loading: reportLoading, refetch } = useReport(reportId);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('general');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [editTokenData, setEditTokenData] = useState<{ editToken: string; editUrl: string } | null>(null);
  const [showEditLinkModal, setShowEditLinkModal] = useState(false);
  const [isGeneratingEditLink, setIsGeneratingEditLink] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Impact Assessment' as ReportCategory,
    allowMultipleResponses: false,
    collectEmail: false,
    isPublic: false,
  });

  const categories: ReportCategory[] = [
    'IMPACT_ASSESSMENT',
    'FEEDBACK',
    'HEALTH',
    'EDUCATION',
    'AGRICULTURE',
    'COMMUNITY',
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
        allowMultipleResponses: report.allowMultipleResponses || false, 
        collectEmail: report.collectEmail || false,
        isPublic: report.isPublic || false,
      });
    }
  }, [report]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateReport(reportId, formData);
      await refetch();
      
      addToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your report settings have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      addToast({
        type: 'error',
        title: 'Failed to Save',
        message: 'There was an error saving your settings. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = confirm(
      `Are you sure you want to delete "${report?.title}"? This will permanently delete the report and all its responses. This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      setLoading(true);
      await deleteReport(reportId);
      
      addToast({
        type: 'success',
        title: 'Report Deleted',
        message: 'The report has been permanently deleted.',
      });
      
      router.push('/reports');
    } catch (error) {
      console.error('Error deleting report:', error);
      addToast({
        type: 'error',
        title: 'Failed to Delete',
        message: 'There was an error deleting the report. Please try again.',
      });
      setLoading(false);
    }
  };

  const handleGenerateShareLink = async () => {
    if (!report) return;
    
    if (report.status !== 'PUBLISHED') {
      addToast({
        type: 'warning',
        title: 'Report Not Published',
        message: 'Only published reports can be shared. Please publish the report first.',
      });
      return;
    }

    try {
      setShareLoading(true);
      const { shareUrl: newShareUrl } = await getShareLink(reportId);
      setShareUrl(newShareUrl);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(newShareUrl);
      
      addToast({
        type: 'success',
        title: 'Link Copied!',
        message: 'Share link has been copied to your clipboard.',
      });
    } catch (error) {
      console.error('Error generating share link:', error);
      addToast({
        type: 'error',
        title: 'Failed to Generate Link',
        message: 'There was an error generating the share link. Please try again.',
      });
    } finally {
      setShareLoading(false);
    }
  };

const handleEmailLink = () => {
  setShowEmailModal(true);
};

  const handleGenerateEditLink = async () => {
    if (!report) return;
    setIsGeneratingEditLink(true);
    try {
      const result = await generateEditToken(report._id);
      setEditTokenData(result);
      setShowEditLinkModal(true);
    } catch (error) {
      console.error('Failed to generate edit link:', error);
      addToast({
        type: 'error',
        title: 'Failed to Generate',
        message: 'Could not generate edit link. Please try again.',
      });
    } finally {
      setIsGeneratingEditLink(false);
    }
  };

  const copyEditLink = async () => {
    if (!editTokenData) return;
    try {
      await navigator.clipboard.writeText(editTokenData.editUrl);
      addToast({
        type: 'success',
        title: 'Link Copied!',
        message: 'Edit link has been copied to your clipboard.',
      });
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = editTokenData.editUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      addToast({
        type: 'success',
        title: 'Link Copied!',
        message: 'Edit link has been copied to your clipboard.',
      });
    }
  };

  const handleDownloadExcel = async () => {
    if (!report) return;
    setIsDownloadingExcel(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const response = await fetch(`${API_BASE_URL}/responses/${report._id}/export/excel`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ message: 'Export failed' }));
        throw new Error(errData.message || 'Export failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `report-responses-${report._id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      addToast({
        type: 'success',
        title: 'Download Started',
        message: 'Your Excel export is downloading.',
      });
    } catch (error: any) {
      console.error('Failed to download Excel:', error);
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: error.message || 'Failed to download Excel file.',
      });
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  if (reportLoading) {
    return (
      <div>
        <ReportNavigation currentPage="settings" />
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-9 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

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
      <ReportNavigation currentPage="settings" />
      
      <div className="p-6 space-y-6">
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

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
                  {report.status === 'PUBLISHED' ? (
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
                            disabled={shareLoading}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                          >
                            {shareLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
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
                          disabled={shareLoading}
                          className="flex items-center gap-2 px-4 py-2 text-[#5B94E5] bg-blue-50 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                          <Share2 className="w-4 h-4" />
                          Generate New Link
                        </button>
                        <button 
                          onClick={handleEmailLink}
                          className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-50 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          Email Link
                        </button>
                        <button
                          onClick={handleGenerateEditLink}
                          disabled={isGeneratingEditLink}
                          className="flex items-center gap-2 px-4 py-2 text-amber-700 bg-amber-50 text-sm font-medium rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
                        >
                          {isGeneratingEditLink ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Link2 className="w-4 h-4" />
                          )}
                          {isGeneratingEditLink ? 'Generating...' : 'Edit Link'}
                        </button>
                        <button
                          onClick={handleDownloadExcel}
                          disabled={isDownloadingExcel || report.responseCount === 0}
                          className="flex items-center gap-2 px-4 py-2 text-green-700 bg-green-50 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={report.responseCount === 0 ? 'No responses to export' : 'Download responses as Excel'}
                        >
                          {isDownloadingExcel ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <FileSpreadsheet className="w-4 h-4" />
                          )}
                          {isDownloadingExcel ? 'Exporting...' : 'Excel Export'}
                        </button>
                        <a
                          href={`/reports/public/${reportId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-50 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Preview Form
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-sm font-medium text-gray-900 mb-1">Report Not Published</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Publish your report to generate a share link and start collecting responses.
                      </p>
                      <Link
                        href={`/reports/${reportId}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Go to Edit & Publish
                      </Link>
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
                        report.status === 'PUBLISHED' 
                          ? 'bg-green-50 text-green-700' 
                          : report.status === 'DRAFT'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-gray-50 text-gray-700'
                      }`}>
                        {report.status === 'PUBLISHED' ? (
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
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Delete Report</h3>
                        <p className="text-sm text-gray-500">
                          Permanently delete this report and all its responses. This action cannot be undone.
                        </p>
                        <div className="mt-2 text-xs text-red-600">
                          ⚠️ This will delete {report.responseCount} responses and cannot be recovered.
                        </div>
                      </div>
                      <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="ml-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        {loading ? 'Deleting...' : 'Delete Report'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {showEmailModal && (
              <EmailSharingModal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                report={report}
                shareUrl={shareUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/reports/public/${reportId}`}
              />
            )}

            {/* Edit Link Modal */}
            {showEditLinkModal && editTokenData && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Link Generated</h3>
                    <button
                      onClick={() => setShowEditLinkModal(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Share this link with collaborators to allow them to edit survey questions <strong>without logging in</strong>.
                  </p>
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-4 break-all text-sm text-gray-700 font-mono">
                    {editTokenData.editUrl}
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mb-5">
                    <p className="text-xs text-amber-800">
                      ⚠️ <strong>Security note:</strong> Anyone with this link can edit the survey&apos;s title, description, and questions. They cannot modify settings, delete the report, or access responses.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={copyEditLink}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7EC9] transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </button>
                    <button
                      onClick={() => setShowEditLinkModal(false)}
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
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