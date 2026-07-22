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

export interface KYCBreakdown {
  pending: number;
  assigned: number;
  inReview: number;
  verificationSubmitted: number;
  verified: number;
  rejected: number;
  total: number;
}

export interface SurveyBreakdown {
  totalReports: number;
  activeReports: number;
  draftReports: number;
  totalResponses: number;
}

export interface ResponseTrendPoint {
  date: string;
  count: number;
}

export interface KYCTrendPoint {
  date: string;
  pending: number;
  verified: number;
  rejected: number;
  total: number;
}

export interface ActivityItem {
  id: string;
  type: 'kyc' | 'response';
  title: string;
  description: string;
  status: string;
  timestamp: string;
  link: string;
}

export interface DashboardStats {
  totalPrograms: DashboardMetric;
  activeProjects: DashboardMetric;
  beneficiaries: DashboardMetric;
  verifiedUsers: DashboardMetric;
  pendingKYC?: DashboardMetric;
  totalSurveys: DashboardMetric;
  totalResponses: DashboardMetric;
  kycBreakdown: KYCBreakdown;
  surveyBreakdown: SurveyBreakdown;
  responseTrend: ResponseTrendPoint[];
  kycTrend: KYCTrendPoint[];
  recentActivity: ActivityItem[];
  availableMonths?: string[];
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
      errorMessage = errorData.message || errorData.error || errorMessage;
      errorCode = errorData.code;
    } catch {
      errorMessage = response.statusText;
    }

    console.error(`API Error [${response.status}] ${url}:`, errorMessage);
    throw new ApiError(errorMessage, response.status, errorCode);
  }

  return response.json();
}

export async function getDashboardStats(
  timeframe: string = '6months',
  organizationId?: string,
  month?: string,
): Promise<DashboardStats> {
  const params = new URLSearchParams({ timeframe });
  if (organizationId) params.append('organizationId', organizationId);
  if (month) params.append('month', month);
  const response = await fetchWithAuth(
    `${API_BASE_URL}/overview/dashboard-stats?${params.toString()}`
  );
  return response.data || response;
}

export async function getResponseTrendData(
  timeframe: string = '6months',
  organizationId?: string,
  month?: string,
): Promise<ResponseTrendPoint[]> {
  const params = new URLSearchParams({ timeframe });
  if (organizationId) params.append('organizationId', organizationId);
  if (month) params.append('month', month);
  const response = await fetchWithAuth(
    `${API_BASE_URL}/overview/response-trend?${params.toString()}`
  );
  return response.data || response;
}

export async function getKYCBreakdownData(
  organizationId?: string,
  month?: string,
): Promise<KYCBreakdown> {
  const params = new URLSearchParams();
  if (organizationId) params.append('organizationId', organizationId);
  if (month) params.append('month', month);
  const url = params.toString() ? `${API_BASE_URL}/overview/kyc-breakdown?${params.toString()}` : `${API_BASE_URL}/overview/kyc-breakdown`;
  const response = await fetchWithAuth(url);
  return response.data || response;
}

export async function getRecentActivityData(
  organizationId?: string,
  month?: string,
): Promise<ActivityItem[]> {
  const params = new URLSearchParams();
  if (organizationId) params.append('organizationId', organizationId);
  if (month) params.append('month', month);
  const url = params.toString() ? `${API_BASE_URL}/overview/recent-activity?${params.toString()}` : `${API_BASE_URL}/overview/recent-activity`;
  const response = await fetchWithAuth(url);
  return response.data || response;
}

export async function getProgramProgress(organizationId?: string): Promise<ProgramProgress[]> {
  const params = new URLSearchParams();
  if (organizationId) params.append('organizationId', organizationId);
  const url = params.toString() ? `${API_BASE_URL}/overview/program-progress?${params.toString()}` : `${API_BASE_URL}/overview/program-progress`;
  const response = await fetchWithAuth(url);
  return response.data || response;
}

export async function getRegionalDistribution(organizationId?: string): Promise<RegionalDistribution[]> {
  const params = new URLSearchParams();
  if (organizationId) params.append('organizationId', organizationId);
  const url = params.toString() ? `${API_BASE_URL}/overview/regional-distribution?${params.toString()}` : `${API_BASE_URL}/overview/regional-distribution`;
  const response = await fetchWithAuth(url);
  return response.data || response;
}
