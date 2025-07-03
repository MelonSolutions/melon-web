/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/reports.ts

export type ReportStatus = 'draft' | 'published' | 'closed';

export type ReportCategory = 
  | 'Impact Assessment'
  | 'Feedback'
  | 'Health'
  | 'Education'
  | 'Agriculture'
  | 'Community';

export type QuestionType = 
  | 'multiple_choice'
  | 'checkboxes'
  | 'dropdown'
  | 'short_answer'
  | 'paragraph'
  | 'linear_scale'
  | 'date'
  | 'time';

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  settings?: {
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    allowOther?: boolean;
  };
}

export interface Report {
  _id: string;
  title: string;
  description?: string;
  category: ReportCategory;
  status: ReportStatus;
  allowMultipleResponses: boolean;
  collectEmail: boolean;
  isPublic: boolean;
  questions: Question[];
  shareToken?: string;
  createdBy: string;
  responseCount: number;
  lastResponseAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportRequest {
  title: string;
  description?: string;
  category?: ReportCategory;
  status?: ReportStatus;
  allowMultipleResponses?: boolean;
  collectEmail?: boolean;
  isPublic?: boolean;
  questions?: Question[];
}

export interface UpdateReportRequest {
  title?: string;
  description?: string;
  category?: ReportCategory;
  status?: ReportStatus;
  allowMultipleResponses?: boolean;
  collectEmail?: boolean;
  isPublic?: boolean;
  questions?: Question[];
}

export interface DashboardStats {
  totalReports: number;
  activeReports: number;
  totalResponses: number;
  avgResponseRate: string;
}

export interface ReportsFilters {
  search?: string;
  status?: ReportStatus | '';
  category?: ReportCategory | '';
  pageSize?: number;
  currentPage?: number;
}

export interface ReportResponse {
  _id: string;
  reportId: string;
  responses: Record<string, any>;
  submittedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ShareLinkResponse {
  shareToken: string;
  shareUrl: string;
}