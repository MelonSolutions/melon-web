/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ProjectLocation extends Coordinates {
  id: string;
  title: string;
  sector: 'Health' | 'Education' | 'Agriculture' | 'Energy' | 'Finance' | 'Infrastructure';
  status: 'active' | 'completed' | 'draft' | 'paused';
  impactScore: number;
  beneficiaries: number;
  activeAgents: number;
  coverage: number; // radius in km
  // budget: {
  //   total: number;
  //   utilized: number;
  // };
  // region: string;
  description: string;
  phases?: ProjectPhase[];
}

export interface ProjectPhase {
  id: string;
  name: string;
  status: 'completed' | 'in_progress' | 'pending';
  progress: number;
}

export interface GeoDataPoint {
  id: string;
  latitude: number;
  longitude: number;
  properties: Record<string, any>; // Flexible properties
  source: 'report' | 'import' | 'manual';
  sourceId?: string; // ID from reports or imports
  timestamp?: string;
  region?: string;
  country?: string;
}

export interface GeoLayer {
  id: string;
  name: string;
  type: 'points' | 'heatmap' | 'choropleth' | 'clusters';
  source: 'reports' | 'imports' | 'external';
  sourceId?: string;
  visible: boolean;
  opacity: number;
  color?: string;
  metric?: string; // Which property to visualize
  styling: LayerStyling;
  data: GeoDataPoint[];
}

export interface LayerStyling {
  colorScale?: 'sequential' | 'diverging' | 'categorical';
  colorPalette?: string[];
  sizeRange?: [number, number];
  strokeWidth?: number;
  fillOpacity?: number;
}

export interface MapFilters {
  dateRange?: [string, string];
  regions?: string[];
  countries?: string[];
  sources?: string[];
  metricRange?: [number, number];
  search?: string;
  layers: string[]; // Active layer IDs
}

export interface MapViewConfig {
  center: [number, number];
  zoom: number;
  bounds?: [[number, number], [number, number]];
  basemap: 'streets' | 'satellite' | 'terrain' | 'light' | 'dark';
  showControls: boolean;
  showLegend: boolean;
  showTimeline: boolean;
}

export interface DataImport {
  id: string;
  name: string;
  fileName: string;
  uploadedAt: string;
  status: 'processing' | 'ready' | 'error';
  rowCount: number;
  geoColumnMappings: {
    latitude: string;
    longitude: string;
    label?: string;
    region?: string;
  };
  availableMetrics: string[];
  preview: GeoDataPoint[];
}

export interface GeospatialAnalytics {
  totalPoints: number;
  dateRange: [string, string];
  regions: { name: string; count: number }[];
  topMetrics: { name: string; value: number; unit?: string }[];
  coverage: {
    countries: number;
    regions: number;
    area: number; // km²
  };
  dataQuality: {
    completeCoordinates: number;
    missingData: number;
    duplicates: number;
  };
}