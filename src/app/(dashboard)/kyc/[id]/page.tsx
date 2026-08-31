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
  RotateCcw,
  Eye,
  Download,
  ZoomIn,
  ZoomOut,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/kyc/StatusBadge';
import { EditKYCModal } from '@/components/kyc/EditKYCModal';
import { RejectKYCModal } from '@/components/kyc/RejectKYCModal';
import { useAuthContext } from '@/context/AuthContext';
import {
  KYCDocument,
  getDocumentTypeDisplayName,
  formatLoanType
} from '@/types/kyc';
import {
  uploadDocument,
  deleteDocument,
  makeVerificationDecision,
  reviveExpiredJob,
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
  const [previewDocument, setPreviewDocument] = useState<KYCDocument | null>(null);
  const [viewerZoom, setViewerZoom] = useState(100);

  const isImageDoc = (fileName?: string, fileType?: string, fileUrl?: string) => {
    const name = (fileName || fileUrl || '').toLowerCase();
    return (
      ['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => name.endsWith(`.${ext}`)) ||
      fileType?.startsWith('image/')
    );
  };

  const isPdfDoc = (fileName?: string, fileType?: string, fileUrl?: string) => {
    const name = (fileName || fileUrl || '').toLowerCase();
    return name.endsWith('.pdf') || fileType === 'application/pdf' || (fileUrl && fileUrl.toLowerCase().includes('.pdf'));
  };

  const getDocumentPreviewUrl = (url?: string) => {
    if (!url) return '';
    if (url.includes('res.cloudinary.com') && url.includes('/image/upload/') && url.toLowerCase().endsWith('.pdf')) {
      return url.replace(/\.pdf$/i, '.png');
    }
    return url;
  };

  const isRenderableAsImage = (fileName?: string, fileType?: string, fileUrl?: string) => {
    if (fileUrl && fileUrl.includes('res.cloudinary.com') && fileUrl.includes('/image/upload/')) {
      return true;
    }
    return isImageDoc(fileName, fileType, fileUrl);
  };

  const formatDocDate = (dateStr?: string | Date) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '' : format(d, 'MMM d, yyyy');
    } catch {
      return '';
    }
  };

  const handleVerificationApproval = async (addressIndex: number) => {
    try {
      setUpdating(true);

      const addressLabel = addresses[addressIndex]?.label || `Address ${addressIndex + 1}`;

      await makeVerificationDecision(userId, 'approved', undefined, addressIndex, undefined);
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

  const handleVerificationNotApproved = async (addressIndex: number) => {
    try {
      setUpdating(true);

      const addressLabel = addresses[addressIndex]?.label || `Address ${addressIndex + 1}`;

      await makeVerificationDecision(userId, 'not_approved', undefined, addressIndex, undefined);
      await refetch();

      addToast({
        type: 'success',
        title: 'Address Not Approved',
        message: `${addressLabel} has been marked as Not Approved.`,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          type: 'error',
          title: 'Update Failed',
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
      await makeVerificationDecision(userId, 'rejected', undefined, addressIndex, rejectionReason);
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
    }
  };

  const handleReviveJob = async () => {
    try {
      setUpdating(true);
      await reviveExpiredJob(userId);
      await refetch();
      addToast({
        type: 'success',
        title: 'Job Revived',
        message: 'The job has been successfully revived and is pending.',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          type: 'error',
          title: 'Failed to Revive Job',
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
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg border border-gray-200 p-8">
          <p className="text-sm text-gray-500 mb-3">User not found</p>
          <Link href="/kyc">
            <Button variant="secondary" size="sm">
              Back to Verification Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasMultipleAddresses = user.addresses && user.addresses.length > 0;
  const addresses = hasMultipleAddresses ? user.addresses! : [{
    label: 'Address',
    streetNumber: user.streetNumber,
    streetName: user.streetName,
    landmark: user.landmark,
    city: user.city,
    lga: user.lga,
    state: user.state,
    country: user.country,
    latitude: user.latitude,
    longitude: user.longitude,
    status: user.status,
    verificationData: user.verificationData,
  }];

  const canUploadDocuments = user.status === 'PENDING';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/kyc" className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-sm text-gray-500">Verification Details</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            {isMelonAdmin && user.status === 'EXPIRED' && (
              <Button
                variant="primary"
                size="sm"
                icon={<RotateCcw className="w-4 h-4" />}
                onClick={handleReviveJob}
                loading={updating}
                className="flex-1 sm:flex-none"
              >
                Revive Job
              </Button>
            )}
            {user.status !== 'REJECTED' && user.status !== 'VERIFIED' && (
              <Button
                variant="danger"
                size="sm"
                icon={<ShieldAlert className="w-4 h-4" />}
                onClick={() => openModal(<RejectKYCModal user={user} onClose={closeModal} onSuccess={refetch} />, { size: 'lg' })}
                className="flex-1 sm:flex-none"
              >
                Reject Request
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              icon={<Edit2 className="w-4 h-4" />}
              onClick={() => openModal(<EditKYCModal user={user} onClose={closeModal} onSuccess={refetch} />, { size: 'xl' })}
              className="flex-1 sm:flex-none"
            >
              Edit Request
            </Button>
            <StatusBadge status={user.status} size="md" className="shrink-0" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {user.status === 'VERIFIED' && (
              <Card className="border-2 border-emerald-200 bg-emerald-50">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="w-full">
                      <CardTitle className="text-emerald-800 mb-1">Approved & Verified</CardTitle>
                      <div className="text-sm text-emerald-700 space-y-1">
                        <p>Organization is satisfied with the job. The submissions, comments and verification have been approved.</p>
                        <p className="text-xs text-emerald-600 font-medium">Agent gets paid ✓</p>
                        {user.verificationDate && (
                          <p className="text-xs text-emerald-600">Decision made: {format(new Date(user.verificationDate), 'PPp')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}

            {user.status === 'NOT_APPROVED' && (
              <Card className="border-2 border-amber-200 bg-amber-50">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="w-full">
                      <CardTitle className="text-amber-800 mb-1">Not Approved</CardTitle>
                      <div className="text-sm text-amber-700 space-y-1">
                        <p>The agent went to the field and did the required job, but the risk team is not convinced to proceed in onboarding the customer.</p>
                        <p className="text-xs text-amber-600 font-medium">Agent still gets paid ✓</p>
                        {user.verificationDate && (
                          <p className="text-xs text-amber-600">Decision made: {format(new Date(user.verificationDate), 'PPp')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}

            {user.status === 'REJECTED' && (
              <Card className="border-2 border-error-light/50 bg-error-light/10">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-error-light/30 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-error" />
                    </div>
                    <div className="w-full">
                      <CardTitle className="text-error mb-1">Verification Rejected</CardTitle>
                      <div className="text-sm text-error/90 space-y-2">
                        <p>The verification submission was not convincing. The verification was not done properly.</p>
                        <p className="text-xs text-red-600 font-medium">Agent does not get paid ✗</p>
                        {user.verificationDate && (
                          <p className="text-xs text-red-500">Decision made: {format(new Date(user.verificationDate), 'PPp')}</p>
                        )}
                        {user.rejectionReason && (
                          <div className="font-medium text-base mt-2">
                            Reason: {user.rejectionReason}
                          </div>
                        )}
                        {user.rejectionNote && (
                          <div className="whitespace-pre-wrap text-error/80">
                            {user.rejectionNote}
                          </div>
                        )}
                        {user.rejectionEvidence && user.rejectionEvidence.length > 0 && (
                          <div className="mt-4 border-t border-error-light/30 pt-4">
                            <span className="font-medium block mb-2">Attached Evidence:</span>
                            <div className="flex gap-4 overflow-x-auto pb-2">
                              {user.rejectionEvidence.map((ev, i) => (
                                <a
                                  key={i}
                                  href={ev.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="shrink-0 group relative rounded-lg overflow-hidden border border-error-light/50 hover:border-error transition-colors"
                                >
                                  <img
                                    src={ev.url}
                                    alt={`Evidence ${i + 1}`}
                                    className="h-24 w-32 object-cover group-hover:scale-105 transition-transform"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                                    <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}

            {user.relogReason && (
              <Card className="border-1 border-primary-light/50 bg-primary-light/5">
                <CardHeader className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-primary-light/20 rounded-md">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-primary uppercase tracking-wider">Re-logged Job Information</div>
                      <div className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">Reason for Re-logging:</span> {user.relogReason}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Full Name</div>
                    <div className="text-sm text-gray-900">{user.firstName} {user.lastName}</div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email Address</div>
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Loan ID</div>
                    <div className="text-sm text-gray-900">{user.loanId || <span className="text-gray-400 italic">Not provided</span>}</div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Request Category</div>
                    <div className="text-sm text-gray-900">
                      {user.loanType ? (
                        <Badge variant="neutral" size="sm" className="bg-gray-100 text-gray-800 border-gray-200">
                          {formatLoanType(user.loanType)}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 italic">Not specified</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Occupation</div>
                    <div className="text-sm text-gray-900">{user.occupation || <span className="text-gray-400 italic">Not provided</span>}</div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Phone Number</div>
                    <div className="text-sm text-gray-900">{user.phone}</div>
                  </div>

                  {user.bvn && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">BVN</div>
                      <div className="text-sm text-gray-900 font-mono">{user.bvn}</div>
                    </div>
                  )}

                  {user.nin && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">NIN</div>
                      <div className="text-sm text-gray-900 font-mono">{user.nin}</div>
                    </div>
                  )}

                  {user.passportNumber && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Passport Number</div>
                      <div className="text-sm text-gray-900 font-mono">{user.passportNumber}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date Submitted</div>
                    <div className="text-sm text-gray-900">{format(new Date(user.submittedAt), 'PPP')}</div>
                  </div>

                  {user.notes && (
                    <div className="md:col-span-2">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">General Instructions / Notes</div>
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">{user.notes}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {addresses.map((address, index) => (
              <div key={index} className="space-y-6">
                {address.status === 'VERIFICATION_SUBMITTED' && address.verificationData && (
                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                            <AlertTriangle className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-blue-900 mb-1">
                              Review Required - {address.label}
                            </CardTitle>
                            <p className="text-sm text-blue-700">
                              Agent has submitted verification results. Review the information below.
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 w-full sm:w-auto">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleVerificationApproval(index)}
                            disabled={updating}
                            icon={<CheckCircle className="w-4 h-4" />}
                            className="flex-1 sm:flex-none"
                            title="Approved & Verified (Agent Gets Paid)"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleVerificationNotApproved(index)}
                            disabled={updating}
                            icon={<AlertTriangle className="w-4 h-4" />}
                            className="flex-1 sm:flex-none text-amber-700 bg-amber-100 hover:bg-amber-200 border-amber-200"
                            title="Not Approved (Agent Gets Paid)"
                          >
                            Not Approved
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setRejectingIndex(index)}
                            disabled={updating}
                            icon={<XCircle className="w-4 h-4" />}
                            className="flex-1 sm:flex-none"
                            title="Rejection (Agent Not Paid)"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{address.label || `Address ${index + 1}`}</CardTitle>
                      {address.status && (
                        <StatusBadge status={address.status} size="sm" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        {formatAddress(address) && (
                          <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Full Address</div>
                            <div className="text-sm text-gray-900">{formatAddress(address)}</div>
                          </div>
                        )}

                        {address.latitude && address.longitude && (
                          <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">GPS Coordinates</div>
                            <div className="text-sm text-gray-900 font-mono">
                              {address.latitude.toFixed(6)}, {address.longitude.toFixed(6)}
                            </div>
                          </div>
                        )}

                        {address.notes && (
                          <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Instructions / Notes</div>
                            <div className="text-sm text-gray-900 whitespace-pre-wrap">{address.notes}</div>
                          </div>
                        )}
                      </div>

                      {address.verificationData && (
                        <div className="pt-6 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-900 mb-4">Agent Verification</h4>

                          <div className="space-y-4">
                            {address.verificationData.verifiedLatitude && address.verificationData.verifiedLongitude && (
                              <>
                                <div>
                                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Verified GPS Coordinates</div>
                                  <div className="text-sm text-gray-900 font-mono">
                                    {address.verificationData.verifiedLatitude.toFixed(6)}, {address.verificationData.verifiedLongitude.toFixed(6)}
                                  </div>
                                </div>

                                {address.latitude && address.longitude && (
                                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="text-xs font-medium text-blue-700 uppercase tracking-wider mb-1">Distance from Original</div>
                                    <div className="text-sm font-semibold text-blue-900">
                                      {(calculateDistance(
                                        address.latitude,
                                        address.longitude,
                                        address.verificationData.verifiedLatitude,
                                        address.verificationData.verifiedLongitude
                                      ) * 1000).toFixed(0)} meters
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                            {address.verificationData.verifiedAddress && (
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Verified Address</div>
                                <div className="text-sm text-gray-900">{address.verificationData.verifiedAddress}</div>
                              </div>
                            )}

                            {address.verificationData.verificationPhotos && address.verificationData.verificationPhotos.length > 0 && (
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                  Verification Photos ({address.verificationData.verificationPhotos.length})
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {address.verificationData.verificationPhotos.map((photo: any, i: number) => {
                                    let url = '';
                                    let tag = null;

                                    if (typeof photo === 'string') {
                                      url = photo;
                                    } else if (photo && typeof photo === 'object') {
                                      if (photo.url) {
                                        url = photo.url;
                                        tag = photo.tag;
                                      } else if (photo['0']) {
                                        // Reconstruct mangled character-by-character object
                                        url = Object.keys(photo)
                                          .sort((a, b) => parseInt(a) - parseInt(b))
                                          .filter(key => !isNaN(parseInt(key)))
                                          .map(key => photo[key])
                                          .join('');
                                      }
                                    }

                                    if (!url || typeof url !== 'string') return null;

                                    return (
                                      <div key={i} className="space-y-1">
                                        <a
                                          href={url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all group block"
                                        >
                                          <Image
                                            src={url}
                                            alt={tag || `Photo ${i + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </div>
                                        </a>
                                        {tag && (
                                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                            {tag.replace(/_/g, ' ')}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {address.verificationData.agentNotes && (
                              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Agent Notes</div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{address.verificationData.agentNotes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Documents</CardTitle>
                  {canUploadDocuments && (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,.pdf"
                        disabled={uploading}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Upload className="w-4 h-4" />}
                        loading={uploading}
                        disabled={uploading}
                      >
                        Upload
                      </Button>
                    </label>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {user.documents && user.documents.length > 0 ? (
                  <div className="space-y-3">
                    {user.documents.map((doc: KYCDocument) => {
                      const docDate = formatDocDate(doc.uploadedAt);
                      const fileSizeStr = doc.fileSize
                        ? `${(doc.fileSize / 1024).toFixed(1)} KB`
                        : '';
                      return (
                        <div
                          key={doc._id || doc.id}
                          className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div
                            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                            onClick={() => {
                              setPreviewDocument(doc);
                              setViewerZoom(100);
                            }}
                          >
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 border border-gray-200 shadow-sm">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <div className="font-medium text-gray-900 text-sm truncate hover:text-primary transition-colors">
                                  {doc.fileName}
                                </div>
                                <Badge variant="neutral" size="sm">
                                  {getDocumentTypeDisplayName(doc.documentType)}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-500">
                                {fileSizeStr && `${fileSizeStr} • `}
                                {docDate || 'Uploaded'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-3">
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={<Eye className="w-4 h-4" />}
                              onClick={() => {
                                setPreviewDocument(doc);
                                setViewerZoom(100);
                              }}
                              className="text-xs py-1 px-2.5"
                            >
                              Preview
                            </Button>
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
                              title="Open in new tab"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            {canUploadDocuments && (
                              <button
                                onClick={() => handleDeleteDocument(doc._id || doc.id || '')}
                                className="p-2 text-gray-400 hover:text-error hover:bg-white rounded-lg transition-colors border border-transparent hover:border-error-light/30"
                                title="Delete document"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">No documents yet</p>
                    <p className="text-xs text-gray-500">Upload documents to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>


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
              <Card>
                <CardHeader>
                  <CardTitle>Submission Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        IP Address
                      </div>
                      <div className="text-sm text-gray-900 font-mono">
                        {user.requestMetadata.ipAddress || 'Unknown'}
                      </div>
                    </div>

                    {user.requestMetadata.location ? (
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                          Approx. Location
                        </div>
                        <div className="text-sm text-gray-900">
                          {user.requestMetadata.location.city},{' '}
                          {user.requestMetadata.location.country}
                        </div>
                        {user.requestMetadata.location.isp && (
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {user.requestMetadata.location.isp}
                          </div>
                        )}
                      </div>
                    ) : user.requestMetadata.ipAddress ? (
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                          Approx. Location
                        </div>
                        <div className="text-sm text-gray-400 italic">
                          {user.requestMetadata.ipAddress.includes('127.0.0.1') || user.requestMetadata.ipAddress === '::1'
                            ? 'Local Network (No Geo Data)'
                            : 'Location Not Available'}
                        </div>
                      </div>
                    ) : null}

                    <div className="pt-3 border-t border-gray-100">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Device & Platform
                      </div>
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <span>
                          {user.requestMetadata.device || 'Unknown Device'}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span>
                          {user.requestMetadata.browser || 'Unknown Browser'}
                        </span>
                      </div>
                      {user.requestMetadata.os && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          on {user.requestMetadata.os}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Submitted</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(user.submittedAt), 'PPp')}
                      </div>
                    </div>
                  </div>

                  {user.assignedAt && (!user.verifiedAt || Math.abs(new Date(user.assignedAt).getTime() - new Date(user.verifiedAt).getTime()) >= 60000) && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-purple-500 shrink-0"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Agent Assigned</div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(user.assignedAt), 'PPp')}
                        </div>
                      </div>
                    </div>
                  )}

                  {user.verifiedAt && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Agent Submitted</div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(user.verifiedAt), 'PPp')}
                        </div>
                      </div>
                    </div>
                  )}

                  {user.status === 'VERIFIED' && user.verificationDate && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 shrink-0"></div>
                      <div>
                        <div className="text-sm font-medium text-emerald-700">Approved & Verified</div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(user.verificationDate), 'PPp')}
                        </div>
                      </div>
                    </div>
                  )}

                  {user.status === 'NOT_APPROVED' && user.verificationDate && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-amber-500 shrink-0"></div>
                      <div>
                        <div className="text-sm font-medium text-amber-700">Not Approved</div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(user.verificationDate), 'PPp')}
                        </div>
                      </div>
                    </div>
                  )}

                  {user.status === 'REJECTED' && user.verificationDate && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-red-500 shrink-0"></div>
                      <div>
                        <div className="text-sm font-medium text-red-700">Rejected</div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(user.verificationDate), 'PPp')}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-gray-300 shrink-0"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Last Updated</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(user.updatedAt), 'PPp')}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {user.assignedAgent && typeof user.assignedAgent !== 'string' && (
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Agent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm text-gray-500">Name</div>
                      <div className="text-gray-900">
                        {user.assignedAgent.firstName} {user.assignedAgent.lastName}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="text-gray-900">{user.assignedAgent.email}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {rejectingIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-error-light rounded-lg">
                <XCircle className="w-5 h-5 text-error" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Reject {addresses[rejectingIndex]?.label}
                </h3>
                <p className="text-sm text-gray-600">
                  Provide a reason for rejecting this address verification.
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-error">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this address verification is being rejected..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 10 characters ({rejectionReason.trim().length}/10)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setRejectingIndex(null);
                  setRejectionReason('');
                }}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => handleVerificationRejection(rejectingIndex)}
                loading={updating}
                disabled={rejectionReason.trim().length < 10 || updating}
                fullWidth
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {previewDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {previewDocument.fileName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span className="font-medium text-gray-700">
                      {getDocumentTypeDisplayName(previewDocument.documentType)}
                    </span>
                    {previewDocument.fileSize ? (
                      <>
                        <span>•</span>
                        <span>{(previewDocument.fileSize / 1024).toFixed(1)} KB</span>
                      </>
                    ) : null}
                    {previewDocument.uploadedAt ? (
                      <>
                        <span>•</span>
                        <span>{formatDocDate(previewDocument.uploadedAt)}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-4">
                {isRenderableAsImage(previewDocument.fileName, previewDocument.fileType, previewDocument.fileUrl) && (
                  <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
                    <button
                      onClick={() => setViewerZoom(Math.max(50, viewerZoom - 25))}
                      className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-gray-600 px-2 font-medium">
                      {viewerZoom}%
                    </span>
                    <button
                      onClick={() => setViewerZoom(Math.min(200, viewerZoom + 25))}
                      className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <a
                  href={getDocumentPreviewUrl(previewDocument.fileUrl)}
                  download={previewDocument.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-white text-gray-600 hover:text-primary rounded-lg border border-gray-200 bg-white transition-colors shadow-sm"
                  title="Download / Open Original"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => {
                    setPreviewDocument(null);
                    setViewerZoom(100);
                  }}
                  className="p-2 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-gray-100 flex items-center justify-center min-h-[500px]">
              {isRenderableAsImage(previewDocument.fileName, previewDocument.fileType, previewDocument.fileUrl) ? (
                <div className="flex items-center justify-center min-h-full">
                  <img
                    src={getDocumentPreviewUrl(previewDocument.fileUrl)}
                    alt={previewDocument.fileName}
                    style={{ transform: `scale(${viewerZoom / 100})` }}
                    className="max-w-full max-h-[75vh] object-contain rounded transition-transform shadow-md"
                  />
                </div>
              ) : isPdfDoc(previewDocument.fileName, previewDocument.fileType, previewDocument.fileUrl) ? (
                <iframe
                  src={
                    previewDocument.fileUrl.startsWith('http')
                      ? `https://docs.google.com/viewer?url=${encodeURIComponent(previewDocument.fileUrl)}&embedded=true`
                      : previewDocument.fileUrl
                  }
                  className="w-full h-full min-h-[650px] border border-gray-200 rounded-lg bg-white shadow-inner"
                  title={previewDocument.fileName}
                />
              ) : (
                <div className="text-center py-12 bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-md">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 mb-1">
                    {previewDocument.fileName}
                  </h4>
                  <p className="text-xs text-gray-500 mb-4">
                    Preview is not supported directly for this file format. You can download or view it in a new window.
                  </p>
                  <a
                    href={previewDocument.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
