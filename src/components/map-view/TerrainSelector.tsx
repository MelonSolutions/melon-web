/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Map, ChevronDown } from 'lucide-react';
import { MAP_TILE_LAYERS } from '@/types/map';

interface TerrainSelectorProps {
  currentTerrain: string;
  onTerrainChange: (terrainId: string) => void;
}

export function TerrainSelector({ currentTerrain, onTerrainChange }: TerrainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLayer = Object.values(MAP_TILE_LAYERS).find(layer => layer.id === currentTerrain) || MAP_TILE_LAYERS.STREETS;

  return (
    <div className="absolute top-4 left-4 z-[1000]">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 hover:scale-105"
          title="Change map style"
        >
          <span className="text-lg">{currentLayer.icon}</span>
          <span className="text-sm font-medium text-gray-700">{currentLayer.name}</span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-[-1]" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1 mb-1">
                  Map Styles
                </h3>
                
                <div className="space-y-1">
                  {Object.values(MAP_TILE_LAYERS).map((layer) => (
                    <button
                      key={layer.id}
                      onClick={() => {
                        onTerrainChange(layer.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-2 py-2 rounded-lg text-left transition-colors ${
                        currentTerrain === layer.id
                          ? 'bg-[#5B94E5] text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{layer.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{layer.name}</div>
                        {layer.id === 'satellite' && (
                          <div className="text-xs opacity-75">High resolution imagery</div>
                        )}
                        {layer.id === 'terrain' && (
                          <div className="text-xs opacity-75">Elevation details</div>
                        )}
                        {layer.id === 'dark' && (
                          <div className="text-xs opacity-75">Night mode friendly</div>
                        )}
                      </div>
                      {currentTerrain === layer.id && (
                        <div className="w-2 h-2 bg-white rounded-full flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
