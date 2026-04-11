/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { getKYCDashboardStats } from '@/lib/api/kyc';
import {
  Clock,
  Download,
  Share2,
  RefreshCw,
  Maximize2,
  Trash2,
  Plus,
  MapPin,
  Activity,
  Layers,
  Database,
  Navigation
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { LayerManager } from '@/components/map-view/LayerManager';
import { ImportDataModal } from '@/components/ImportDataModal';
import { ProjectLocation, MapFilters } from '@/types/geospatial';
import { DataService, Layer, SAMPLE_MALARIA_DATA } from '@/utils/dataService';
import { Button } from '@/components/ui/Button';

// Dynamically import map components with premium loading state
const InteractiveMap = dynamic(
  () => import('@/components/map-view/InteractiveMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-surface to-surface-secondary flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-2xl animate-spin mx-auto mb-6 shadow-xl shadow-primary/10" />
          <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Initializing Spatial Matrix</h3>
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mt-2 opacity-60">Preparing high-precision geospatial nodes...</p>
        </div>
      </div>
    )
  }
);

export default function MapViewPage() {
  const searchParams = useSearchParams();
  const kycLayerRequested = searchParams.get('layer') === 'kyc';
  const focusId = searchParams.get('focus');
  const focalLat = searchParams.get('lat');
  const focalLng = searchParams.get('lng');
  
  const [selectedProject, setSelectedProject] = useState<ProjectLocation | null>(null);
  const [sidebarView, setSidebarView] = useState<'analytics' | 'details'>('analytics');
  const [timeRange, setTimeRange] = useState<[string, string]>(['2020-01-01', '2024-12-31']);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCoverage, setShowCoverage] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedDatasets, setImportedDatasets] = useState<any[]>([]);

  const [layers, setLayers] = useState<Layer[]>([]);
  const kycLoadedRef = useRef(false);

  // Effect to load KYC data if requested
  useEffect(() => {
    if (kycLayerRequested && !kycLoadedRef.current) {
      const fetchKYCData = async () => {
        try {
          const stats = await getKYCDashboardStats();
          if (stats.locations && stats.locations.length > 0) {
            kycLoadedRef.current = true;
            const kycPoints = stats.locations.map((loc: any, index: number) => ({
              id: loc._id || `kyc-${index}`,
              title: loc.customer || 'KYC Request',
              description: `Status: ${loc.status}`,
              lat: loc.lat,
              lng: loc.lng,
              sector: 'Finance' as any, // Use Finance for KYC
              status: (loc.status === 'VERIFIED' ? 'active' : 'inactive') as any,
              kycStatus: loc.status, // Custom field for coloring
              impactScore: 100,
              beneficiaries: 1,
              coverage: 0,
              activeAgents: 0
            }));

            const kycLayer: Layer = {
              id: 'kyc-mapping-spread',
              name: 'KYC Mapping Spread',
              visible: true,
              type: 'points',
              count: kycPoints.length,
              color: '#10b981', // Emerald
              opacity: 80,
              data: kycPoints,
              description: 'Real-time spread of KYC verification activities',
              createdAt: new Date()
            };

            setLayers(prev => {
              // Avoid duplicates
              if (prev.find(l => l.id === kycLayer.id)) return prev;
              return [kycLayer, ...prev];
            });

            addToast({
              type: 'success',
              title: 'KYC Layer Activated',
              message: `Spatial distribution of ${kycPoints.length} verification nodes loaded.`,
            });

            // If a focus ID was provided, select it
            if (focusId) {
              const project = kycPoints.find((p: any) => p.id === focusId);
              if (project) {
                setSelectedProject(project);
                setSidebarView('details');
              }
            }
          }
        } catch (error) {
          console.error('Failed to fetch KYC map data:', error);
        }
      };
      fetchKYCData();
    }
  }, [kycLayerRequested]);

  const [filters, setFilters] = useState<MapFilters>({
    dateRange: timeRange,
    regions: [],
    countries: [],
    sources: [],
    layers: [],
    search: ''
  });

  const loading = false;
  const { addToast } = useToast();

  const visibleProjects = DataService.convertLayerDataToProjects(layers);

  const handleProjectSelect = (project: ProjectLocation) => {
    setSelectedProject(project);
    setSidebarView('details');
  };


  const handleLayerToggle = (layerId: string, visible?: boolean) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId
        ? { ...layer, visible: visible !== undefined ? visible : !layer.visible }
        : layer
    ));
  };

  const handleLayerDelete = (layerId: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== layerId));
    setImportedDatasets(prev => prev.filter(d => d.id !== layerId));
  };

  const handleLayerUpdate = (updatedLayer: Layer) => {
    setLayers(prev => prev.map(layer =>
      layer.id === updatedLayer.id ? updatedLayer : layer
    ));
  };

  const handleDataImport = (importData: any) => {
    try {
      if (!importData.data || importData.data.length === 0) {
        addToast({
          type: 'error',
          title: 'Import Conflict',
          message: 'Zero valid nodes detected in the provided source.',
        });
        return;
      }

      const processedData = DataService.processImportedData(importData.data, importData.fileName);

      if (processedData.length === 0) {
        addToast({
          type: 'error',
          title: 'Spatial Failure',
          message: 'No valid coordinates recovered. Validate CSV telemetry format.',
        });
        return;
      }

      const newLayer = DataService.createLayerFromData(processedData, importData.name, layers);

      setLayers(prev => [...prev, newLayer]);

      const importDataset = {
        id: newLayer.id,
        name: importData.name,
        data: processedData,
        rowCount: processedData.length
      };
      setImportedDatasets(prev => [...prev, importDataset]);

      addToast({
        type: 'success',
        title: 'Source Integrated',
        message: `${importData.name} layer synthesized with ${processedData.length} nodes.`,
      });
    } catch (error) {
      console.error('Import error:', error);
      addToast({
        type: 'error',
        title: 'Integration Error',
        message: 'A critical error occurred during spatial synthesis.',
      });
    }
  };

  const handleExport = () => {
    const dataToExport = {
      projects: visibleProjects,
      filters: filters,
      layers: layers,
      datasets: importedDatasets,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `geospatial-intel-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'Archives Exported',
      message: 'Geospatial intelligence successfully archived to system storage.',
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Geospatial Intelligence Dashboard',
      text: `Tactical interface with ${visibleProjects.length} active nodes`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        addToast({
          type: 'success',
          title: 'Shared Successfully',
          message: 'Link transmission complete.',
        });
      } catch (err) {
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      addToast({
        type: 'success',
        title: 'Pulse Link Copied',
        message: 'Mission link secured to clipboard buffer.',
      });
    }
  };

  const refreshData = () => {
    setLayers(prev => prev.map(layer =>
      layer.id === 'sample-malaria-data'
        ? { ...layer, data: [...SAMPLE_MALARIA_DATA], count: SAMPLE_MALARIA_DATA.length }
        : layer
    ));
    addToast({
      type: 'info',
      title: 'Sync Re-established',
      message: 'Spatial data refreshed from active intelligence nodes.',
    });
  };

  const clearAllData = () => {
    setLayers([]);
    setImportedDatasets([]);
    setSelectedProject(null);
    setSidebarView('analytics');
    addToast({
      type: 'info',
      title: 'Map Purged',
      message: 'All tactical layers have been cleared from the interface.',
    });
  };

  const loadSampleData = () => {
    const sampleLayer = DataService.createSampleLayer();

    setLayers([sampleLayer]);
    setImportedDatasets([]);
    setSelectedProject(null);
    setSidebarView('analytics');

    addToast({
      type: 'success',
      title: 'Sample Core Loaded',
      message: `Simulated geospatial data engaged (${SAMPLE_MALARIA_DATA.length} nodes).`,
    });
  };

  return (
    <div className="h-full flex flex-col bg-surface font-sans overflow-hidden">
      <div className="bg-surface border-b border-border px-8 py-5 flex-shrink-0 shadow-sm relative z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="w-2 h-8 bg-primary rounded-full shadow-lg shadow-primary/20"></div>
             <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Geospatial Intelligence</h1>
                <div className="flex items-center gap-4 mt-1">
                   <p className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest opacity-70">
                      {layers.length} Layers engagement • {visibleProjects.length} active nodes
                   </p>
                   <div className="h-1 w-1 rounded-full bg-border"></div>
                   <p className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Live Tracking Enabled</p>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border-r border-border pr-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowImportModal(true)}
                className="rounded-xl font-black uppercase tracking-widest text-[9px] border-emerald-500/20 text-emerald-600 dark:text-emerald-400 py-3"
                icon={<Plus className="w-3 h-3" />}
              >
                Incorporate Data
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={loadSampleData}
                className="rounded-xl font-black uppercase tracking-widest text-[9px] border-border/60 py-3"
              >
                Simulate Nodes
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={clearAllData}
                className="rounded-xl font-black uppercase tracking-widest text-[9px] border-error/20 text-error hover:bg-error/5 py-3"
                icon={<Trash2 className="w-3 h-3" />}
              >
                Purge Matrix
              </Button>
            </div>

            <div className="flex items-center gap-2 pl-3">
              <button
                onClick={refreshData}
                className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/5 border border-border/40 rounded-xl transition-all"
                title="Resync Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/5 border border-border/40 rounded-xl transition-all"
                title="Fullscreen Interface"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleShare}
                className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/5 border border-border/40 rounded-xl transition-all"
                title="Transmit Link"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleExport}
                className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/5 border border-border/40 rounded-xl transition-all"
                title="Archive Data"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex relative overflow-hidden">
        <div className="flex-1 relative overflow-hidden">
          {loading ? (
            <div className="w-full h-full bg-surface-secondary/40 flex items-center justify-center">
              <div className="text-center animate-pulse">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-2xl animate-spin mx-auto mb-6" />
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Synthesizing Spatial Core</h3>
              </div>
            </div>
          ) : (
            <div className="w-full h-full relative group/map">
              <InteractiveMap
                projects={visibleProjects}
                selectedProject={selectedProject}
                onProjectSelect={handleProjectSelect}
                showCoverage={showCoverage}
                showHeatmap={showHeatmap}
                onLoadSampleData={loadSampleData}
                onOpenImportModal={() => setShowImportModal(true)}
                focalPoint={focalLat && focalLng ? { lat: parseFloat(focalLat), lng: parseFloat(focalLng) } : undefined}
              />
              
              {/* Specialized Map Overlay Accents */}
              <div className="absolute top-8 left-8 p-4 bg-surface/80 backdrop-blur-md border border-border rounded-2xl shadow-2xl pointer-events-none opacity-0 group-hover/map:opacity-100 transition-opacity duration-500">
                 <div className="flex items-center gap-3">
                    <Navigation className="w-3 h-3 text-primary animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-900 pointer-events-none">Vector Sync Active</span>
                 </div>
              </div>
            </div>
          )}

          <LayerManager
            layers={layers}
            onLayerToggle={handleLayerToggle}
            onLayerDelete={handleLayerDelete}
            onLayerUpdate={handleLayerUpdate}
            onImportClick={() => setShowImportModal(true)}
            onLayerSelect={(layer) => {
              console.log('Layer selected for analysis:', layer);
            }}
          />

          {loading && (
            <div className="absolute inset-0 bg-surface/60 flex items-center justify-center z-[2000] backdrop-blur-sm transition-all duration-700">
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-xl animate-spin mx-auto mb-4" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Calibrating Coordinates...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ImportDataModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleDataImport}
      />
    </div>
  );
}