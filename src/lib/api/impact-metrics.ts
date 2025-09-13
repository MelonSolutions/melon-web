import { 
  ImpactMetric, 
  CreateImpactMetricRequest, 
  UpdateImpactMetricRequest, 
  ImpactMetricsFilters, 
  ImpactMetricsStats,
  PaginatedMetricsResponse 
} from '@/types/impact-metrics';

const API_BASE_URL = 'https://melon-core.onrender.com';

// Get authorization header
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Handle API errors
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }
  return response.json();
};

// Create a new impact metric
export const createImpactMetric = async (data: CreateImpactMetricRequest): Promise<ImpactMetric> => {
  const response = await fetch(`${API_BASE_URL}/impact-metrics/create`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiError(response);
};

// Get all impact metrics with filters and pagination
export const getImpactMetrics = async (filters: ImpactMetricsFilters = {}): Promise<PaginatedMetricsResponse> => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.metricType) params.append('metricType', filters.metricType);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
  if (filters.currentPage) params.append('currentPage', filters.currentPage.toString());

  const response = await fetch(`${API_BASE_URL}/impact-metrics/all?${params}`, {
    headers: getAuthHeaders(),
  });

  return handleApiError(response);
};

// Get impact metrics dashboard statistics
export const getImpactMetricsStats = async (): Promise<ImpactMetricsStats> => {
  const response = await fetch(`${API_BASE_URL}/impact-metrics/dashboard`, {
    headers: getAuthHeaders(),
  });

  return handleApiError(response);
};

// Get single impact metric by ID
export const getImpactMetric = async (id: string): Promise<ImpactMetric> => {
  const response = await fetch(`${API_BASE_URL}/impact-metrics/details/${id}`, {
    headers: getAuthHeaders(),
  });

  return handleApiError(response);
};

// Update impact metric
export const updateImpactMetric = async (id: string, data: UpdateImpactMetricRequest): Promise<ImpactMetric> => {
  const response = await fetch(`${API_BASE_URL}/impact-metrics/update/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiError(response);
};

// Update impact metric status
export const updateImpactMetricStatus = async (id: string, status: string): Promise<ImpactMetric> => {
  const response = await fetch(`${API_BASE_URL}/impact-metrics/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  return handleApiError(response);
};

// Update impact metric actual value
export const updateImpactMetricValue = async (id: string, actualValue: number): Promise<ImpactMetric> => {
  const response = await fetch(`${API_BASE_URL}/impact-metrics/${id}/value`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ actualValue }),
  });

  return handleApiError(response);
};

// Delete impact metric
export const deleteImpactMetric = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/impact-metrics/delete/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleApiError(response);
};

// Duplicate impact metric
export const duplicateImpactMetric = async (id: string): Promise<ImpactMetric> => {
  const response = await fetch(`${API_BASE_URL}/impact-metrics/${id}/duplicate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  return handleApiError(response);
};

// Get metrics summary for dashboard
export const getImpactMetricsSummary = async (): Promise<ImpactMetric[]> => {
  const response = await fetch(`${API_BASE_URL}/impact-metrics/summary`, {
    headers: getAuthHeaders(),
  });

  return handleApiError(response);
};