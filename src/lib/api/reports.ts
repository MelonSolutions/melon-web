/* eslint-disable @typescript-eslint/no-explicit-any */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://melon-core.onrender.com';
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface CreateReportRequest {
  title: string;
  description?: string;
  category?: string;
  projectId?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
  allowMultipleResponses?: boolean;
  collectEmail?: boolean;
  isPublic?: boolean;
  questions?: any[];
}

export interface UpdateReportRequest {
  title?: string;
  description?: string;
  category?: string;
  projectId?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
  allowMultipleResponses?: boolean;
  collectEmail?: boolean;
  isPublic?: boolean;
  questions?: any[];
}

export interface ReportsFilters {
  search?: string;
  status?: string;
  category?: string;
  pageSize?: number;
  currentPage?: number;
}

export interface DashboardStats {
  totalReports: number;
  activeReports: number;
  totalResponses: number;
  avgResponseRate: string;
}

export interface ShareReportEmailRequest {
  recipients: string[];
  personalMessage?: string;
}

export interface ShareReportEmailResponse {
  message: string;
  recipientCount: number;
}
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleApiError = async (res: globalThis.Response) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ 
      message: 'An error occurred',
      code: 'UNKNOWN_ERROR'
    }));
    
    throw new ApiError(
      errorData.message || `HTTP ${res.status}: ${res.statusText}`,
      res.status,
      errorData.code
    );
  }
  return res;
};


// Create a new report
export const createReport = async (data: CreateReportRequest): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/reports/create`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  await handleApiError(response);
  return response.json();
};

// Get all reports with filters
export const getReports = async (filters: ReportsFilters = {}): Promise<ApiResponse> => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.category) params.append('category', filters.category);
  if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
  if (filters.currentPage) params.append('currentPage', filters.currentPage.toString());

  const response = await fetch(`${API_BASE_URL}/reports/all?${params}`, {
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch(`${API_BASE_URL}/reports/dashboard`, {
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

// Get single report by ID
export const getReport = async (id: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/reports/details/${id}`, {
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

// Update report
export const updateReport = async (id: string, data: UpdateReportRequest): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/reports/update/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  await handleApiError(response);
  return response.json();
};

// Delete report
export const deleteReport = async (id: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/reports/delete/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

// Publish report
export const publishReport = async (id: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/reports/${id}/publish`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

// Duplicate report
export const duplicateReport = async (id: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/reports/${id}/duplicate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

// Get share link
export const getShareLink = async (id: string): Promise<{ shareToken: string; shareUrl: string }> => {
  const response = await fetch(`${API_BASE_URL}/reports/${id}/share-link`, {
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  const data = await response.json();
  return {
    shareToken: data.shareToken,
    shareUrl: data.shareUrl || `${window.location.origin}/reports/public/${data.shareToken}`,
  };
};

// Get public report by share token
export const getPublicReport = async (shareToken: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/reports/public/${shareToken}`);

  await handleApiError(response);
  return response.json();
};

// Update report status
export const updateReportStatus = async (id: string, status: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/reports/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  await handleApiError(response);
  return response.json();
};

// Share report via email
export const shareReportViaEmail = async (
  reportId: string,
  data: ShareReportEmailRequest
): Promise<ShareReportEmailResponse> => {
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}/share-email`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  await handleApiError(response);
  return response.json();
};

// Get reports by project ID
export const getReportsByProject = async (projectId: string): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/reports/by-project/${projectId}`, {
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

// Get unlinked reports (reports not attached to any project)
export const getUnlinkedReports = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/reports/unlinked`, {
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

// Link report to project
export const linkReportToProject = async (reportId: string, projectId: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}/link-project`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ projectId }),
  });

  await handleApiError(response);
  return response.json();
};

// Unlink report from project
export const unlinkReportFromProject = async (reportId: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}/unlink-project`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

// ============================================
// Analytics Types & Functions
// ============================================

export interface OptionBreakdown {
  option: string;
  count: number;
  percentage: number;
}

export interface NumericStats {
  min: number;
  max: number;
  average: number;
  median: number;
  distribution: Array<{ range: string; count: number }>;
}

export interface TextStats {
  avgWordCount: number;
  totalWords: number;
  commonKeywords: Array<{ word: string; count: number }>;
}

export interface TimeDistribution {
  period: string;
  count: number;
}

export interface QuestionAnalytics {
  questionId: string;
  questionTitle: string;
  questionType: string;
  totalResponses: number;
  optionBreakdown?: OptionBreakdown[];
  numericStats?: NumericStats;
  textStats?: TextStats;
  timeDistribution?: TimeDistribution[];
}

export interface ResponseOverTime {
  date: string;
  count: number;
}

export interface PeakResponseTime {
  hour: number;
  count: number;
}

export interface GeographicDistribution {
  country: string;
  count: number;
}

export interface ReportAnalytics {
  totalResponses: number;
  completedResponses: number;
  partialResponses: number;
  completionRate: number;
  responsesOverTime: ResponseOverTime[];
  avgCompletionTimeSeconds?: number;
  peakResponseTimes?: PeakResponseTime[];
  geographicDistribution?: GeographicDistribution[];
}

// Get report-level analytics (aggregate statistics)
export const getReportAnalytics = async (reportId: string): Promise<ReportAnalytics> => {
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}/analytics/overview`, {
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

// Get analytics for all questions in a report
export const getAllQuestionsAnalytics = async (reportId: string): Promise<QuestionAnalytics[]> => {
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}/analytics/questions`, {
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

// Get analytics for a specific question
export const getQuestionAnalytics = async (
  reportId: string,
  questionId: string
): Promise<QuestionAnalytics> => {
  const response = await fetch(
    `${API_BASE_URL}/reports/${reportId}/analytics/questions/${questionId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  await handleApiError(response);
  return response.json();
};