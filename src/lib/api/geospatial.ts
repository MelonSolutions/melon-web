/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataImport, GeoDataPoint, GeoLayer, GeospatialAnalytics, LayerStyling, MapFilters } from "@/types/geospatial";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CreateLayerRequest {
  name: string;
  type: GeoLayer['type'];
  source: GeoLayer['source'];
  sourceId?: string;
  metric?: string;
  styling?: Partial<LayerStyling>;
}

export interface ImportDataRequest {
  file: File;
  mappings: {
    latitude: string;
    longitude: string;
    label?: string;
    region?: string;
  };
  name: string;
}

class GeospatialAPI {
  private getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Data Import
  async importData(request: ImportDataRequest): Promise<DataImport> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('mappings', JSON.stringify(request.mappings));
    formData.append('name', request.name);

    const response = await fetch(`${API_BASE_URL}/api/geospatial/import`, {
      method: 'POST',
      headers: {
        ...(typeof window !== 'undefined' && localStorage.getItem('authToken') && {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to import data');
    }

    return response.json();
  }

  async getImports(): Promise<DataImport[]> {
    const response = await fetch(`${API_BASE_URL}/api/geospatial/imports`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async deleteImport(importId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/geospatial/imports/${importId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete import');
    }
  }

  // Layers
  async getLayers(): Promise<GeoLayer[]> {
    const response = await fetch(`${API_BASE_URL}/api/geospatial/layers`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async createLayer(request: CreateLayerRequest): Promise<GeoLayer> {
    const response = await fetch(`${API_BASE_URL}/api/geospatial/layers`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to create layer');
    }

    return response.json();
  }

  async updateLayer(layerId: string, updates: Partial<GeoLayer>): Promise<GeoLayer> {
    const response = await fetch(`${API_BASE_URL}/api/geospatial/layers/${layerId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update layer');
    }

    return response.json();
  }

  async deleteLayer(layerId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/geospatial/layers/${layerId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete layer');
    }
  }

  // Data Queries
  async getGeoData(filters: MapFilters): Promise<GeoDataPoint[]> {
    const params = new URLSearchParams();
    
    if (filters.dateRange) {
      params.append('startDate', filters.dateRange[0]);
      params.append('endDate', filters.dateRange[1]);
    }
    
    if (filters.regions?.length) {
      params.append('regions', filters.regions.join(','));
    }
    
    if (filters.countries?.length) {
      params.append('countries', filters.countries.join(','));
    }
    
    if (filters.sources?.length) {
      params.append('sources', filters.sources.join(','));
    }

    if (filters.search) {
      params.append('search', filters.search);
    }

    const response = await fetch(`${API_BASE_URL}/api/geospatial/data?${params}`, {
      headers: this.getHeaders(),
    });

    return response.json();
  }

  async getAnalytics(filters?: Partial<MapFilters>): Promise<GeospatialAnalytics> {
    const params = new URLSearchParams();
    
    if (filters?.dateRange) {
      params.append('startDate', filters.dateRange[0]);
      params.append('endDate', filters.dateRange[1]);
    }

    const response = await fetch(`${API_BASE_URL}/api/geospatial/analytics?${params}`, {
      headers: this.getHeaders(),
    });

    return response.json();
  }

  // Report Integration
  async getReportLocations(reportId?: string): Promise<GeoDataPoint[]> {
    const url = reportId 
      ? `${API_BASE_URL}/api/geospatial/reports/${reportId}/locations`
      : `${API_BASE_URL}/api/geospatial/reports/locations`;
      
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    return response.json();
  }

  // Spatial Analysis
  async getSpatialAnalysis(options: {
    metric: string;
    aggregation: 'sum' | 'avg' | 'count';
    groupBy: 'region' | 'country' | 'grid';
    resolution?: number; // For grid analysis
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/geospatial/analysis`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(options),
    });

    return response.json();
  }
}

export const geospatialAPI = new GeospatialAPI();