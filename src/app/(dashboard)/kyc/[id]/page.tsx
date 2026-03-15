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
  ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/kyc/StatusBadge';
import { EditKYCModal } from '@/components/kyc/EditKYCModal';
import { RejectKYCModal } from '@/components/kyc/RejectKYCModal';
import { useAuthContext } from '@/context/AuthContext';
import {
  KYCDocument,
  getDocumentTypeDisplayName
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
    const note = window.prompt('Please provide a verification note for this approval:');
    if (!note || note.trim().length === 0) {
      addToast({
        type: 'error',
        title: 'Note Required',
        message: 'A verification note is mandatory for approval.',
      });
      return;
    }

    try {
      setUpdating(true);

      const addressLabel = addresses[addressIndex]?.label || `Address ${addressIndex + 1}`;

      await makeVerificationDecision(userId, true, undefined, addressIndex, note);
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
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/kyc" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-sm text-gray-500">Verification Details</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user.status !== 'REJECTED' && user.status !== 'VERIFIED' && (
              <Button
                variant="danger"
                size="sm"
                icon={<ShieldAlert className="w-4 h-4" />}
                onClick={() => openModal(<RejectKYCModal user={user} onClose={closeModal} onSuccess={refetch} />, { size: 'lg' })}
              >
                Reject Request
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              icon={<Edit2 className="w-4 h-4" />}
              onClick={() => openModal(<EditKYCModal user={user} onClose={closeModal} onSuccess={refetch} />, { size: 'xl' })}
            >
              Edit Request
            </Button>
            <StatusBadge status={user.status} size="md" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
                        {user.rejectionReason && (
                          <div className="font-medium text-base">
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
                          {user.loanType.toLowerCase()}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 italic">Not specified</span>
                      )}
                    </div>
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
                </div>
              </CardContent>
            </Card>

            {addresses.map((address, index) => (
              <div key={index} className="space-y-6">
                {address.status === 'VERIFICATION_SUBMITTED' && address.verificationData && (
                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-blue-100 rounded-lg">
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
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleVerificationApproval(index)}
                            disabled={updating}
                            icon={<CheckCircle className="w-4 h-4" />}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setRejectingIndex(index)}
                            disabled={updating}
                            icon={<XCircle className="w-4 h-4" />}
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
                                <div className="grid grid-cols-2 gap-3">
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
                    {user.documents.map((doc: KYCDocument) => (
                      <div
                        key={doc._id || doc.id}
                        className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-medium text-gray-900 text-sm truncate">
                                {doc.fileName}
                              </div>
                              <Badge variant="neutral" size="sm">
                                {getDocumentTypeDisplayName(doc.documentType)}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500">
                              {(doc.fileSize / 1024).toFixed(1)} KB • {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 ml-3">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-lg transition-colors"
                            title="View document"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          {canUploadDocuments && (
                            <button
                              onClick={() => handleDeleteDocument(doc._id || doc.id || '')}
                              className="p-2 text-gray-400 hover:text-error hover:bg-white rounded-lg transition-colors"
                              title="Delete document"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
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

                  {user.verificationDate && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-success shrink-0"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Verified</div>
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
    </div>
  );
}
