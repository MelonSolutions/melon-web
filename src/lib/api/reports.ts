/* eslint-disable @typescript-eslint/no-explicit-any */

const API_BASE_URL = 'https://melon-core.onrender.com';

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