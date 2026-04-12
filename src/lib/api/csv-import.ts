import type {
  CSVDataSource,
  UploadCSVRequest,
  UpdateCSVDataSourceRequest,
  CSVFormatRequirements,
  CSVQueryResult,
  MapDataPoint,
} from '@/types/csv-import';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://melon-core.onrender.com';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const BASE_URL = '/csv-import';

/**
 * Get CSV format requirements and examples
 */
export async function getCSVFormatRequirements(): Promise<CSVFormatRequirements> {
  const response = await fetch(`${API_BASE_URL}${BASE_URL}/format-requirements`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to get CSV format requirements');
  }

  return response.json();
}

/**
 * Upload a CSV file
 */
export async function uploadCSV(request: UploadCSVRequest): Promise<CSVDataSource> {
  const formData = new FormData();
  formData.append('file', request.file);
  formData.append('name', request.name);

  if (request.description) {
    formData.append('description', request.description);
  }

  if (request.isMapDataSource !== undefined) {
    formData.append('isMapDataSource', request.isMapDataSource.toString());
  }

  if (request.latitudeColumn) {
    formData.append('latitudeColumn', request.latitudeColumn);
  }

  if (request.longitudeColumn) {
    formData.append('longitudeColumn', request.longitudeColumn);
  }

  if (request.labelColumn) {
    formData.append('labelColumn', request.labelColumn);
  }

  if (request.categoryColumn) {
    formData.append('categoryColumn', request.categoryColumn);
  }

  const response = await fetch(`${API_BASE_URL}${BASE_URL}/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload CSV');
  }

  return response.json();
}

/**
 * Get all CSV data sources
 */
export async function getCSVDataSources(filters?: {
  isMapDataSource?: boolean;
  status?: string;
  search?: string;
}): Promise<CSVDataSource[]> {
  const params = new URLSearchParams();

  if (filters?.isMapDataSource !== undefined) {
    params.append('isMapDataSource', filters.isMapDataSource.toString());
  }

  if (filters?.status) {
    params.append('status', filters.status);
  }

  if (filters?.search) {
    params.append('search', filters.search);
  }

  const url = `${API_BASE_URL}${BASE_URL}/data-sources${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get CSV data sources');
  }

  return response.json();
}

/**
 * Get a specific CSV data source
 */
export async function getCSVDataSource(id: string): Promise<CSVDataSource> {
  const response = await fetch(`${API_BASE_URL}${BASE_URL}/data-sources/${id}`, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get CSV data source');
  }

  return response.json();
}

/**
 * Update a CSV data source
 */
export async function updateCSVDataSource(
  id: string,
  data: UpdateCSVDataSourceRequest
): Promise<CSVDataSource> {
  const response = await fetch(`${API_BASE_URL}${BASE_URL}/data-sources/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update CSV data source');
  }

  return response.json();
}

/**
 * Delete a CSV data source
 */
export async function deleteCSVDataSource(id: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}${BASE_URL}/data-sources/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete CSV data source');
  }

  return response.json();
}

/**
 * Query data from a CSV source
 */
export async function queryCSVData(
  id: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<CSVQueryResult> {
  const params = new URLSearchParams();

  if (options?.limit) {
    params.append('limit', options.limit.toString());
  }

  if (options?.offset) {
    params.append('offset', options.offset.toString());
  }

  const url = `${API_BASE_URL}${BASE_URL}/data-sources/${id}/data${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to query CSV data');
  }

  return response.json();
}

/**
 * Get map data points from a CSV source
 */
export async function getCSVMapDataPoints(id: string): Promise<MapDataPoint[]> {
  const response = await fetch(`${API_BASE_URL}${BASE_URL}/data-sources/${id}/map-points`, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get CSV map data points');
  }

  return response.json();
}
