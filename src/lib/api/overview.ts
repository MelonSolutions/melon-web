const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://melon-core.onrender.com';
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

// Export the types
export interface DashboardMetric {
  value: string;
  description: string;
}

export interface DashboardStats {
  totalPrograms: DashboardMetric;
  activeProjects: DashboardMetric;
  beneficiaries: DashboardMetric;
  verifiedUsers: DashboardMetric;
}

export interface ProgramProgress {
  label: string;
  value: number;
  sector: string;
  status: 'on-track' | 'needs-attention' | 'critical';
}

export interface RegionalDistribution {
  region: string;
  projects: number;
  beneficiaries: string;
  coverage: number;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    let errorCode: string | undefined;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      errorCode = errorData.code;
    } catch {
      errorMessage = response.statusText;
    }

    throw new ApiError(errorMessage, response.status, errorCode);
  }

  return response.json();
}

export async function getDashboardStats(
  timeframe: string = '6months'
): Promise<DashboardStats> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/overview/dashboard-stats?timeframe=${timeframe}`
  );
  return response.data || response;
}

export async function getProgramProgress(): Promise<ProgramProgress[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/overview/program-progress`);
  return response.data || response;
}

export async function getRegionalDistribution(): Promise<RegionalDistribution[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/overview/regional-distribution`);
  return response.data || response;
}
