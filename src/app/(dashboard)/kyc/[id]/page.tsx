/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useKYCUser } from '@/hooks/useKYC';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/kyc/StatusBadge';
import { 
  getIdentityTypeDisplayName, 
  VerificationStatus,
  KYCDocument 
} from '@/types/kyc';
import { 
  updateKYCUser, 
  uploadDocument, 
  deleteDocument,
  verifyIdentity,
  ApiError 
} from '@/lib/api/kyc';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/Toast';
import { useModal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function KYCUserDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  const router = useRouter();
  const { addToast } = useToast();
  const { openModal, closeModal } = useModal();
  
  const { user, loading, refetch } = useKYCUser(userId);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleStatusChange = async (newStatus: VerificationStatus) => {
    if (!user) return;

    let rejectionReason: string | undefined;
    
    if (newStatus === 'REJECTED') {
      // Prompt for rejection reason
      const reason = window.prompt('Please provide a reason for rejection:');
      if (!reason) return;
      rejectionReason = reason;
    }

    try {
      setUpdating(true);
      await updateKYCUser(userId, { 
        status: newStatus,
        ...(rejectionReason && { rejectionReason })
      });
      
      await refetch();
      
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: `User status changed to ${newStatus.toLowerCase()}.`,
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await uploadDocument(userId, file, 'ID_CARD');
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
    openModal(
      <ConfirmDialog
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={async () => {
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
        onCancel={closeModal}
      />,
      { size: 'sm' }
    );
  };

  const handleVerifyIdentity = async () => {
    if (!user) return;

    try {
      setVerifying(true);
      const result = await verifyIdentity({
        identityType: user.identityType as any,
        identityNumber: user.identityNumber || '',
        firstName: user.firstName,
        lastName: user.lastName,
      });

      if (result.verified) {
        addToast({
          type: 'success',
          title: 'Identity Verified',
          message: 'The identity has been verified successfully with external API.',
        });
      } else {
        addToast({
          type: 'warning',
          title: 'Verification Failed',
          message: result.message || 'Could not verify identity.',
        });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          type: 'error',
          title: 'Verification Error',
          message: error.message,
        });
      }
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
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
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-sm mb-2">User not found</div>
        <Link 
          href="/kyc"
          className="text-sm text-[#5B94E5] hover:text-blue-700 font-medium"
        >
          Back to KYC Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/kyc"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              KYC Verification Details
            </p>
          </div>
        </div>
        
        <StatusBadge status={user.status} size="lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="text-gray-900">{user.email}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="text-gray-900">{user.phone}</div>
                </div>
              </div>
              
              {user.addressVerification && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Address</div>
                    <div className="text-gray-900">
                      {user.addressVerification.address}
                      {user.addressVerification.city && `, ${user.addressVerification.city}`}
                      {user.addressVerification.state && `, ${user.addressVerification.state}`}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Submitted</div>
                  <div className="text-gray-900">
                    {format(new Date(user.submittedAt), 'PPP')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Identity Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Identity Verification
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Identity Type</div>
                <div className="text-gray-900 font-medium">
                  {getIdentityTypeDisplayName(user.identityType as any)}
                </div>
              </div>
              
              {user.identityNumber && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Identity Number</div>
                  <div className="text-gray-900 font-mono">
                    {user.identityNumber}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Documents ({user.documents?.length || 0})
              </h2>
              <label className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#5B94E5] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload Document'}
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf"
                  disabled={uploading}
                />
              </label>
            </div>
            
            {user.documents && user.documents.length > 0 ? (
              <div className="space-y-3">
                {user.documents.map((doc: KYCDocument) => (
                  <div
                    key={doc._id || doc.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {doc.fileName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {(doc.fileSize / 1024).toFixed(1)} KB • Uploaded {format(new Date(doc.uploadedAt), 'PPp')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-[#5B94E5] hover:bg-blue-50 rounded transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(doc._id || doc.id || '')}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No documents uploaded yet
              </div>
            )}
          </div>

          {/* Rejection Reason */}
          {user.status === 'REJECTED' && user.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">
                    Rejection Reason
                  </h3>
                  <p className="text-red-700">{user.rejectionReason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
            
            <div className="space-y-2">
              {user.status !== 'VERIFIED' && (
                <button
                  onClick={() => handleStatusChange('VERIFIED')}
                  disabled={updating}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              )}
              
              {user.status !== 'IN_REVIEW' && (
                <button
                  onClick={() => handleStatusChange('IN_REVIEW')}
                  disabled={updating}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Clock className="w-4 h-4" />
                  Mark In Review
                </button>
              )}
              
              {user.status !== 'REJECTED' && (
                <button
                  onClick={() => handleStatusChange('REJECTED')}
                  disabled={updating}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Submitted</div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(user.submittedAt), 'PPp')}
                  </div>
                </div>
              </div>
              
              {user.verificationDate && (
                <div className="flex gap-3">
                  <div className="shrink-0 w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Verified</div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(user.verificationDate), 'PPp')}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <div className="shrink-0 w-2 h-2 mt-2 rounded-full bg-gray-300"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Last Updated</div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(user.updatedAt), 'PPp')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
