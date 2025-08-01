/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Plus, 
  Settings, 
  Trash2, 
  Upload,
  MapIcon,
  X,
  BarChart3,
  Database,
  Filter,
  Download
} from 'lucide-react';

interface LayerManagerProps {
  onLayerToggle: (layerId: string) => void;
  onLayerSelect: (layer: any) => void;
  onImportClick: () => void;
}

export function LayerManager({ onLayerToggle, onLayerSelect, onImportClick }: LayerManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'layers' | 'data'>('layers');
  
  // Mock layers with more realistic data
  const [layers, setLayers] = useState([
    { 
      id: '1', 
      name: 'Health Projects', 
      visible: true, 
      type: 'points', 
      count: 150,
      color: '#dc2626',
      description: 'Community health initiatives and medical facilities'
    },
    { 
      id: '2', 
      name: 'Education Centers', 
      visible: false, 
      type: 'points', 
      count: 45,
      color: '#7c3aed',
      description: 'Schools, universities, and educational programs'
    },
    { 
      id: '3', 
      name: 'Impact Heatmap', 
      visible: false, 
      type: 'heatmap', 
      count: 0,
      color: '#059669',
      description: 'Beneficiary impact visualization overlay'
    },
  ]);

  // Mock datasets
  const datasets = [
    { id: 'ds1', name: 'Sample Projects', points: 3, source: 'built-in', date: '2024-01-15' },
    { id: 'ds2', name: 'Health Survey Data', points: 247, source: 'import', date: '2024-01-10' },
  ];

  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
    onLayerToggle(layerId);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-6 right-6 z-[1000] bg-white p-3 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 hover:scale-105 group"
        title="Manage Layers & Data"
      >
        <Layers className="w-5 h-5 text-gray-700 group-hover:text-blue-600" />
      </button>
    );
  }

  return (
    <div className="absolute top-6 right-6 z-[1000] w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Layers className="w-5 h-5 text-white" />
            <h3 className="font-semibold text-white">Layer Manager</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onImportClick}
              className="p-2 text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Import Data"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex mt-3 bg-white bg-opacity-20 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('layers')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'layers'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 inline mr-2" />
            Layers
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'data'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-blue-100 hover:text-white'
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
            {layers.length === 0 ? (
              <div className="text-center py-8">
                <MapIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-4">No layers yet</p>
                <button 
                  onClick={onImportClick}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Import Data
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 group transition-all"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleLayer(layer.id)}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {layer.visible ? (
                          <Eye className="w-4 h-4 text-blue-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                          style={{ backgroundColor: layer.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate text-sm">
                            {layer.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="capitalize">{layer.type}</span>
                            {layer.count > 0 && (
                              <>
                                <span>•</span>
                                <span>{layer.count} points</span>
                              </>
                            )}
                          </div>
                          {layer.description && (
                            <div className="text-xs text-gray-400 mt-1 truncate">
                              {layer.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onLayerSelect(layer)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                        title="Layer Settings"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        title="Delete Layer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Layer Controls */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Global Opacity</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    defaultValue="80"
                    className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Show Labels</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Data Tab
          <div className="p-4">
            <div className="space-y-3">
              {datasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 group transition-all"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate text-sm">
                        {dataset.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{dataset.points} points</span>
                        <span>•</span>
                        <span className="capitalize">{dataset.source}</span>
                        <span>•</span>
                        <span>{new Date(dataset.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                      title="Export Data"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
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
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {datasets.reduce((sum, ds) => sum + ds.points, 0)}
                  </div>
                  <div className="text-xs text-gray-500">Total Points</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{datasets.length}</div>
                  <div className="text-xs text-gray-500">Datasets</div>
                </div>
              </div>
            </div>

            {/* Data Actions */}
            <div className="mt-4 space-y-2">
              <button
                onClick={onImportClick}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import New Dataset
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Filter className="w-4 h-4" />
                Filter Data Points
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}