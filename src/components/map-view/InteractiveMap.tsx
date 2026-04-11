/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, Popup, Tooltip } from 'react-leaflet';
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

function FocalCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const focusedRef = useRef(false);

  useEffect(() => {
    if (map && lat && lng && !focusedRef.current) {
      focusedRef.current = true;
      map.setView([lat, lng], 14, { animate: true });
    }
  }, [map, lat, lng]);

  return null;
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
      default: return '';
    }
  };

  let color = getSectorColor(project.sector);
  if (project.kycStatus === 'VERIFIED') {
    color = '#10b981';
  } else if (project.kycStatus === 'REJECTED') {
    color = '#ef4444';
  }

  const size = isSelected ? 34 : (project.id.startsWith('kyc') ? 20 : 26);
  const iconSize: [number, number] = [size, size];
  const iconAnchor: [number, number] = [size / 2, size / 2];

  const icon = getSectorIcon(project.sector);
  
  const customIcon = new DivIcon({
    html: `
      <div class="relative">
        <div style="
          width: ${size}px;
          height: ${size}px;
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
            width: 10px;
            height: 10px;
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
    iconSize: iconSize,
    iconAnchor: iconAnchor,
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
        <Tooltip direction="top" offset={[0, -10]} opacity={1}>
          <div className="px-1 py-0.5 font-medium text-gray-900 leading-none">
            {project.title}
          </div>
        </Tooltip>
        
        <Popup className="kyc-popup" maxWidth={300}>
          <div className="p-3 min-w-[220px] bg-white rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900 pr-4">{project.title}</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                project.kycStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {project.kycStatus || project.status}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3 text-[10px] text-gray-500">
              <span className="font-medium px-1.5 py-0.5 bg-gray-100 rounded tracking-wider">{project.sector}</span>
              <span>•</span>
              <span className="italic">{project.id.startsWith('kyc') ? 'Address Verification' : 'Geospatial Project'}</span>
            </div>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed line-clamp-2">
              {project.description}
            </p>
            <div className="grid grid-cols-2 gap-3 py-2 border-t border-gray-100">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">Impact</span>
                <span className="text-sm font-bold text-indigo-600">{project.impactScore}%</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">Volume</span>
                <span className="text-sm font-bold text-gray-900">{project.beneficiaries.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Popup>
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

function MapBounds({ projects, hasSelection }: { projects: ProjectLocation[]; hasSelection: boolean }) {
  const map = useMap();
  const lastCountRef = useRef(0);

  useEffect(() => {
    if (!map) return;

    try {
      if (projects.length > 0) {
        if (!hasSelection && projects.length !== lastCountRef.current) {
          lastCountRef.current = projects.length;
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
          }
        }
      } else if (lastCountRef.current !== 0) {
        lastCountRef.current = 0;
        map.setView([9.0820, 8.6753], 6);
      }
    } catch (error) {
      console.warn('Error setting map bounds:', error);
    }
  }, [projects, map, hasSelection]);

  return null;
}

function CustomZoomControls() {
  const map = useMap();

  const handleZoomIn = () => { map?.zoomIn(); };
  const handleZoomOut = () => { map?.zoomOut(); };
  const handleZoomToFit = () => { map?.setView([9.0820, 8.6753], 6); };

  if (!map) return null;

  return (
    <div className="absolute top-20 left-4 z-[1000] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <button className="cursor-pointer w-10 h-10 text-gray-700 hover:text-gray-900 hover:bg-blue-50 border-b border-gray-200 flex items-center justify-center text-lg font-bold transition-colors" onClick={handleZoomIn} title="Zoom in">+</button>
      <button className="cursor-pointer w-10 h-10 text-gray-700 hover:text-gray-900 hover:bg-blue-50 border-b border-gray-200 flex items-center justify-center text-lg font-bold transition-colors" onClick={handleZoomOut} title="Zoom out">−</button>
      <button className="cursor-pointer w-10 h-10 text-gray-700 hover:text-gray-900 hover:bg-blue-50 flex items-center justify-center text-xs font-medium transition-colors" onClick={handleZoomToFit} title="Reset view"><MapPin className="w-4 h-4" /></button>
    </div>
  );
}

export interface InteractiveMapProps {
  projects: ProjectLocation[];
  onProjectSelect: (project: ProjectLocation) => void;
  selectedProject: ProjectLocation | null;
  showCoverage: boolean;
  showHeatmap: boolean;
  basemap?: 'streets' | 'satellite' | 'terrain' | 'light' | 'dark';
  focalPoint?: { lat: number; lng: number };
  onLoadSampleData?: () => void;
  onOpenImportModal?: () => void;
}

export default function InteractiveMap({
  projects,
  onProjectSelect,
  selectedProject,
  showCoverage,
  showHeatmap,
  basemap = 'streets',
  focalPoint,
  onLoadSampleData,
  onOpenImportModal
}: InteractiveMapProps) {
  const mapRef = useRef<any>(null);
  const [currentTerrain, setCurrentTerrain] = useState<'streets' | 'satellite' | 'terrain' | 'light' | 'dark'>(basemap);

  useEffect(() => { setCurrentTerrain(basemap); }, [basemap]);

  const handleTerrainChange = (terrain: string) => {
    setCurrentTerrain(terrain as any);
  };

  const currentTileLayer = Object.values(MAP_TILE_LAYERS).find(
    layer => layer.id === currentTerrain
  ) || MAP_TILE_LAYERS.STREETS;

  const validProjects = projects.filter(project => 
    project && project.lat && project.lng && !isNaN(project.lat) && !isNaN(project.lng) &&
    project.lat >= -90 && project.lat <= 90 && project.lng >= -180 && project.lng <= 180
  );

  return (
    <div className="w-full h-full relative">
      <MapContainer
        ref={mapRef}
        center={[9.0820, 8.6753]}
        zoom={6}
        className="w-full h-full z-0"
        zoomControl={false}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          key={currentTerrain}
          url={currentTileLayer.url}
          attribution={currentTileLayer.attribution}
          maxZoom={currentTileLayer.maxZoom}
          minZoom={2}
        />
        
        {focalPoint && <FocalCenter lat={focalPoint.lat} lng={focalPoint.lng} />}
        
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
        <MapBounds projects={validProjects} hasSelection={!!selectedProject || !!focalPoint} />
      </MapContainer>
      
      <TerrainSelector currentTerrain={currentTerrain} onTerrainChange={handleTerrainChange} />
      
      {validProjects.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[1000] bg-white bg-opacity-95">
          <div className="text-center max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{projects.length > 0 ? 'Invalid Data Points' : 'No Data Points'}</h3>
            <p className="text-sm text-gray-600 mb-6">{projects.length > 0 ? 'Invalid coordinates detected.' : 'Import CSV or load sample data.'}</p>
            <div className="flex gap-3 justify-center">
              {onLoadSampleData && <button onClick={onLoadSampleData} className="cursor-pointer px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors">Load Sample Data</button>}
              {onOpenImportModal && <button onClick={onOpenImportModal} className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors">Import CSV</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}