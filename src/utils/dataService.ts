/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProjectLocation } from '@/types/geospatial';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  type: 'points' | 'heatmap' | 'coverage';
  count: number;
  color: string;
  opacity: number;
  data: any[];
  description?: string;
  createdAt: Date;
}

export const SAMPLE_MALARIA_DATA: ProjectLocation[] = [
  {
    id: '1',
    title: 'Lagos Malaria Control Center',
    description: 'Community-based malaria prevention initiative in Lagos State',
    lat: 6.5244,
    lng: 3.3792,
    sector: 'Health' as const,
    status: 'active' as const,
    impactScore: 87,
    beneficiaries: 15000,
    coverage: 25,
    activeAgents: 12
  },
  {
    id: '2',
    title: 'Kano Health Initiative',
    description: 'Integrated malaria case management and prevention program',
    lat: 12.0022,
    lng: 8.5920,
    sector: 'Health' as const,
    status: 'active' as const,
    impactScore: 92,
    beneficiaries: 18000,
    coverage: 30,
    activeAgents: 15
  },
  {
    id: '3',
    title: 'Abuja Federal Malaria Program',
    description: 'Advanced malaria diagnosis and treatment facility',
    lat: 9.0765,
    lng: 7.3986,
    sector: 'Health' as const,
    status: 'active' as const,
    impactScore: 85,
    beneficiaries: 12000,
    coverage: 20,
    activeAgents: 10
  },
  {
    id: '4',
    title: 'Port Harcourt Anti-Malaria Campaign',
    description: 'Coastal malaria prevention with water management focus',
    lat: 4.8156,
    lng: 7.0498,
    sector: 'Health' as const,
    status: 'active' as const,
    impactScore: 89,
    beneficiaries: 22000,
    coverage: 35,
    activeAgents: 18
  },
  {
    id: '5',
    title: 'Ibadan Malaria Research Center',
    description: 'Research-focused malaria intervention and treatment',
    lat: 7.3775,
    lng: 3.9470,
    sector: 'Health' as const,
    status: 'active' as const,
    impactScore: 94,
    beneficiaries: 8500,
    coverage: 15,
    activeAgents: 8
  }
];

// Color palette for layers
export const LAYER_COLORS = [
  '#dc2626', '#ea580c', '#ca8a04', '#65a30d', '#059669', 
  '#0891b2', '#2563eb', '#7c3aed', '#c026d3', '#db2777'
];

// Data processing utilities
export class DataService {
  static createSampleLayer(): Layer {
    return {
      id: 'sample-malaria-data',
      name: 'Sample Malaria Data',
      visible: true,
      type: 'points',
      count: SAMPLE_MALARIA_DATA.length,
      color: '#2563eb',
      opacity: 80,
      data: SAMPLE_MALARIA_DATA,
      description: `Sample malaria surveillance data from ${SAMPLE_MALARIA_DATA.length} locations`,
      createdAt: new Date()
    };
  }

  static processImportedData(data: any[], fileName: string): any[] {
    return data.map((item, index) => {
      const latField = Object.keys(item).find(key => 
        key.toLowerCase().includes('lat') || key.toLowerCase() === 'latitude'
      );
      const lngField = Object.keys(item).find(key => 
        key.toLowerCase().includes('lng') || 
        key.toLowerCase().includes('lon') || 
        key.toLowerCase() === 'longitude'
      );

      if (!latField || !lngField) {
        console.warn('No coordinate fields found for item:', item);
        return null;
      }

      const lat = parseFloat(item[latField]);
      const lng = parseFloat(item[lngField]);

      if (isNaN(lat) || isNaN(lng)) {
        console.warn('Invalid coordinates for item:', item);
        return null;
      }

      return {
        ...item,
        id: item.id || `imported-${Date.now()}-${index}`,
        lat,
        lng,
        title: item.title || item.name || item.project_name || `Point ${index + 1}`,
        description: item.description || item.details || item.notes || `Imported from ${fileName}`,
        sector: item.sector || item.category || item.type || 'Health',
        status: item.status || item.state || 'active',
        impactScore: parseInt(item.impactScore || item.impact || '0') || Math.floor(Math.random() * 40) + 60,
        beneficiaries: parseInt(item.beneficiaries || item.population || '0') || Math.floor(Math.random() * 10000) + 1000,
        coverage: parseFloat(item.coverage || item.area || '0') || Math.floor(Math.random() * 30) + 10,
        activeAgents: parseInt(item.activeAgents || item.agents || item.staff || '0') || Math.floor(Math.random() * 20) + 5
      };
    }).filter(Boolean);
  }

  static createLayerFromData(data: any[], layerName: string, existingLayers: Layer[]): Layer {
    const usedColors = existingLayers.map(l => l.color);
    const availableColors = LAYER_COLORS.filter(c => !usedColors.includes(c));
    const layerColor = availableColors[0] || LAYER_COLORS[existingLayers.length % LAYER_COLORS.length];

    return {
      id: `layer-${Date.now()}`,
      name: layerName,
      visible: true,
      type: 'points',
      count: data.length,
      color: layerColor,
      opacity: 80,
      data: data,
      description: `Imported ${data.length} data points`,
      createdAt: new Date()
    };
  }

  static validateCoordinates(lat: number, lng: number): boolean {
    return !isNaN(lat) && 
           !isNaN(lng) && 
           lat >= -90 && 
           lat <= 90 && 
           lng >= -180 && 
           lng <= 180;
  }

  static convertLayerDataToProjects(layers: Layer[]): ProjectLocation[] {
    const visibleLayers = layers.filter(layer => layer.visible);
    const projects: ProjectLocation[] = [];
    
    visibleLayers.forEach(layer => {
      layer.data.forEach(item => {
        if (item.lat && item.lng && this.validateCoordinates(item.lat, item.lng)) {
          const project: ProjectLocation = {
            id: item.id || `${layer.id}-${projects.length}`,
            title: item.title || item.name || `Point ${projects.length + 1}`,
            description: item.description || 'Data point',
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lng),
            sector: (item.sector as any) || 'Health',
            status: (item.status as any) || 'active',
            impactScore: item.impactScore || Math.floor(Math.random() * 40) + 60,
            beneficiaries: item.beneficiaries || Math.floor(Math.random() * 10000) + 1000,
            coverage: item.coverage || Math.floor(Math.random() * 30) + 10,
            activeAgents: item.activeAgents || Math.floor(Math.random() * 20) + 5,
            ...item // Include any additional fields
          };
          projects.push(project);
        }
      });
    });

    return projects;
  }

  static generateSampleCSV(): string {
    return [
      'id,title,description,lat,lng,sector,status,impactScore,beneficiaries,coverage,activeAgents',
      '1,Lagos Malaria Control Center,Community-based malaria prevention initiative,6.5244,3.3792,Health,active,87,15000,25,12',
      '2,Kano Health Initiative,Integrated malaria case management program,12.0022,8.5920,Health,active,92,18000,30,15',
      '3,Abuja Federal Program,Advanced malaria diagnosis and treatment,9.0765,7.3986,Health,active,85,12000,20,10',
      '4,Port Harcourt Campaign,Coastal malaria prevention program,4.8156,7.0498,Health,active,89,22000,35,18',
      '5,Ibadan Research Center,Research-focused malaria intervention,7.3775,3.9470,Health,active,94,8500,15,8'
    ].join('\n');
  }

  static downloadSampleCSV(): void {
    const csvContent = this.generateSampleCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_malaria_data.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  static exportLayerAsCSV(layer: Layer): void {
    if (layer.data.length === 0) {
      alert('No data to export for this layer');
      return;
    }

    const csvContent = [
      // Headers
      Object.keys(layer.data[0] || {}).join(','),
      // Data rows
      ...layer.data.map(row => 
        Object.values(row).map(val => 
          typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${layer.name.replace(/\s+/g, '_')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  static exportAllLayersAsCSV(layers: Layer[]): void {
    const allData = layers.flatMap(layer => 
      layer.data.map(point => ({ ...point, layer: layer.name }))
    );
    
    if (allData.length === 0) {
      alert('No data to export');
      return;
    }

    const csvContent = [
      Object.keys(allData[0] || {}).join(','),
      ...allData.map(row => 
        Object.values(row).map(val => 
          typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        ).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'all_layers_data.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }
}