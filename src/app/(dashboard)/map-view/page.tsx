/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Clock,
  Download,
  Share2,
  RefreshCw,
  Maximize2,
  Trash2,
  Plus
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { LayerManager } from '@/components/map-view/LayerManager';
import { ImportDataModal } from '@/components/ImportDataModal';
import { ProjectLocation, MapFilters } from '@/types/geospatial';
import { DataService, Layer, SAMPLE_MALARIA_DATA } from '@/utils/dataService';

// Dynamically import map components
const InteractiveMap = dynamic(
  () => import('@/components/map-view/InteractiveMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading interactive map...</p>
          <p className="text-sm text-gray-500 mt-1">Preparing your geospatial data</p>
        </div>
      </div>
    )
  }
);

export default function MapViewPage() {
  const [selectedProject, setSelectedProject] = useState<ProjectLocation | null>(null);
  const [sidebarView, setSidebarView] = useState<'analytics' | 'details'>('analytics');
  const [timeRange, setTimeRange] = useState<[string, string]>(['2020-01-01', '2024-12-31']);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCoverage, setShowCoverage] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedDatasets, setImportedDatasets] = useState<any[]>([]);
  
  const [layers, setLayers] = useState<Layer[]>([]);
  
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
          title: 'Import Failed',
          message: 'No valid data points found in the imported file.',
        });
        return;
      }

      const processedData = DataService.processImportedData(importData.data, importData.fileName);
      
      if (processedData.length === 0) {
        addToast({
          type: 'error',
          title: 'Import Failed',
          message: 'No valid coordinates found. Please check your CSV format.',
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
        title: 'Data Import Successful',
        message: `${importData.name} has been imported with ${processedData.length} data points.`,
      });
    } catch (error) {
      console.error('Import error:', error);
      addToast({
        type: 'error',
        title: 'Import Failed',
        message: 'An error occurred while importing the data.',
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
    link.download = `geospatial-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'Export Complete',
      message: 'Your geospatial data has been exported successfully.',
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Geospatial Intelligence Dashboard',
      text: `Interactive map with ${visibleProjects.length} data points`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        addToast({
          type: 'success',
          title: 'Shared Successfully',
          message: 'Map link has been shared.',
        });
      } catch (err) {
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      addToast({
        type: 'success',
        title: 'Link Copied',
        message: 'Map link has been copied to clipboard.',
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
      title: 'Data Refreshed',
      message: 'Latest data has been loaded from all sources.',
    });
  };

  const clearAllData = () => {
    setLayers([]);
    setImportedDatasets([]);
    setSelectedProject(null);
    setSidebarView('analytics');
    addToast({
      type: 'info',
      title: 'Map Cleared',
      message: 'All data has been removed from the map.',
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
      title: 'Sample Data Loaded',
      message: `Sample malaria surveillance data has been loaded (${SAMPLE_MALARIA_DATA.length} locations).`,
    });
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Geospatial Intelligence
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Interactive malaria surveillance data • {layers.length} layers • {visibleProjects.length} points
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border-r border-gray-300 pr-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="cursor-pointer px-3 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Import
              </button>
              <button
                onClick={loadSampleData}
                className="cursor-pointer px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Load Sample
              </button>
              <button
                onClick={clearAllData}
                className="cursor-pointer px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>

            <div className="flex items-center gap-2 pl-3">
              <button
                onClick={refreshData}
                className="cursor-pointer p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="cursor-pointer p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Toggle Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleShare}
                className="cursor-pointer p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Share Map"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleExport}
                className="cursor-pointer p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Export Data"
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
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Loading geographic data...</p>
              </div>
            </div>
          ) : (
            <InteractiveMap
              projects={visibleProjects}
              selectedProject={selectedProject}
              onProjectSelect={handleProjectSelect}
              showCoverage={showCoverage}
              showHeatmap={showHeatmap}
              onLoadSampleData={loadSampleData}
              onOpenImportModal={() => setShowImportModal(true)}
            />
          )}

          <LayerManager
            layers={layers}
            onLayerToggle={handleLayerToggle}
            onLayerDelete={handleLayerDelete}
            onLayerUpdate={handleLayerUpdate}
            onImportClick={() => setShowImportModal(true)}
            onLayerSelect={(layer) => {
              console.log('Layer selected for editing:', layer);
            }}
          />

          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[2000]">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-gray-600">Loading map data...</p>
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