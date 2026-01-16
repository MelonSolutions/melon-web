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
  Upload,
  Trash2,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/kyc/StatusBadge';
import { 
  VerificationStatus,
  KYCDocument,
  getDocumentTypeDisplayName
} from '@/types/kyc';
import { 
  updateKYCUser, 
  uploadDocument, 
  deleteDocument,
  ApiError 
} from '@/lib/api/kyc';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/Toast';
import { useModal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

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

  const handleStatusChange = async (newStatus: VerificationStatus) => {
    if (!user) return;

    let rejectionReason: string | undefined;
    
    if (newStatus === 'REJECTED') {
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
        message: `Status changed to ${newStatus.replace('_', ' ').toLowerCase()}.`,
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

  const formatAddress = () => {
    if (!user) return null;
    
    const parts = [
      user.streetNumber,
      user.streetName,
      user.landmark,
      user.city,
      user.lga,
      user.state,
      user.country,
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : null;
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

  const addressDisplay = formatAddress();

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
          
          <StatusBadge status={user.status} size="md" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
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
                  
                  {addressDisplay && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-500">Address</div>
                        <div className="text-gray-900">{addressDisplay}</div>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Documents ({user.documents?.length || 0})</CardTitle>
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
                </div>
              </CardHeader>
              <CardContent>
                {user.documents && user.documents.length > 0 ? (
                  <div className="space-y-3">
                    {user.documents.map((doc: KYCDocument) => (
                      <div
                        key={doc._id || doc.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-gray-900 truncate">
                                {doc.fileName}
                              </div>
                              <Badge variant="neutral" size="sm">
                                {getDocumentTypeDisplayName(doc.documentType)}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500 mt-0.5">
                              {(doc.fileSize / 1024).toFixed(1)} KB • {format(new Date(doc.uploadedAt), 'PPp')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-2">
                          
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary-light rounded transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDeleteDocument(doc._id || doc.id || '')}
                            className="p-2 text-gray-400 hover:text-error hover:bg-error-light rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No documents uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {user.status === 'REJECTED' && user.rejectionReason && (
              <div className="bg-error-light border border-error rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-error mb-2">
                      Rejection Reason
                    </h3>
                    <p className="text-sm text-gray-700">{user.rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {user.status !== 'VERIFIED' && (
                    <Button
                      variant="success"
                      size="md"
                      fullWidth
                      onClick={() => handleStatusChange('VERIFIED')}
                      disabled={updating}
                      icon={<CheckCircle className="w-4 h-4" />}
                    >
                      Approve
                    </Button>
                  )}
                  
                  {user.status !== 'IN_REVIEW' && (
                    <Button
                      variant="secondary"
                      size="md"
                      fullWidth
                      onClick={() => handleStatusChange('IN_REVIEW')}
                      disabled={updating}
                      icon={<Clock className="w-4 h-4" />}
                    >
                      Mark In Review
                    </Button>
                  )}
                  
                  {user.status !== 'REJECTED' && (
                    <Button
                      variant="danger"
                      size="md"
                      fullWidth
                      onClick={() => handleStatusChange('REJECTED')}
                      disabled={updating}
                      icon={<XCircle className="w-4 h-4" />}
                    >
                      Reject
                    </Button>
                  )}
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
          </div>
        </div>
      </div>
    </div>
  );
}
