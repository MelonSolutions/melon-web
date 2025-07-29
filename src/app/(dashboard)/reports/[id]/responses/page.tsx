/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Filter, Search, Eye, MoreHorizontal, Users, Clock, TrendingUp, FileText } from 'lucide-react';
import Link from 'next/link';
import { useReport } from '@/hooks/useReports';
import { useReportResponses, useResponseAnalytics, useImpactMetricsProgress } from '@/hooks/useResponses';
import { formatDistanceToNow } from 'date-fns';

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
  
  const [activeTab, setActiveTab] = useState<'responses' | 'summary' | 'individual' | 'impact'>('responses');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<any>(null);

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting responses...');
  };

  const filteredResponses = responses.filter(response =>
    Object.values(response.responses).some(responseItem =>
      responseItem.answer?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const loading = reportLoading || responsesLoading;

  if (loading) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href={`/reports/${reportId}`}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
            <p className="text-gray-600">Responses and Analytics</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <Link
            href={`/reports/${reportId}/settings`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Settings
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Responses</p>
              <p className="text-2xl font-bold text-gray-900">{responses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {responses.length > 0 ? '94%' : '0%'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Time</p>
              <p className="text-2xl font-bold text-gray-900">3m 24s</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Response</p>
              <p className="text-sm font-bold text-gray-900">
                {responses.length > 0 
                  ? formatDistanceToNow(new Date(responses[0].submittedAt), { addSuffix: true })
                  : 'No responses'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('responses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'responses'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Responses ({responses.length})
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'summary'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'individual'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Individual
          </button>
          {progress && progress.totalMetrics > 0 && (
            <button
              onClick={() => setActiveTab('impact')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'impact'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Impact Metrics ({progress.totalMetrics})
            </button>
          )}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'responses' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search responses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>

          {/* Responses Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Respondent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResponses.map((response) => (
                    <tr key={response._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{response._id.slice(-6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDistanceToNow(new Date(response.submittedAt), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {response.respondentName || response.respondentEmail || 'Anonymous'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {response.responses.length} questions
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedResponse(response)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredResponses.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No responses</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'No responses match your search.' : 'No responses have been submitted yet.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="space-y-6">
          {!analyticsLoading && analytics.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analytics.map((analytic) => {
                const question = report.questions?.find(q => q.id === analytic._id);
                return (
                  <div key={analytic._id} className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {question?.title || `Question ${analytic._id}`}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Responses</span>
                        <span className="font-semibold">{analytic.totalResponses}</span>
                      </div>
                      {analytic.avgActualValue && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Average Value</span>
                          <span className="font-semibold">{analytic.avgActualValue.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No analytics data available</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'individual' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Response List */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Individual Responses</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {responses.map((response) => (
                <button
                  key={response._id}
                  onClick={() => setSelectedResponse(response)}
                  className={`w-full p-4 text-left hover:bg-gray-50 ${
                    selectedResponse?._id === response._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <p className="font-medium text-gray-900">Response #{response._id.slice(-6)}</p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(response.submittedAt), { addSuffix: true })}
                  </p>
                  {response.respondentName && (
                    <p className="text-sm text-gray-600">{response.respondentName}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Response Details */}
          <div className="lg:col-span-2">
            {selectedResponse ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Response #{selectedResponse._id.slice(-6)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Submitted {formatDistanceToNow(new Date(selectedResponse.submittedAt), { addSuffix: true })}
                  </p>
                  {selectedResponse.respondentName && (
                    <p className="text-sm text-gray-600 mt-1">
                      By: {selectedResponse.respondentName}
                      {selectedResponse.respondentEmail && ` (${selectedResponse.respondentEmail})`}
                    </p>
                  )}
                </div>

                <div className="space-y-6">
                  {selectedResponse.responses.map((response: any, index: number) => {
                    const question = report.questions?.find(q => q.id === response.questionId);
                    return (
                      <div key={response.questionId || index}>
                        <h4 className="font-medium text-gray-900 mb-2">
                          {question?.title || `Question ${index + 1}`}
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-900">
                            {response.actualValue !== undefined 
                              ? `Value: ${response.actualValue}`
                              : response.answer || 'No response'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Response Metadata */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Response Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Submitted:</span>
                      <p className="font-medium">
                        {new Date(selectedResponse.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">IP Address:</span>
                      <p className="font-medium">{selectedResponse.ipAddress || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Select a response</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a response from the list to view details.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'impact' && progress && (
        <div className="space-y-6">
          {/* Overall Progress Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Overall Impact Progress</h3>
              <span className="text-2xl font-bold text-blue-600">{progress.overallProgress}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress.overallProgress}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{progress.summary.achieved}</p>
                <p className="text-sm text-gray-500">Achieved</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{progress.summary.onTrack}</p>
                <p className="text-sm text-gray-500">On Track</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{progress.summary.failing}</p>
                <p className="text-sm text-gray-500">Behind</p>
              </div>
            </div>
          </div>

          {/* Individual Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {progress.metrics.map((metric) => {
              const statusColor = {
                'Achieved': 'text-green-600 bg-green-100',
                'On Track': 'text-yellow-600 bg-yellow-100',
                'Fail': 'text-red-600 bg-red-100',
              }[metric.trackingStatus] || 'text-gray-600 bg-gray-100';

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
                      <span className="font-semibold">{metric.progressPercentage}%</span>
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

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Target:</span>
                        <p className="font-medium">{metric.target.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Actual:</span>
                        <p className="font-medium">{metric.actualValue.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Weight:</span>
                        <p className="font-medium">{metric.scoringWeight}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Responses:</span>
                        <p className="font-medium">{metric.responseCount}</p>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Timeline: {new Date(metric.startDate).toLocaleDateString()} - {new Date(metric.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}