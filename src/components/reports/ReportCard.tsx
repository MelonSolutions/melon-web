'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Share2, 
  Copy, 
  Trash2, 
  Users,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Report {
  _id: string;
  title: string;
  description?: string;
  category: string;
  status: 'draft' | 'published' | 'closed';
  responseCount: number;
  createdAt: string;
  updatedAt: string;
  lastResponseAt?: string;
}

interface ReportCardProps {
  report: Report;
  view: 'grid' | 'list';
  onRefetch: () => void;
}

export function ReportCard({ report, view, onRefetch }: ReportCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Impact Assessment':
        return 'bg-blue-100 text-blue-800';
      case 'Feedback':
        return 'bg-purple-100 text-purple-800';
      case 'Health':
        return 'bg-green-100 text-green-800';
      case 'Education':
        return 'bg-orange-100 text-orange-800';
      case 'Agriculture':
        return 'bg-yellow-100 text-yellow-800';
      case 'Community':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDuplicate = async () => {
    // TODO: Implement duplicate functionality
    console.log('Duplicate report:', report._id);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this report?')) {
      // TODO: Implement delete functionality
      console.log('Delete report:', report._id);
      setShowMenu(false);
      onRefetch();
    }
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share report:', report._id);
    setShowMenu(false);
  };

  if (view === 'list') {
    return (
      <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-4">
            <Link 
              href={`/reports/${report._id}`}
              className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
            >
              {report.title}
            </Link>
            {report.description && (
              <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                {report.description}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(report.category)}`}>
              {report.category}
            </span>
          </div>

          <div className="col-span-2">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(report.status)}`}>
              {report.status}
            </span>
          </div>

          <div className="col-span-2">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-1" />
              {report.responseCount} responses
            </div>
          </div>

          <div className="col-span-1">
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(report.updatedAt), { addSuffix: true })}
            </span>
          </div>

          <div className="col-span-1 relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <Link
                    href={`/reports/${report._id}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    <Edit className="w-4 h-4 mr-3" />
                    Edit
                  </Link>
                  <Link
                    href={`/reports/${report._id}/responses`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    <Eye className="w-4 h-4 mr-3" />
                    View Responses
                  </Link>
                  <button
                    onClick={handleShare}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Share2 className="w-4 h-4 mr-3" />
                    Share
                  </button>
                  <button
                    onClick={handleDuplicate}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Copy className="w-4 h-4 mr-3" />
                    Duplicate
                  </button>
                  <div className="border-t border-gray-100"></div>
                  <button
                    onClick={handleDelete}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow relative">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
            <div className="py-1">
              <Link
                href={`/reports/${report._id}`}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowMenu(false)}
              >
                <Edit className="w-4 h-4 mr-3" />
                Edit
              </Link>
              <Link
                href={`/reports/${report._id}/responses`}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowMenu(false)}
              >
                <Eye className="w-4 h-4 mr-3" />
                View Responses
              </Link>
              {report.status === 'published' && (
                <a
                  href={`/reports/public/${report._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowMenu(false)}
                >
                  <ExternalLink className="w-4 h-4 mr-3" />
                  View Public Form
                </a>
              )}
              <button
                onClick={handleShare}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Share2 className="w-4 h-4 mr-3" />
                Share
              </button>
              <button
                onClick={handleDuplicate}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Copy className="w-4 h-4 mr-3" />
                Duplicate
              </button>
              <div className="border-t border-gray-100"></div>
              <button
                onClick={handleDelete}
                className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Link 
            href={`/reports/${report._id}`}
            className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
          >
            {report.title}
          </Link>
          {report.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
              {report.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(report.status)}`}>
            {report.status}
          </span>
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(report.category)}`}>
            {report.category}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {report.responseCount} responses
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDistanceToNow(new Date(report.updatedAt), { addSuffix: true })}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Link
            href={`/reports/${report._id}/responses`}
            className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            View Responses
          </Link>
          {report.status === 'published' && (
            <button
              onClick={handleShare}
              className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
            >
              Share
            </button>
          )}
        </div>
      </div>
    </div>
  );
}