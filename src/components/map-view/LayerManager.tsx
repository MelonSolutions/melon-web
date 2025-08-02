/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Plus, 
  Settings, 
  Trash2,
  MapIcon,
  X,
  BarChart3,
  Database,
  Filter,
  Download,
  MapPin
} from 'lucide-react';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  type: 'points' | 'heatmap' | 'coverage';
  count: number;
  color: string;
  opacity: number;
  data: any[];
  description?: string;
  createdAt: Date;
}

interface LayerManagerProps {
  layers?: Layer[];
  onLayerToggle: (layerId: string, visible?: boolean) => void;
  onLayerDelete?: (layerId: string) => void;
  onLayerUpdate?: (layer: Layer) => void;
  onImportClick: () => void;
  onLayerSelect?: (layer: Layer) => void;
}

export function LayerManager({ 
  layers = [], 
  onLayerToggle, 
  onLayerDelete, 
  onLayerUpdate, 
  onImportClick,
  onLayerSelect 
}: LayerManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'layers' | 'data'>('layers');
  const [editingLayer, setEditingLayer] = useState<string | null>(null);
  const [internalLayers, setInternalLayers] = useState<Layer[]>([]);

  // If no layers prop provided, use internal state with default data
  useEffect(() => {
    if (layers.length === 0 && internalLayers.length === 0) {
      setInternalLayers([
        {
          id: 'health-projects',
          name: 'Health Projects',
          visible: true,
          type: 'points',
          count: 3,
          color: '#dc2626',
          opacity: 80,
          data: [],
          description: 'Health sector initiatives',
          createdAt: new Date()
        },
        {
          id: 'coverage-areas',
          name: 'Coverage Areas',
          visible: false,
          type: 'coverage',
          count: 0,
          color: '#059669',
          opacity: 50,
          data: [],
          description: 'Service coverage zones',
          createdAt: new Date()
        }
      ]);
    }
  }, [layers.length, internalLayers.length]);

  const currentLayers = layers.length > 0 ? layers : internalLayers;
  const totalPoints = currentLayers.reduce((sum, layer) => sum + layer.count, 0);
  const visibleLayers = currentLayers.filter(layer => layer.visible);

  const toggleLayer = (layerId: string) => {
    const layer = currentLayers.find(l => l.id === layerId);
    if (layer) {
      if (layers.length > 0) {
        onLayerToggle(layerId, !layer.visible);
      } else {
        setInternalLayers(prev => prev.map(l => 
          l.id === layerId ? { ...l, visible: !l.visible } : l
        ));
        onLayerToggle(layerId, !layer.visible);
      }
    }
  };

  const deleteLayer = (layerId: string) => {
    if (confirm('Are you sure you want to delete this layer?')) {
      if (onLayerDelete) {
        onLayerDelete(layerId);
      } else {
        setInternalLayers(prev => prev.filter(l => l.id !== layerId));
      }
    }
  };

  const updateLayerColor = (layerId: string, color: string) => {
    const layer = currentLayers.find(l => l.id === layerId);
    if (layer) {
      const updatedLayer = { ...layer, color };
      if (onLayerUpdate) {
        onLayerUpdate(updatedLayer);
      } else {
        setInternalLayers(prev => prev.map(l => 
          l.id === layerId ? updatedLayer : l
        ));
      }
    }
  };

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    const layer = currentLayers.find(l => l.id === layerId);
    if (layer) {
      const updatedLayer = { ...layer, opacity };
      if (onLayerUpdate) {
        onLayerUpdate(updatedLayer);
      } else {
        setInternalLayers(prev => prev.map(l => 
          l.id === layerId ? updatedLayer : l
        ));
      }
    }
  };

  const exportLayerData = (layer: Layer) => {
    if (layer.data.length === 0) {
      alert('No data to export for this layer');
      return;
    }

    const csvContent = [
      // Headers
      Object.keys(layer.data[0] || {}).join(','),
      // Data rows
      ...layer.data.map(row => 
        Object.values(row).map(val => 
          typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${layer.name.replace(/\s+/g, '_')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'points': return <MapPin className="w-4 h-4" />;
      case 'heatmap': return <BarChart3 className="w-4 h-4" />;
      case 'coverage': return <MapIcon className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  const colorOptions = [
    '#dc2626', '#ea580c', '#ca8a04', '#65a30d', '#059669', 
    '#0891b2', '#2563eb', '#7c3aed', '#c026d3', '#db2777'
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="cursor-pointer absolute top-6 right-6 z-[1000] bg-white p-3 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 hover:scale-105 group"
        title="Manage Layers & Data"
      >
        <div className="relative">
          <Layers className="w-5 h-5 text-gray-700 group-hover:text-blue-600" />
          {currentLayers.length > 0 && (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-[] text-white text-xs rounded-full flex items-center justify-center">
              {currentLayers.length}
            </div>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="absolute top-6 right-6 z-[1000] w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
     {/* Enhanced Header */}
        <div className="bg-[#5B94E5] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Layers className="w-5 h-5 text-white" />
              <div>
                <h3 className="font-semibold text-white">Layer Manager</h3>
                <p className="text-xs text-white/70">
                  {currentLayers.length} layers • {totalPoints} points
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onImportClick}
                className="cursor-pointer p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-all duration-200"
                title="Import Data"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="cursor-pointer p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex mt-4 bg-white/15 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('layers')}
              className={`cursor-pointer flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'layers'
                  ? 'bg-white text-[#5B94E5] shadow-sm'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <Layers className="w-4 h-4 inline mr-2" />
              Layers ({currentLayers.length})
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`cursor-pointer flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'data'
                  ? 'bg-white text-[#5B94E5] shadow-sm'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <Database className="w-4 h-4 inline mr-2" />
              Data
            </button>
          </div>
        </div>

      {/* Content Area */}
        <div className="max-h-96 overflow-y-auto">
        {activeTab === 'layers' ? (
          // Layers Tab
          <div className="p-4">
            {currentLayers.length === 0 ? (
              <div className="text-center py-8">
                <MapIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-4">No layers yet</p>
                <button 
                  onClick={onImportClick}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Import Data
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {currentLayers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`rounded-lg border transition-all duration-200 ${
                      layer.visible 
                        ? 'border-[#5B94E5]/30 bg-[#5B94E5]/5' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between p-3 group">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <button
                          onClick={() => toggleLayer(layer.id)}
                          className="cursor-pointer p-1.5 hover:bg-white/80 rounded-lg transition-colors"
                        >
                          {layer.visible ? (
                            <Eye className="w-4 h-4 text-[#5B94E5]" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                        
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="p-1.5 rounded-lg bg-white shadow-sm border border-gray-100">
                            {getLayerIcon(layer.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate text-sm">
                              {layer.name}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="capitalize">{layer.type}</span>
                              <span>•</span>
                              <span>{layer.count} points</span>
                              <span>•</span>
                              <span>{Math.round(layer.opacity)}% opacity</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingLayer(editingLayer === layer.id ? null : layer.id)}
                          className="cursor-pointer p-1.5 text-gray-400 hover:text-[#5B94E5] hover:bg-[#5B94E5]/10 rounded-lg transition-all duration-200"
                          title="Layer Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteLayer(layer.id)}
                          className="cursor-pointer p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete Layer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Layer Settings Panel */}
                    {editingLayer === layer.id && (
                      <div className="px-3 pb-3 space-y-3 border-t border-gray-100 bg-gray-50/50">
                        {/* Color Picker */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Color
                          </label>
                          <div className="flex gap-1.5">
                            {colorOptions.map((color) => (
                              <button
                                key={color}
                                onClick={() => updateLayerColor(layer.id, color)}
                                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                                  layer.color === color 
                                    ? 'border-gray-500 scale-110 shadow-md' 
                                    : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Opacity Slider */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Opacity: {Math.round(layer.opacity)}%
                          </label>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={layer.opacity}
                            onChange={(e) => updateLayerOpacity(layer.id, parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to right, #5B94E5 0%, #5B94E5 ${layer.opacity}%, #e5e7eb ${layer.opacity}%, #e5e7eb 100%)`
                            }}
                          />
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => exportLayerData(layer)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-[#5B94E5] bg-[#5B94E5]/10 rounded-lg hover:bg-[#5B94E5]/20 transition-colors duration-200"
                          >
                            <Download className="w-3 h-3" />
                            Export
                          </button>
                          <button
                            onClick={() => onLayerSelect?.(layer)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                          >
                            <Filter className="w-3 h-3" />
                            Filter
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Global Controls */}
            {currentLayers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Global Settings</h4>
                <div className="space-y-3">
                  <div className="text-center p-3 bg-gradient-to-br from-[#5B94E5]/10 to-[#5B94E5]/5 rounded-lg border border-[#5B94E5]/20">
                    <div className="text-lg font-bold text-[#5B94E5]">{visibleLayers.length}</div>
                    <div className="text-xs text-gray-600">Visible Layers</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Data Tab
          <div className="p-4">
            <div className="space-y-3">
              {currentLayers.map((layer) => (
                <div
                  key={layer.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 group transition-all duration-200"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div 
                      className="p-2 rounded-lg border border-gray-100" 
                      style={{ backgroundColor: layer.color + '15' }}
                    >
                      {getLayerIcon(layer.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate text-sm">
                        {layer.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{layer.count} points</span>
                        <span>•</span>
                        <span className="capitalize">{layer.type}</span>
                        <span>•</span>
                        <span>{new Date(layer.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => exportLayerData(layer)}
                      className="p-1.5 text-gray-400 hover:text-[#5B94E5] hover:bg-[#5B94E5]/10 rounded-lg transition-all duration-200"
                      title="Export Data"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteLayer(layer.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Remove Dataset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Data Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-[#5B94E5] rounded-lg">
                  <div className="text-lg font-bold text-white">
                    {totalPoints}
                  </div>
                  <div className="text-xs text-white/80">Total Points</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                  <div className="text-lg font-bold text-white">{currentLayers.length}</div>
                  <div className="text-xs text-white/80">Datasets</div>
                </div>
              </div>
            </div>

            {/* Data Actions */}
            <div className="mt-4 space-y-2">
              <button
                onClick={onImportClick}
                className="cursor-pointer w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-[#5B94E5] bg-[#5B94E5]/10 rounded-lg hover:bg-[#5B94E5]/20 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                Import New Dataset
              </button>
              {currentLayers.length > 0 && (
                <button 
                  onClick={() => {
                    // Export all data combined
                    const allData = currentLayers.flatMap(layer => 
                      layer.data.map(point => ({ ...point, layer: layer.name }))
                    );
                    
                    if (allData.length === 0) {
                      alert('No data to export');
                      return;
                    }

                    const csvContent = [
                      Object.keys(allData[0] || {}).join(','),
                      ...allData.map(row => 
                        Object.values(row).map(val => 
                          typeof val === 'string' && val.includes(',') ? `"${val}"` : val
                        ).join(',')
                      )
                    ].join('\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'all_layers_data.csv';
                    link.click();
                    window.URL.revokeObjectURL(url);
                  }}
                  className="cursor-pointer w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  Export All Data
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}