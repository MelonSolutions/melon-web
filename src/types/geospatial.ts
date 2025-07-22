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
  budget: {
    total: number;
    utilized: number;
  };
  region: string;
  description: string;
  phases?: ProjectPhase[];
}

export interface ProjectPhase {
  id: string;
  name: string;
  status: 'completed' | 'in_progress' | 'pending';
  progress: number;
}

export interface MapLayer {
  id: string;
  name: string;
  type: 'projects' | 'heatmap' | 'coverage' | 'demographics' | 'infrastructure';
  visible: boolean;
  color?: string;
  opacity?: number;
}

export interface ServiceGap {
  sector: 'Health Services' | 'Education Access' | 'Energy Access';
  level: 'High Gap' | 'Medium Gap' | 'Low Gap';
  color: string;
}

export interface EmergencyResponse {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

export interface GeographicAnalytics {
  activeProjects: number;
  kmCoverage: number;
  beneficiaries: number;
  avgServiceGap: number;
}

export interface NearbyProject {
  id: string;
  title: string;
  sector: string;
  distance: number; // in km
}

export interface MapFilters {
  sectors: string[];
  status: string[];
  impactRange: [number, number];
  showCoverage: boolean;
  showHeatmap: boolean;
}