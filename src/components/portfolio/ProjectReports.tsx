'use client';

import { useState } from 'react';
import { FileText, Plus, Link as LinkIcon, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { useProjectReports, useProjectReportActions } from '@/hooks/usePortfolio';
import { LinkReportModal } from './LinkReportModal';
import { useRouter } from 'next/navigation';

interface ProjectReportsProps {
  projectId: string;
}

export function ProjectReports({ projectId }: ProjectReportsProps) {
  const router = useRouter();
  const { reports, loading, error, refetch } = useProjectReports(projectId);
  const { unlinkReport, loading: actionLoading } = useProjectReportActions();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

  const handleUnlink = async (reportId: string) => {
    if (!confirm('Are you sure you want to unlink this report from the project?')) {
      return;
    }

    setUnlinkingId(reportId);
    const success = await unlinkReport(reportId);

    if (success) {
      refetch();
    }
    setUnlinkingId(null);
  };

  const handleLinkSuccess = () => {
    setShowLinkModal(false);
    refetch();
  };

  const handleCreateReport = () => {
    // Navigate to create report page with projectId pre-filled
    router.push(`/reports/create?projectId=${projectId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'CLOSED':
        return 'bg-red-100 text-red-800';
      case 'ARCHIVED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#5B94E5]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-600 mb-2">Error loading reports</p>
        <p className="text-xs text-gray-500">{error}</p>
        <button
          onClick={refetch}
          className="mt-4 text-sm text-[#5B94E5] hover:text-[#4A7BC8] font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Project Reports</h3>
          <p className="text-sm text-gray-600 mt-1">
            {reports.length} {reports.length === 1 ? 'report' : 'reports'} linked to this project
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowLinkModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
            Link Existing Report
          </button>
          <button
            onClick={handleCreateReport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New Report
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-base font-medium text-gray-900 mb-2">No reports yet</h3>
          <p className="text-sm text-gray-600 mb-4">
            Create a new report for this project or link an existing one
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowLinkModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              Link Existing Report
            </button>
            <button
              onClick={handleCreateReport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Report
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="flex items-start justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {report.title}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  {report.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {report.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{report.responseCount || 0} responses</span>
                    <span>•</span>
                    <span>{report.questions?.length || 0} questions</span>
                    {report.category && (
                      <>
                        <span>•</span>
                        <span>{report.category}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => router.push(`/reports/${report._id}`)}
                  className="p-2 text-gray-600 hover:text-[#5B94E5] hover:bg-gray-50 rounded-lg transition-colors"
                  title="View report"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleUnlink(report._id)}
                  disabled={actionLoading || unlinkingId === report._id}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Unlink from project"
                >
                  {unlinkingId === report._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showLinkModal && (
        <LinkReportModal
          projectId={projectId}
          onClose={() => setShowLinkModal(false)}
          onSuccess={handleLinkSuccess}
        />
      )}
    </div>
  );
}
