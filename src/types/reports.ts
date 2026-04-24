/* eslint-disable @typescript-eslint/no-explicit-any */
export type ReportStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';

export type ReportCategory =
  | 'IMPACT_ASSESSMENT'
  | 'FEEDBACK'
  | 'HEALTH'
  | 'EDUCATION'
  | 'AGRICULTURE'
  | 'COMMUNITY'
  | 'ENVIRONMENT'
  | 'ECONOMIC';

export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'CHECKBOXES'
  | 'DROPDOWN'
  | 'SHORT_ANSWER'
  | 'PARAGRAPH'
  | 'LINEAR_SCALE'
  | 'MATRIX'
  | 'DATE'
  | 'TIME'
  | 'EMAIL'
  | 'PHONE'
  | 'NUMBER'
  | 'IMPACT_METRIC';

export interface QuestionSettings {
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  allowOther?: boolean;
  rows?: string[]; // For matrix questions - the row labels/questions
  columns?: string[]; // For matrix questions - the column options
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  settings?: QuestionSettings;
  impactMetricId?: string;
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

export interface QuestionResponse {
  questionId: string;
  answer?: any;
  impactMetricId?: string;
  actualValue?: number;
}

export interface ReportResponse {
  _id: string;
  reportId: string;
  respondentEmail?: string;
  respondentName?: string;
  responses: QuestionResponse[];
  submittedAt: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShareLinkResponse {
  shareToken: string;
  shareUrl: string;
}

export const CATEGORY_DISPLAY_NAMES: Record<ReportCategory, string> = {
  IMPACT_ASSESSMENT: 'Impact Assessment',
  FEEDBACK: 'Feedback',
  HEALTH: 'Health',
  EDUCATION: 'Education',
  AGRICULTURE: 'Agriculture',
  COMMUNITY: 'Community',
  ENVIRONMENT: 'Environment',
  ECONOMIC: 'Economic',
};

export const QUESTION_TYPE_DISPLAY_NAMES: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: 'Multiple Choice',
  CHECKBOXES: 'Checkboxes',
  DROPDOWN: 'Dropdown',
  SHORT_ANSWER: 'Short Answer',
  PARAGRAPH: 'Paragraph',
  LINEAR_SCALE: 'Linear Scale',
  MATRIX: 'Matrix / Likert Scale',
  DATE: 'Date',
  TIME: 'Time',
  EMAIL: 'Email',
  PHONE: 'Phone',
  NUMBER: 'Number',
  IMPACT_METRIC: 'Impact Metric',
};

// Helper functions
export const getCategoryDisplayName = (category: ReportCategory): string => {
  return CATEGORY_DISPLAY_NAMES[category] || category;
};

export const getQuestionTypeDisplayName = (type: QuestionType): string => {
  return QUESTION_TYPE_DISPLAY_NAMES[type] || type;
};