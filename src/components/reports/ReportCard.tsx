'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { 
  MoreHorizontal, 
  Eye, 
  Edit3, 
  Copy, 
  Trash2, 
  Share2,
  Settings,
  BarChart3,
  Globe,
  Lock,
  Loader2
} from 'lucide-react';
import { duplicateReport, deleteReport } from '@/lib/api/reports';
import { EmailSharingModal } from '@/components/reports/EmailSharingModal';

interface Report {
  _id: string;
  title: string;
  description?: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
  responseCount: number;
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
  shareToken?: string;
}

interface ReportCardProps {
  report: Report;
  view: 'grid' | 'list';
  onRefetch: () => void;
}

export function ReportCard({ report, view, onRefetch }: ReportCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const reportId = report._id;

  if (!reportId) {
    console.error('Report missing ID:', report);
    return null;
  }

  const handleDuplicate = async () => {
    try {
      setLoading(true);
      await duplicateReport(reportId);
      onRefetch();
    } catch (error) {
      console.error('Error duplicating report:', error);
    } finally {
      setLoading(false);
      setShowDropdown(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = confirm(`Are you sure you want to delete "${report.title}"? This action cannot be undone.`);
    
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteReport(reportId);
      onRefetch();
    } catch (error) {
      console.error('Error deleting report:', error);
    } finally {
      setLoading(false);
      setShowDropdown(false);
    }
  };

const handleShare = async () => {
  if (report.status !== 'PUBLISHED') {
    alert('Only published reports can be shared.');
    return;
  }

  const shareUrl = `${window.location.origin}/reports/public/${report.shareToken || reportId}`;
  
  try {
    await navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy link:', error);
    const textArea = document.createElement('textarea');
    textArea.value = shareUrl;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('Share link copied to clipboard!');
  }
  setShowDropdown(false);
};

  const handleNavigate = (path: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    window.location.href = path;
    setShowDropdown(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'DRAFT':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'CLOSED':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Impact Assessment': 'bg-blue-50 text-blue-700',
      'Feedback': 'bg-purple-50 text-purple-700',
      'Health': 'bg-red-50 text-red-700',
      'Education': 'bg-indigo-50 text-indigo-700',
      'Agriculture': 'bg-green-50 text-green-700',
      'Community': 'bg-orange-50 text-orange-700',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-50 text-gray-700';
  };

  // Grid View
  if (view === 'grid') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow relative flex flex-col h-full cursor-pointer group">
        <Link href={`/reports/${reportId}`} className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 pb-4 flex-1">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 truncate group-hover:text-[#5B94E5] transition-colors">
                  {report.title}
                </h3>
                {report.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {report.description}
                  </p>
                )}
              </div>

              <div className="relative ml-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDropdown(!showDropdown);
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors z-10"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  ) : (
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-20">
                    <div className="py-1">
                      <button
                        onClick={(e) => handleNavigate(`/reports/${reportId}`, e)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleNavigate(`/reports/${reportId}/responses`, e)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Responses
                      </button>
                      <button
                        onClick={(e) => handleNavigate(`/reports/${reportId}/settings`, e)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      
                      <div className="border-t border-gray-100 my-1"></div>

                      {report.status === 'PUBLISHED' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.open(`/reports/public/${report.shareToken || reportId}`, '_blank');
                              setShowDropdown(false);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                          >
                            <Eye className="w-4 h-4" />
                            Preview
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleShare();
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                          >
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDuplicate();
                        }}
                        disabled={loading}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-left"
                      >
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </button>
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete();
                        }}
                        disabled={loading}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 text-left"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status and Category Badges */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(report.status)}`}>
                {report.status === 'PUBLISHED' && report.isPublic && <Globe className="w-3 h-3" />}
                {report.status === 'PUBLISHED' && !report.isPublic && <Lock className="w-3 h-3" />}
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(report.category)}`}>
                {report.category}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 mt-auto">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  <span className="font-medium">{report.responseCount}</span> responses
                </span>
                <span className="text-gray-400">
                  Updated {formatDistanceToNow(new Date(report.updatedAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Click overlay to close dropdown */}
        {showDropdown && (
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="hover:bg-gray-50 transition-colors">
      <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
        {/* Name */}
        <div className="col-span-4">
          <Link 
            href={`/reports/${reportId}`}
            className="block"
          >
            <div className="font-medium text-gray-900 hover:text-[#5B94E5] transition-colors truncate">
              {report.title}
            </div>
            {report.description && (
              <div className="text-sm text-gray-500 truncate mt-1">
                {report.description}
              </div>
            )}
          </Link>
        </div>

        {/* Status */}
        <div className="col-span-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(report.status)}`}>
            {report.status === 'PUBLISHED' && report.isPublic && <Globe className="w-3 h-3" />}
            {report.status === 'PUBLISHED' && !report.isPublic && <Lock className="w-3 h-3" />}
            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
          </span>
        </div>

        {/* Category */}
        <div className="col-span-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(report.category)}`}>
            {report.category}
          </span>
        </div>

        {/* Responses */}
        <div className="col-span-2">
          <span className="text-sm text-gray-900 font-medium">{report.responseCount}</span>
        </div>

        {/* Updated */}
        <div className="col-span-1">
          <span className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(report.updatedAt), { addSuffix: true })}
          </span>
        </div>

        {/* Actions */}
        <div className="col-span-1 flex justify-end">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              ) : (
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleNavigate(`/reports/${reportId}`)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleNavigate(`/reports/${reportId}/responses`)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Responses
                  </button>
                  <button
                    onClick={() => handleNavigate(`/reports/${reportId}/settings`)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>

                  {report.status === 'PUBLISHED' && (
                    <>
                      <button
                        onClick={() => {
                          window.open(`/reports/public/${report.shareToken || reportId}`, '_blank');
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                      <button
                        onClick={handleShare}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={handleDuplicate}
                    disabled={loading}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-left"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Click overlay to close dropdown */}
        {showDropdown && (
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
        )}
        {showEmailModal && (
          <EmailSharingModal
            isOpen={showEmailModal}
            onClose={() => setShowEmailModal(false)}
            report={report}
            shareUrl={`${window.location.origin}/reports/public/${report.shareToken || reportId}`}
          />
        )}
      </div>
    </div>
  );
}