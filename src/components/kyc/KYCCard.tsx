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
}

export function KYCCard({ user, view, onRefetch }: KYCCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { addToast } = useToast();
  const { openModal, closeModal, openConfirmModal } = useModal();
  const { organization } = useAuthContext();
  const isMelonAdmin = organization?.name?.toLowerCase().includes('melon');

  const userId = user._id || user.id;
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
      <Link href={`/kyc/${userId}`}>
        <div className="bg-surface rounded-2xl border border-border p-6 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden h-full flex flex-col">
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary transition-colors pr-8">
                {user.firstName} {user.lastName}
              </h3>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  {user.loanId || 'UNASSIGNED ID'}
                </span>
                {user.loanType && (
                  <>
                    <span className="text-border h-3 w-[1px]"></span>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{user.loanType.toLowerCase()}</span>
                  </>
                )}
              </div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-2 truncate italic">{user.email}</p>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-primary hover:bg-surface-secondary rounded-xl transition-all border border-transparent hover:border-border z-10"
              disabled={loading || downloading}
            >
              {loading || downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MoreHorizontal className="w-5 h-5" />
              )}
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDropdown(false);
                  }}
                />
                <div className="absolute right-6 top-16 w-56 bg-surface rounded-2xl border border-border shadow-2xl z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-2 space-y-1">
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
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-surface-secondary rounded-xl transition-all uppercase tracking-widest"
                    >
                      <Save className="w-4 h-4 text-primary" />
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
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-error hover:bg-error/10 rounded-xl transition-all uppercase tracking-widest"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Reject Request
                      </button>
                    )}
                    {userLat && userLng && (
                      <Link
                        href={`/map-view?layer=kyc&focus=${userId}&lat=${userLat}&lng=${userLng}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-surface-secondary rounded-xl transition-all uppercase tracking-widest"
                      >
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        View on Map
                      </Link>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/kyc/${userId}`;
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-surface-secondary rounded-xl transition-all uppercase tracking-widest"
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
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-surface-secondary rounded-xl transition-all uppercase tracking-widest"
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
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-surface-secondary rounded-xl disabled:opacity-50 transition-all uppercase tracking-widest"
                    >
                      <Download className="w-4 h-4" />
                      Export Report
                    </button>
                    <div className="border-t border-border mx-2 my-2"></div>
                    {isMelonAdmin && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete();
                        }}
                        disabled={loading || !canDelete}
                        className={`flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold rounded-xl transition-colors uppercase tracking-widest ${canDelete ? 'text-error hover:bg-error/10' : 'text-gray-400 dark:text-gray-600 bg-transparent'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Request
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between mb-6">
            <StatusBadge status={user.status} size="sm" />
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              <User className="w-3 h-3" />
              {user.addresses?.length || 1} Address
            </div>
          </div>

          <div className="flex-1 space-y-4 pt-5 border-t border-border/50">
            {user.status === 'REJECTED' && user.rejectionReason && (
              <div className="bg-error/5 border border-error/20 rounded-xl p-4 mb-2">
                <span className="text-[10px] font-bold text-error uppercase tracking-wider block mb-1.5 opacity-80">Reason for Failure</span>
                <p className="text-xs text-error font-bold leading-relaxed line-clamp-2">{user.rejectionReason}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Logged</p>
                <p className="text-[11px] font-bold text-gray-700 dark:text-gray-200">
                  {user.submittedAt ? format(new Date(user.submittedAt), 'MM/dd, HH:mm') : '-'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Assigned</p>
                <p className={`text-[11px] font-bold ${user.assignedAt ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 italic'}`}>
                  {user.assignedAt ? format(new Date(user.assignedAt), 'MM/dd, HH:mm') : 'None'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Submitted</p>
                <p className={`text-[11px] font-bold ${user.verifiedAt ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 italic'}`}>
                  {user.verifiedAt ? format(new Date(user.verifiedAt), 'MM/dd, HH:mm') : 'Pending'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Validated</p>
                <p className={`text-[11px] font-bold ${user.verificationDate ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 italic'}`}>
                  {user.verificationDate ? format(new Date(user.verificationDate), 'MM/dd, HH:mm') : 'Pending'}
                </p>
              </div>
            </div>

            {user.organization?.name && (
              <div className="pt-4 mt-auto">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-secondary/50 border border-border/50 w-fit">
                  <Building2 className="w-3 h-3 text-primary/70" />
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest truncate max-w-[120px]">
                    {user.organization.name}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="hover:bg-surface-secondary/30 dark:hover:bg-surface-secondary/20 transition-all border-b border-border/60 last:border-0 relative group">
      <div className="px-8 py-5">
        <div 
          className="flex lg:grid gap-6 items-center justify-between lg:justify-start"
          style={{ gridTemplateColumns: 'minmax(220px, 2fr) minmax(140px, 1fr) 130px 90px 90px 90px 90px 60px' }}
        >
          {/* Main Content Area - Column 1 on Desktop */}
          <div className="flex-1 lg:col-span-1 min-w-0">
            <Link href={`/kyc/${userId}`} className="block group/link">
              <div className="font-bold text-gray-900 dark:text-gray-100 group-hover/link:text-primary transition-colors truncate text-sm">
                {user.firstName} {user.lastName}
              </div>
              <div className="flex flex-col gap-1 mt-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    {user.loanId || 'UNASSIGNED'}
                  </span>
                  {user.loanType && (
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      • {user.loanType}
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate max-w-full italic">{user.email}</div>
                
                {user.organization?.name && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest lg:hidden mt-2">
                    <Building2 className="w-3 h-3 text-primary/50 shrink-0" />
                    <span className="truncate">Source: {user.organization?.name}</span>
                  </div>
                )}

                {/* Mobile-only timestamps */}
                <div className="grid grid-cols-2 gap-6 mt-4 pt-3 border-t border-border/40 lg:hidden">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold opacity-70">Logged</span>
                    <span className="text-[11px] text-gray-800 dark:text-gray-200 font-bold">
                      {user.submittedAt ? format(new Date(user.submittedAt as string), 'MM/dd, HH:mm') : '-'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold opacity-70">Claimed</span>
                    <span className={`text-[11px] font-bold ${user.assignedAt ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600 italic font-medium'}`}>
                      {user.assignedAt ? format(new Date(user.assignedAt as string), 'MM/dd, HH:mm') : 'None'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Column 2: Source (Desktop-only) */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wide truncate" title={user.organization?.name || ''}>
            <Building2 className="w-3.5 h-3.5 text-primary/30 shrink-0" />
            <span className="truncate">{user.organization?.name || 'N/A'}</span>
          </div>

          {/* Column 3: Status (Desktop-only) */}
          <div className="hidden lg:flex flex-col items-start gap-1 shrink-0 group-hover:scale-105 transition-transform duration-300">
            <StatusBadge status={user.status} size="sm" />
            {user.status === 'REJECTED' && user.rejectionReason && (
              <span className="text-[9px] text-error font-bold leading-tight line-clamp-1 max-w-[120px] pl-1 border-l border-error/20 ml-1" title={user.rejectionReason}>
                {user.rejectionReason}
              </span>
            )}
          </div>

          {/* Column 4: Logged (Desktop-only) */}
          <div className="hidden lg:block text-center">
            <div className="text-[11px] text-gray-900 dark:text-gray-100 font-bold">
              {user.submittedAt ? format(new Date(user.submittedAt as string), 'MM/dd, HH:mm') : '-'}
            </div>
          </div>

          {/* Column 5: Assigned (Desktop-only) */}
          <div className="hidden lg:block text-center">
            <div className={`text-[11px] font-bold ${user.assignedAt ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600 italic font-medium'}`}>
              {user.assignedAt ? format(new Date(user.assignedAt as string), 'MM/dd, HH:mm') : 'None'}
            </div>
          </div>

          {/* Column 6: Submitted (Desktop-only) */}
          <div className="hidden lg:block text-center">
            <div className={`text-[11px] font-bold ${user.verifiedAt ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600 italic font-medium'}`}>
              {user.verifiedAt ? format(new Date(user.verifiedAt as string), 'MM/dd, HH:mm') : 'Pending'}
            </div>
          </div>

          {/* Column 7: Decision (Desktop-only) */}
          <div className="hidden lg:block text-center">
            <div className={`text-[11px] font-bold ${(user.status === 'VERIFIED' || user.status === 'REJECTED') && user.verificationDate ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600 italic font-medium'}`}>
              {(user.status === 'VERIFIED' || user.status === 'REJECTED') && user.verificationDate
                ? format(new Date(user.verificationDate as string), 'MM/dd, HH:mm')
                : 'Pending'}
            </div>
          </div>

          {/* Column 8: Actions (Desktop-only) */}
          <div className="hidden lg:flex justify-end relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 text-gray-400 hover:text-primary hover:bg-surface-secondary rounded-xl transition-all border border-transparent hover:border-border"
              disabled={loading || downloading}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-2xl border border-border shadow-2xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        openModal(<EditKYCModal user={user} onClose={closeModal} onSuccess={onRefetch} />, { size: 'xl' });
                        setShowDropdown(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-surface-secondary transition-all rounded-xl uppercase tracking-widest"
                    >
                      <Save className="w-4 h-4 text-primary" />
                      Edit Request
                    </button>
                    {isMelonAdmin && user.status !== 'REJECTED' && user.status !== 'VERIFIED' && (
                      <button
                        onClick={() => {
                          openModal(<RejectKYCModal user={user} onClose={closeModal} onSuccess={onRefetch} />, { size: 'lg' });
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-error hover:bg-error/10 transition-all rounded-xl uppercase tracking-widest"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Failure Note
                      </button>
                    )}
                    {userLat && userLng && (
                      <Link
                        href={`/map-view?layer=kyc&focus=${userId}&lat=${userLat}&lng=${userLng}`}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-surface-secondary transition-all rounded-xl uppercase tracking-widest"
                      >
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        Location
                      </Link>
                    )}
                    <button
                      onClick={() => (window.location.href = `/kyc/${userId}`)}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-surface-secondary transition-all rounded-xl uppercase tracking-widest"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </button>
                    <button
                      onClick={() => (window.location.href = `/kyc/${userId}/documents`)}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-surface-secondary transition-all rounded-xl uppercase tracking-widest"
                    >
                      <FileText className="w-4 h-4" />
                      Payload
                    </button>
                    <button
                      onClick={handleDownloadReport}
                      disabled={downloading}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-surface-secondary transition-all rounded-xl disabled:opacity-50 uppercase tracking-widest"
                    >
                      <Download className="w-4 h-4" />
                      Raw Data
                    </button>
                    <div className="border-t border-border mx-2 my-2"></div>
                    {isMelonAdmin && (
                      <button
                        onClick={handleDelete}
                        disabled={loading || !canDelete}
                        className={`flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold transition-all rounded-xl uppercase tracking-widest ${canDelete ? 'text-error hover:bg-error/10' : 'text-gray-400 dark:text-gray-600 italic opacity-50'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        Purge Entry
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
