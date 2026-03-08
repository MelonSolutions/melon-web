/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://melon-core.onrender.com';
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface QuestionResponse {
  questionId: string;
  answer?: any;
  impactMetricId?: string;
  actualValue?: number;
}

export interface CreateResponseRequest {
  reportId: string;
  respondentEmail?: string;
  respondentName?: string;
  responses: QuestionResponse[];
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

export interface ResponseAnalytics {
  _id: string;
  totalResponses: number;
  answers: any[];
  actualValues: number[];
  avgActualValue: number;
}

export interface ImpactMetricProgress {
  questionId: string;
  questionTitle: string;
  metricId: string;
  metricName: string;
  target: number;
  actualValue: number;
  progressPercentage: number;
  trackingStatus: 'Fail' | 'On Track' | 'Achieved';
  scoringWeight: number;
  responseCount: number;
  startDate: string;
  endDate: string;
}

export interface ImpactMetricsProgressResponse {
  overallProgress: number;
  totalMetrics: number;
  metrics: ImpactMetricProgress[];
  summary: {
    achieved: number;
    onTrack: number;
    failing: number;
  };
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
    const errorData = await res.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
  }
  return res;
};

export const submitResponse = async (data: CreateResponseRequest): Promise<{
  message: string;
  responseId: string;
  impactMetricsUpdated: number;
}> => {
  const res = await fetch(`${API_BASE_URL}/responses/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  await handleApiError(res);
  return res.json();
};

export const getResponsesByReport = async (
  reportId: string,
  pagination: { pageSize?: number; currentPage?: number } = {}
): Promise<{
  data: ReportResponse[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}> => {
  const params = new URLSearchParams();
  if (pagination.pageSize) params.append('pageSize', pagination.pageSize.toString());
  if (pagination.currentPage) params.append('currentPage', pagination.currentPage.toString());

  const res = await fetch(`${API_BASE_URL}/responses/report/${reportId}?${params}`, {
    headers: getAuthHeaders(),
  });

  await handleApiError(res);
  return res.json();
};

export const getResponseDetails = async (responseId: string): Promise<ReportResponse> => {
  const res = await fetch(`${API_BASE_URL}/responses/details/${responseId}`, {
    headers: getAuthHeaders(),
  });

  await handleApiError(res);
  return res.json();
};

export const getResponseAnalytics = async (reportId: string): Promise<ResponseAnalytics[]> => {
  const res = await fetch(`${API_BASE_URL}/responses/analytics/${reportId}`, {
    headers: getAuthHeaders(),
  });

  await handleApiError(res);
  return res.json();
};

export const getImpactMetricsProgress = async (reportId: string): Promise<ImpactMetricsProgressResponse> => {
  const res = await fetch(`${API_BASE_URL}/responses/impact-metrics-progress/${reportId}`, {
    headers: getAuthHeaders(),
  });

  await handleApiError(res);
  return res.json();
};
