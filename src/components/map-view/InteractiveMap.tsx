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
  const isKYC = !!project.kycStatus;

  const getKYCStatusColor = (status?: string) => {
    switch (status) {
      case 'VERIFIED': return '#10b981';
      case 'REJECTED': return '#ef4444';
      case 'PENDING': return '#f59e0b';
      case 'IN_REVIEW': return '#3b82f6';
      case 'ASSIGNED': return '#8b5cf6';
      case 'VERIFICATION_SUBMITTED': return '#f97316';
      default: return '#6b7280';
    }
  };

  const getKYCStatusBadgeClasses = (status?: string) => {
    switch (status) {
      case 'VERIFIED': return 'background:#dcfce7;color:#15803d;';
      case 'REJECTED': return 'background:#fee2e2;color:#b91c1c;';
      case 'PENDING': return 'background:#fef3c7;color:#92400e;';
      case 'IN_REVIEW': return 'background:#dbeafe;color:#1d4ed8;';
      case 'ASSIGNED': return 'background:#ede9fe;color:#6d28d9;';
      case 'VERIFICATION_SUBMITTED': return 'background:#ffedd5;color:#c2410c;';
      default: return 'background:#f3f4f6;color:#374151;';
    }
  };

  const getKYCStatusLabel = (status?: string) => {
    switch (status) {
      case 'VERIFICATION_SUBMITTED': return 'PENDING APPROVAL';
      case 'IN_REVIEW': return 'IN REVIEW';
      default: return status || 'UNKNOWN';
    }
  };

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

  const color = isKYC ? getKYCStatusColor(project.kycStatus) : getSectorColor(project.sector);
  const isPending = project.kycStatus === 'PENDING' || project.kycStatus === 'ASSIGNED';
  const size = isSelected ? 34 : (isKYC ? 22 : 26);
  const iconSize: [number, number] = [size, size];
  const iconAnchor: [number, number] = [size / 2, size / 2];

  // Build address string
  const addressParts = [
    project.streetNumber,
    project.streetName,
  ].filter(Boolean).join(' ');

  const locationParts = [
    project.city,
    project.lga ? `${project.lga} LGA` : null,
    project.state,
  ].filter(Boolean).join(', ');

  const fullAddress = [addressParts, locationParts].filter(Boolean).join(', ');

  // Format dates
  const formatDate = (d?: string) => {
    if (!d) return null;
    try { return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return null; }
  };

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
        "></div>
        ${isPending ? `
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            width: ${size + 12}px;
            height: ${size + 12}px;
            margin-top: -${(size + 12) / 2}px;
            margin-left: -${(size + 12) / 2}px;
            border: 2px solid ${color};
            border-radius: 50%;
            animation: kycPulse 2s infinite;
            opacity: 0.6;
          "></div>
        ` : ''}
      </div>
      <style>
        @keyframes kycPulse {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
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
        
        <Popup className="kyc-popup" maxWidth={340} minWidth={280}>
          {isKYC ? (
            /* ── Rich KYC Popup ── */
            <div className="p-0 min-w-[260px] bg-white rounded-lg overflow-hidden" style={{ margin: '-14px -20px -14px -20px' }}>
              {/* Header with status accent bar */}
              <div style={{ borderTop: `3px solid ${color}` }} className="px-4 pt-3 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{project.title}</h3>
                  <span
                    className="flex-shrink-0 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                    style={{ ...Object.fromEntries(getKYCStatusBadgeClasses(project.kycStatus).split(';').filter(Boolean).map(s => { const [k,v] = s.split(':'); return [k.trim(), v.trim()]; })) }}
                  >
                    {getKYCStatusLabel(project.kycStatus)}
                  </span>
                </div>
                {project.loanId && (
                  <div className="text-[10px] text-gray-400 mt-0.5 font-mono">ID: {project.loanId}</div>
                )}
              </div>

              {/* Address Section */}
              {fullAddress && (
                <div className="px-4 py-2 border-t border-gray-100">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">Address</div>
                  <p className="text-xs text-gray-700 leading-relaxed">{fullAddress}</p>
                </div>
              )}

              {/* Landmark Callout */}
              {project.landmark && (
                <div className="mx-4 mb-2 px-3 py-2 rounded-md" style={{ background: '#fefce8', border: '1px solid #fef08a' }}>
                  <div className="flex items-start gap-1.5">
                    <span className="text-sm flex-shrink-0">📍</span>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: '#a16207' }}>Landmark</div>
                      <p className="text-xs font-medium" style={{ color: '#854d0e' }}>{project.landmark}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Verification Details (Verified) */}
              {project.kycStatus === 'VERIFIED' && (project.verifiedAddress || project.agentNotes) && (
                <div className="px-4 py-2 border-t border-gray-100" style={{ background: '#f0fdf4' }}>
                  <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: '#15803d' }}>Verification Details</div>
                  {project.verifiedAddress && (
                    <p className="text-xs text-gray-700 mb-1">
                      <span className="font-medium text-gray-500">Verified Address:</span> {project.verifiedAddress}
                    </p>
                  )}
                  {project.agentNotes && (
                    <p className="text-xs text-gray-600 italic">&ldquo;{project.agentNotes}&rdquo;</p>
                  )}
                </div>
              )}

              {/* Rejection Details */}
              {project.kycStatus === 'REJECTED' && (project.rejectionReason || project.rejectionNote) && (
                <div className="px-4 py-2 border-t border-gray-100" style={{ background: '#fef2f2' }}>
                  <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: '#b91c1c' }}>Rejection Details</div>
                  {project.rejectionReason && (
                    <p className="text-xs text-gray-700 mb-1">
                      <span className="font-medium text-gray-500">Reason:</span> {project.rejectionReason.replace(/_/g, ' ')}
                    </p>
                  )}
                  {project.rejectionNote && (
                    <p className="text-xs text-gray-600 italic">&ldquo;{project.rejectionNote}&rdquo;</p>
                  )}
                </div>
              )}

              {/* Dates & Contact */}
              <div className="px-4 py-2 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-2">
                  {formatDate(project.submittedAt) && (
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Submitted</div>
                      <div className="text-[11px] font-medium text-gray-700">{formatDate(project.submittedAt)}</div>
                    </div>
                  )}
                  {formatDate(project.verifiedAt) && (
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                        {project.kycStatus === 'REJECTED' ? 'Rejected' : 'Verified'}
                      </div>
                      <div className="text-[11px] font-medium text-gray-700">{formatDate(project.verifiedAt)}</div>
                    </div>
                  )}
                </div>
                {project.phone && (
                  <div className="mt-1.5">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Phone</div>
                    <div className="text-[11px] font-medium text-gray-700">{project.phone}</div>
                  </div>
                )}
              </div>

              {/* Quick Action Footer */}
              <div className="px-4 py-2.5 border-t border-gray-100" style={{ background: '#f9fafb' }}>
                <a
                  href={`/kyc/${project.id}`}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold rounded-md py-1.5 px-3 transition-colors"
                  style={{ color: '#4f46e5', background: '#eef2ff', border: '1px solid #c7d2fe' }}
                >
                  View Full Details →
                </a>
              </div>
            </div>
          ) : (
            /* ── Original Popup for non-KYC points ── */
            <div className="p-3 min-w-[220px] bg-white rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 pr-4">{project.title}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {project.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3 text-[10px] text-gray-500">
                <span className="font-medium px-1.5 py-0.5 bg-gray-100 rounded tracking-wider">{project.sector}</span>
                <span>•</span>
                <span className="italic">Geospatial Project</span>
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
          )}
        </Popup>
      </Marker>
      
      {/* Landmark Marker (Only visible when selected) */}
      {isSelected && isKYC && project.landmark && (
        <Marker
          position={[project.lat + 0.0003, project.lng + 0.0003]} // Slight offset to appear nearby
          interactive={false}
          icon={new DivIcon({
            html: `
              <div style="
                background: #fefce8;
                border: 2px solid #eab308;
                color: #713f12;
                padding: 6px 10px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 800;
                white-space: nowrap;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                width: max-content;
                transform: translate(12px, -20px);
                display: inline-flex;
                align-items: center;
                gap: 4px;
              ">
                <span style="font-size: 15px;">📍</span> 
                <span>${project.landmark}</span>
              </div>
            `,
            className: 'landmark-marker-label',
          })}
        />
      )}

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