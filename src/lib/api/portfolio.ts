import { 
  Project, 
  CreateProjectRequest, 
  UpdateProjectRequest, 
  PortfolioFilters, 
  PortfolioStats,
  PaginatedResponse 
} from '@/types/portfolio';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://melon-core.onrender.com';
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

// Create a new project
export const createProject = async (data: CreateProjectRequest): Promise<Project> => {
  const response = await fetch(`${API_BASE_URL}/portfolio/create`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiError(response);
};

// Get all projects with filters and pagination
export const getProjects = async (filters: PortfolioFilters = {}): Promise<PaginatedResponse<Project>> => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.sector) params.append('sector', filters.sector);
  if (filters.region) params.append('region', filters.region);
  if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
  if (filters.currentPage) params.append('currentPage', filters.currentPage.toString());

  const response = await fetch(`${API_BASE_URL}/portfolio/all?${params}`, {
    headers: getAuthHeaders(),
  });

  return handleApiError(response);
};

// Get portfolio dashboard statistics
export const getPortfolioStats = async (): Promise<PortfolioStats> => {
  const response = await fetch(`${API_BASE_URL}/portfolio/dashboard`, {
    headers: getAuthHeaders(),
  });

  return handleApiError(response);
};

// Get single project by ID
export const getProject = async (id: string): Promise<Project> => {
  const response = await fetch(`${API_BASE_URL}/portfolio/details/${id}`, {
    headers: getAuthHeaders(),
  });

  return handleApiError(response);
};

// Update project
export const updateProject = async (id: string, data: UpdateProjectRequest): Promise<Project> => {
  const response = await fetch(`${API_BASE_URL}/portfolio/update/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleApiError(response);
};

// Update project status
export const updateProjectStatus = async (id: string, status: string): Promise<Project> => {
  const response = await fetch(`${API_BASE_URL}/portfolio/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  return handleApiError(response);
};

// Duplicate project
export const duplicateProject = async (id: string): Promise<Project> => {
  const response = await fetch(`${API_BASE_URL}/portfolio/${id}/duplicate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  return handleApiError(response);
};

// Delete project
export const deleteProject = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/portfolio/delete/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleApiError(response);
};

// Get project summary with metrics
export const getProjectSummaryWithMetrics = async (): Promise<Project[]> => {
  const response = await fetch(`${API_BASE_URL}/portfolio/summary-with-metrics`, {
    headers: getAuthHeaders(),
  });

  return handleApiError(response);
};