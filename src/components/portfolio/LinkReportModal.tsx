'use client';

import { useState, useEffect } from 'react';
import { X, FileText, Loader2, Search, CheckCircle } from 'lucide-react';
import { useUnlinkedReports, useProjectReportActions } from '@/hooks/usePortfolio';

interface LinkReportModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function LinkReportModal({ projectId, onClose, onSuccess }: LinkReportModalProps) {
  const { reports, loading, error, fetch } = useUnlinkedReports();
  const { linkReport, loading: linking } = useProjectReportActions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const filteredReports = reports.filter((report) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      report.title?.toLowerCase().includes(query) ||
      report.description?.toLowerCase().includes(query) ||
      report.category?.toLowerCase().includes(query)
    );
  });

  const handleLink = async () => {
    if (!selectedReportId) return;

    const success = await linkReport(selectedReportId, projectId);
    if (success) {
      onSuccess();
    }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Link Existing Report</h2>
              <p className="text-sm text-gray-500">Select a report to link to this project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#5B94E5]" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-sm text-red-600 mb-2">Error loading reports</p>
              <p className="text-xs text-gray-500">{error}</p>
              <button
                onClick={fetch}
                className="mt-4 text-sm text-[#5B94E5] hover:text-[#4A7BC8] font-medium"
              >
                Try again
              </button>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="mx-auto h-8 w-8 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600">
                {searchQuery
                  ? 'No reports match your search'
                  : 'No unlinked reports available'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {!searchQuery && 'All reports are already linked to projects'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <div
                  key={report._id}
                  onClick={() => setSelectedReportId(report._id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedReportId === report._id
                      ? 'border-[#5B94E5] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
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
                    {selectedReportId === report._id && (
                      <CheckCircle className="w-5 h-5 text-[#5B94E5] flex-shrink-0 ml-3" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={linking}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleLink}
            disabled={!selectedReportId || linking}
            className="px-4 py-2 text-sm font-medium text-white bg-[#5B94E5] rounded-lg hover:bg-[#4A7BC8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {linking ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Linking...
              </span>
            ) : (
              'Link Report'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
