/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Filter,
  Clock,
  Download,
  Share2,
  RefreshCw,
  Settings,
  Maximize2,
  X,
  MapPin,
  BarChart3,
  Layers,
  Trash2
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { LayerManager } from '@/components/map-view/LayerManager';
import { MapLegend } from '@/components/map-view/MapLegend';
import { AnalyticsSidebar } from '@/components/map-view/AnalyticsSidebar';
import { ImportDataModal } from '@/components/ImportDataModal';
import { ProjectLocation, MapFilters } from '@/types/geospatial';

// Mock data with correct types
const mockProjects: ProjectLocation[] = [
  {
    id: '1',
    title: 'Malaria Prevention Program',
    description: 'Community-based malaria prevention initiative',
    lat: 9.0765,
    lng: 7.3986,
    sector: 'Health' as const,
    status: 'active' as const,
    impactScore: 85,
    beneficiaries: 15000,
    coverage: 25,
    activeAgents: 12
  },
  {
    id: '2',
    title: 'Rural Health Centers',
    description: 'Building and equipping rural health facilities',
    lat: 6.5244,
    lng: 3.3792,
    sector: 'Health' as const,
    status: 'completed' as const,
    impactScore: 92,
    beneficiaries: 8500,
    coverage: 15,
    activeAgents: 8
  },
  {
    id: '3',
    title: 'Education Access Initiative',
    description: 'Improving access to quality education',
    lat: 11.9804,
    lng: 8.5201,
    sector: 'Education' as const,
    status: 'active' as const,
    impactScore: 78,
    beneficiaries: 12000,
    coverage: 30,
    activeAgents: 15
  }
];

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
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('');
  const [timeRange, setTimeRange] = useState<[string, string]>(['2020-01-01', '2024-12-31']);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCoverage, setShowCoverage] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedDatasets, setImportedDatasets] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<ProjectLocation[]>(mockProjects);
  
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
  const availableMetrics = ['impactScore', 'beneficiaries', 'coverage'];

  const handleProjectSelect = (project: ProjectLocation) => {
    setSelectedProject(project);
    setSidebarView('details');
  };

  const handleRegionClick = (region: string) => {
    setFilters(prev => ({
      ...prev,
      regions: prev.regions?.includes(region) 
        ? prev.regions.filter(r => r !== region)
        : [...(prev.regions || []), region]
    }));
  };

  const handleExport = () => {
    const dataToExport = {
      projects: allProjects,
      filters: filters,
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
      text: `Interactive map with ${allProjects.length} data points`,
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
        // User cancelled or error occurred
      }
    } else {
      // Fallback - copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      addToast({
        type: 'success',
        title: 'Link Copied',
        message: 'Map link has been copied to clipboard.',
      });
    }
  };

  const refreshData = () => {
    // Simulate data refresh
    setAllProjects([...mockProjects]);
    addToast({
      type: 'info',
      title: 'Data Refreshed',
      message: 'Latest data has been loaded from all sources.',
    });
  };

  const clearAllData = () => {
    setAllProjects([]);
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
    setAllProjects(mockProjects);
    addToast({
      type: 'success',
      title: 'Sample Data Loaded',
      message: 'Sample geospatial data has been loaded to the map.',
    });
  };

  const handleImport = (importData: any) => {
    // Add imported data to the map
    if (importData.data && importData.data.length > 0) {
      setAllProjects(prev => [...prev, ...importData.data]);
      setImportedDatasets(prev => [...prev, importData]);
      
      addToast({
        type: 'success',
        title: 'Data Import Successful',
        message: `${importData.name} has been imported with ${importData.rowCount} data points.`,
      });
    } else {
      addToast({
        type: 'error',
        title: 'Import Failed',
        message: 'No valid data points found in the imported file.',
      });
    }
  };

  const removeDataset = (datasetId: string) => {
    const dataset = importedDatasets.find(d => d.id === datasetId);
    if (dataset && dataset.data) {
      // Remove projects from this dataset
      const datasetProjectIds = dataset.data.map((p: any) => p.id);
      setAllProjects(prev => prev.filter(p => !datasetProjectIds.includes(p.id)));
      
      // Remove dataset from tracking
      setImportedDatasets(prev => prev.filter(d => d.id !== datasetId));
      
      addToast({
        type: 'success',
        title: 'Dataset Removed',
        message: `${dataset.name} has been removed from the map.`,
      });
    }
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-screen'} flex flex-col bg-white`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Geospatial Intelligence
              </h1>
                <p className="text-sm text-gray-500 mt-1">
                Interactive data exploration and analysis
              </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Data Management */}
            <div className="flex items-center gap-2 border-r border-gray-300 pr-3">
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

            {/* Time Range Selector */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <Clock className="w-4 h-4 text-gray-500" />
              <select
                value={`${timeRange[0]}-${timeRange[1]}`}
                onChange={(e) => {
                  const [start, end] = e.target.value.split('-');
                  const newRange: [string, string] = [start, end];
                  setTimeRange(newRange);
                  setFilters(prev => ({ ...prev, dateRange: newRange }));
                }}
                className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="2024-01-01-2024-12-31">2024</option>
                <option value="2023-01-01-2023-12-31">2023</option>
                <option value="2022-01-01-2022-12-31">2022</option>
                <option value="2020-01-01-2024-12-31">Last 5 Years</option>
                <option value="2010-01-01-2024-12-31">All Time</option>
              </select>
            </div>

            {/* Metric Selector */}
            {/* {availableMetrics.length > 0 && (
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              >
                <option value="">Select Metric</option>
                {availableMetrics.map(metric => (
                  <option key={metric} value={metric}>
                    {metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </option>
                ))}
              </select>
            )} */}

            {/* Action Buttons */}
            <div className="flex items-center gap-1 border-l border-gray-300 pl-3 ml-3">
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

      {/* Main Content - Full Width Map */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Map Container - Full Width No Padding */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Loading geographic data...</p>
              </div>
            </div>
          ) : (
            <InteractiveMap
              projects={allProjects}
              selectedProject={selectedProject}
              onProjectSelect={handleProjectSelect}
              showCoverage={showCoverage}
              showHeatmap={showHeatmap}
            />
          )}

          {/* Map Controls Overlay */}
          <LayerManager
            onLayerToggle={(layerId: string) => {
              console.log('Toggle layer:', layerId);
            }}
            onLayerSelect={(layer: any) => {
              console.log('Layer selected:', layer);
            }}
            onImportClick={() => setShowImportModal(true)}
          />

          {/* Map Legend
          <MapLegend 
            layers={[]}
            selectedMetric={selectedMetric}
          /> */}

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[2000]">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-gray-600">Loading map data...</p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Sidebar */}
        {!isFullscreen && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg">
            {sidebarView === 'analytics' ? (
              <AnalyticsSidebar
                filters={filters}
                layers={[]}
                onRegionClick={handleRegionClick}
              />
            ) : (
              <div className="h-full flex flex-col">
                {/* Enhanced Details Panel */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-600" />
                      Project Details
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedProject(null);
                        setSidebarView('analytics');
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {selectedProject ? (
                    <div className="space-y-6">
                      {/* Project Header */}
                      <div className="text-center pb-4 border-b border-gray-200">
                        <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl shadow-lg ${
                          selectedProject.status === 'active' ? 'bg-green-100 border-2 border-green-200' :
                          selectedProject.status === 'completed' ? 'bg-blue-100 border-2 border-blue-200' : 'bg-yellow-100 border-2 border-yellow-200'
                        }`}>
                          {selectedProject.sector === 'Health' ? '🏥' : 
                           selectedProject.sector === 'Education' ? '🎓' : '🏗️'}
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          {selectedProject.title}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {selectedProject.description}
                        </p>
                      </div>

                      {/* Status & Sector */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-xl">
                          <div className="text-sm text-gray-600 mb-2">Status</div>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            selectedProject.status === 'active' ? 'bg-green-100 text-green-700' :
                            selectedProject.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-xl">
                          <div className="text-sm text-gray-600 mb-2">Sector</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {selectedProject.sector}
                          </div>
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-blue-600" />
                          Key Metrics
                        </h5>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                            <span className="text-sm text-gray-700 font-medium">Impact Score</span>
                            <span className="text-xl font-bold text-blue-600">
                              {selectedProject.impactScore}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                            <span className="text-sm text-gray-700 font-medium">Beneficiaries</span>
                            <span className="text-xl font-bold text-green-600">
                              {selectedProject.beneficiaries.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                            <span className="text-sm text-gray-700 font-medium">Active Agents</span>
                            <span className="text-xl font-bold text-purple-600">
                              {selectedProject.activeAgents}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                            <span className="text-sm text-gray-700 font-medium">Coverage Area</span>
                            <span className="text-xl font-bold text-orange-600">
                              {selectedProject.coverage} km²
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Impact Progress */}
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-4">Impact Progress</h5>
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-full h-4 mb-3 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
                              style={{ width: `${selectedProject.impactScore}%` }}
                            />
                          </div>
                          <div className="text-center">
                            <span className="text-lg font-bold text-gray-900">{selectedProject.impactScore}%</span>
                            <span className="text-sm text-gray-600 ml-2">of target achieved</span>
                          </div>
                        </div>
                      </div>

                      {/* Location Info */}
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          Location Details
                        </h5>
                        <div className="space-y-3">
                          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600 font-medium">Latitude:</span>
                            <span className="font-mono text-sm text-gray-900 bg-white px-2 py-1 rounded border">
                              {selectedProject.lat.toFixed(6)}
                            </span>
                          </div>
                          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600 font-medium">Longitude:</span>
                            <span className="font-mono text-sm text-gray-900 bg-white px-2 py-1 rounded border">
                              {selectedProject.lng.toFixed(6)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-4 border-t border-gray-200">
                        <button className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                          <Settings className="w-5 h-5" />
                          View Full Project Details
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Project Selected</h4>
                      <p className="text-sm text-gray-600">
                        Click on a project marker on the map to view detailed information
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Import Modal */}
      <ImportDataModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />
    </div>
  );
}
