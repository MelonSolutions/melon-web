/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import { LatLngBounds, Icon, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ProjectLocation } from '@/types/geospatial';
import { MapPin } from 'lucide-react';
import { TerrainSelector } from './TerrainSelector';
import { MAP_TILE_LAYERS } from '@/types/map';

// Fix for default markers in Next.js
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveMapProps {
  projects: ProjectLocation[];
  selectedProject: ProjectLocation | null;
  onProjectSelect: (project: ProjectLocation) => void;
  showCoverage: boolean;
  showHeatmap: boolean;
  onLoadSampleData?: () => void;
  onOpenImportModal?: () => void;
}

function HeatmapLayer({ projects, show }: { projects: ProjectLocation[]; show: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!show || projects.length === 0 || !map) return;

    let canvas: HTMLCanvasElement | null = null;
    let ctx: CanvasRenderingContext2D | null = null;

    try {
      const mapContainer = map.getContainer();
      if (!mapContainer) return;

      const size = map.getSize();
      
      canvas = document.createElement('canvas');
      ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = size.x;
      canvas.height = size.y;
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '400';
      canvas.style.opacity = '0.6';

      const drawHeatmap = () => {
        if (!ctx || !canvas) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        projects.forEach(project => {
          try {
            const point = map.latLngToContainerPoint([project.lat, project.lng]);
            const intensity = (project.beneficiaries / 20000) * (project.impactScore / 100);
            const radius = Math.max(30, Math.min(80, project.coverage * 2));
            
            if (!ctx) return;
            
            const gradient = ctx.createRadialGradient(
              point.x, point.y, 0,
              point.x, point.y, radius
            );
            
            const alpha = Math.min(0.7, intensity);
            gradient.addColorStop(0, `rgba(59, 130, 246, ${alpha})`); // Blue center
            gradient.addColorStop(0.4, `rgba(147, 197, 253, ${alpha * 0.7})`); // Light blue
            gradient.addColorStop(0.8, `rgba(219, 234, 254, ${alpha * 0.3})`); // Very light blue
            gradient.addColorStop(1, 'rgba(219, 234, 254, 0)'); // Transparent
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            ctx.fill();
          } catch (error) {
            console.warn('Error drawing heatmap point:', error);
          }
        });
      };

      // Initial draw
      drawHeatmap();
      mapContainer.appendChild(canvas);

      const updateHeatmap = () => {
        if (!canvas || !ctx) return;
        
        try {
          const newSize = map.getSize();
          canvas.width = newSize.x;
          canvas.height = newSize.y;
          drawHeatmap();
        } catch (error) {
          console.warn('Error updating heatmap:', error);
        }
      };

      map.on('zoom', updateHeatmap);
      map.on('move', updateHeatmap);

      return () => {
        try {
          map.off('zoom', updateHeatmap);
          map.off('move', updateHeatmap);
          if (canvas && mapContainer && mapContainer.contains(canvas)) {
            mapContainer.removeChild(canvas);
          }
        } catch (error) {
          console.warn('Error cleaning up heatmap:', error);
        }
      };
    } catch (error) {
      console.warn('Error initializing heatmap:', error);
      return;
    }
  }, [map, projects, show]);

  return null;
}

// Enhanced Project Marker component
function ProjectMarker({ project, isSelected, onSelect, showCoverage }: {
  project: ProjectLocation;
  isSelected: boolean;
  onSelect: (project: ProjectLocation) => void;
  showCoverage: boolean;
}) {
  const getSectorColor = (sector: string) => {
    switch (sector) {
      case 'Health': return '#dc2626';
      case 'Education': return '#7c3aed';
      case 'Agriculture': return '#059669';
      case 'Energy': return '#d97706';
      case 'Finance': return '#0891b2';
      case 'Infrastructure': return '#4338ca';
      default: return '#374151';
    }
  };

  const getSectorIcon = (sector: string) => {
    switch (sector) {
      case 'Health': return '🏥';
      case 'Education': return '🎓';
      case 'Agriculture': return '🌾';
      case 'Energy': return '⚡';
      case 'Finance': return '💰';
      case 'Infrastructure': return '🏗️';
      default: return '📍';
    }
  };

  const color = getSectorColor(project.sector);
  const icon = getSectorIcon(project.sector);
  
  const customIcon = new DivIcon({
    html: `
      <div class="relative">
        <div style="
          width: ${isSelected ? '40px' : '32px'};
          height: ${isSelected ? '40px' : '32px'};
          background: ${color};
          border: ${isSelected ? '3px' : '2px'} solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 ${isSelected ? '4px 12px' : '2px 8px'} rgba(0,0,0,${isSelected ? '0.4' : '0.25'});
          transition: all 0.2s ease;
          position: relative;
          z-index: ${isSelected ? '1000' : '500'};
        ">
          <span style="font-size: ${isSelected ? '18px' : '14px'};">${icon}</span>
        </div>
        ${project.status === 'active' ? `
          <div style="
            position: absolute;
            top: -2px;
            right: -2px;
            width: 12px;
            height: 12px;
            background: #10b981;
            border: 2px solid white;
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
        ` : ''}
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>
    `,
    className: 'custom-marker',
    iconSize: [isSelected ? 40 : 32, isSelected ? 40 : 32],
    iconAnchor: [isSelected ? 20 : 16, isSelected ? 20 : 16],
  });

  return (
    <>
      <Marker
        position={[project.lat, project.lng]}
        icon={customIcon}
        eventHandlers={{
          click: () => onSelect(project),
        }}
      >
      </Marker>
      
      {showCoverage && (
        <Circle
          center={[project.lat, project.lng]}
          radius={project.coverage * 1000}
          pathOptions={{
            color: color,
            fillColor: color,
            fillOpacity: isSelected ? 0.15 : 0.08,
            weight: isSelected ? 2.5 : 1.5,
            opacity: isSelected ? 0.7 : 0.4,
            dashArray: isSelected ? '10, 5' : '5, 5'
          }}
        />
      )}
    </>
  );
}

function MapBounds({ projects }: { projects: ProjectLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    try {
      if (projects.length > 0) {
        const validProjects = projects.filter(p => 
          p.lat && p.lng && 
          !isNaN(p.lat) && !isNaN(p.lng) &&
          p.lat >= -90 && p.lat <= 90 &&
          p.lng >= -180 && p.lng <= 180
        );

        if (validProjects.length > 0) {
          const bounds = new LatLngBounds(
            validProjects.map(project => [project.lat, project.lng])
          );
          map.fitBounds(bounds, { 
            padding: [50, 50],
            maxZoom: 10 
          });
        } else {
          map.setView([9.0820, 8.6753], 6);
        }
      } else {
        map.setView([9.0820, 8.6753], 6);
      }
    } catch (error) {
      console.warn('Error setting map bounds:', error);
      try {
        map.setView([9.0820, 8.6753], 6);
      } catch (fallbackError) {
        console.error('Error setting fallback map view:', fallbackError);
      }
    }
  }, [projects, map]);

  return null;
}

function CustomZoomControls() {
  const map = useMap();

  const handleZoomIn = () => {
    try {
      if (map) map.zoomIn();
    } catch (error) {
      console.warn('Error zooming in:', error);
    }
  };

  const handleZoomOut = () => {
    try {
      if (map) map.zoomOut();
    } catch (error) {
      console.warn('Error zooming out:', error);
    }
  };

  const handleZoomToFit = () => {
    try {
      if (map) map.setView([9.0820, 8.6753], 6);
    } catch (error) {
      console.warn('Error resetting view:', error);
    }
  };

  if (!map) return null;

  return (
    <div className="absolute top-20 left-4 z-[1000] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <button 
        className="cursor-pointer w-10 h-10 text-gray-700 hover:text-gray-900 hover:bg-blue-50 border-b border-gray-200 flex items-center justify-center text-lg font-bold transition-colors"
        onClick={handleZoomIn}
        title="Zoom in"
      >
        +
      </button>
      <button 
        className="cursor-pointer w-10 h-10 text-gray-700 hover:text-gray-900 hover:bg-blue-50 border-b border-gray-200 flex items-center justify-center text-lg font-bold transition-colors"
        onClick={handleZoomOut}
        title="Zoom out"
      >
        −
      </button>
      <button 
        className="cursor-pointer w-10 h-10 text-gray-700 hover:text-gray-900 hover:bg-blue-50 flex items-center justify-center text-xs font-medium transition-colors"
        onClick={handleZoomToFit}
        title="Reset view"
      >
        <MapPin className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function InteractiveMap({
  projects,
  selectedProject,
  onProjectSelect,
  showCoverage,
  showHeatmap,
  onLoadSampleData,
  onOpenImportModal
}: InteractiveMapProps) {
  const mapRef = useRef<any>(null);
  const [currentTerrain, setCurrentTerrain] = useState('streets');
  
  // Get current tile layer configuration
  const currentTileLayer = Object.values(MAP_TILE_LAYERS).find(
    layer => layer.id === currentTerrain
  ) || MAP_TILE_LAYERS.STREETS;

  // Default center (Nigeria)
  const defaultCenter: [number, number] = [9.0820, 8.6753];
  const defaultZoom = 6;

  const validProjects = projects.filter(project => 
    project && 
    project.lat && 
    project.lng && 
    !isNaN(project.lat) && 
    !isNaN(project.lng) &&
    project.lat >= -90 && 
    project.lat <= 90 &&
    project.lng >= -180 && 
    project.lng <= 180
  );

  return (
    <div className="w-full h-full relative">
      <MapContainer
        ref={mapRef}
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full z-0"
        zoomControl={false}
        attributionControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        {/* FIXED: Dynamic TileLayer that changes based on terrain selection */}
        <TileLayer
          key={currentTerrain} // This forces re-render when terrain changes
          url={currentTileLayer.url}
          attribution={currentTileLayer.attribution}
          maxZoom={currentTileLayer.maxZoom}
          minZoom={2}
        />
        
        {showHeatmap && validProjects.length > 0 && (
          <HeatmapLayer projects={validProjects} show={showHeatmap} />
        )}
        
        {validProjects.map((project) => (
          <ProjectMarker
            key={project.id}
            project={project}
            isSelected={selectedProject?.id === project.id}
            onSelect={onProjectSelect}
            showCoverage={showCoverage}
          />
        ))}

        <CustomZoomControls />
        <MapBounds projects={validProjects} />
      </MapContainer>
      
      <TerrainSelector
        currentTerrain={currentTerrain}
        onTerrainChange={setCurrentTerrain}
      />
      
      {/* Scale bar */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <div className="bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-16 h-1 bg-gray-900 relative">
              <div className="absolute -bottom-2 left-0 text-xs text-gray-600">0</div>
              <div className="absolute -bottom-2 right-0 text-xs text-gray-600">50km</div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {validProjects.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[1000] bg-white bg-opacity-95">
          <div className="text-center max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {projects.length > 0 ? 'Invalid Data Points' : 'No Data Points'}
            </h3>
            
            <p className="text-sm text-gray-600 mb-6">
              {projects.length > 0 
                ? 'All data points have invalid coordinates. Please check your CSV format.'
                : 'Import CSV data or load sample data to get started.'
              }
            </p>

            <div className="flex gap-3 justify-center">
              {onLoadSampleData && (
                <button 
                  onClick={onLoadSampleData}
                  className="cursor-pointer px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors"
                >
                  Load Sample Data
                </button>
              )}
              
              {onOpenImportModal && (
                <button 
                  onClick={onOpenImportModal}
                  className="cursor-pointer px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Import CSV
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}