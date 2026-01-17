'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Eye, FileText, Trash2, Loader2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { KYCUser } from '@/types/kyc';
import { deleteKYCUser, ApiError } from '@/lib/api/kyc';
import { useToast } from '@/components/ui/Toast';

interface KYCCardProps {
  user: KYCUser;
  view: 'grid' | 'list';
  onRefetch: () => void;
}

export function KYCCard({ user, view, onRefetch }: KYCCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const userId = user.id || user._id;
  const canDelete = user.status === 'PENDING';

  if (!userId) {
    return null;
  }

  const handleDelete = async () => {
    if (!canDelete) {
      addToast({
        type: 'error',
        title: 'Cannot Delete',
        message: 'Only pending verification requests can be deleted. This restriction helps track completed verifications for billing purposes.',
      });
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete "${user.firstName} ${user.lastName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteKYCUser(userId);
      
      addToast({
        type: 'success',
        title: 'Request Deleted',
        message: 'The verification request has been deleted successfully.',
      });
      
      onRefetch();
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          type: 'error',
          title: 'Delete Failed',
          message: error.message,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Delete Failed',
          message: 'Failed to delete the request. Please try again.',
        });
      }
    } finally {
      setLoading(false);
      setShowDropdown(false);
    }
  };

  if (view === 'grid') {
    return (
      <Link href={`/kyc/${userId}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-gray-500 mt-1 truncate">{user.email}</p>
              <p className="text-sm text-gray-500 mt-0.5">{user.phone}</p>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              ) : (
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDropdown(false);
                  }}
                />
                <div className="absolute right-6 top-12 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-20">
                  <div className="py-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/kyc/${userId}`;
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/kyc/${userId}/documents`;
                      }}
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
                      disabled={loading || !canDelete}
                      className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-error-light disabled:opacity-50 text-left ${
                        canDelete ? 'text-error' : 'text-gray-400'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete {!canDelete && '(Pending Only)'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mb-4">
            <StatusBadge status={user.status} size="sm" />
          </div>

          <div className="space-y-2 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Documents:</span>
              <span className="text-gray-900 font-medium">{user.documents?.length || 0}</span>
            </div>
            <div className="text-xs text-gray-400 pt-2">
              {formatDistanceToNow(new Date(user.updatedAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      <div className="px-6 py-4">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-4">
            <Link href={`/kyc/${userId}`} className="block group">
              <div className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sm text-gray-500 truncate mt-0.5">{user.email}</div>
            </Link>
          </div>

          <div className="col-span-3">
            <span className="text-sm text-gray-600">{user.phone}</span>
          </div>

          <div className="col-span-2">
            <StatusBadge status={user.status} size="sm" />
          </div>

          <div className="col-span-2">
            <span className="text-sm text-gray-900 font-medium">
              {user.documents?.length || 0}
            </span>
          </div>

          <div className="col-span-1 flex justify-end relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              ) : (
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-20">
                  <div className="py-1">
                    <button
                      onClick={() => (window.location.href = `/kyc/${userId}`)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => (window.location.href = `/kyc/${userId}/documents`)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    >
                      <FileText className="w-4 h-4" />
                      Documents
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleDelete}
                      disabled={loading || !canDelete}
                      className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-error-light disabled:opacity-50 text-left ${
                        canDelete ? 'text-error' : 'text-gray-400'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete {!canDelete && '(Pending Only)'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
