import { ProjectLocation, GeographicAnalytics, ServiceGap, EmergencyResponse } from '@/types/geospatial';

// Mock project locations (Nigerian coordinates)
export const mockProjectLocations: ProjectLocation[] = [
  {
    id: '1',
    lat: 9.0820,
    lng: 8.6753,
    title: 'Rural Health Initiative 2024',
    sector: 'Health',
    status: 'active',
    impactScore: 87,
    beneficiaries: 2450,
    activeAgents: 8,
    coverage: 15,
    budget: { total: 125000, utilized: 97500 },
    region: 'Northern Region',
    description: 'Comprehensive healthcare delivery program for remote communities',
    phases: [
      { id: '1', name: 'Community Mapping', status: 'completed', progress: 100 },
      { id: '2', name: 'Service Delivery', status: 'in_progress', progress: 78 },
      { id: '3', name: 'Impact Assessment', status: 'pending', progress: 0 }
    ]
  },
  {
    id: '2',
    lat: 6.5244,
    lng: 3.3792,
    title: 'Clean Energy Access Program',
    sector: 'Energy',
    status: 'active',
    impactScore: 92,
    beneficiaries: 1850,
    activeAgents: 12,
    coverage: 20,
    budget: { total: 200000, utilized: 130000 },
    region: 'Western Region',
    description: 'Solar power installation and maintenance in off-grid areas'
  },
  {
    id: '3',
    lat: 4.8156,
    lng: 7.0498,
    title: 'Financial Inclusion Initiative',
    sector: 'Finance',
    status: 'draft',
    impactScore: 0,
    beneficiaries: 0,
    activeAgents: 0,
    coverage: 12,
    budget: { total: 80000, utilized: 12000 },
    region: 'Southern Region',
    description: 'Mobile banking and financial literacy program'
  },
  {
    id: '4',
    lat: 11.8461,
    lng: 13.1572,
    title: 'Maternal Health Support',
    sector: 'Health',
    status: 'active',
    impactScore: 94,
    beneficiaries: 1920,
    activeAgents: 6,
    coverage: 18,
    budget: { total: 95000, utilized: 84550 },
    region: 'Northern Region',
    description: 'Prenatal and postnatal care services expansion'
  },
  {
    id: '5',
    lat: 5.1958,
    lng: 6.9981,
    title: 'Digital Literacy Program',
    sector: 'Education',
    status: 'active',
    impactScore: 76,
    beneficiaries: 980,
    activeAgents: 4,
    coverage: 10,
    budget: { total: 60000, utilized: 33000 },
    region: 'Eastern Region',
    description: 'Computer skills and internet access training'
  }
];

export const mockGeographicAnalytics: GeographicAnalytics = {
  activeProjects: 30,
  kmCoverage: 8.2, // 8.2K km²
  beneficiaries: 42, // 42K beneficiaries
  avgServiceGap: 27 // 27%
};

export const mockServiceGaps: ServiceGap[] = [
  { sector: 'Health Services', level: 'High Gap', color: '#ef4444' },
  { sector: 'Education Access', level: 'Medium Gap', color: '#f59e0b' },
  { sector: 'Energy Access', level: 'Low Gap', color: '#10b981' }
];

export const mockEmergencyResponse: EmergencyResponse[] = [
  {
    id: '1',
    title: 'Identify High-Risk Areas',
    description: 'Rapid deployment planning',
    icon: '⚠️',
    action: () => console.log('Identify high-risk areas')
  },
  {
    id: '2',
    title: 'Plan Resource Deployment',
    description: 'Optimize resource allocation',
    icon: '📋',
    action: () => console.log('Plan resource deployment')
  },
  {
    id: '3',
    title: 'Optimize Response Routes',
    description: 'Calculate optimal paths',
    icon: '🗺️',
    action: () => console.log('Optimize response routes')
  },
  {
    id: '4',
    title: 'Coordinate Field Teams',
    description: 'Team coordination tools',
    icon: '👥',
    action: () => console.log('Coordinate field teams')
  }
];

// Helper function to get nearby projects
export const getNearbyProjects = (projectId: string, maxDistance = 50) => {
  const project = mockProjectLocations.find(p => p.id === projectId);
  if (!project) return [];

  return mockProjectLocations
    .filter(p => p.id !== projectId)
    .map(p => {
      const distance = Math.sqrt(
        Math.pow(p.lat - project.lat, 2) + Math.pow(p.lng - project.lng, 2)
      ) * 111; // Rough conversion to km
      
      return {
        id: p.id,
        title: p.title,
        sector: p.sector,
        distance: Math.round(distance * 10) / 10
      };
    })
    .filter(p => p.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);
};