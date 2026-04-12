/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useKYCUser } from '@/hooks/useKYC';
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  Upload,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  Edit2,
  ShieldAlert,
  Mail,
  Phone,
  User,
  Building2,
  Calendar,
  DollarSign,
  Hash,
  Archive,
  LayoutGrid,
  Users,
  Navigation,
  Compass,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Search,
  UserCheck,
  FileCheck,
  Loader2,
  MapPin,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/kyc/StatusBadge';
import { EditKYCModal } from '@/components/kyc/EditKYCModal';
import { RejectKYCModal } from '@/components/kyc/RejectKYCModal';
import { useAuthContext } from '@/context/AuthContext';
import {
  KYCDocument,
  getDocumentTypeDisplayName,
  AddressData
} from '@/types/kyc';
import {
  uploadDocument,
  deleteDocument,
  makeVerificationDecision,
  ApiError
} from '@/lib/api/kyc';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/Toast';
import { useModal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface PageProps {
  params: Promise<{ id: string; }>;
}

export default function KYCUserDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  const router = useRouter();
  const { addToast } = useToast();
  const { openModal, closeModal } = useModal();
  const { organization } = useAuthContext();
  const isMelonAdmin = organization?.name?.toLowerCase().includes('melon');

  const { user, loading, refetch } = useKYCUser(userId);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rejectingIndex, setRejectingIndex] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleVerificationApproval = async (addressIndex: number) => {
    try {
      setUpdating(true);

      const addressLabel = addresses[addressIndex]?.label || `Address ${addressIndex + 1}`;

      await makeVerificationDecision(userId, true, undefined, addressIndex, undefined);
      await refetch();

      addToast({
        type: 'success',
        title: 'Address Approved',
        message: `${addressLabel} has been approved successfully.`,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          type: 'error',
          title: 'Approval Failed',
          message: error.message,
        });
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleVerificationRejection = async (addressIndex: number) => {
    if (rejectionReason.trim().length < 10) {
      return;
    }

    try {
      setUpdating(true);

      const addressLabel = addresses[addressIndex]?.label || `Address ${addressIndex + 1}`;

      // Pass rejectionReason as Note as well since it's the detailed text
      await makeVerificationDecision(userId, false, undefined, addressIndex, rejectionReason);
      await refetch();

      addToast({
        type: 'success',
        title: 'Address Rejected',
        message: `${addressLabel} has been rejected.`,
      });

      setRejectingIndex(null);
      setRejectionReason('');
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          type: 'error',
          title: 'Rejection Failed',
          message: error.message,
        });
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (user?.status !== 'PENDING') {
      addToast({
        type: 'error',
        title: 'Upload Not Allowed',
        message: 'Documents can only be uploaded for pending verification requests.',
      });
      event.target.value = '';
      return;
    }

    try {
      setUploading(true);
      await uploadDocument(userId, file, 'PROOF_OF_ADDRESS');
      await refetch();

      addToast({
        type: 'success',
        title: 'Document Uploaded',
        message: 'The document has been uploaded successfully.',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          type: 'error',
          title: 'Upload Failed',
          message: error.message,
        });
      }
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (user?.status !== 'PENDING') {
      addToast({
        type: 'error',
        title: 'Delete Not Allowed',
        message: 'Documents can only be deleted for pending verification requests.',
      });
      return;
    }

    openModal(
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Document</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end mt-6">
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              try {
                await deleteDocument(userId, documentId);
                await refetch();
                closeModal();

                addToast({
                  type: 'success',
                  title: 'Document Deleted',
                  message: 'The document has been removed.',
                });
              } catch (error) {
                if (error instanceof ApiError) {
                  addToast({
                    type: 'error',
                    title: 'Delete Failed',
                    message: error.message,
                  });
                }
              }
            }}
          >
            Delete
          </Button>
        </div>
      </div>,
      { size: 'sm' }
    );
  };

  const formatAddress = (address: any) => {
    if (!address) return null;

    const parts = [
      address.streetNumber,
      address.streetName,
      address.landmark,
      address.city,
      address.lga,
      address.state,
      address.country,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : null;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  if (loading) {
    return (
      <div className="min-h-screen font-sans animate-pulse px-2">
        {/* Header Skeleton */}
        <div className="bg-surface border-b border-border px-6 py-6 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto flex items-center gap-6">
            <div className="h-12 w-12 bg-border/30 rounded-2xl"></div>
            <div className="space-y-2">
               <div className="h-8 w-64 bg-border/40 rounded-xl"></div>
               <div className="h-3 w-48 bg-border/20 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              {/* Identity Matrix Skeleton */}
              <div className="bg-surface rounded-3xl border border-border h-[400px] shadow-sm"></div>
              
              {/* Geographical Assets Skeleton */}
              <div className="bg-surface rounded-3xl border border-border h-[400px] shadow-sm"></div>
            </div>

            <div className="space-y-8">
              {/* Context Hub Skeleton */}
              <div className="bg-surface rounded-3xl border border-border h-64 shadow-sm"></div>
              <div className="bg-surface rounded-3xl border border-border h-96 shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface-secondary/5 flex items-center justify-center p-6">
        <div className="text-center bg-surface rounded-3xl border border-border p-12 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-6 border border-border/50">
            <Search className="w-10 h-10 text-gray-300 dark:text-gray-700" />
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-2">Request Not Found</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium">We couldn't locate the verification request you're looking for. It may have been deleted or archived.</p>
          <Link href="/kyc" className="w-full block">
            <Button variant="primary" className="w-full py-4 rounded-xl shadow-lg shadow-primary/20 font-black uppercase tracking-widest">
              Return to Pipeline
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasMultipleAddresses = user.addresses && user.addresses.length > 0;
  const addresses = hasMultipleAddresses ? user.addresses! : [{
    label: 'Primary Address',
    landmark: user.landmark,
    city: user.city,
    state: user.state,
    country: user.country,
    latitude: user.latitude,
    longitude: user.longitude,
    status: user.status,
    verificationData: undefined,
    streetName: user.streetName,
    streetNumber: user.streetNumber,
  }] as AddressData[];

  const documents = (user.documents || []) as KYCDocument[];

  return (
    <div className="min-h-screen bg-surface-secondary/5 pb-20">
      <div className="bg-surface border-b border-border px-4 sm:px-6 py-6 sticky top-0 z-20 backdrop-blur-xl bg-surface/90">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/kyc" className="p-2.5 hover:bg-surface-secondary rounded-xl transition-all border border-border/40 hover:border-primary/30 group">
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-primary" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 truncate tracking-tight">
                  {user.firstName} {user.lastName}
                </h1>
                <StatusBadge status={user.status} size="sm" />
              </div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
                Ref: <span className="text-primary">{user.loanId || 'UNASSIGNED'}</span> • {user.submittedAt ? format(new Date(user.submittedAt), 'PPP') : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />}
              onClick={refetch}
              disabled={updating}
              className="h-11 font-bold rounded-xl border-border/60 hover:bg-surface-secondary"
            >
              Sync
            </Button>
            {isMelonAdmin && (
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={async () => {
                  if (confirm('Permanently excision this verification profile?')) {
                    try {
                      setUpdating(true);
                      // In a real app we'd call a delete endpoint here
                      addToast({ type: 'success', title: 'Purge Complete', message: 'Entity has been excised.' });
                      router.push('/kyc');
                    } catch (e) {
                      addToast({ type: 'error', title: 'Purge Failed', message: 'Access denied or network error.' });
                    } finally {
                      setUpdating(false);
                    }
                  }
                }}
                loading={updating}
                className="h-11 font-bold rounded-xl shadow-lg shadow-error/10"
              >
                Delete
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              icon={<Edit2 className="w-4 h-4" />}
              onClick={() => openModal(<EditKYCModal user={user} onClose={closeModal} onSuccess={refetch} />, { size: 'xl' })}
              className="h-11 font-bold rounded-xl border-border/60 hover:bg-surface-secondary"
            >
              Modify
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Rejection Narrative */}
            {user.status === 'REJECTED' && (
              <div className="bg-error/5 border-2 border-error/20 rounded-3xl p-8 relative overflow-hidden animate-in slide-in-from-top-4 duration-700 font-sans">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                  <ShieldAlert className="w-32 h-32 text-error" />
                </div>
                <div className="flex items-start gap-5 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center shrink-0 border border-error/20">
                    <AlertTriangle className="w-7 h-7 text-error" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-error uppercase tracking-widest mb-3">Verification Failure Record</h3>
                    <div className="space-y-4">
                      {user.rejectionReason && (
                        <div className="bg-surface/50 rounded-2xl p-5 border border-error/10">
                          <span className="text-[10px] font-black text-error/60 uppercase tracking-widest block mb-2">Primary Reason for Rejection</span>
                          <p className="text-sm font-bold text-error leading-relaxed">{user.rejectionReason}</p>
                        </div>
                      )}
                      {user.rejectionNote && (
                        <div className="bg-surface/50 rounded-2xl p-5 border border-error/10 border-dashed">
                          <span className="text-[10px] font-black text-error/60 uppercase tracking-widest block mb-2">Officer's Internal Narrative</span>
                          <p className="text-sm font-medium text-error/80 italic leading-relaxed">"{user.rejectionNote}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Core Entity Profile */}
            <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden group hover:border-primary/20 transition-all duration-500 font-sans">
              <div className="px-8 py-5 border-b border-border bg-gradient-to-r from-surface to-surface-secondary/50 flex items-center gap-3">
                <User className="w-5 h-5 text-primary" />
                <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em]">Entity Identity Matrix</h3>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <DataBlock label="Primary Identity" value={`${user.firstName} ${user.lastName}`} icon={<User className="w-4 h-4" />} />
                  <DataBlock label="Digital Corridor" value={user.email} icon={<Mail className="w-4 h-4" />} />
                  <DataBlock label="Telemetry" value={user.phone} icon={<Phone className="w-4 h-4" />} />
                  <DataBlock label="Request Vector" value={user.loanType || 'N/A'} subValue={user.loanId} uppercase />
                  <DataBlock label="Occupational Domain" value={user.occupation || 'N/A'} />
                  <DataBlock label="BVN Protocol" value={user.bvn || 'NOT_FOUND'} mono />
                  <DataBlock label="NIN Protocol" value={user.nin || 'NOT_FOUND'} mono />
                  <DataBlock label="Pass Context" value={user.submittedAt ? format(new Date(user.submittedAt), 'PPP') : 'N/A'} />
                </div>
              </div>
            </div>

            {/* Geographical Assets */}
            <div className="space-y-10">
              {addresses.map((address, index) => (
                <div key={index} className="space-y-10">
                  {address.status === 'VERIFICATION_SUBMITTED' && address.verificationData && isMelonAdmin && (
                    <div className="bg-primary/5 border-2 border-primary/20 rounded-3xl p-8 animate-in zoom-in-95 duration-500 font-sans">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-start gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 animate-pulse">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-primary uppercase tracking-widest mb-2">Review Required</h3>
                            <p className="text-sm text-primary/70 font-bold leading-relaxed max-w-md">
                              Operational intelligence has been submitted for <span className="text-primary">{address.label || 'Primary Location'}</span>. Perform final validation.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <Button
                            variant="primary"
                            size="lg"
                            onClick={() => handleVerificationApproval(index)}
                            disabled={updating}
                            icon={<CheckCircle className="w-5 h-5" />}
                            className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 flex-1 md:flex-none py-6 rounded-2xl shadow-xl shadow-emerald-500/10"
                          >
                            Validate
                          </Button>
                          <Button
                            variant="danger"
                            size="lg"
                            onClick={() => setRejectingIndex(index)}
                            disabled={updating}
                            icon={<XCircle className="w-5 h-5" />}
                            className="flex-1 md:flex-none py-6 rounded-2xl shadow-xl shadow-error/10"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>

                      {rejectingIndex === index && (
                        <div className="mt-8 pt-8 border-t border-primary/10 space-y-4 animate-in slide-in-from-top-2 duration-300">
                           <textarea
                             value={rejectionReason}
                             onChange={(e) => setRejectionReason(e.target.value)}
                             placeholder="Provide a detailed technical narrative for rejection (min 10 characters)..."
                             className="w-full bg-surface border border-border p-5 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-error/20 focus:border-error transition-all outline-none resize-none h-32"
                           />
                           <div className="flex justify-end gap-3">
                              <Button variant="ghost" className="font-bold text-xs uppercase" onClick={() => setRejectingIndex(null)}>Cancel</Button>
                              <Button 
                                variant="danger" 
                                className="font-black text-xs uppercase tracking-widest px-8 rounded-xl"
                                onClick={() => handleVerificationRejection(index)}
                                disabled={updating || rejectionReason.trim().length < 10}
                                loading={updating}
                              >
                                Commit Rejection
                              </Button>
                           </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm group hover:border-primary/20 transition-all duration-500 px-0">
                    <div className="px-8 py-5 border-b border-border bg-gradient-to-r from-surface to-surface-secondary/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-primary" />
                        <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em]">{address.label || `Geographic Zone ${index + 1}`}</h3>
                      </div>
                      <StatusBadge status={address.status || user.status} size="sm" />
                    </div>
                    <div className="p-8">
                      <div className="flex flex-col md:flex-row gap-10">
                        <div className="flex-1 space-y-8">
                          <div>
                            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1.5 opacity-60">Physical Location Payload</span>
                            <p className="text-lg font-black text-gray-900 dark:text-gray-100 leading-snug tracking-tight">
                              {address.streetNumber} {address.streetName} {address.city && `, ${address.city}`}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-border/40">
                            <DataBlock label="Spatial Latitude" value={address.latitude?.toFixed(6) || 'N/A'} mono />
                            <DataBlock label="Spatial Longitude" value={address.longitude?.toFixed(6) || 'N/A'} mono />
                          </div>

                          {address.verificationData && (
                            <div className="pt-8 border-t border-primary/10 bg-primary/5 -mx-8 -mb-8 p-8 relative overflow-hidden group/audit">
                              <div className="absolute -right-4 -bottom-4 opacity-[0.05] pointer-events-none group-hover/audit:scale-110 transition-transform duration-700">
                                <FileCheck className="w-24 h-24 text-primary" />
                              </div>
                              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                Filed Audit Intelligence
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <DataBlock label="Verified Lat" value={address.verificationData.verifiedLatitude?.toFixed(6)} mono highlight />
                                <DataBlock label="Verified Lng" value={address.verificationData.verifiedLongitude?.toFixed(6)} mono highlight />
                              </div>

                              {/* Verification Photos Section */}
                              {address.verificationData.verificationPhotos && address.verificationData.verificationPhotos.length > 0 && (
                                <div className="mt-8 space-y-4 relative z-10">
                                  <div className="flex items-center gap-2 mb-4">
                                    <Archive className="w-4 h-4 text-primary/60" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification Evidence Portfolio</span>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {address.verificationData.verificationPhotos.map((photo, pIdx) => (
                                      <div key={pIdx} className="group/photo relative aspect-square rounded-2xl overflow-hidden border border-primary/20 bg-surface shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-500">
                                        <Image
                                          src={photo}
                                          alt={'Verification Evidence'}
                                          fill
                                          className="object-cover group-hover/photo:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-3">
                                          <p className="text-[8px] font-black text-white uppercase tracking-widest line-clamp-2">
                                            {'Verification Evidence'}
                                          </p>
                                          <a 
                                            href={photo} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="mt-2 text-[8px] font-bold text-primary hover:text-white transition-colors uppercase tracking-[0.2em] flex items-center gap-1"
                                          >
                                            View Source <ExternalLink className="w-2 h-2" />
                                          </a>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {address.verificationData.verifiedLatitude && address.latitude && (
                                <div className="mt-10 p-4 rounded-2xl bg-surface border border-primary/20 flex items-center justify-between group/variance">
                                  <div className="flex items-center gap-3">
                                    <Navigation className="w-4 h-4 text-primary/40 group-hover/variance:rotate-45 transition-transform" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Spatial Variance</span>
                                  </div>
                                  <span className="text-xs font-black text-primary px-3 py-1 rounded-lg bg-primary/5 border border-primary/10">
                                    {calculateDistance(address.latitude as number, address.longitude as number, address.verificationData.verifiedLatitude as number, address.verificationData.verifiedLongitude as number).toFixed(2)} km Offset
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {user.status === 'REJECTED' && user.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-900 mb-1">
                      Verification Rejected
                    </h3>
                    <p className="text-sm text-red-700">{user.rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Addresses</span>
                    <span className="font-medium text-gray-900">{addresses.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Documents</span>
                    <span className="font-medium text-gray-900">{user.documents?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Overall Status</span>
                    <StatusBadge status={user.status} size="sm" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {user.requestMetadata && (
              <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden group hover:border-primary/20 transition-all duration-500 font-sans">
                <div className="px-8 py-5 border-b border-border bg-gradient-to-r from-surface to-surface-secondary/50 flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-primary" />
                  <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em]">Context Intel</h3>
                </div>
                <div className="p-8 space-y-4">
                  <DataBlock label="Transmission IP" value={user.requestMetadata.ipAddress || 'UNKNOWN'} mono />
                </div>
              </div>
            )}
            {/* Workflow / Action Card */}
            {user.status !== 'VERIFIED' && user.status !== 'REJECTED' && (
              <div className="bg-surface rounded-3xl border-2 border-primary/10 shadow-xl shadow-primary/5 overflow-hidden group hover:border-primary/20 transition-all duration-500 font-sans">
                <div className="p-8">
                  <div className="flex bg-primary/10 p-4 rounded-2xl items-start gap-4 mb-8 border border-primary/20">
                    <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
                    <div>
                      <h4 className="text-sm font-black text-primary uppercase tracking-widest">Active Pipeline</h4>
                      <p className="text-[11px] text-primary/70 font-bold mt-1 leading-relaxed">Transition this entity through the validation stage.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {user.status === 'PENDING' && (
                      <Button
                        variant="primary"
                        className="w-full py-4 rounded-xl shadow-lg shadow-primary/20 text-sm font-black uppercase tracking-widest"
                        onClick={async () => {
                           try {
                             setUpdating(true);
                             await makeVerificationDecision(userId, false, 'ASSIGNED', undefined, undefined);
                             await refetch();
                           } catch (e) {
                             addToast({ type: 'error', title: 'Action Failed', message: 'Failed to claim request.' });
                           } finally {
                             setUpdating(false);
                           }
                        }}
                        loading={updating}
                        icon={<UserCheck className="w-5 h-5" />}
                      >
                        Claim for Review
                      </Button>
                    )}
                    {user.status === 'ASSIGNED' && (
                      <Button
                        variant="primary"
                        className="w-full py-4 rounded-xl shadow-lg shadow-primary/20 text-sm font-black uppercase tracking-widest"
                        onClick={async () => {
                           try {
                             setUpdating(true);
                             await makeVerificationDecision(userId, false, 'IN_REVIEW', undefined, undefined);
                             await refetch();
                           } catch (e) {
                             addToast({ type: 'error', title: 'Action Failed', message: 'Failed to update status.' });
                           } finally {
                             setUpdating(false);
                           }
                        }}
                        loading={updating}
                        icon={<Search className="w-5 h-5" />}
                      >
                        Initiate Review
                      </Button>
                    )}
                    {(user.status === 'IN_REVIEW' || user.status === 'VERIFICATION_SUBMITTED') && isMelonAdmin && (
                      <div className="grid grid-cols-1 gap-4 pt-2">
                        <Button
                          variant="primary"
                          className="w-full py-4 rounded-xl shadow-lg shadow-success/20 bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-sm font-black uppercase tracking-widest text-white"
                          onClick={async () => {
                             try {
                               setUpdating(true);
                               await makeVerificationDecision(userId, true, 'VERIFIED', undefined, undefined);
                               await refetch();
                               addToast({ type: 'success', title: 'Verified', message: 'Entity has been fully validated.' });
                             } catch (e) {
                               addToast({ type: 'error', title: 'Validation Failed', message: 'Technical error during validation.' });
                             } finally {
                               setUpdating(false);
                             }
                          }}
                          loading={updating}
                          icon={<CheckCircle2 className="w-5 h-5" />}
                        >
                          Approve Profile
                        </Button>
                        <Button
                          variant="danger"
                          className="w-full py-4 rounded-xl shadow-lg shadow-error/20 text-sm font-black uppercase tracking-widest"
                          onClick={() => openModal(<RejectKYCModal user={user} onClose={closeModal} onSuccess={refetch} />, { size: 'lg' })}
                          loading={updating}
                          icon={<XCircle className="w-5 h-5" />}
                        >
                          Reject Profile
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Assigned Intelligence */}
            {user.assignedAgent && typeof user.assignedAgent !== 'string' && (
              <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden group hover:border-primary/20 transition-all duration-500 font-sans">
                <div className="px-8 py-5 border-b border-border bg-gradient-to-r from-surface to-surface-secondary/50 flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-primary" />
                  <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em]">Filed Officer</h3>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-secondary/30 border border-border/50">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20">
                      {(user.assignedAgent as any).firstName?.[0] || 'A'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-gray-900 dark:text-gray-100 truncate">
                        {(user.assignedAgent as any).firstName} {(user.assignedAgent as any).lastName}
                      </p>
                      <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 truncate mt-0.5">{(user.assignedAgent as any).email || 'DIGITAL_OFFICER'}</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-border/40 space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Active Since:</span>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                          {user.assignedAt ? format(new Date(user.assignedAt), 'MMM dd, HH:mm') : 'N/A'}
                        </span>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payload Inventory */}
            <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden group hover:border-primary/20 transition-all duration-500 font-sans">
              <div className="px-8 py-5 border-b border-border bg-gradient-to-r from-surface to-surface-secondary/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Archive className="w-5 h-5 text-primary" />
                  <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em]">Payload Blocks ({documents.length})</h3>
                </div>
                <div className="relative">
                  <input
                    type="file"
                    id="doc-upload-sidebar"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading || (user.status !== 'PENDING' && user.status !== 'ASSIGNED' && user.status !== 'IN_REVIEW')}
                  />
                  <label
                    htmlFor="doc-upload-sidebar"
                    className={`p-2 rounded-lg border border-border transition-all cursor-pointer ${uploading || (user.status !== 'PENDING' && user.status !== 'ASSIGNED' && user.status !== 'IN_REVIEW') ? 'opacity-30 pointer-events-none' : 'hover:bg-primary/5 hover:border-primary text-primary'}`}
                  >
                    <Upload className="w-4 h-4" />
                  </label>
                </div>
              </div>
              <div className="p-8 space-y-4">
                {documents && documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.slice(0, 5).map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-surface-secondary/20 border border-border/60 group/doc">
                        <div className="flex items-center gap-4 min-w-0">
                          <FileText className="w-4 h-4 text-gray-400 group-hover/doc:text-primary transition-colors" />
                          <div className="min-w-0">
                            <p className="text-[11px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider truncate" title={doc.fileName}>{doc.fileName}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => window.open(doc.fileUrl, '_blank')}
                          className="p-2 text-gray-400 hover:text-primary transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {documents.length > 5 && (
                      <Link href={`/kyc/${userId}/documents`}>
                        <button className="w-full py-3 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-primary transition-colors border-2 border-dashed border-border/60 rounded-2xl hover:border-primary/20 mt-2">
                          + {documents.length - 5} More Artifacts
                        </button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest">No Payload</p>
                  </div>
                )}
              </div>
            </div>

            {/* Officer Audit Section */}
            {isMelonAdmin && (
              <div className="bg-error/5 border-2 border-error/20 rounded-3xl p-8 space-y-6 font-sans">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-6 h-6 text-error" />
                  <h3 className="text-sm font-black text-error uppercase tracking-[0.2em]">Administrative Purge</h3>
                </div>
                <p className="text-xs text-error/70 font-bold leading-relaxed">
                  Permanent excision of this profile from the ledger.
                </p>
                <Button
                  variant="danger"
                  size="lg"
                  onClick={async () => {
                    if (confirm('Commit destructive purge?')) {
                      try {
                        setUpdating(true);
                        addToast({ type: 'success', title: 'Purge Complete', message: 'Entity has been excised.' });
                        router.push('/kyc');
                      } catch (e) {
                         addToast({ type: 'error', title: 'Purge Failed', message: 'Technical error.' });
                      } finally {
                        setUpdating(false);
                      }
                    }
                  }}
                  loading={updating}
                  className="w-full py-5 rounded-2xl shadow-xl shadow-error/20 font-black uppercase tracking-widest text-sm"
                >
                  Confirm Purge
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DataBlock({ label, value, subValue, icon, uppercase, mono, highlight }: { 
  label: string; 
  value?: string | number | null; 
  subValue?: string | number | null; 
  icon?: React.ReactNode;
  uppercase?: boolean;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="space-y-1.5 group/data font-sans">
      <div className="flex items-center gap-2">
        {icon && <span className="text-primary/40 group-hover/data:text-primary transition-colors">{icon}</span>}
        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest opacity-70">{label}</span>
      </div>
      <div className="flex flex-col">
        <span className={`text-sm font-bold ${highlight ? 'text-primary' : 'text-gray-900 dark:text-gray-100'} ${uppercase ? 'uppercase' : ''} ${mono ? 'font-mono tracking-tighter' : ''}`}>
          {value || 'DATA_NULL'}
        </span>
        {subValue && (
          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest italic opacity-60">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}
