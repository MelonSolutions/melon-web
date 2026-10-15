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
  | 'UTILITY_BILL'
  | 'OTHER';

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

export type CustomerType = 'FIRST_TIME' | 'RETURNING';

export const CUSTOMER_TYPE_OPTIONS: { value: CustomerType; label: string }[] = [
  { value: 'FIRST_TIME', label: 'First time customer' },
  { value: 'RETURNING', label: 'Return customer' },
];

export function formatCustomerType(customerType?: string): string {
  return CUSTOMER_TYPE_OPTIONS.find((o) => o.value === customerType)?.label || '';
}

export function isSycamoreOrganization(organization?: { name?: string; domain?: string } | null): boolean {
  const name = (organization?.name || '').toLowerCase();
  const domain = (organization?.domain || '').toLowerCase();
  return name.includes('sycamore') || domain.includes('sycamore');
}

// Rejection category, stored next to the free-text rejectionReason
export type RejectionCode =
  | 'CUSTOMER_UNREACHABLE'
  | 'ADDRESS_DOES_NOT_EXIST'
  | 'FAKE_ADDRESS'
  | 'CUSTOMER_NOT_AVAILABLE'
  | 'INCORRECT_ADDRESS'
  | 'DUPLICATE_REQUEST'
  | 'CUSTOMER_WITHDREW'
  | 'CUSTOMER_UNCOOPERATIVE'
  | 'INCOMPLETE_DOCUMENTS'
  | 'CUSTOMER_RELOCATED'
  | 'AGENT_WRONG_LOCATION'
  | 'AGENT_POOR_EVIDENCE'
  | 'OUT_OF_COVERAGE'
  | 'OTHER';

export const REJECTION_CODE_LABELS: Record<RejectionCode, string> = {
  // Agent's work (used when rejecting a submitted verification)
  AGENT_WRONG_LOCATION: 'Agent verified wrong location',
  AGENT_POOR_EVIDENCE: 'Agent evidence poor / incomplete',
  // Customer
  CUSTOMER_UNREACHABLE: 'Customer unreachable',
  CUSTOMER_NOT_AVAILABLE: 'Customer not available',
  CUSTOMER_UNCOOPERATIVE: 'Customer uncooperative',
  CUSTOMER_RELOCATED: 'Customer relocated',
  CUSTOMER_WITHDREW: 'Customer withdrew / loan cancelled',
  // Request / address
  INCORRECT_ADDRESS: 'Incorrect or incomplete address',
  ADDRESS_DOES_NOT_EXIST: 'Address does not exist',
  FAKE_ADDRESS: 'Fake address',
  DUPLICATE_REQUEST: 'Duplicate request',
  INCOMPLETE_DOCUMENTS: 'Incomplete documents',
  OUT_OF_COVERAGE: 'Outside coverage / no agent available',
  OTHER: 'Other',
};

export const REJECTION_CODE_OPTIONS = [
  { value: '', label: 'Select a category' },
  ...(Object.keys(REJECTION_CODE_LABELS) as RejectionCode[]).map((code) => ({
    value: code,
    label: REJECTION_CODE_LABELS[code],
  })),
];

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
  rejectionCode?: RejectionCode;
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
  customerType?: CustomerType;
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
  // Earlier request(s) this one duplicates (set when created with a relogReason)
  relogOf?: string[];
  environment?: 'live' | 'sandbox';
  latitude?: number;
  longitude?: number;
  status: VerificationStatus;
  hasOpenIssue?: boolean;
  documents: KYCDocument[];
  verificationDate?: string;
  rejectionReason?: string;
  rejectionCode?: RejectionCode;
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
  customerType?: CustomerType;
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
  customerType?: CustomerType;
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
  rejectionCode?: RejectionCode;
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
  OTHER: 'Other Document',
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
