/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://melon-core.onrender.com';

export type AccessLevel = 'full' | 'read-only' | 'blocked';

export type FeatureName =
  | 'kyc'
  | 'portfolio'
  | 'reports'
  | 'impactMetrics'
  | 'visualizations'
  | 'responses'
  | 'overview';

export interface OrganizationRestrictions {
  id: string;
  organizationId: string;
  kyc: AccessLevel;
  portfolio: AccessLevel;
  reports: AccessLevel;
  impactMetrics: AccessLevel;
  visualizations: AccessLevel;
  responses: AccessLevel;
  overview: AccessLevel;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  TRIAL = 'TRIAL',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
}

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  plan: string;
  status: OrganizationStatus;
  userCount: number;
  createdAt: string;
}

export interface OrganizationsResponse {
  organizations: Organization[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateRestrictionsRequest {
  kyc?: AccessLevel;
  portfolio?: AccessLevel;
  reports?: AccessLevel;
  impactMetrics?: AccessLevel;
  visualizations?: AccessLevel;
  responses?: AccessLevel;
  overview?: AccessLevel;
  reason: string;
}

export interface AuditLogEntry {
  id: string;
  organizationId: {
    id: string;
    name: string;
    domain?: string;
  };
  adminUserId: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  feature: FeatureName | 'status';
  oldValue: string;
  newValue: string;
  reason: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogResponse {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLogQueryParams {
  organizationId?: string;
  adminUserId?: string;
  feature?: FeatureName;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class AdminError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AdminError';
    this.status = status;
  }
}

class AdminApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const config: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
          }
        }

        throw new AdminError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status
        );
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timeout - please try again');
        timeoutError.name = 'TimeoutError';
        throw timeoutError;
      }

      if (error.message === 'Failed to fetch') {
        console.error(`Network Error: Failed to fetch ${url}. Online: ${navigator.onLine}`);
        const networkError = new Error('Connection failed. Please check your internet and try again.');
        networkError.name = 'NetworkError';
        throw networkError;
      }

      console.error(`API request failed [${url}]:`, error);
      throw error;
    }
  }

  /**
   * Get all organizations with optional pagination and search
   */
  async getOrganizations(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<OrganizationsResponse> {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/admin/organizations${queryString ? `?${queryString}` : ''}`;

    return this.request<OrganizationsResponse>(endpoint);
  }

  /**
   * Get all restrictions (for all organizations)
   */
  async getAllRestrictions(): Promise<OrganizationRestrictions[]> {
    return this.request<OrganizationRestrictions[]>('/admin/restrictions');
  }

  /**
   * Get restrictions for a specific organization
   */
  async getRestrictions(organizationId: string): Promise<OrganizationRestrictions> {
    return this.request<OrganizationRestrictions>(`/admin/restrictions/${organizationId}`);
  }

  /**
   * Update restrictions for a specific organization
   */
  async updateRestrictions(
    organizationId: string,
    updates: UpdateRestrictionsRequest
  ): Promise<OrganizationRestrictions> {
    return this.request<OrganizationRestrictions>(`/admin/restrictions/${organizationId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Get audit log with optional filters and pagination
   */
  async getAuditLog(params?: AuditLogQueryParams): Promise<AuditLogResponse> {
    const queryParams = new URLSearchParams();

    if (params?.organizationId) queryParams.append('organizationId', params.organizationId);
    if (params?.adminUserId) queryParams.append('adminUserId', params.adminUserId);
    if (params?.feature) queryParams.append('feature', params.feature);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/admin/audit-log${queryString ? `?${queryString}` : ''}`;

    return this.request<AuditLogResponse>(endpoint);
  }

  /**
   * Export audit log as CSV
   */
  async exportAuditLog(params?: AuditLogQueryParams): Promise<Blob> {
    const queryParams = new URLSearchParams();

    if (params?.organizationId) queryParams.append('organizationId', params.organizationId);
    if (params?.adminUserId) queryParams.append('adminUserId', params.adminUserId);
    if (params?.feature) queryParams.append('feature', params.feature);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const url = `${this.baseURL}/admin/audit-log/export${queryString ? `?${queryString}` : ''}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const config: RequestInit = {
      signal: controller.signal,
      headers: {},
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AdminError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status
        );
      }

      return await response.blob();
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }

      if (error.message === 'Failed to fetch') {
        throw new Error('Connection failed. Please check your internet and try again.');
      }

      console.error(`Export failed [${url}]:`, error);
      throw error;
    }
  }
}

export const adminApiClient = new AdminApiClient(API_BASE_URL);
