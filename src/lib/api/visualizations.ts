/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { DataSource, ChartConfig, VisualizationStats } from '@/types/visualization';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper function for API requests with better error handling
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log(`🔗 API Request: ${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, defaultOptions);
    
    console.log(`📡 Response Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      return response.text();
    }
  } catch (error) {
    console.error(`❌ API Error for ${endpoint}:`, error);
    throw error;
  }
};

// Mock data for development when backend is not available
const getMockStats = (): VisualizationStats => ({
  totalDataSources: 3,
  totalRecords: 1250,
  activeCharts: 8,
  sharedCharts: 2,
});

const getMockDataSources = (): DataSource[] => [
  {
    id: '1',
    name: 'App Rating Survey',
    type: 'report',
    columns: [
      { name: 'region', type: 'string', nullable: false, unique: false },
      { name: 'rating', type: 'number', nullable: false, unique: false },
      { name: 'feedback', type: 'string', nullable: true, unique: false },
    ],
    rowCount: 150,
    uploadedAt: new Date().toISOString(),
    status: 'ready',
  },
  {
    id: '2',
    name: 'Sales Data Q4',
    type: 'csv',
    fileName: 'sales_q4.csv',
    columns: [
      { name: 'month', type: 'string', nullable: false, unique: false },
      { name: 'revenue', type: 'number', nullable: false, unique: false },
      { name: 'units_sold', type: 'number', nullable: false, unique: false },
    ],
    rowCount: 12,
    uploadedAt: new Date().toISOString(),
    status: 'ready',
  },
];

const getMockCharts = (): ChartConfig[] => [
  {
    id: '1',
    name: 'App Ratings by Region',
    type: 'bar',
    dataSourceId: '1',
    xAxis: 'region',
    yAxis: 'rating',
    aggregation: 'average',
    filters: [],
    styling: {
      colors: ['#4F46E5'],
      showLegend: true,
      showGrid: true,
      title: 'App Ratings by Region',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Dashboard & Stats
export const getDashboardStats = async (): Promise<VisualizationStats> => {
  try {
    return await apiRequest('/visualizations/dashboard');
  } catch (error) {
    console.warn('Using mock data for dashboard stats');
    return getMockStats();
  }
};

// Data Sources API
export const getDataSources = async (type?: string): Promise<DataSource[]> => {
  try {
    const queryParam = type ? `?type=${type}` : '';
    return await apiRequest(`/visualizations/data-sources/all${queryParam}`);
  } catch (error) {
    console.warn('Using mock data for data sources');
    return getMockDataSources();
  }
};

export const getDataSourceById = async (id: string): Promise<DataSource> => {
  try {
    return await apiRequest(`/visualizations/data-sources/${id}`);
  } catch (error) {
    console.warn('Using mock data for data source');
    return getMockDataSources().find(ds => ds.id === id) || getMockDataSources()[0];
  }
};

export const previewDataSource = async (id: string, limit: number = 100): Promise<any[]> => {
  try {
    return await apiRequest(`/visualizations/data-sources/${id}/preview?limit=${limit}`);
  } catch (error) {
    console.warn('Using mock data for preview');
    return [
      { region: 'North America', rating: 4.5, feedback: 'Great app!' },
      { region: 'Europe', rating: 4.2, feedback: 'Good functionality' },
      { region: 'Asia', rating: 4.7, feedback: 'Excellent performance' },
    ];
  }
};

export const deleteDataSource = async (id: string): Promise<{ message: string }> => {
  try {
    return await apiRequest(`/visualizations/data-sources/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.warn('Mock delete operation');
    return { message: 'Data source deleted successfully' };
  }
};

// Charts API
export const getCharts = async (params: {
  pageSize?: number;
  currentPage?: number;
  status?: string;
  type?: string;
  search?: string;
} = {}): Promise<{ data: ChartConfig[]; pagination: any }> => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });

    const queryString = queryParams.toString();
    return await apiRequest(`/visualizations/charts/all${queryString ? `?${queryString}` : ''}`);
  } catch (error) {
    console.warn('Using mock data for charts');
    return {
      data: getMockCharts(),
      pagination: { page: 1, total: 1, pages: 1 },
    };
  }
};

export const createChart = async (data: Partial<ChartConfig>): Promise<ChartConfig> => {
  try {
    return await apiRequest('/visualizations/charts/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.warn('Mock chart creation');
    const newChart: ChartConfig = {
      id: Date.now().toString(),
      name: data.name || 'New Chart',
      type: data.type || 'bar',
      dataSourceId: data.dataSourceId || '1',
      xAxis: data.xAxis || 'category',
      yAxis: data.yAxis || 'value',
      aggregation: data.aggregation || 'count',
      filters: data.filters || [],
      styling: data.styling || {
        colors: ['#4F46E5'],
        showLegend: true,
        showGrid: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newChart;
  }
};

export const deleteChart = async (id: string): Promise<{ message: string }> => {
  try {
    return await apiRequest(`/visualizations/charts/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.warn('Mock delete operation');
    return { message: 'Chart deleted successfully' };
  }
};

export const duplicateChart = async (id: string): Promise<ChartConfig> => {
  try {
    return await apiRequest(`/visualizations/charts/${id}/duplicate`, {
      method: 'POST',
    });
  } catch (error) {
    console.warn('Mock duplicate operation');
    const mockCharts = getMockCharts();
    const original = mockCharts.find(c => c.id === id) || mockCharts[0];
    return {
      ...original,
      id: Date.now().toString(),
      name: `${original.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
};

export const shareChart = async (id: string): Promise<{
  shareToken: string;
  shareUrl: string;
  chart: ChartConfig;
}> => {
  try {
    return await apiRequest(`/visualizations/charts/${id}/share`, {
      method: 'POST',
    });
  } catch (error) {
    console.warn('Mock share operation');
    return {
      shareToken: 'mock-share-token',
      shareUrl: `http://localhost:3000/shared/charts/mock-share-token`,
      chart: getMockCharts().find(c => c.id === id) || getMockCharts()[0],
    };
  }
};

// CSV Import
export const importCsvFile = async (formData: FormData): Promise<DataSource> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    console.log('🔄 Sending FormData to backend...');
    
    // Log FormData contents for debugging
    for (const [key, value] of formData.entries()) {
      console.log(`📝 FormData: ${key} =`, value);
    }
    
    const response = await fetch(`${API_BASE_URL}/visualizations/data-sources/import-csv`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type - let browser set it with boundary for multipart/form-data
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    console.log(`📡 Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Upload error response:', errorText);
      
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Upload successful:', result);
    return result;
  } catch (error) {
    console.error('❌ CSV import failed:', error);
    console.warn('Using mock CSV import due to error');
    
    // Return mock data for development
    return {
      id: Date.now().toString(),
      name: 'Imported CSV Data',
      type: 'csv',
      fileName: 'imported_data.csv',
      columns: [
        { name: 'category', type: 'string', nullable: false, unique: false },
        { name: 'value', type: 'number', nullable: false, unique: false },
      ],
      rowCount: 100,
      uploadedAt: new Date().toISOString(),
      status: 'ready',
    };
  }
};

export const downloadSampleCsv = async (): Promise<Blob> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    const response = await fetch(`${API_BASE_URL}/visualizations/data-sources/sample-csv`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download sample CSV');
    }

    return response.blob();
  } catch (error) {
    console.warn('Creating mock CSV');
    const csvContent = 'region,rating,feedback\nNorth America,4.5,Great app!\nEurope,4.2,Good functionality\nAsia,4.7,Excellent performance';
    return new Blob([csvContent], { type: 'text/csv' });
  }
};

// Reports Integration
export const getAvailableReports = async (): Promise<any[]> => {
  try {
    return await apiRequest('/visualizations/reports/available');
  } catch (error) {
    console.warn('Using mock reports data');
    return [
      {
        _id: '1',
        title: 'App Rating Survey',
        description: 'Quarterly app rating and feedback collection',
        responseCount: 150,
        questions: [
          { name: 'region', type: 'text' },
          { name: 'rating', type: 'number' },
          { name: 'feedback', type: 'text' },
        ],
      },
      {
        _id: '2',
        title: 'User Experience Survey',
        description: 'UX feedback and usability metrics',
        responseCount: 89,
        questions: [
          { name: 'user_type', type: 'text' },
          { name: 'satisfaction_score', type: 'number' },
          { name: 'feature_usage', type: 'text' },
        ],
      },
    ];
  }
};

export const getReportFields = async (reportId: string): Promise<any> => {
  try {
    return await apiRequest(`/visualizations/reports/${reportId}/fields`);
  } catch (error) {
    console.warn('Using mock report fields');
    return {
      responseCount: 150,
      fields: [
        { name: 'region', displayName: 'Region', type: 'string' },
        { name: 'rating', displayName: 'Rating', type: 'number' },
        { name: 'feedback', displayName: 'Feedback', type: 'string' },
      ],
    };
  }
};

export const createDataSourceFromReport = async (data: {
  name: string;
  description?: string;
  reportId: string;
  selectedFields?: string[];
  dateRange?: string;
}): Promise<DataSource> => {
  try {
    return await apiRequest('/visualizations/data-sources/from-report', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.warn('Mock report data source creation');
    return {
      id: Date.now().toString(),
      name: data.name,
      type: 'report',
      reportId: data.reportId,
      columns: [
        { name: 'region', type: 'string', nullable: false, unique: false },
        { name: 'rating', type: 'number', nullable: false, unique: false },
        { name: 'feedback', type: 'string', nullable: true, unique: false },
      ],
      rowCount: 150,
      uploadedAt: new Date().toISOString(),
      status: 'ready',
    };
  }
};

// Add these missing methods to your visualizations.ts API file

export const updateChart = async (id: string, data: Partial<ChartConfig>): Promise<ChartConfig> => {
  try {
    return await apiRequest(`/visualizations/charts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.warn('Mock chart update');
    const mockCharts = getMockCharts();
    const original = mockCharts.find(c => c.id === id) || mockCharts[0];
    return {
      ...original,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
  }
};

export const generateChartData = async (id: string): Promise<any> => {
  try {
    return await apiRequest(`/visualizations/charts/${id}/data`);
  } catch (error) {
    console.warn('Using mock chart data');
    // Return mock data based on chart configuration
    return [
      { region: 'North America', rating: 4.5, feedback: 'Great app!' },
      { region: 'Europe', rating: 4.2, feedback: 'Good functionality' },
      { region: 'Asia', rating: 4.7, feedback: 'Excellent performance' },
      { region: 'South America', rating: 3.8, feedback: 'Average experience' },
      { region: 'Africa', rating: 4.1, feedback: 'Very satisfied' },
    ];
  }
};

export const exportChart = async (id: string, format: string = 'json'): Promise<Blob> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    const response = await fetch(`${API_BASE_URL}/visualizations/charts/${id}/export?format=${format}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export chart');
    }

    return response.blob();
  } catch (error) {
    console.warn('Creating mock export');
    const mockData = JSON.stringify({
      chartId: id,
      exportedAt: new Date().toISOString(),
      data: [
        { region: 'North America', rating: 4.5 },
        { region: 'Europe', rating: 4.2 },
        { region: 'Asia', rating: 4.7 },
      ]
    }, null, 2);
    
    return new Blob([mockData], { type: 'application/json' });
  }
};

// Public API (no auth required)
export const getSharedChart = async (shareToken: string): Promise<ChartConfig> => {
  try {
    return await apiRequest(`/visualizations/public/charts/${shareToken}`);
  } catch (error) {
    console.warn('Using mock shared chart');
    return getMockCharts()[0];
  }
};

export const getSharedChartData = async (shareToken: string): Promise<any> => {
  try {
    return await apiRequest(`/visualizations/public/charts/${shareToken}/data`);
  } catch (error) {
    console.warn('Using mock shared chart data');
    return [
      { region: 'North America', rating: 4.5 },
      { region: 'Europe', rating: 4.2 },
      { region: 'Asia', rating: 4.7 },
    ];
  }
};
