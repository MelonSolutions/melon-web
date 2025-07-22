'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapToolbar } from '@/components/map-view/MapToolbar';
import { MapSidebar } from '@/components/map-view/MapSidebar';
import { ProjectDetailsPanel } from '@/components/map-view/ProjectDetailsPanel';
import { mockProjectLocations, mockGeographicAnalytics } from '@/lib/api/geospatial-mock';
import { ProjectLocation, MapFilters } from '@/types/geospatial';

// Dynamically import the map to avoid SSR issues
const InteractiveMap = dynamic(
  () => import('@/components/map-view/InteractiveMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }
);

export default function MapViewPage() {
  const [selectedProject, setSelectedProject] = useState<ProjectLocation | null>(null);
  const [sidebarView, setSidebarView] = useState<'analytics' | 'details'>('analytics');
  const [filters, setFilters] = useState<MapFilters>({
    sectors: [],
    status: [],
    impactRange: [0, 100],
    showCoverage: true,
    showHeatmap: false
  });

  const handleProjectSelect = (project: ProjectLocation) => {
    setSelectedProject(project);
    setSidebarView('details');
  };

  const handleCloseSidebar = () => {
    setSelectedProject(null);
    setSidebarView('analytics');
  };

  const filteredProjects = mockProjectLocations.filter(project => {
    // Filter by sectors
    if (filters.sectors.length > 0 && !filters.sectors.includes(project.sector)) {
      return false;
    }
    
    // Filter by status
    if (filters.status.length > 0 && !filters.status.includes(project.status)) {
      return false;
    }
    
    // Filter by impact range
    if (project.impactScore < filters.impactRange[0] || project.impactScore > filters.impactRange[1]) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Geospatial Intelligence</h1>
          </div>
        </div>
      </div>

      {/* Map Toolbar */}
      <MapToolbar filters={filters} onFiltersChange={setFilters} />

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Map Container */}
        <div className="flex-1 relative">
          <InteractiveMap
            projects={filteredProjects}
            selectedProject={selectedProject}
            onProjectSelect={handleProjectSelect}
            showCoverage={filters.showCoverage}
            showHeatmap={filters.showHeatmap}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {sidebarView === 'analytics' ? (
            <MapSidebar 
              analytics={mockGeographicAnalytics}
              onProjectSelect={handleProjectSelect}
            />
          ) : (
            <ProjectDetailsPanel
              project={selectedProject}
              onClose={handleCloseSidebar}
            />
          )}
        </div>
      </div>
    </div>
  );
}