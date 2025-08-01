/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { geospatialAPI } from '@/lib/api/geospatial';
import { GeoLayer, GeoDataPoint, MapFilters, GeospatialAnalytics, DataImport } from '@/types/geospatial';
import { useToast } from '@/components/ui/Toast';

export function useGeospatialLayers() {
  const [layers, setLayers] = useState<GeoLayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchLayers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await geospatialAPI.getLayers();
      setLayers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch layers');
      addToast({
        type: 'error',
        title: 'Error Loading Layers',
        message: 'Failed to load map layers. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const createLayer = useCallback(async (request: Parameters<typeof geospatialAPI.createLayer>[0]) => {
    try {
      const newLayer = await geospatialAPI.createLayer(request);
      setLayers(prev => [...prev, newLayer]);
      addToast({
        type: 'success',
        title: 'Layer Created',
        message: `${newLayer.name} has been added to the map.`,
      });
      return newLayer;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to Create Layer',
        message: err instanceof Error ? err.message : 'Unknown error occurred',
      });
      throw err;
    }
  }, [addToast]);

  const updateLayer = useCallback(async (layerId: string, updates: Partial<GeoLayer>) => {
    try {
      const updatedLayer = await geospatialAPI.updateLayer(layerId, updates);
      setLayers(prev => prev.map(layer => 
        layer.id === layerId ? updatedLayer : layer
      ));
      return updatedLayer;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to Update Layer',
        message: err instanceof Error ? err.message : 'Unknown error occurred',
      });
      throw err;
    }
  }, [addToast]);

  const deleteLayer = useCallback(async (layerId: string) => {
    try {
      await geospatialAPI.deleteLayer(layerId);
      setLayers(prev => prev.filter(layer => layer.id !== layerId));
      addToast({
        type: 'success',
        title: 'Layer Deleted',
        message: 'Layer has been removed from the map.',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to Delete Layer',
        message: err instanceof Error ? err.message : 'Unknown error occurred',
      });
      throw err;
    }
  }, [addToast]);

  const toggleLayerVisibility = useCallback(async (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      await updateLayer(layerId, { visible: !layer.visible });
    }
  }, [layers, updateLayer]);

  useEffect(() => {
    fetchLayers();
  }, [fetchLayers]);

  return {
    layers,
    loading,
    error,
    refetch: fetchLayers,
    createLayer,
    updateLayer,
    deleteLayer,
    toggleLayerVisibility,
  };
}

export function useGeoData(filters: MapFilters) {
  const [data, setData] = useState<GeoDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const geoData = await geospatialAPI.getGeoData(filters);
      setData(geoData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useGeospatialAnalytics(filters?: Partial<MapFilters>) {
  const [analytics, setAnalytics] = useState<GeospatialAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await geospatialAPI.getAnalytics(filters);
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [filters]);

  return { analytics, loading };
}

export function useDataImports() {
  const [imports, setImports] = useState<DataImport[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchImports = useCallback(async () => {
    try {
      const data = await geospatialAPI.getImports();
      setImports(data);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to Load Imports',
        message: 'Could not retrieve your data imports.',
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const importData = useCallback(async (request: Parameters<typeof geospatialAPI.importData>[0]) => {
    try {
      const newImport = await geospatialAPI.importData(request);
      setImports(prev => [...prev, newImport]);
      addToast({
        type: 'success',
        title: 'Data Import Started',
        message: 'Your file is being processed and will appear on the map shortly.',
      });
      return newImport;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Import Failed',
        message: err instanceof Error ? err.message : 'Failed to import data file.',
      });
      throw err;
    }
  }, [addToast]);

  const deleteImport = useCallback(async (importId: string) => {
    try {
      await geospatialAPI.deleteImport(importId);
      setImports(prev => prev.filter(imp => imp.id !== importId));
      addToast({
        type: 'success',
        title: 'Import Deleted',
        message: 'Data import has been removed.',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to Delete Import',
        message: err instanceof Error ? err.message : 'Unknown error occurred',
      });
    }
  }, [addToast]);

  useEffect(() => {
    fetchImports();
  }, [fetchImports]);

  return {
    imports,
    loading,
    refetch: fetchImports,
    importData,
    deleteImport,
  };
}