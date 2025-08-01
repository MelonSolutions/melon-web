/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { LatLngBounds, Icon, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ProjectLocation } from '@/types/geospatial';
import { 
  MapPin,
  Activity,
  Eye,
  Users,
  TrendingUp
} from 'lucide-react';

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
}

// Enhanced Heatmap component with comprehensive error handling
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
        
        // Create heatmap based on beneficiaries and impact
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
        <Popup className="custom-popup" maxWidth={320}>
          <div className="p-0 min-w-[300px]">
            {/* Header */}
            <div className={`p-4 text-white rounded-t-lg`} style={{ backgroundColor: color }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg leading-tight mb-1">{project.title}</h3>
                  <div className="flex items-center space-x-2 text-sm opacity-90">
                    <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                      {project.sector}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'active' ? 'bg-green-500' :
                      project.status === 'completed' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="text-2xl ml-2">{icon}</div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{project.description}</p>
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-lg font-bold text-blue-600">{project.impactScore}%</div>
                  <div className="text-xs text-gray-500">Impact Score</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-lg font-bold text-green-600">{project.beneficiaries.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Beneficiaries</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Activity className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-lg font-bold text-purple-600">{project.activeAgents}</div>
                  <div className="text-xs text-gray-500">Active Agents</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <MapPin className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-lg font-bold text-orange-600">{project.coverage}</div>
                  <div className="text-xs text-gray-500">km² Coverage</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-gray-900">{project.impactScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${project.impactScore}%`,
                      backgroundColor: color
                    }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(project);
                }}
                className="w-full py-2 px-4 rounded-lg font-medium text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: color }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </div>
              </button>
            </div>
          </div>
        </Popup>
      </Marker>
      
      {/* Enhanced Coverage Circle */}
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

// Component to fit map bounds to projects with robust error handling
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
          // Add padding and ensure minimum zoom level
          map.fitBounds(bounds, { 
            padding: [50, 50],
            maxZoom: 10 
          });
        } else {
          // Default to Nigeria if no valid projects
          map.setView([9.0820, 8.6753], 6);
        }
      } else {
        // Default to Nigeria if no projects
        map.setView([9.0820, 8.6753], 6);
      }
    } catch (error) {
      console.warn('Error setting map bounds:', error);
      // Fallback to default view
      try {
        map.setView([9.0820, 8.6753], 6);
      } catch (fallbackError) {
        console.error('Error setting fallback map view:', fallbackError);
      }
    }
  }, [projects, map]);

  return null;
}

// Enhanced zoom controls with error handling
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
        className="w-10 h-10 text-gray-700 hover:text-gray-900 hover:bg-blue-50 border-b border-gray-200 flex items-center justify-center text-lg font-bold transition-colors"
        onClick={handleZoomIn}
        title="Zoom in"
      >
        +
      </button>
      <button 
        className="w-10 h-10 text-gray-700 hover:text-gray-900 hover:bg-blue-50 border-b border-gray-200 flex items-center justify-center text-lg font-bold transition-colors"
        onClick={handleZoomOut}
        title="Zoom out"
      >
        −
      </button>
      <button 
        className="w-10 h-10 text-gray-700 hover:text-gray-900 hover:bg-blue-50 flex items-center justify-center text-xs font-medium transition-colors"
        onClick={handleZoomToFit}
        title="Reset view"
      >
        ⌂
      </button>
    </div>
  );
}

// Main Interactive Map Component
export default function InteractiveMap({
  projects,
  selectedProject,
  onProjectSelect,
  showCoverage,
  showHeatmap
}: InteractiveMapProps) {
  const mapRef = useRef<any>(null);

  // Default center (Nigeria)
  const defaultCenter: [number, number] = [9.0820, 8.6753];
  const defaultZoom = 6;

  // Filter out invalid projects
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
        // whenCreated={(map) => {
        //   // Map is fully initialized
        //   console.log('Map initialized successfully');
        // }}
      >
        {/* Enhanced tile layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={18}
          minZoom={2}
        />
        
        {/* Heatmap Layer - only render if we have valid projects */}
        {showHeatmap && validProjects.length > 0 && (
          <HeatmapLayer projects={validProjects} show={showHeatmap} />
        )}
        
        {/* Project Markers - only render valid projects */}
        {validProjects.map((project) => (
          <ProjectMarker
            key={project.id}
            project={project}
            isSelected={selectedProject?.id === project.id}
            onSelect={onProjectSelect}
            showCoverage={showCoverage}
          />
        ))}

        {/* Custom zoom controls */}
        <CustomZoomControls />

        {/* Map bounds - use valid projects */}
        <MapBounds projects={validProjects} />
      </MapContainer>
      
      {/* Enhanced Map Stats */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 text-sm">Project Overview</h4>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {validProjects.length} total
            </span>
          </div>
          
          <div className="space-y-2.5">
            {/* Sector breakdown */}
            {[
              { sector: 'Health', color: '#dc2626', icon: '🏥' },
              { sector: 'Education', color: '#7c3aed', icon: '🎓' },
              { sector: 'Agriculture', color: '#059669', icon: '🌾' },
              { sector: 'Energy', color: '#d97706', icon: '⚡' },
              { sector: 'Finance', color: '#0891b2', icon: '💰' },
              { sector: 'Infrastructure', color: '#4338ca', icon: '🏗️' }
            ].map(({ sector, color, icon }) => {
              const count = validProjects.filter(p => p.sector === sector).length;
              if (count === 0) return null;
              
              return (
                <div key={sector} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{icon}</span>
                    <div 
                      className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm text-gray-700 font-medium">{sector}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-semibold">{count}</span>
                </div>
              );
            }).filter(Boolean)}
          </div>
          
          {/* Status indicators */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-gray-600">Active: {validProjects.filter(p => p.status === 'active').length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span className="text-gray-600">Completed: {validProjects.filter(p => p.status === 'completed').length}</span>
              </div>
            </div>
          </div>

          {/* Coverage indicator */}
          {showCoverage && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 border border-gray-400 rounded-full" style={{ borderStyle: 'dashed' }} />
                <span className="text-xs text-gray-600">Coverage Areas Visible</span>
              </div>
            </div>
          )}

          {/* Heatmap indicator */}
          {showHeatmap && (
            <div className="mt-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-60" />
                <span className="text-xs text-gray-600">Impact Heatmap Active</span>
              </div>
            </div>
          )}

          {/* Data quality indicator */}
          {projects.length !== validProjects.length && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                <span className="text-xs text-gray-600">
                  {projects.length - validProjects.length} invalid coordinates filtered
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

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

      {/* Empty state */}
      {validProjects.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[1000] bg-white bg-opacity-90">
          <div className="text-center p-8">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {projects.length > 0 ? 'No Valid Data Points' : 'No Data Points'}
            </h3>
            <p className="text-gray-500 mb-4">
              {projects.length > 0 
                ? 'All data points have invalid coordinates. Please check your CSV format.'
                : 'Import CSV data or load sample data to get started'
              }
            </p>
            <div className="space-x-3">
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('load-sample-data'))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Load Sample Data
              </button>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-import-modal'))}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Import CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}