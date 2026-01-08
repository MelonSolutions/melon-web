/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useKYCUser } from '@/hooks/useKYC';
import { 
  ArrowLeft, 
  Upload,
  Download,
  Trash2,
  FileText,
  Image as ImageIcon,
  File,
  Eye,
  ZoomIn,
  ZoomOut,
  X,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/kyc/StatusBadge';
import { KYCDocument } from '@/types/kyc';
import { uploadDocument, deleteDocument, ApiError } from '@/lib/api/kyc';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/Toast';
import { useModal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function KYCDocumentsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  const router = useRouter();
  const { addToast } = useToast();
  const { openModal, closeModal } = useModal();
  
  const { user, loading, refetch } = useKYCUser(userId);
  const [uploading, setUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null);
  const [viewerZoom, setViewerZoom] = useState(100);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'File Too Large',
        message: 'Please upload a file smaller than 5MB.',
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      addToast({
        type: 'error',
        title: 'Invalid File Type',
        message: 'Please upload a JPG, PNG, or PDF file.',
      });
      return;
    }

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

  const handleDeleteDocument = async (document: KYCDocument) => {
    const docId = document._id || document.id || '';
    
    openModal(
      <ConfirmDialog
        title="Delete Document"
        message={`Are you sure you want to delete "${document.fileName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={async () => {
          try {
            await deleteDocument(userId, docId);
            await refetch();
            closeModal();
            
            // Close viewer if this document was being viewed
            if (selectedDocument && (selectedDocument._id === docId || selectedDocument.id === docId)) {
              setSelectedDocument(null);
            }
            
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

  const handleViewDocument = (document: KYCDocument) => {
    setSelectedDocument(document);
    setViewerZoom(100);
  };

  const closeViewer = () => {
    setSelectedDocument(null);
    setViewerZoom(100);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <ImageIcon className="w-5 h-5" />;
    } else if (extension === 'pdf') {
      return <FileText className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  const isImageFile = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-48 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
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

  const documents = user.documents || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/kyc/${userId}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Documents - {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage verification documents
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <StatusBadge status={user.status} size="md" />
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors cursor-pointer">
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Document
              </>
            )}
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* User Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Email</span>
              <span className="font-medium text-gray-900">{user.email}</span>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Phone</span>
              <span className="font-medium text-gray-900">{user.phone}</span>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Documents</span>
              <span className="font-medium text-gray-900">{documents.length} file(s)</span>
            </div>
          </div>
          <Link
            href={`/kyc/${userId}`}
            className="text-sm text-[#5B94E5] hover:text-blue-700 font-medium"
          >
            View Full Profile →
          </Link>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc: KYCDocument) => {
              const docId = doc._id || doc.id;
              return docId ? (
                <div
                  key={docId}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Preview */}
                  <div className="relative bg-gray-50 h-48 flex items-center justify-center">
                    {isImageFile(doc.fileName) ? (
                      <img
                        src={doc.fileUrl}
                        alt={doc.fileName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400">
                        {getFileIcon(doc.fileName)}
                        <div className="text-xs mt-2 text-center">
                          {doc.fileName.split('.').pop()?.toUpperCase()}
                        </div>
                      </div>
                    )}
                    
                    {/* Verified Badge */}
                    {doc.verified && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                        Verified
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 truncate mb-1">
                      {doc.fileName}
                    </h3>
                    <div className="text-xs text-gray-500 mb-3">
                      {(doc.fileSize / 1024).toFixed(1)} KB • Uploaded {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                    </div>

                    {/* OCR Info */}
                    {doc.ocrData && (
                      <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                        <div className="font-medium text-blue-900 mb-1">OCR Extracted</div>
                        <div className="text-blue-700">
                          Confidence: {(doc.ocrData.confidence * 100).toFixed(0)}%
                        </div>
                        {doc.ocrData.mismatches && doc.ocrData.mismatches.length > 0 && (
                          <div className="text-red-600 mt-1">
                            ⚠ {doc.ocrData.mismatches.length} mismatch(es) found
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDocument(doc)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <a
                        href={doc.fileUrl}
                        download={doc.fileName}
                        className="inline-flex items-center justify-center p-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(doc)}
                        className="inline-flex items-center justify-center p-2 text-red-600 bg-white border border-gray-300 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Documents Yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Upload identity documents, proof of address, or other verification files to get started.
            </p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              Upload First Document
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf"
                disabled={uploading}
              />
            </label>
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {getFileIcon(selectedDocument.fileName)}
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedDocument.fileName}</h3>
                  <p className="text-sm text-gray-500">
                    {(selectedDocument.fileSize / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isImageFile(selectedDocument.fileName) && (
                  <>
                    <button
                      onClick={() => setViewerZoom(Math.max(50, viewerZoom - 25))}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                    >
                      <ZoomOut className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-gray-600 min-w-15 text-center">
                      {viewerZoom}%
                    </span>
                    <button
                      onClick={() => setViewerZoom(Math.min(200, viewerZoom + 25))}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>
                  </>
                )}
                <a
                  href={selectedDocument.fileUrl}
                  download={selectedDocument.fileName}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <Download className="w-5 h-5" />
                </a>
                <button
                  onClick={closeViewer}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 bg-gray-50">
              {isImageFile(selectedDocument.fileName) ? (
                <div className="flex items-center justify-center min-h-full">
                  <img
                    src={selectedDocument.fileUrl}
                    alt={selectedDocument.fileName}
                    style={{ transform: `scale(${viewerZoom / 100})` }}
                    className="max-w-full transition-transform"
                  />
                </div>
              ) : selectedDocument.fileName.endsWith('.pdf') ? (
                <iframe
                  src={selectedDocument.fileUrl}
                  className="w-full h-full min-h-150 border-0"
                  title={selectedDocument.fileName}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Preview not available for this file type</p>
                  <a
                    href={selectedDocument.fileUrl}
                    download={selectedDocument.fileName}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </a>
                </div>
              )}
            </div>

            {/* OCR Data */}
            {selectedDocument.ocrData && (
              <div className="p-4 border-t border-gray-200 bg-white">
                <h4 className="font-semibold text-gray-900 mb-3">OCR Extracted Data</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {selectedDocument.ocrData.detectedFields?.name && (
                    <div>
                      <div className="text-gray-500">Name</div>
                      <div className="font-medium text-gray-900">{selectedDocument.ocrData.detectedFields.name}</div>
                    </div>
                  )}
                  {selectedDocument.ocrData.detectedFields?.idNumber && (
                    <div>
                      <div className="text-gray-500">ID Number</div>
                      <div className="font-medium text-gray-900 font-mono">{selectedDocument.ocrData.detectedFields.idNumber}</div>
                    </div>
                  )}
                  {selectedDocument.ocrData.detectedFields?.dateOfBirth && (
                    <div>
                      <div className="text-gray-500">Date of Birth</div>
                      <div className="font-medium text-gray-900">{selectedDocument.ocrData.detectedFields.dateOfBirth}</div>
                    </div>
                  )}
                  {selectedDocument.ocrData.detectedFields?.expiryDate && (
                    <div>
                      <div className="text-gray-500">Expiry Date</div>
                      <div className="font-medium text-gray-900">{selectedDocument.ocrData.detectedFields.expiryDate}</div>
                    </div>
                  )}
                </div>
                
                {selectedDocument.ocrData.mismatches && selectedDocument.ocrData.mismatches.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="font-medium text-red-900 mb-2">⚠ Data Mismatches Found:</div>
                    <ul className="text-sm text-red-700 space-y-1">
                      {selectedDocument.ocrData.mismatches.map((mismatch, index) => (
                        <li key={index}>• {mismatch}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="mt-3 text-sm text-gray-500">
                  Confidence Score: {(selectedDocument.ocrData.confidence * 100).toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
