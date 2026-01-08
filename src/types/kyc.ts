/* eslint-disable @typescript-eslint/no-explicit-any */

export type VerificationStatus = 
  | 'PENDING' 
  | 'IN_REVIEW' 
  | 'VERIFIED' 
  | 'REJECTED';

export type IdentityType = 
  | 'NIN' 
  | 'BVN' 
  | 'VOTER_CARD' 
  | 'DRIVERS_LICENSE' 
  | 'PASSPORT';

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
  identityType: IdentityType;
  identityNumber: string;
  status: VerificationStatus;
  documents: KYCDocument[];
  verificationDate?: string;
  rejectionReason?: string;
  addressVerification?: AddressVerification;
  submittedAt: string;
  updatedAt: string;
  createdAt: string;
}

export interface KYCDocument {
  _id?: string;
  id?: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  ocrData?: OCRData;
  verified: boolean;
}

export interface OCRData {
  extractedText: string;
  confidence: number;
  detectedFields: {
    name?: string;
    idNumber?: string;
    dateOfBirth?: string;
    address?: string;
    expiryDate?: string;
  };
  mismatches?: string[];
}

export interface AddressVerification {
  address: string;
  city: string;
  state: string;
  assignedAgent?: string;
  agentNotes?: string;
  verifiedAt?: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
}

export interface IdentityVerificationRequest {
  identityType: IdentityType;
  identityNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
}

export interface IdentityVerificationResponse {
  success: boolean;
  verified: boolean;
  data?: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phone?: string;
    email?: string;
    photo?: string;
  };
  message?: string;
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
  identityType: IdentityType;
  identityNumber: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface UpdateKYCUserRequest {
  status?: VerificationStatus;
  rejectionReason?: string;
  addressVerification?: Partial<AddressVerification>;
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

// Display name helpers
export const STATUS_DISPLAY_NAMES: Record<VerificationStatus, string> = {
  PENDING: 'Pending',
  IN_REVIEW: 'In Review',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
};

export const IDENTITY_TYPE_DISPLAY_NAMES: Record<IdentityType, string> = {
  NIN: 'National Identity Number',
  BVN: 'Bank Verification Number',
  VOTER_CARD: 'Voter Card',
  DRIVERS_LICENSE: 'Driver\'s License',
  PASSPORT: 'International Passport',
};

export const getStatusDisplayName = (status: VerificationStatus): string => {
  return STATUS_DISPLAY_NAMES[status] || status;
};

export const getIdentityTypeDisplayName = (type: IdentityType): string => {
  return IDENTITY_TYPE_DISPLAY_NAMES[type] || type;
};

// Status color helpers
export const getStatusColor = (status: VerificationStatus): string => {
  const colors = {
    PENDING: 'blue',
    IN_REVIEW: 'yellow',
    VERIFIED: 'green',
    REJECTED: 'red',
  };
  return colors[status] || 'gray';
};
