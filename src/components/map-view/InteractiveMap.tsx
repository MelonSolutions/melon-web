/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { LatLngBounds, Icon, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ProjectLocation } from '@/types/geospatial';
import { 
  Heart, 
  GraduationCap, 
  Wheat, 
  Zap, 
  DollarSign, 
  Building2,
  MapPin,
  Activity
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

// Heatmap component
function HeatmapLayer({ projects, show }: { projects: ProjectLocation[]; show: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!show) return;

    // Create intensity points based on project impact
    const heatPoints = projects.map(project => ({
      lat: project.lat,
      lng: project.lng,
      intensity: project.impactScore / 100,
      beneficiaries: project.beneficiaries
    }));

    // Create canvas overlay for heatmap effect
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bounds = map.getBounds();
    const size = map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '400';

    // Draw heatmap points
    heatPoints.forEach(point => {
      const pixelPoint = map.latLngToContainerPoint([point.lat, point.lng]);
      const gradient = ctx.createRadialGradient(
        pixelPoint.x, pixelPoint.y, 0,
        pixelPoint.x, pixelPoint.y, 50
      );
      
      const alpha = point.intensity * 0.6;
      gradient.addColorStop(0, `rgba(255, 69, 0, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(255, 165, 0, ${alpha * 0.5})`);
      gradient.addColorStop(1, 'rgba(255, 165, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pixelPoint.x, pixelPoint.y, 50, 0, Math.PI * 2);
      ctx.fill();
    });

    const mapContainer = map.getContainer();
    mapContainer.appendChild(canvas);

    return () => {
      if (mapContainer.contains(canvas)) {
        mapContainer.removeChild(canvas);
      }
    };
  }, [map, projects, show]);

  return null;
}

// Professional marker component
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
      case 'Agriculture': return '#ea580c';
      case 'Energy': return '#ca8a04';
      case 'Finance': return '#059669';
      case 'Infrastructure': return '#0284c7';
      default: return '#374151';
    }
  };

  const getSectorIcon = (sector: string) => {
    switch (sector) {
      case 'Health': return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';
      case 'Education': return 'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z';
      case 'Agriculture': return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';
      case 'Energy': return 'M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z';
      case 'Finance': return 'M7 15h2c0 1.08 1.37 2 3 2s3-.92 3-2c0-1.1-1.04-1.5-3.24-2.03C9.64 12.44 7 11.78 7 9c0-1.79 1.47-3.31 3.5-3.82V3h3v2.18C15.53 5.69 17 7.21 17 9h-2c0-1.08-1.37-2-3-2s-3 .92-3 2c0 1.1 1.04 1.5 3.24 2.03C14.36 11.56 17 12.22 17 15c0 1.79-1.47 3.31-3.5 3.82V21h-3v-2.18C8.47 18.31 7 16.79 7 15z';
      default: return 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z';
    }
  };

  const color = getSectorColor(project.sector);
  const iconPath = getSectorIcon(project.sector);
  
  const customIcon = new DivIcon({
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ${isSelected ? 'transform: scale(1.3); border-width: 3px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);' : ''}
        transition: all 0.2s ease;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="${iconPath}"/>
        </svg>
      </div>
    `,
    className: 'professional-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
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
        <Popup className="professional-popup">
          <div className="p-3 min-w-[250px]">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-base leading-tight">{project.title}</h3>
              <span 
                className="px-2 py-1 text-xs font-medium rounded-full ml-2"
                style={{ 
                  backgroundColor: `${color}15`,
                  color: color
                }}
              >
                {project.sector}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
            
            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Impact Score</div>
                  <div className="font-semibold text-gray-900">{project.impactScore}%</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Beneficiaries</div>
                  <div className="font-semibold text-gray-900">{project.beneficiaries.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                project.status === 'active' ? 'bg-green-100 text-green-700' :
                project.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                project.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                <div className="w-1.5 h-1.5 rounded-full bg-current mr-1"></div>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(project);
                }}
                className="px-3 py-1 bg-gray-900 text-white text-xs rounded-md hover:bg-gray-800 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        </Popup>
      </Marker>
      
      {/* Coverage Circle */}
      {showCoverage && (
        <Circle
          center={[project.lat, project.lng]}
          radius={project.coverage * 1000}
          pathOptions={{
            color: color,
            fillColor: color,
            fillOpacity: 0.08,
            weight: 1.5,
            opacity: 0.4,
            dashArray: '5, 5'
          }}
        />
      )}
    </>
  );
}

// Component to fit map bounds to projects
function MapBounds({ projects }: { projects: ProjectLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (projects.length > 0) {
      const bounds = new LatLngBounds(
        projects.map(project => [project.lat, project.lng])
      );
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [projects, map]);

  return null;
}

// Custom zoom controls component
function ZoomControls({ mapRef }: { mapRef: React.RefObject<any> }) {
  const handleZoomIn = () => {
    const map = mapRef.current;
    if (map) {
      map.zoomIn();
    }
  };

  const handleZoomOut = () => {
    const map = mapRef.current;
    if (map) {
      map.zoomOut();
    }
  };

  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <button 
        className="block w-10 h-10 text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-b border-gray-200 items-center justify-center text-lg font-semibold transition-colors"
        onClick={handleZoomIn}
        title="Zoom in"
      >
        +
      </button>
      <button 
        className="block w-10 h-10 text-gray-700 hover:text-gray-900 hover:bg-gray-50 items-center justify-center text-lg font-semibold transition-colors"
        onClick={handleZoomOut}
        title="Zoom out"
      >
        −
      </button>
    </div>
  );
}

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

  return (
    <div className="w-full h-full relative">
      <MapContainer
        ref={mapRef}
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full professional-map"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Heatmap Layer */}
        {showHeatmap && <HeatmapLayer projects={projects} show={showHeatmap} />}
        
        {/* Project Markers */}
        {projects.map((project) => (
          <ProjectMarker
            key={project.id}
            project={project}
            isSelected={selectedProject?.id === project.id}
            onSelect={onProjectSelect}
            showCoverage={showCoverage}
          />
        ))}

        <MapBounds projects={projects} />
      </MapContainer>
      
      {/* Custom zoom controls */}
      <ZoomControls mapRef={mapRef} />
      
      {/* Professional Legend */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-xs">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm">Project Categories</h4>
          <div className="space-y-2.5">
            {[
              { sector: 'Health', color: '#dc2626', count: projects.filter(p => p.sector === 'Health').length },
              { sector: 'Energy', color: '#ca8a04', count: projects.filter(p => p.sector === 'Energy').length },
              { sector: 'Finance', color: '#059669', count: projects.filter(p => p.sector === 'Finance').length },
              { sector: 'Education', color: '#7c3aed', count: projects.filter(p => p.sector === 'Education').length }
            ].filter(item => item.count > 0).map(({ sector, color, count }) => (
              <div key={sector} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-sm text-gray-700">{sector}</span>
                </div>
                <span className="text-xs text-gray-500 font-medium">{count}</span>
              </div>
            ))}
          </div>
          
          {/* Scale */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Scale</span>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-0.5 bg-gray-900"></div>
                <span className="text-xs text-gray-600 font-medium">50 km</span>
              </div>
            </div>
          </div>

          {/* Coverage indicator */}
          {showCoverage && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 border border-gray-400 rounded-full" style={{ borderStyle: 'dashed' }}></div>
                <span className="text-xs text-gray-600">Coverage Areas</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-1 right-1 z-[1000] text-xs text-gray-500 bg-white bg-opacity-75 px-2 py-1 rounded">
        © OpenStreetMap contributors
      </div>
    </div>
  );
}