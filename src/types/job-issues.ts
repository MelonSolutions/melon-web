export type JobIssueCategory =
  | 'PHONE_INCOMPLETE'
  | 'PHONE_UNREACHABLE'
  | 'ADDRESS_NOT_FOUND'
  | 'CUSTOMER_UNAVAILABLE'
  | 'CUSTOMER_REFUSED'
  | 'OTHER';

export type JobIssueStatus = 'OPEN' | 'RESOLVED' | 'CLOSED_UNRESOLVED';

export type JobIssueAuthor = 'agent' | 'client' | 'melon' | 'system';

export interface JobIssueMessage {
  id: string;
  from: JobIssueAuthor;
  authorName?: string;
  text: string;
  photos: { url: string; tag?: string }[];
  createdAt: string;
}

export interface JobIssue {
  id: string;
  kycId: string;
  job?: {            // present in the Messages list only
    firstName: string;
    lastName: string;
    loanId?: string;
    loanType?: string;
    status: string;
  };
  organization?: { id: string; name: string }; // Messages list only
  addressIndex?: number;
  addressLabel?: string;
  category: JobIssueCategory;
  status: JobIssueStatus;
  messages: JobIssueMessage[];
  unread?: boolean;  // for the signed-in side (client or Melon)
  lastMessageAt?: string;
  resolveBy?: string; // when an open issue will be closed automatically
  createdAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface JobIssueList {
  items: JobIssue[];
  total: number;
  page: number;
  limit: number;
}

export interface JobIssueCounts {
  unread: number;
  open: number;
}

export interface JobIssueStats {
  open: number;
  resolved: number;
  closedUnresolved: number;
  all: number;
}

export const ISSUE_CATEGORY_LABELS: Record<JobIssueCategory, string> = {
  PHONE_INCOMPLETE: 'Incomplete phone number',
  PHONE_UNREACHABLE: 'Phone number not reachable',
  ADDRESS_NOT_FOUND: 'Address not found',
  CUSTOMER_UNAVAILABLE: 'Customer not available',
  CUSTOMER_REFUSED: 'Customer refused verification',
  OTHER: 'Other',
};

export const ISSUE_STATUS_LABELS: Record<JobIssueStatus, string> = {
  OPEN: 'Waiting on you',
  RESOLVED: 'Fixed',
  CLOSED_UNRESOLVED: 'Closed, not fixed',
};
