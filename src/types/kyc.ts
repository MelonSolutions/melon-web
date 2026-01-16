/* eslint-disable @typescript-eslint/no-explicit-any */

export type VerificationStatus = 
  | 'PENDING' 
  | 'IN_REVIEW' 
  | 'VERIFIED' 
  | 'REJECTED';

export type DocumentType = 
  | 'ID_CARD' 
  | 'PROOF_OF_ADDRESS' 
  | 'PASSPORT_PHOTO' 
  | 'UTILITY_BILL';

export interface KYCUser {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  streetNumber?: string;
  streetName?: string;
  landmark?: string;
  city?: string;
  lga?: string;
  state?: string;
  country?: string;
  
  status: VerificationStatus;
  documents: KYCDocument[];
  verificationDate?: string;
  rejectionReason?: string;
  
  assignedAgent?: string;
  agentNotes?: string;
  verifiedAt?: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
  
  submittedAt: string;
  updatedAt: string;
  createdAt: string;
}

export interface KYCDocument {
  _id?: string;
  id?: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  verified: boolean;
  ocrData?: OCRData;
}

export interface OCRData {
  extractedText: string;
  confidence: number;
  detectedFields: Record<string, string>;
  mismatches?: string[];
}

export interface KYCDashboardStats {
  totalUsers: number;
  verified: number;
  inReview: number;
  pending: number;
  rejected: number;
}

export interface CreateKYCUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetNumber?: string;
  streetName?: string;
  landmark?: string;
  city?: string;
  lga?: string;
  state?: string;
  country?: string;
}

export interface UpdateKYCUserRequest {
  status?: VerificationStatus;
  rejectionReason?: string;
  streetNumber?: string;
  streetName?: string;
  landmark?: string;
  city?: string;
  lga?: string;
  state?: string;
  country?: string;
  assignedAgent?: string;
  agentNotes?: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
}

export interface AuditLog {
  _id: string;
  userId: string;
  action: string;
  performedBy: string;
  changes: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
}

export const STATUS_DISPLAY_NAMES: Record<VerificationStatus, string> = {
  PENDING: 'Pending',
  IN_REVIEW: 'In Review',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
};

export const DOCUMENT_TYPE_DISPLAY_NAMES: Record<DocumentType, string> = {
  ID_CARD: 'ID Card',
  PROOF_OF_ADDRESS: 'Proof of Address',
  PASSPORT_PHOTO: 'Passport Photo',
  UTILITY_BILL: 'Utility Bill',
};

export const getStatusDisplayName = (status: VerificationStatus): string => {
  return STATUS_DISPLAY_NAMES[status] || status;
};

export const getDocumentTypeDisplayName = (type: DocumentType): string => {
  return DOCUMENT_TYPE_DISPLAY_NAMES[type] || type;
};

export const getStatusColor = (status: VerificationStatus): string => {
  const colors = {
    PENDING: 'blue',
    IN_REVIEW: 'yellow',
    VERIFIED: 'green',
    REJECTED: 'red',
  };
  return colors[status] || 'gray';
};
