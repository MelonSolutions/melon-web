import { API_BASE_URL, getAuthHeaders } from './client';
import { ApiError } from './errors';

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'disabled';
  description?: string;
  createdAt: string;
}

export interface CreateWebhookDto {
  url: string;
  events: string[];
  description?: string;
}

export const getEndpoints = async (): Promise<WebhookEndpoint[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/webhooks/config`, {
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

export const createEndpoint = async (dto: CreateWebhookDto): Promise<{ endpoint: WebhookEndpoint, secret: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/webhooks/config`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    
    if (!response.ok) {
      throw await response.json();
    }
    
    const result = await response.json();
    return { endpoint: result.data, secret: result.data.secret };
  } catch (error) {
    throw error;
  }
};

export const deleteEndpoint = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/webhooks/config/${id}`, {
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
