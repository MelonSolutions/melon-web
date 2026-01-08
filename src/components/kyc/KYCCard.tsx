'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  MoreHorizontal, 
  Eye, 
  Edit3, 
  Trash2,
  FileText,
  Loader2
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { getIdentityTypeDisplayName, KYCUser } from '@/types/kyc';
import { deleteKYCUser } from '@/lib/api/kyc';

interface KYCCardProps {
  user: KYCUser;
  view: 'grid' | 'list';
  onRefetch: () => void;
}

export function KYCCard({ user, view, onRefetch }: KYCCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const userId = user.id || user._id;

  if (!userId) {
    return null;
  }

  const handleDelete = async () => {
    const confirmed = confirm(`Are you sure you want to delete "${user.firstName} ${user.lastName}"? This action cannot be undone.`);
    
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteKYCUser(userId);
      onRefetch();
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setLoading(false);
      setShowDropdown(false);
    }
  };

  const handleNavigate = (path: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    window.location.href = path;
    setShowDropdown(false);
  };

  // Grid View
  if (view === 'grid') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow relative flex flex-col h-full cursor-pointer group">
        <Link href={`/kyc/${userId}`} className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 pb-4 flex-1">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 truncate group-hover:text-[#5B94E5] transition-colors">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-500 mt-1 truncate">
                  {user.email}
                </p>
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
                        onClick={(e) => handleNavigate(`/kyc/${userId}`, e)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <Edit3 className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={(e) => handleNavigate(`/kyc/${userId}/documents`, e)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <FileText className="w-4 h-4" />
                        Documents
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

            {/* Status */}
            <div className="mb-4">
              <StatusBadge status={user.status} size="sm" />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 mt-auto">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  {getIdentityTypeDisplayName(user.identityType)}
                </span>
                <span className="text-gray-600">
                  <span className="font-medium">{user.documents?.length || 0}</span> docs
                </span>
              </div>
              <span className="text-gray-400">
                {formatDistanceToNow(new Date(user.updatedAt), { addSuffix: true })}
              </span>
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

  // List View
  return (
    <div className="hover:bg-gray-50 transition-colors">
      <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
        {/* Name */}
        <div className="col-span-3">
          <Link 
            href={`/kyc/${userId}`}
            className="block"
          >
            <div className="font-medium text-gray-900 hover:text-[#5B94E5] transition-colors">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-500 truncate mt-1">
              {user.email}
            </div>
          </Link>
        </div>

        {/* Phone */}
        <div className="col-span-2">
          <span className="text-sm text-gray-600">{user.phone}</span>
        </div>

        {/* Identity Type */}
        <div className="col-span-2">
          <span className="text-sm text-gray-600">
            {getIdentityTypeDisplayName(user.identityType)}
          </span>
        </div>

        {/* Status */}
        <div className="col-span-2">
          <StatusBadge status={user.status} size="sm" />
        </div>

        {/* Documents */}
        <div className="col-span-2">
          <span className="text-sm text-gray-900 font-medium">
            {user.documents?.length || 0}
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
                    onClick={() => handleNavigate(`/kyc/${userId}`)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => handleNavigate(`/kyc/${userId}/documents`)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                  >
                    <FileText className="w-4 h-4" />
                    Documents
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
      </div>
    </div>
  );
}