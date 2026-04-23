/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Download, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Users,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useReport } from '@/hooks/useReports';
import { useReportResponses, useResponseAnalytics, useImpactMetricsProgress } from '@/hooks/useResponses';
import { formatDistanceToNow, format } from 'date-fns';
import { ReportNavigation } from '@/components/reports/navigation/ReportNavigation';
import OverviewStats from '@/components/reports/analytics/OverviewStats';
import ResponseTrends from '@/components/reports/analytics/ResponseTrends';
import QuestionBreakdown from '@/components/reports/analytics/QuestionBreakdown';

interface ResponsesPageProps {}

export default function ReportResponsesPage({}: ResponsesPageProps) {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  
  const { report, loading: reportLoading } = useReport(reportId);
  const { responses, loading: responsesLoading, pagination, refetch } = useReportResponses(reportId, {
    pageSize: 20,
    currentPage: 1,
  });
  const { analytics, loading: analyticsLoading } = useResponseAnalytics(reportId);
  const { progress, loading: progressLoading } = useImpactMetricsProgress(reportId);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'impact'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set());

  const handleExport = () => {
    if (!report || !responses) return;

    // Determine which responses to export
    const responsesToExport = selectedResponses.size > 0
      ? responses.filter(r => selectedResponses.has(r._id))
      : responses;

    if (responsesToExport.length === 0) {
      alert('No responses to export');
      return;
    }

    // Build CSV headers
    const headers = ['Response ID', 'Respondent Name', 'Respondent Email', 'Submitted At'];
    report.questions?.forEach(q => {
      headers.push(q.title);
    });

    // Build CSV rows
    const rows = responsesToExport.map(response => {
      const row = [
        response._id,
        response.respondentName || '',
        response.respondentEmail || '',
        format(new Date(response.submittedAt), 'yyyy-MM-dd HH:mm:ss')
      ];

      report.questions?.forEach(q => {
        const responses = response.responses || {};
        const responseData = responses[q.id as keyof typeof responses];
        if (responseData) {
          const value = (responseData as any)?.actualValue !== undefined
            ? (responseData as any).actualValue
            : (responseData as any)?.answer || '';
          row.push(String(value));
        } else {
          row.push('');
        }
      });

      return row;
    });

    // Create CSV content
    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${report.title}-responses-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleResponseSelection = (responseId: string) => {
    const newSelected = new Set(selectedResponses);
    if (newSelected.has(responseId)) {
      newSelected.delete(responseId);
    } else {
      newSelected.add(responseId);
    }
    setSelectedResponses(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedResponses.size === filteredResponses.length) {
      setSelectedResponses(new Set());
    } else {
      setSelectedResponses(new Set(filteredResponses.map(r => r._id)));
    }
  };

  const filteredResponses = responses?.filter(response =>
    Object.values(response.responses || {}).some(responseItem =>
      responseItem?.answer?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  const loading = reportLoading || responsesLoading;

  if (loading) {
    return (
      <div>
        <ReportNavigation currentPage="responses" />
        <div className="p-6 space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-9 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div>
        <ReportNavigation currentPage="responses" />
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

  const tabs = [
    { id: 'overview', label: 'Responses', count: responses?.length || 0 },
    { id: 'analytics', label: 'Analytics' },
    ...(progress && progress.totalMetrics > 0 ? [{ id: 'impact', label: 'Impact', count: progress.totalMetrics }] : [])
  ];

  return (
    <div>
      {/* Integrated Navigation */}
      <ReportNavigation currentPage="responses" />
      
      {/* Page Content */}
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-gray-900">Responses & Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">View and analyze form responses</p>
          </div>

          <div className="flex items-center gap-2">
            {selectedResponses.size > 0 && (
              <span className="text-sm text-gray-600">
                {selectedResponses.size} selected
              </span>
            )}
            <button
              onClick={handleExport}
              disabled={!responses || responses.length === 0}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {selectedResponses.size > 0 ? `Export Selected (${selectedResponses.size})` : 'Export All'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-semibold text-gray-900">{responses?.length || 0}</div>
            <div className="text-sm text-gray-500">Total Responses</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-semibold text-gray-900">94%</div>
            <div className="text-sm text-gray-500">Completion Rate</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-semibold text-gray-900">3m 24s</div>
            <div className="text-sm text-gray-500">Avg. Time</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-semibold text-gray-900">
              {responses?.length > 0 
                ? formatDistanceToNow(new Date(responses[0].submittedAt), { addSuffix: true })
                : 'None'
              }
            </div>
            <div className="text-sm text-gray-500">Last Response</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#5B94E5] text-[#5B94E5]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Response List */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Responses</h3>
                  {filteredResponses.length > 0 && (
                    <button
                      onClick={toggleSelectAll}
                      className="text-xs text-[#5B94E5] hover:text-blue-700 font-medium"
                    >
                      {selectedResponses.size === filteredResponses.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search responses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors w-full"
                  />
                </div>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {filteredResponses.length > 0 ? (
                  filteredResponses.map((response, index) => (
                    <div
                      key={response._id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        selectedResponse?._id === response._id ? 'bg-blue-50 border-r-2 border-[#5B94E5]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedResponses.has(response._id)}
                          onChange={() => toggleResponseSelection(response._id)}
                          className="mt-1 w-4 h-4 text-[#5B94E5] focus:ring-[#5B94E5] focus:ring-offset-0 border-gray-300 rounded"
                        />
                        <button
                          onClick={() => setSelectedResponse(response)}
                          className="flex-1 text-left"
                        >
                          <div className="font-medium text-gray-900 mb-1">
                            Response #{response._id.slice(-6)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(response.submittedAt), { addSuffix: true })}
                          </div>
                          {response.respondentName && (
                            <div className="text-sm text-gray-600 mt-1">{response.respondentName}</div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {Object.keys(response.responses || {}).length} answers
                          </div>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 px-4">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
                    <p className="text-sm text-gray-500">
                      {searchTerm
                        ? 'No responses match your search criteria.'
                        : 'Responses will appear here once people start submitting your form.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Response Details */}
            <div className="lg:col-span-2">
              {selectedResponse ? (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="border-b border-gray-200 pb-4 mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      Response #{selectedResponse._id.slice(-6)}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1">
                      Submitted {format(new Date(selectedResponse.submittedAt), 'MMM d, yyyy at h:mm a')}
                    </div>
                    {selectedResponse.respondentName && (
                      <div className="text-sm text-gray-600 mt-1">
                        By: {selectedResponse.respondentName}
                        {selectedResponse.respondentEmail && ` (${selectedResponse.respondentEmail})`}
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {Object.entries(selectedResponse.responses || {}).map(([questionId, response], index) => {
                      const question = report.questions?.find(q => q.id === questionId);
                      return (
                        <div key={questionId || index}>
                          <h4 className="font-medium text-gray-900 mb-2">
                            {question?.title || `Question ${index + 1}`}
                          </h4>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-gray-900">
                              {(response as any)?.actualValue !== undefined
                                ? `Value: ${(response as any).actualValue}`
                                : (response as any)?.answer || 'No response'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a response</h3>
                  <p className="text-sm text-gray-500">
                    Choose a response from the list to view details.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <OverviewStats reportId={reportId} />
            <ResponseTrends reportId={reportId} />
            <QuestionBreakdown reportId={reportId} />
          </div>
        )}

        {activeTab === 'impact' && progress && (
          <div className="space-y-6">
            {/* Overall Progress */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Overall Impact Progress</h3>
                <span className="text-2xl font-semibold text-[#5B94E5]">{progress.overallProgress}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div 
                  className="bg-[#5B94E5] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.overallProgress}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-semibold text-green-600">{progress.summary.achieved}</div>
                  <div className="text-sm text-gray-500">Achieved</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-yellow-600">{progress.summary.onTrack}</div>
                  <div className="text-sm text-gray-500">On Track</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-red-600">{progress.summary.failing}</div>
                  <div className="text-sm text-gray-500">Behind</div>
                </div>
              </div>
            </div>

            {/* Individual Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {progress.metrics.map((metric) => {
                const statusColor = {
                  'Achieved': 'text-green-700 bg-green-50',
                  'On Track': 'text-yellow-700 bg-yellow-50',
                  'Fail': 'text-red-700 bg-red-50',
                }[metric.trackingStatus] || 'text-gray-700 bg-gray-50';

                return (
                  <div key={metric.metricId} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">{metric.metricName}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                        {metric.trackingStatus}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="font-medium">{metric.progressPercentage}%</span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            metric.trackingStatus === 'Achieved' ? 'bg-green-500' :
                            metric.trackingStatus === 'On Track' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(metric.progressPercentage, 100)}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                        <div>
                          <span className="text-gray-500">Target:</span>
                          <div className="font-medium">{metric.target.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Actual:</span>
                          <div className="font-medium">{metric.actualValue.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
