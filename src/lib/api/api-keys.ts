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
