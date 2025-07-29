/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import Link from 'next/link';
import { Users, Clock, MoreHorizontal } from 'lucide-react';

interface Report {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  status: 'draft' | 'published' | 'closed';
  responseCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ReportsListProps {
  reports: Report[];
  view: 'grid' | 'list';
  onRefetch: () => void;
}

function ReportCard({ report }: { report: Report }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link 
            href={`/reports/${report._id}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 block"
          >
            {report.title}
          </Link>
          {report.description && (
            <p className="text-gray-600 mt-1 text-sm line-clamp-2">{report.description}</p>
          )}
        </div>
        <div className="ml-4">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {report.responseCount} responses
          </span>
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {formatDate(report.createdAt)}
          </span>
        </div>
        {report.category && (
          <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            {report.category}
          </span>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <Link
          href={`/reports/${report._id}`}
          className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-center"
        >
          Edit
        </Link>
        <Link
          href={`/reports/${report._id}/responses`}
          className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
        >
          View Data
        </Link>
      </div>
    </div>
  );
}

export function ReportsList({ reports, view, onRefetch }: ReportsListProps) {
  if (view === 'list') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/reports/${report._id}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {report.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      report.status === 'published' ? 'bg-green-100 text-green-800' :
                      report.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.category || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.responseCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link href={`/reports/${report._id}`} className="text-blue-600 hover:text-blue-900">
                      Edit
                    </Link>
                    <Link href={`/reports/${report._id}/responses`} className="text-green-600 hover:text-green-900">
                      Data
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reports.map((report) => (
        <ReportCard key={report._id} report={report} />
      ))}
    </div>
  );
}
