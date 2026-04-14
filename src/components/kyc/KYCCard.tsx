'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { MoreHorizontal, Eye, FileText, Trash2, Loader2, Download, Save, ShieldAlert, Building2, Clock, User, MapPin } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { KYCUser } from '@/types/kyc';
import { deleteKYCUser, downloadKYCReport, ApiError } from '@/lib/api/kyc';
import { useToast } from '@/components/ui/Toast';
import { useModal } from '@/components/ui/Modal';
import { EditKYCModal } from './EditKYCModal';
import { RejectKYCModal } from './RejectKYCModal';
import { getUserId } from '@/lib/utils';
import { useAuthContext } from '@/context/AuthContext';

interface KYCCardProps {
  user: KYCUser;
  view: 'grid' | 'list';
  onRefetch: () => void;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (userId: string) => void;
}

export function KYCCard({ user, view, onRefetch, selectable, isSelected, onToggleSelect }: KYCCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { addToast } = useToast();
  const { openModal, closeModal, openConfirmModal } = useModal();
  const { organization } = useAuthContext();
  const isMelonAdmin = organization?.name?.toLowerCase().includes('melon');

  const userId = getUserId(user);
  const userLat = user.latitude || (user.addresses && user.addresses[0]?.latitude);
  const userLng = user.longitude || (user.addresses && user.addresses[0]?.longitude);
  const canDelete = user.status === 'PENDING';

  if (!userId) {
    return null;
  }

  const handleDownloadReport = async () => {
    try {
      setDownloading(true);
      await downloadKYCReport(userId);

      addToast({
        type: 'success',
        title: 'Report Downloaded',
        message: 'The verification report has been downloaded successfully.',
      });

      setShowDropdown(false);
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          type: 'error',
          title: 'Download Failed',
          message: error.message,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Download Failed',
          message: 'Failed to download the report. Please try again.',
        });
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = () => {
    if (!canDelete) {
      addToast({
        type: 'error',
        title: 'Cannot Delete',
        message: 'Only pending verification requests can be deleted. This restriction helps track completed verifications for billing purposes.',
      });
      return;
    }

    openConfirmModal({
      title: 'Delete Verification Request',
      description: `Are you sure you want to delete "${user.firstName} ${user.lastName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
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
      },
      onCancel: () => {
        setShowDropdown(false);
      }
    });
  };

  if (view === 'grid') {
    return (
      <div className="relative">
        {selectable && onToggleSelect && (
          <div className="absolute top-4 right-14 z-10">
            <input 
              type="checkbox" 
              checked={isSelected || false} 
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelect(userId);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-5 h-5 text-primary rounded border border-gray-300 focus:ring-primary cursor-pointer hover:border-primary shadow-sm" 
            />
          </div>
        )}
        <Link href={`/kyc/${userId}`}>
          <div className={`bg-white rounded-lg border ${isSelected ? 'border-primary ring-1 ring-primary bg-primary/5 shadow-md' : 'border-gray-200'} p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group relative`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0 pr-12">
                <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-xs font-medium text-primary mt-0.5 uppercase">
                  {user.loanId && user.loanId}
                  {user.loanId && user.loanType && ' • '}
                  <span className="text-gray-400">{user.loanType?.toLowerCase()}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1 truncate">{user.email}</p>
                <p className="text-sm text-gray-500 mt-0.5">{user.phone}</p>
                {user.organization?.name && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      Source: {user.organization.name}
                    </span>
                  </div>
                )}
              </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              disabled={loading || downloading}
            >
              {loading || downloading ? (
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
                        openModal(
                          <EditKYCModal
                            user={user}
                            onClose={closeModal}
                            onSuccess={onRefetch}
                          />,
                          { size: 'xl' }
                        );
                        setShowDropdown(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    >
                      <Save className="w-4 h-4 text-blue-600" />
                      Edit Request
                    </button>
                    {isMelonAdmin && user.status !== 'REJECTED' && user.status !== 'VERIFIED' && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openModal(
                            <RejectKYCModal
                              user={user}
                              onClose={closeModal}
                              onSuccess={onRefetch}
                            />,
                            { size: 'lg' }
                          );
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-error hover:bg-error-light/10 text-left"
                      >
                        <ShieldAlert className="w-4 h-4 text-error" />
                        Reject Request
                      </button>
                    )}
                    {userLat && userLng && (
                      <Link
                        href={`/map-view?layer=kyc&focus=${userId}&lat=${userLat}&lng=${userLng}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        View on Map
                      </Link>
                    )}
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
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDownloadReport();
                      }}
                      disabled={downloading}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      Download Report
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    {isMelonAdmin && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete();
                        }}
                        disabled={loading || !canDelete}
                        className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-error-light disabled:opacity-50 text-left ${canDelete ? 'text-error' : 'text-gray-400'
                          }`}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete {!canDelete && '(Pending Only)'}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mb-4">
            <StatusBadge status={user.status} size="sm" />
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            {user.status === 'REJECTED' && user.rejectionReason && (
              <div className="bg-error-light/10 border border-error-light/50 rounded-lg p-3 mb-2">
                <span className="text-[10px] font-bold text-error uppercase tracking-wider block mb-1">Rejection Reason</span>
                <p className="text-xs text-error font-medium leading-tight">{user.rejectionReason}</p>
                {user.rejectionNote && <p className="text-[10px] text-error/70 mt-1 line-clamp-2">{user.rejectionNote}</p>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="flex flex-col">
                <span className="text-gray-400">Logged</span>
                <span className="text-gray-700 font-medium">
                  {user.submittedAt ? format(new Date(user.submittedAt), 'MM/dd, HH:mm') : '-'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400">Assigned</span>
                <span className="text-gray-700 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.assignedAt ? format(new Date(user.assignedAt), 'MM/dd, HH:mm') : 'Not Assigned'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400">Submitted</span>
                <span className="text-gray-700 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.verifiedAt ? format(new Date(user.verifiedAt), 'MM/dd, HH:mm') : 'Pending'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400">Decision</span>
                <span className="text-gray-700 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.verificationDate ? format(new Date(user.verificationDate), 'MM/dd, HH:mm') : 'Pending'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
              <span className="text-gray-500">Addresses:</span>
              <span className="text-gray-900 font-bold">{user.addresses?.length || 1}</span>
            </div>
          </div>
        </div>
        </Link>
      </div>
    );
  }

  return (
    <div className={`hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 relative ${isSelected ? 'bg-primary/5' : ''}`}>
      <div className="px-4 sm:px-6 py-4">
        <div 
          className="flex lg:grid gap-4 items-center justify-between lg:justify-start"
          style={{ gridTemplateColumns: selectable ? '40px minmax(200px, 2fr) minmax(120px, 1fr) 120px 80px 80px 80px 80px 60px' : 'minmax(200px, 2fr) minmax(120px, 1fr) 120px 80px 80px 80px 80px 60px' }}
        >
          {selectable && onToggleSelect && (
            <div className="hidden lg:flex items-center justify-center">
              <input 
                type="checkbox" 
                checked={isSelected || false} 
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleSelect(userId);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-5 h-5 text-primary rounded border border-gray-300 focus:ring-primary cursor-pointer hover:border-primary shadow-sm" 
              />
            </div>
          )}
          {/* Main Content Area - Column 1 on Desktop */}
          <div className="flex-1 lg:col-span-1 min-w-0">
            <Link href={`/kyc/${userId}`} className="block group">
              <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors truncate text-sm">
                {user.firstName} {user.lastName}
              </div>
              <div className="flex flex-col gap-0.5 mt-0.5">
                <span className="text-[10px] font-bold text-primary uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.loanId || 'N/A'} {user.loanType && `• ${(user.loanType as string).toLowerCase()}`}
                </span>
                <div className="text-[11px] text-gray-500 truncate max-w-full">{user.email}</div>
                
                {user.organization?.name && (
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium lg:hidden mt-1.5">
                    <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="truncate">Source: {user.organization?.name}</span>
                  </div>
                )}

                {/* Mobile-only timestamps */}
                <div className="grid grid-cols-2 gap-6 mt-3 pt-2.5 border-t border-gray-100/50 lg:hidden">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 uppercase tracking-tight font-bold leading-none">Logged</span>
                    <span className="text-[11px] text-gray-800 font-bold whitespace-nowrap">
                      {user.submittedAt ? format(new Date(user.submittedAt as string), 'MM/dd, HH:mm') : '-'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 uppercase tracking-tight font-bold leading-none">Assigned</span>
                    <span className="text-[11px] text-gray-800 font-bold whitespace-nowrap">
                      {user.assignedAt ? format(new Date(user.assignedAt as string), 'MM/dd, HH:mm') : 'None'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Mobile Actions/Status (Hidden on Desktop) */}
          <div className="lg:hidden flex flex-col items-end gap-3 shrink-0">
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                disabled={loading || downloading}
              >
                {loading || downloading ? (
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
                        onClick={() => {
                          openModal(<EditKYCModal user={user} onClose={closeModal} onSuccess={onRefetch} />, { size: 'xl' });
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <Save className="w-4 h-4 text-blue-600" />
                        Edit Request
                      </button>
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
                      <button
                        onClick={handleDownloadReport}
                        disabled={downloading}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        Download Report
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      {isMelonAdmin && (
                        <button
                          onClick={handleDelete}
                          disabled={loading || !canDelete}
                          className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-error-light disabled:opacity-50 text-left ${canDelete ? 'text-error' : 'text-gray-400'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete {!canDelete && '(Pending Only)'}
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <StatusBadge status={user.status} size="sm" />
            {user.status === 'REJECTED' && user.rejectionReason && (
              <span className="text-[9px] text-error font-bold leading-tight line-clamp-1 max-w-[80px]" title={user.rejectionReason}>
                {user.rejectionReason}
              </span>
            )}
          </div>

          {/* Column 2: Source (Desktop-only) */}
          <div className="hidden lg:block text-[11px] text-gray-600 font-medium truncate" title={user.organization?.name || ''}>
            {user.organization?.name || '-'}
          </div>

          {/* Column 3: Status (Desktop-only) */}
          <div className="hidden lg:flex flex-col items-start gap-1 shrink-0">
            <StatusBadge status={user.status} size="sm" />
            {user.status === 'REJECTED' && user.rejectionReason && (
              <span className="text-[10px] text-error font-semibold leading-tight line-clamp-1" title={user.rejectionReason}>
                {user.rejectionReason}
              </span>
            )}
          </div>

          {/* Column 4: Logged (Desktop-only) */}
          <div className="hidden lg:block text-center">
            <div className="text-[11px] text-gray-900 font-medium">
              {user.submittedAt ? format(new Date(user.submittedAt as string), 'MM/dd, HH:mm') : '-'}
            </div>
          </div>

          {/* Column 5: Assigned (Desktop-only) */}
          <div className="hidden lg:block text-center">
            <div className={`text-[11px] font-medium ${user.assignedAt ? 'text-gray-900' : 'text-gray-300 italic'}`}>
              {user.assignedAt ? format(new Date(user.assignedAt as string), 'MM/dd, HH:mm') : 'None'}
            </div>
          </div>

          {/* Column 6: Submitted (Desktop-only) */}
          <div className="hidden lg:block text-center">
            <div className={`text-[11px] font-medium ${user.verifiedAt ? 'text-gray-900' : 'text-gray-300 italic'}`}>
              {user.verifiedAt ? format(new Date(user.verifiedAt as string), 'MM/dd, HH:mm') : 'Pending'}
            </div>
          </div>

          {/* Column 7: Decision (Desktop-only) */}
          <div className="hidden lg:block text-center">
            <div className={`text-[11px] font-medium ${(user.status === 'VERIFIED' || user.status === 'REJECTED') && user.verificationDate ? 'text-gray-900' : 'text-gray-300 italic'}`}>
              {(user.status === 'VERIFIED' || user.status === 'REJECTED') && user.verificationDate
                ? format(new Date(user.verificationDate as string), 'MM/dd, HH:mm')
                : 'Pending'}
            </div>
          </div>

          {/* Column 8: Actions (Desktop-only) */}
          <div className="hidden lg:flex justify-end relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              disabled={loading || downloading}
            >
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-20">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        openModal(<EditKYCModal user={user} onClose={closeModal} onSuccess={onRefetch} />, { size: 'xl' });
                        setShowDropdown(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    >
                      <Save className="w-4 h-4 text-blue-600" />
                      Edit Request
                    </button>
                    {isMelonAdmin && user.status !== 'REJECTED' && user.status !== 'VERIFIED' && (
                      <button
                        onClick={() => {
                          openModal(<RejectKYCModal user={user} onClose={closeModal} onSuccess={onRefetch} />, { size: 'lg' });
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-error hover:bg-error-light/10 text-left"
                      >
                        <ShieldAlert className="w-4 h-4 text-error" />
                        Reject Request
                      </button>
                    )}
                    {userLat && userLng && (
                      <Link
                        href={`/map-view?layer=kyc&focus=${userId}&lat=${userLat}&lng=${userLng}`}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        View on Map
                      </Link>
                    )}
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
                    <button
                      onClick={handleDownloadReport}
                      disabled={downloading}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      Download Report
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    {isMelonAdmin && (
                      <button
                        onClick={handleDelete}
                        disabled={loading || !canDelete}
                        className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-error-light disabled:opacity-50 text-left ${canDelete ? 'text-error' : 'text-gray-400'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete {!canDelete && '(Pending Only)'}
                      </button>
                    )}
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
