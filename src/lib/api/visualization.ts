import type {
  CreateVisualizationQuery,
  SavedVisualization,
  VisualizationResult,
  ExportFormat,
} from '@/types/kyc-visualization';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://melon-core.onrender.com';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const BASE_URL = '/kyc/visualizations';

/**
 * Execute a visualization query without saving
 */
export async function executeVisualizationQuery(
  query: CreateVisualizationQuery,
  organizationId?: string
): Promise<VisualizationResult> {
  const params = new URLSearchParams();
  if (organizationId) {
    params.append('organizationId', organizationId);
  }

  const url = `${API_BASE_URL}${BASE_URL}/query${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(query),
  });

  if (!response.ok) {
    throw new Error('Failed to execute visualization query');
  }

  return response.json();
}

/**
 * Save a new visualization
 */
export async function saveVisualization(data: {
  name: string;
  description?: string;
  configuration: CreateVisualizationQuery;
  isPublic?: boolean;
  tags?: string[];
}): Promise<SavedVisualization> {
  const response = await fetch(`${API_BASE_URL}${BASE_URL}/save`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to save visualization');
  }

  return response.json();
}

/**
 * Get all visualizations for the current organization
 */
export async function getVisualizations(filters?: {
  search?: string;
  tags?: string[];
  isPinned?: boolean;
  createdByMe?: boolean;
}): Promise<SavedVisualization[]> {
  const params = new URLSearchParams();

  if (filters?.search) {
    params.append('search', filters.search);
  }
  if (filters?.tags && filters.tags.length > 0) {
    params.append('tags', filters.tags.join(','));
  }
  if (filters?.isPinned !== undefined) {
    params.append('isPinned', filters.isPinned.toString());
  }
  if (filters?.createdByMe !== undefined) {
    params.append('createdByMe', filters.createdByMe.toString());
  }

  const url = `${API_BASE_URL}${BASE_URL}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to get visualizations');
  }

  return response.json();
}

/**
 * Get all tags used in organization
 */
export async function getVisualizationTags(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}${BASE_URL}/tags`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to get visualization tags');
  }

  return response.json();
}

/**
 * Get a single visualization by ID
 */
export async function getVisualizationById(id: string): Promise<SavedVisualization> {
  const response = await fetch(`${API_BASE_URL}${BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to get visualization');
  }

  return response.json();
}

/**
 * Execute a saved visualization
 */
export async function executeSavedVisualization(id: string): Promise<VisualizationResult> {
  const response = await fetch(`${API_BASE_URL}${BASE_URL}/${id}/execute`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to execute saved visualization');
  }

  return response.json();
}

/**
 * Update a visualization
 */
export async function updateVisualization(
  id: string,
  data: {
    name?: string;
    description?: string;
    configuration?: CreateVisualizationQuery;
    isPublic?: boolean;
    tags?: string[];
  }
): Promise<SavedVisualization> {
  const response = await fetch(`${API_BASE_URL}${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update visualization');
  }

  return response.json();
}

/**
 * Toggle pin status of a visualization
 */
export async function toggleVisualizationPin(id: string): Promise<SavedVisualization> {
  const response = await fetch(`${API_BASE_URL}${BASE_URL}/${id}/pin`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to toggle pin status');
  }

  return response.json();
}

/**
 * Delete a visualization
 */
export async function deleteVisualization(id: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete visualization');
  }

  return response.json();
}

/**
 * Export visualization data
 */
export async function exportVisualization(
  configuration: CreateVisualizationQuery,
  format: ExportFormat,
  filename?: string,
  organizationId?: string
): Promise<void> {
  const params = new URLSearchParams();
  if (organizationId) {
    params.append('organizationId', organizationId);
  }

  const url = `${API_BASE_URL}${BASE_URL}/export${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      format,
      configuration,
      filename,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to export visualization');
  }

  // Get filename from Content-Disposition header or use provided filename
  const contentDisposition = response.headers.get('content-disposition');
  let downloadFilename = filename || `visualization.${format.toLowerCase()}`;

  if (contentDisposition) {
    const matches = /filename="([^"]+)"/.exec(contentDisposition);
    if (matches && matches[1]) {
      downloadFilename = matches[1];
    }
  }

  // Create download link
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = downloadFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}
