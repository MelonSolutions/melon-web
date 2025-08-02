/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Marker, useMap, Popup, Circle } from 'react-leaflet';
import { DivIcon, LatLng, LatLngBounds } from 'leaflet';
import { ProjectLocation } from '@/types/geospatial';

// Simple clustering algorithm without external dependencies
interface ClusterPoint {
  lat: number;
  lng: number;
  projects: ProjectLocation[];
  id: string;
}

// Custom clustering logic
function createClusters(projects: ProjectLocation[], radius: number = 60): (ClusterPoint | ProjectLocation)[] {
  if (projects.length === 0) return [];
  
  const clusters: ClusterPoint[] = [];
  const processed = new Set<string>();
  
  projects.forEach((project, index) => {
    if (processed.has(project.id)) return;
    
    const cluster: ClusterPoint = {
      lat: project.lat,
      lng: project.lng,
      projects: [project],
      id: `cluster-${index}`
    };
    
    processed.add(project.id);
    
    // Find nearby projects to cluster
    projects.forEach(otherProject => {
      if (processed.has(otherProject.id)) return;
      
      const distance = getDistance(project.lat, project.lng, otherProject.lat, otherProject.lng);
      if (distance < radius) {
        cluster.projects.push(otherProject);
        processed.add(otherProject.id);
        
        // Update cluster center (average position)
        const totalLat = cluster.projects.reduce((sum, p) => sum + p.lat, 0);
        const totalLng = cluster.projects.reduce((sum, p) => sum + p.lng, 0);
        cluster.lat = totalLat / cluster.projects.length;
        cluster.lng = totalLng / cluster.projects.length;
      }
    });
    
    clusters.push(cluster);
  });
  
  // Return individual projects if they're alone in a cluster, otherwise return cluster
  return clusters.map(cluster => 
    cluster.projects.length === 1 ? cluster.projects[0] : cluster
  );
}

// Distance calculation helper
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

interface SmartClusterProps {
  projects: ProjectLocation[];
  selectedProject: ProjectLocation | null;
  onProjectSelect: (project: ProjectLocation) => void;
  showCoverage: boolean;
  clusterRadius?: number;
  maxClusterRadius?: number;
}

export function SmartClusterGroup({ 
  projects, 
  selectedProject, 
  onProjectSelect, 
  showCoverage,
  clusterRadius = 60
}: SmartClusterProps) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  
  // Update zoom level when map changes
  useEffect(() => {
    const handleZoomEnd = () => {
      setZoom(map.getZoom());
    };
    
    map.on('zoomend', handleZoomEnd);
    return () => {
      map.off('zoomend', handleZoomEnd);
    };
  }, [map]);

  // Adjust cluster radius based on zoom level
  const adjustedRadius = useMemo(() => {
    const baseRadius = clusterRadius;
    const zoomFactor = Math.max(0.3, 1 - (zoom - 6) * 0.1);
    return baseRadius * zoomFactor;
  }, [clusterRadius, zoom]);

  // Create clusters based on current zoom
  const clusteredData = useMemo(() => {
    if (zoom >= 14) {
      // At high zoom levels, show individual markers
      return projects;
    }
    return createClusters(projects, adjustedRadius);
  }, [projects, adjustedRadius, zoom]);

  const createClusterIcon = (cluster: ClusterPoint) => {
    const count = cluster.projects.length;
    const dominantSector = getDominantSector(cluster.projects);
    const color = getSectorColor(dominantSector);
    const size = Math.min(60, Math.max(40, 30 + count * 2));
    
    return new DivIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: 4px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          font-weight: bold;
          color: white;
          font-size: ${count < 100 ? '14px' : '12px'};
          position: relative;
          cursor: pointer;
          transition: all 0.2s ease;
        ">
          ${count}
          <div style="
            position: absolute;
            bottom: -3px;
            right: -3px;
            width: 16px;
            height: 16px;
            background: linear-gradient(135deg, ${color}, ${color}aa);
            border: 2px solid white;
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>
      `,
      className: 'custom-cluster-icon',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  const handleClusterClick = (cluster: ClusterPoint) => {
    if (cluster.projects.length === 1) {
      onProjectSelect(cluster.projects[0]);
    } else {
      // Zoom to cluster bounds
      const points = cluster.projects.map(p => new LatLng(p.lat, p.lng));
      const bounds = new LatLngBounds(points);
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 15 });
    }
  };

  return (
    <>
      {clusteredData.map((item) => {
        const isCluster = 'projects' in item;
        
        if (isCluster) {
          const cluster = item as ClusterPoint;
          return (
            <Marker
              key={cluster.id}
              position={[cluster.lat, cluster.lng]}
              icon={createClusterIcon(cluster)}
              eventHandlers={{
                click: () => handleClusterClick(cluster),
              }}
            >
              <Popup>
                <ClusterPopupContent 
                  cluster={cluster} 
                  onProjectSelect={onProjectSelect}
                />
              </Popup>
            </Marker>
          );
        } else {
          const project = item as ProjectLocation;
          return (
            <Marker
              key={project.id}
              position={[project.lat, project.lng]}
              icon={createProjectIcon(project, selectedProject?.id === project.id)}
              eventHandlers={{
                click: () => onProjectSelect(project),
              }}
            >
              <Popup>
                <ProjectPopupContent project={project} onSelect={onProjectSelect} />
              </Popup>
              
              {/* Coverage circle for individual markers */}
              {showCoverage && (
                <Circle
                  center={[project.lat, project.lng]}
                  radius={project.coverage * 1000}
                  pathOptions={{
                    color: getSectorColor(project.sector),
                    fillColor: getSectorColor(project.sector),
                    fillOpacity: selectedProject?.id === project.id ? 0.15 : 0.08,
                    weight: selectedProject?.id === project.id ? 2.5 : 1.5,
                    opacity: selectedProject?.id === project.id ? 0.7 : 0.4,
                  }}
                />
              )}
            </Marker>
          );
        }
      })}
    </>
  );
}

// Enhanced Heatmap Component (unchanged, working version)
interface DensityHeatmapProps {
  projects: ProjectLocation[];
  show: boolean;
  metric?: 'beneficiaries' | 'impactScore' | 'coverage';
  radius?: number;
  blur?: number;
}

export function DensityHeatmap({ 
  projects, 
  show, 
  metric = 'beneficiaries',
  radius = 25,
}: DensityHeatmapProps) {
  const map = useMap();

  useEffect(() => {
    if (!show || projects.length === 0 || !map) return;

    // Clean up existing heatmap layers
    map.eachLayer((layer: any) => {
      if (layer.options && layer.options.className === 'density-heatmap') {
        map.removeLayer(layer);
      }
    });

    try {
      const heatmapData = projects.map(project => {
        let intensity: number;
        
        switch (metric) {
          case 'beneficiaries':
            intensity = Math.min(1, project.beneficiaries / 50000);
            break;
          case 'impactScore':
            intensity = project.impactScore / 100;
            break;
          case 'coverage':
            intensity = Math.min(1, project.coverage / 100);
            break;
          default:
            intensity = 0.5;
        }

        return [project.lat, project.lng, intensity];
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const mapContainer = map.getContainer();
      const size = map.getSize();
      
      canvas.width = size.x;
      canvas.height = size.y;
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '400';
      canvas.style.opacity = '0.6';
      canvas.className = 'density-heatmap';

      const drawAdvancedHeatmap = () => {
        if (!ctx || !canvas) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Create color gradient
        const gradientCanvas = document.createElement('canvas');
        const gradientCtx = gradientCanvas.getContext('2d');
        gradientCanvas.width = 256;
        gradientCanvas.height = 1;
        
        if (gradientCtx) {
          const gradient = gradientCtx.createLinearGradient(0, 0, 256, 0);
          gradient.addColorStop(0, 'rgba(0, 0, 255, 0)');
          gradient.addColorStop(0.2, 'rgba(0, 0, 255, 0.5)');
          gradient.addColorStop(0.4, 'rgba(0, 255, 255, 0.7)');
          gradient.addColorStop(0.6, 'rgba(0, 255, 0, 0.8)');
          gradient.addColorStop(0.8, 'rgba(255, 255, 0, 0.9)');
          gradient.addColorStop(1, 'rgba(255, 0, 0, 1)');
          
          gradientCtx.fillStyle = gradient;
          gradientCtx.fillRect(0, 0, 256, 1);
        }

        // Draw intensity circles
        heatmapData.forEach(([lat, lng, intensity]) => {
          const point = map.latLngToContainerPoint([lat as number, lng as number]);
          const adjustedRadius = radius * (0.5 + intensity * 0.5);
          
          const grad = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, adjustedRadius
          );
          
          const alpha = intensity * 0.8;
          grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
          grad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.3})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(point.x, point.y, adjustedRadius, 0, Math.PI * 2);
          ctx.fill();
        });

        // Apply colorization
        if (gradientCtx) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const gradientData = gradientCtx.getImageData(0, 0, 256, 1).data;
          
          for (let i = 0; i < data.length; i += 4) {
            const alpha = data[i + 3];
            if (alpha > 0) {
              const colorIndex = Math.min(255, Math.floor(alpha));
              data[i] = gradientData[colorIndex * 4];
              data[i + 1] = gradientData[colorIndex * 4 + 1];
              data[i + 2] = gradientData[colorIndex * 4 + 2];
              data[i + 3] = alpha * 0.8;
            }
          }
          
          ctx.putImageData(imageData, 0, 0);
        }
      };

      drawAdvancedHeatmap();
      mapContainer.appendChild(canvas);

      const updateHeatmap = () => {
        const newSize = map.getSize();
        canvas.width = newSize.x;
        canvas.height = newSize.y;
        drawAdvancedHeatmap();
      };

      map.on('zoom', updateHeatmap);
      map.on('move', updateHeatmap);

      return () => {
        map.off('zoom', updateHeatmap);
        map.off('move', updateHeatmap);
        if (canvas && mapContainer && mapContainer.contains(canvas)) {
          mapContainer.removeChild(canvas);
        }
      };
    } catch (error) {
      console.warn('Error creating density heatmap:', error);
    }
  }, [map, projects, show, metric, radius]);

  return null;
}

// Helper functions
function getDominantSector(projects: ProjectLocation[]): string {
  const sectorCounts: { [key: string]: number } = {};
  projects.forEach(project => {
    sectorCounts[project.sector] = (sectorCounts[project.sector] || 0) + 1;
  });
  
  return Object.entries(sectorCounts).reduce((a, b) => 
    sectorCounts[a[0]] > sectorCounts[b[0]] ? a : b
  )[0];
}

function getSectorColor(sector: string): string {
  switch (sector) {
    case 'Health': return '#dc2626';
    case 'Education': return '#7c3aed';
    case 'Agriculture': return '#059669';
    case 'Energy': return '#d97706';
    case 'Finance': return '#0891b2';
    case 'Infrastructure': return '#4338ca';
    default: return '#374151';
  }
}

function getSectorIcon(sector: string): string {
  switch (sector) {
    case 'Health': return '🏥';
    case 'Education': return '🎓';
    case 'Agriculture': return '🌾';
    case 'Energy': return '⚡';
    case 'Finance': return '💰';
    case 'Infrastructure': return '🏗️';
    default: return '📍';
  }
}

function createProjectIcon(project: ProjectLocation, isSelected: boolean) {
  const color = getSectorColor(project.sector);
  const icon = getSectorIcon(project.sector);
  const size = isSelected ? 44 : 36;
  
  return new DivIcon({
    html: `
      <div class="project-marker ${isSelected ? 'selected' : ''}" style="
        width: ${size}px;
        height: ${size}px;
        position: relative;
        cursor: pointer;
        z-index: ${isSelected ? '1000' : '500'};
      ">
        <div style="
          width: 100%;
          height: 100%;
          background: ${color};
          border: ${isSelected ? '4px' : '3px'} solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 ${isSelected ? '6px 20px' : '3px 12px'} rgba(0,0,0,${isSelected ? '0.4' : '0.3'});
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
        ">
          <span style="font-size: ${isSelected ? '20px' : '16px'}; line-height: 1;">${icon}</span>
        </div>
        
        ${project.status === 'active' ? `
          <div style="
            position: absolute;
            top: -3px;
            right: -3px;
            width: 14px;
            height: 14px;
            background: #10b981;
            border: 3px solid white;
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
        ` : ''}
        
        ${isSelected ? `
          <div style="
            position: absolute;
            inset: -8px;
            border: 2px solid ${color};
            border-radius: 50%;
            opacity: 0.3;
            animation: ripple 2s infinite;
          "></div>
        ` : ''}
      </div>
      
      <style>
        .project-marker:hover div:first-child {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0,0,0,0.4);
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
        
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      </style>
    `,
    className: 'custom-project-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Cluster popup component
function ClusterPopupContent({ 
  cluster, 
  onProjectSelect 
}: { 
  cluster: ClusterPoint; 
  onProjectSelect: (project: ProjectLocation) => void; 
}) {
  const dominantSector = getDominantSector(cluster.projects);
  const totalBeneficiaries = cluster.projects.reduce((sum, p) => sum + p.beneficiaries, 0);
  const avgImpactScore = Math.round(
    cluster.projects.reduce((sum, p) => sum + p.impactScore, 0) / cluster.projects.length
  );

  return (
    <div className="p-3 min-w-[280px] max-w-[320px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">{getSectorIcon(dominantSector)}</div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">
              {cluster.projects.length} Projects
            </h4>
            <p className="text-xs text-gray-500">Clustered in this area</p>
          </div>
        </div>
      </div>

      {/* Cluster Metrics */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-sm font-bold text-[#5B94E5]">{avgImpactScore}</div>
          <div className="text-xs text-gray-600">Avg Impact</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-sm font-bold text-green-600">
            {totalBeneficiaries > 1000 
              ? `${(totalBeneficiaries / 1000).toFixed(1)}k` 
              : totalBeneficiaries}
          </div>
          <div className="text-xs text-gray-600">Total Beneficiaries</div>
        </div>
      </div>

      {/* Project List */}
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {cluster.projects.slice(0, 5).map(project => (
          <div 
            key={project.id}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={() => onProjectSelect(project)}
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900 truncate">
                {project.title}
              </div>
              <div className="text-xs text-gray-500">{project.sector}</div>
            </div>
            <div className="text-xs font-medium text-[#5B94E5]">
              {project.impactScore}
            </div>
          </div>
        ))}
        {cluster.projects.length > 5 && (
          <div className="text-xs text-gray-500 text-center py-1">
            +{cluster.projects.length - 5} more projects
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-200">
        <button 
          className="w-full bg-[#5B94E5] text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-[#4A7BC8] transition-colors"
          onClick={() => {
            // You can implement zoom to cluster bounds here
            console.log('Zoom to cluster bounds');
          }}
        >
          View All Projects
        </button>
      </div>
    </div>
  );
}

// Individual project popup (same as before)
function ProjectPopupContent({ 
  project, 
  onSelect 
}: { 
  project: ProjectLocation; 
  onSelect: (project: ProjectLocation) => void; 
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-3 min-w-[250px] max-w-[300px]">
      <div className="flex items-start space-x-3 mb-3">
        <div className="text-2xl">{getSectorIcon(project.sector)}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
            {project.title}
          </h4>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
            <span className="text-xs text-gray-500">{project.sector}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {project.description}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-[#5B94E5]">{project.impactScore}</div>
          <div className="text-xs text-gray-600">Impact Score</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-green-600">
            {project.beneficiaries > 1000 
              ? `${(project.beneficiaries / 1000).toFixed(1)}k` 
              : project.beneficiaries}
          </div>
          <div className="text-xs text-gray-600">Beneficiaries</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-orange-600">{project.coverage}</div>
          <div className="text-xs text-gray-600">Coverage (km)</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-purple-600">{project.activeAgents}</div>
          <div className="text-xs text-gray-600">Active Agents</div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200">
        <button 
          onClick={() => onSelect(project)}
          className="w-full bg-[#5B94E5] text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-[#4A7BC8] transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

// Heatmap Legend Component
interface HeatmapLegendProps {
  metric: string;
  visible: boolean;
  onMetricChange: (metric: 'beneficiaries' | 'impactScore' | 'coverage') => void;
}

export function HeatmapLegend({ metric, visible, onMetricChange }: HeatmapLegendProps) {
  if (!visible) return null;

  const metrics = [
    { key: 'beneficiaries', label: 'Beneficiaries', unit: 'people' },
    { key: 'impactScore', label: 'Impact Score', unit: '/100' },
    { key: 'coverage', label: 'Coverage', unit: 'km' }
  ];

  return (
    <div className="absolute bottom-20 left-4 z-[1000] bg-white rounded-xl shadow-lg border border-gray-200 p-4 min-w-[200px]">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Heatmap Intensity</h4>
      
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">Metric</label>
        <select 
          value={metric}
          onChange={(e) => onMetricChange(e.target.value as any)}
          className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] outline-none"
        >
          {metrics.map(m => (
            <option key={m.key} value={m.key}>
              {m.label} ({m.unit})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <div className="text-xs font-medium text-gray-600">Intensity Scale</div>
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500">Low</span>
          <div className="flex-1 h-3 rounded" style={{
            background: 'linear-gradient(to right, rgba(0,0,255,0.3), rgba(0,255,255,0.5), rgba(0,255,0,0.7), rgba(255,255,0,0.8), rgba(255,0,0,1))'
          }}></div>
          <span className="text-xs text-gray-500">High</span>
        </div>
      </div>
    </div>
  );
}