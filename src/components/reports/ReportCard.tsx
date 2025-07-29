/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Share2, 
  Copy, 
  Trash2, 
  Users,
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
}

interface ReportCardProps {
  report: Report;
  view: 'grid' | 'list';
  onRefetch: () => void;
}

export function ReportCard({ report, view, onRefetch }: ReportCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'published':
        return `${baseClasses} bg-green-50 text-green-700`;
      case 'draft':
        return `${baseClasses} bg-yellow-50 text-yellow-700`;
      case 'closed':
        return `${baseClasses} bg-gray-50 text-gray-700`;
      default:
        return `${baseClasses} bg-gray-50 text-gray-700`;
    }
  };

  const getCategoryBadge = (category: string) => {
    return "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700";
  };

  const handleAction = async (action: string) => {
    setShowMenu(false);
    
    switch (action) {
      case 'duplicate':
        // TODO: Implement duplicate functionality
        console.log('Duplicate report:', report._id);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this report?')) {
          // TODO: Implement delete functionality
          console.log('Delete report:', report._id);
          onRefetch();
        }
        break;
      case 'share':
        // TODO: Implement share functionality
        console.log('Share report:', report._id);
        break;
    }
  };

  const MenuDropdown = () => (
    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10" ref={menuRef}>
      <Link
        href={`/reports/${report._id}`}
        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        onClick={() => setShowMenu(false)}
      >
        <Edit className="w-4 h-4" />
        Edit Report
      </Link>
      <Link
        href={`/reports/${report._id}/responses`}
        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        onClick={() => setShowMenu(false)}
      >
        <Eye className="w-4 h-4" />
        View Responses
      </Link>
      {report.status === 'published' && (
        <a
          href={`/reports/public/${report._id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={() => setShowMenu(false)}
        >
          <ExternalLink className="w-4 h-4" />
          View Public Form
        </a>
      )}
      <button
        onClick={() => handleAction('share')}
        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
      >
        <Share2 className="w-4 h-4" />
        Share Report
      </button>
      <button
        onClick={() => handleAction('duplicate')}
        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
      >
        <Copy className="w-4 h-4" />
        Duplicate
      </button>
      <div className="border-t border-gray-100 my-1"></div>
      <button
        onClick={() => handleAction('delete')}
        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
      >
        <Trash2 className="w-4 h-4" />
        Delete Report
      </button>
    </div>
  );

  if (view === 'list') {
    return (
      <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-4">
            <Link 
              href={`/reports/${report._id}`}
              className="font-medium text-gray-900 hover:text-[#5B94E5] transition-colors line-clamp-1"
            >
              {report.title}
            </Link>
            {report.description && (
              <div className="text-sm text-gray-500 line-clamp-1 mt-1">
                {report.description}
              </div>
            )}
          </div>

          <div className="col-span-2">
            <span className={getStatusBadge(report.status)}>
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </span>
          </div>

          <div className="col-span-2">
            <span className={getCategoryBadge(report.category)}>
              {report.category}
            </span>
          </div>

          <div className="col-span-2">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              {report.responseCount}
            </div>
          </div>

          <div className="col-span-1">
            <div className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(report.updatedAt), { addSuffix: true })}
            </div>
          </div>

          <div className="col-span-1 relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMenu && <MenuDropdown />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <Link 
              href={`/reports/${report._id}`}
              className="font-medium text-gray-900 hover:text-[#5B94E5] transition-colors line-clamp-2"
            >
              {report.title}
            </Link>
            {report.description && (
              <div className="text-sm text-gray-500 line-clamp-2 mt-2">
                {report.description}
              </div>
            )}
          </div>
          <div className="ml-4 relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMenu && <MenuDropdown />}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className={getStatusBadge(report.status)}>
            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
          </span>
          <span className={getCategoryBadge(report.category)}>
            {report.category}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {report.responseCount} responses
          </div>
          <div>
            {formatDistanceToNow(new Date(report.updatedAt), { addSuffix: true })}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 px-6 py-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/reports/${report._id}/responses`}
            className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
          >
            View Responses
          </Link>
          {report.status === 'published' && (
            <button
              onClick={() => handleAction('share')}
              className="px-3 py-2 text-sm font-medium text-[#5B94E5] bg-blue-50 rounded hover:bg-blue-100 transition-colors"
            >
              Share
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
