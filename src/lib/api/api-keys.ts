import { API_BASE_URL, getAuthHeaders } from './client';
import { ApiError } from './errors';

export interface ApiKey {
  id: string;
  keyId: string;
  name: string;
  environment: 'live' | 'sandbox';
  scopes: string[];
  status: 'active' | 'revoked';
  rateLimit: number;
  createdAt: string;
  lastUsedAt?: string;
}

export interface CreateApiKeyDto {
  name: string;
  environment: 'live' | 'sandbox';
  scopes: string[];
}

export const listApiKeys = async (): Promise<ApiKey[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api-keys`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw await response.json();
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    throw error;
  }
};

export const createApiKey = async (dto: CreateApiKeyDto): Promise<{ apiKey: ApiKey, secret: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api-keys`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    
    if (!response.ok) {
      throw await response.json();
    }
    
    const result = await response.json();
    return { apiKey: result.data, secret: result.data.secret };
  } catch (error) {
    throw error;
  }
};

export const rotateApiKey = async (keyId: string): Promise<{ apiKey: ApiKey, secret: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api-keys/${keyId}/rotate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw await response.json();
    }
    
    const result = await response.json();
    return { apiKey: result.data, secret: result.data.secret };
  } catch (error) {
    throw error;
  }
};

export const revokeApiKey = async (keyId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api-keys/${keyId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw await response.json();
    }
  } catch (error) {
    throw error;
  }
};

export interface ApiLog {
  _id: string;
  requestId: string;
  method: string;
  path: string;
  url: string;
  statusCode: number;
  responseTime: number;
  environment: 'live' | 'sandbox';
  ipAddress?: string;
  userAgent?: string;
  errorCode?: string;
  requestBody?: Record<string, any>;
  responseBody?: Record<string, any>;
  requestHeaders?: Record<string, string>;
  createdAt: string;
}

export interface ApiLogsResponse {
  logs: ApiLog[];
  total: number;
  page: number;
  totalPages: number;
}

export const getApiLogs = async (params: {
  page?: number;
  limit?: number;
  environment?: string;
  method?: string;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
} = {}): Promise<ApiLogsResponse> => {
  try {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.environment) searchParams.set('environment', params.environment);
    if (params.method) searchParams.set('method', params.method);
    if (params.status) searchParams.set('status', params.status);
    if (params.search) searchParams.set('search', params.search);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);

    const response = await fetch(`${API_BASE_URL}/api-keys/logs?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw await response.json();
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    throw error;
  }
};
