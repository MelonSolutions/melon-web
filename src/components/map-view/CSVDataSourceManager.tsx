'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CSVUploader } from '@/components/csv/CSVUploader';
import { useModal } from '@/components/ui/Modal';
import {
  getCSVDataSources,
  deleteCSVDataSource,
  getCSVMapDataPoints,
} from '@/lib/api/csv-import';
import type { CSVDataSource, MapDataPoint } from '@/types/csv-import';
import { FileSpreadsheet, Trash2, Eye, Upload, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface CSVDataSourceManagerProps {
  onLayerAdd: (layer: any) => void;
}

export function CSVDataSourceManager({ onLayerAdd }: CSVDataSourceManagerProps) {
  const { addToast } = useToast();
  
  const toast = {
    error: (msg: string) => addToast({ type: 'error', title: 'Error', message: msg }),
    success: (msg: string) => addToast({ type: 'success', title: 'Success', message: msg })
  };
  
  const [dataSources, setDataSources] = useState<CSVDataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const { openModal, closeModal } = useModal();
  const [loadingPoints, setLoadingPoints] = useState<string | null>(null);

  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    try {
      setLoading(true);
      const sources = await getCSVDataSources({ isMapDataSource: true });
      setDataSources(sources);
    } catch (error) {
      toast.error('Failed to load CSV data sources');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = async (dataSource: CSVDataSource) => {
    closeModal();
    await loadDataSources();

    // Auto-load the new data source
    if (dataSource.status === 'ready') {
      handleLoadPoints(dataSource._id);
    }
  };

  const handleLoadPoints = async (id: string) => {
    try {
      setLoadingPoints(id);
      const points = await getCSVMapDataPoints(id);

      const dataSource = dataSources.find((ds) => ds._id === id);
      if (!dataSource) return;

      // Create a layer from the CSV data
      const layer = {
        id: `csv-${id}`,
        name: dataSource.name,
        visible: true,
        type: 'points' as const,
        count: points.length,
        color: '#8b5cf6', // Purple for CSV data
        opacity: 80,
        data: points.map((point) => ({
          id: point.id,
          title: point.title,
          description: point.description,
          lat: point.lat,
          lng: point.lng,
          sector: point.sector,
          status: point.status,
          impactScore: 100,
          beneficiaries: 1,
          coverage: 0,
          activeAgents: 0,
          csvData: point.data, // Include original CSV data
        })),
        description: dataSource.description || 'Imported from CSV',
        createdAt: new Date(dataSource.createdAt),
      };

      onLayerAdd(layer);
      toast.success(`Loaded ${points.length} points from ${dataSource.name}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load map points');
      console.error(error);
    } finally {
      setLoadingPoints(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this CSV data source?')) {
      return;
    }

    try {
      await deleteCSVDataSource(id);
      toast.success('Data source deleted');
      await loadDataSources();
    } catch (error) {
      toast.error('Failed to delete data source');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Loading CSV data sources...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">CSV Data Sources</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload CSV files with location data to display on the map
          </p>
        </div>
        <Button size="sm" onClick={() => {
          openModal({
            type: 'custom',
            title: 'Upload CSV for Map View',
            description: 'Upload a CSV file containing location data to display on the map',
            content: (
              <CSVUploader
                isMapDataSource={true}
                onSuccess={handleUploadSuccess}
                onCancel={closeModal}
              />
            )
          }, { size: 'xl' });
        }}>
          <Upload className="h-4 w-4 mr-2" />
          Upload CSV
        </Button>
      </div>

      {dataSources.length === 0 ? (
        <Card className="p-8 text-center">
          <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-700">No CSV data sources</p>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            Upload a CSV file with latitude and longitude columns to get started
          </p>
          <Button size="sm" onClick={() => {
            openModal({
              type: 'custom',
              title: 'Upload CSV for Map View',
              description: 'Upload a CSV file containing location data to display on the map',
              content: (
                <CSVUploader
                  isMapDataSource={true}
                  onSuccess={handleUploadSuccess}
                  onCancel={closeModal}
                />
              )
            }, { size: 'xl' });
          }}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Your First CSV
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {dataSources.map((source) => (
            <Card key={source._id} className="p-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <h4 className="font-medium text-sm truncate">{source.name}</h4>
                      <Badge
                        variant={
                          source.status === 'ready'
                            ? 'success'
                            : source.status === 'error'
                              ? 'error'
                              : 'neutral'
                        }
                        className="text-xs"
                      >
                        {source.status}
                      </Badge>
                    </div>
                    {source.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {source.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span>{source.rowCount.toLocaleString()} rows</span>
                    <span>•</span>
                    <span>{source.columns.length} columns</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {source.status === 'ready' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleLoadPoints(source._id)}
                        disabled={loadingPoints === source._id}
                        className="h-7 text-xs"
                      >
                        {loadingPoints === source._id ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Load on Map
                          </>
                        )}
                      </Button>
                    ) : source.status === 'error' ? (
                      <div className="flex items-center gap-1 text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        <span className="text-xs">{source.errorMessage}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(source._id)}
                      className="h-7"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>

                {source.status === 'ready' && (
                  <div className="flex gap-1 text-xs text-muted-foreground pt-1 border-t">
                    <span className="font-medium">Columns:</span>
                    <div className="flex gap-1 flex-wrap">
                      {source.latitudeColumn && (
                        <Badge variant="neutral" className="text-xs">
                          Lat: {source.latitudeColumn}
                        </Badge>
                      )}
                      {source.longitudeColumn && (
                        <Badge variant="neutral" className="text-xs">
                          Lng: {source.longitudeColumn}
                        </Badge>
                      )}
                      {source.labelColumn && (
                        <Badge variant="neutral" className="text-xs">
                          Label: {source.labelColumn}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}


    </div>
  );
}
