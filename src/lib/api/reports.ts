export * from './reports-mock';

// Uncomment below when ready to connect to real backend
/*
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CreateReportData {
  title: string;
  description?: string;
  category?: string;
  status?: 'draft' | 'published' | 'closed';
  allowMultipleResponses?: boolean;
  collectEmail?: boolean;
  isPublic?: boolean;
  questions?: any[];
}

export interface UpdateReportData {
  title?: string;
  description?: string;
  category?: string;
  status?: 'draft' | 'published' | 'closed';
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

// Get authorization header
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Create a new report
export const createReport = async (data: CreateReportData) => {
  const response = await fetch(`${API_BASE_URL}/api/reports/create`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create report');
  }

  return response.json();
};

// Get all reports with filters
export const getReports = async (filters: ReportsFilters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.category) params.append('category', filters.category);
  if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
  if (filters.currentPage) params.append('currentPage', filters.currentPage.toString());

  const response = await fetch(`${API_BASE_URL}/api/reports/all?${params}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch reports');
  }

  return response.json();
};

// Get dashboard statistics
export const getDashboardStats = async () => {
  const response = await fetch(`${API_BASE_URL}/api/reports/dashboard`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }

  return response.json();
};

// Get single report by ID
export const getReport = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/reports/details/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch report');
  }

  return response.json();
};

// Update report
export const updateReport = async (id: string, data: UpdateReportData) => {
  const response = await fetch(`${API_BASE_URL}/api/reports/update/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update report');
  }

  return response.json();
};

// Delete report
export const deleteReport = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/reports/delete/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete report');
  }

  return response.json();
};

// Publish report
export const publishReport = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/reports/${id}/publish`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to publish report');
  }

  return response.json();
};

// Duplicate report
export const duplicateReport = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/reports/${id}/duplicate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to duplicate report');
  }

  return response.json();
};

// Get share link
export const getShareLink = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/reports/${id}/share-link`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to get share link');
  }

  return response.json();
};

// Get public report by share token
export const getPublicReport = async (shareToken: string) => {
  const response = await fetch(`${API_BASE_URL}/api/reports/public/${shareToken}`);

  if (!response.ok) {
    throw new Error('Failed to fetch public report');
  }

  return response.json();
};
*/