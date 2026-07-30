/* eslint-disable @typescript-eslint/no-explicit-any */

export type VerificationStatus = 
  | 'PENDING' 
  | 'ASSIGNED'
  | 'IN_REVIEW'
  | 'VERIFICATION_SUBMITTED'
  | 'VERIFIED'
  | 'NOT_APPROVED'
  | 'REJECTED'
  | 'EXPIRED';

export type DocumentType = 
  | 'ID_CARD' 
  | 'PROOF_OF_ADDRESS' 
  | 'PASSPORT_PHOTO' 
  | 'UTILITY_BILL';

export type LoanType = 'PERSONAL' | 'BUSINESS' | 'DOCUMENT_VERIFICATION' | 'NEW_CUSTOMER';

export const LOAN_TYPE_LABELS: Record<string, string> = {
  PERSONAL: 'Personal Loan',
  BUSINESS: 'Business Loan',
  DOCUMENT_VERIFICATION: 'Document Verification (Purchase Order, Invoices)',
  NEW_CUSTOMER: 'New Customer Verification',
};

export function formatLoanType(loanType?: string): string {
  if (!loanType) return '';
  return LOAN_TYPE_LABELS[loanType] || loanType.toLowerCase();
}

export interface VerificationData {
  verifiedLatitude?: number;
  verifiedLongitude?: number;
  verifiedAddress?: string;
  verificationPhotos?: Array<{ url: string; tag?: string } | string>;
  agentNotes?: string;
  verifiedAt?: string;
}

export interface AddressData {
  label: string;
  streetNumber?: string;
  streetName?: string;
  landmark?: string;
  city?: string;
  lga?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  status?: VerificationStatus;
  verificationData?: VerificationData;
  mobileJobId?: string;
  notes?: string;
  relogReason?: string;
  rejectionReason?: string;
  rejectionNote?: string;
  isDeleted?: boolean;
  rejectionEvidence?: {
    url: string;
    tag?: string;
  }[];
}

export interface KYCUser {
  _id?: string;
  id?: string;
  loanId?: string;
  loanType?: LoanType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  occupation: string;
  bvn?: string;
  nin?: string;
  passportNumber?: string;
  addresses?: AddressData[];
  streetNumber?: string;
  streetName?: string;
  landmark?: string;
  city?: string;
  lga?: string;
  state?: string;
  country?: string;
  notes?: string;
  relogReason?: string;
  latitude?: number;
  longitude?: number;
  status: VerificationStatus;
  documents: KYCDocument[];
  verificationDate?: string;
  rejectionReason?: string;
  rejectionNote?: string;
  rejectionEvidence?: {
    url: string;
    tag?: string;
  }[];
  assignedAgent?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | string;
  assignedAt?: string;
  agentNotes?: string;
  verifiedAddress?: string;
  verifiedAt?: string;
  verificationData?: VerificationData;
  mobileJobId?: string;
  organization?: {
    _id: string;
    name: string;
  };
  requestMetadata?: {
    ipAddress?: string;
    userAgent?: string;
    device?: string;
    browser?: string;
    os?: string;
    location?: {
      city?: string;
      region?: string;
      country?: string;
      isp?: string;
      latitude?: number;
      longitude?: number;
    };
  };
  isDeleted?: boolean;
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
  pending: number;
  assigned: number;
  inReview: number;
  verificationSubmitted: number;
  verified: number;
  rejected: number;
  timeSeries?: {
    date: string;
    pending: number;
    verified: number;
    rejected: number;
    total: number;
  }[];
  orgBreakdown?: {
    _id: string;
    name: string;
    total: number;
    verified: number;
    rejected: number;
  }[];
  geographicBreakdown?: {
    state: string;
    count: number;
    verified: number;
  }[];
  locations?: {
    _id?: string;
    lat: number;
    lng: number;
    status: string;
    customer: string;
    phone?: string;
    streetNumber?: string;
    streetName?: string;
    landmark?: string;
    city?: string;
    lga?: string;
    state?: string;
    country?: string;
    loanId?: string;
    loanType?: string;
    submittedAt?: string;
    verifiedAt?: string;
    rejectionReason?: string;
    rejectionNote?: string;
    verificationData?: {
      verifiedAddress?: string;
      verifiedLatitude?: number;
      verifiedLongitude?: number;
      agentNotes?: string;
    };
  }[];
  availableMonths?: string[];
}

export interface CreateKYCUserRequest {
  loanId?: string;
  organizationId?: string;
  loanType?: LoanType;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  occupation?: string;
  bvn?: string;
  nin?: string;
  relogReason?: string;
  passportNumber?: string;
  addresses?: AddressData[];
  streetNumber?: string;
  streetName?: string;
  landmark?: string;
  city?: string;
  lga?: string;
  state?: string;
  country?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateKYCUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  occupation?: string;
  loanId?: string;
  loanType?: LoanType;
  bvn?: string;
  nin?: string;
  passportNumber?: string;
  addresses?: AddressData[];
  streetNumber?: string;
  streetName?: string;
  landmark?: string;
  city?: string;
  lga?: string;
  state?: string;
  country?: string;
  notes?: string;
  status?: VerificationStatus;
  assignedAgent?: string;
  agentNotes?: string;
  latitude?: number;
  longitude?: number;
  rejectionReason?: string;
  rejectionNote?: string;
  rejectionEvidence?: {
    url: string;
    tag?: string;
  }[];
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
  ASSIGNED: 'Agent Assigned',
  IN_REVIEW: 'In Review',
  VERIFICATION_SUBMITTED: 'Pending Approval',
  VERIFIED: 'Verified',
  NOT_APPROVED: 'Not Approved',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
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
    ASSIGNED: 'purple',
    IN_REVIEW: 'yellow',
    VERIFICATION_SUBMITTED: 'orange',
    VERIFIED: 'green',
    NOT_APPROVED: 'yellow',
    REJECTED: 'red',
    EXPIRED: 'gray',
  };
  return colors[status] || 'gray';
};
