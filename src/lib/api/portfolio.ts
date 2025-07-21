export * from './portfolio-mock';

// Uncomment below when ready to connect to real backend
/*
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CreateProjectData {
  title: string;
  description: string;
  sector: string;
  region: string;
  totalBudget: number;
  targetHouseholds: number;
  fundingSource: string;
  startDate: string;
  endDate: string;
  projectLead: string;
  fieldCoordinator: string;
  tags: string[];
  attachments?: File[];
}

export interface UpdateProjectData {
  title?: string;
  description?: string;
  sector?: string;
  region?: string;
  status?: string;
  budget?: {
    total: number;
    utilized: number;
  };
  timeline?: {
    startDate: string;
    endDate: string;
  };
  team?: {
    projectLead: string;
    fieldCoordinator: string;
  };
  tags?: string[];
}

export interface PortfolioFilters {
  search?: string;
  status?: string;
  sector?: string;
  region?: string;
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

// Create a new project
export const createProject = async (data: CreateProjectData) => {
  const response = await fetch(`${API_BASE_URL}/api/portfolio/create`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create project');
  }

  return response.json();
};

// Get all projects with filters
export const getProjects = async (filters: PortfolioFilters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.sector) params.append('sector', filters.sector);
  if (filters.region) params.append('region', filters.region);
  if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
  if (filters.currentPage) params.append('currentPage', filters.currentPage.toString());

  const response = await fetch(`${API_BASE_URL}/api/portfolio/all?${params}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  return response.json();
};

// Get portfolio statistics
export const getPortfolioStats = async () => {
  const response = await fetch(`${API_BASE_URL}/api/portfolio/dashboard`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch portfolio stats');
  }

  return response.json();
};

// Get single project by ID
export const getProject = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/portfolio/details/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch project');
  }

  return response.json();
};

// Update project
export const updateProject = async (id: string, data: UpdateProjectData) => {
  const response = await fetch(`${API_BASE_URL}/api/portfolio/update/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update project');
  }

  return response.json();
};

// Delete project
export const deleteProject = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/portfolio/delete/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete project');
  }

  return response.json();
};
*/