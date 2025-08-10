/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartConfig } from '@/types/visualization';
import { BarChart3, Loader } from 'lucide-react';

interface ChartPreviewProps {
  config: ChartConfig;
  data: any[];
  isEmpty: boolean;
  loading?: boolean;
}

export function ChartPreview({ config, data, isEmpty, loading = false }: ChartPreviewProps) {
  const mockData = [
    { name: 'North', value: 45, region: 'North', score: 4.2 },
    { name: 'South', value: 32, region: 'South', score: 3.8 },
    { name: 'East', value: 67, region: 'East', score: 4.5 },
    { name: 'West', value: 23, region: 'West', score: 3.5 },
    { name: 'Central', value: 54, region: 'Central', score: 4.1 },
  ];

  const chartData = data.length > 0 ? data : mockData;
  const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (isEmpty) {
    return (
      <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chart Preview</h3>
          <p className="text-gray-500">Configure your settings to create your visualization</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Generating chart...</p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    const height = config.styling?.height || 400;
    
    switch (config.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              {config.styling?.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
              <XAxis 
                dataKey={config.xAxis || 'name'} 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              {config.styling?.showLegend && <Legend />}
              <Bar 
                dataKey={config.yAxis || 'value'} 
                fill={colors[0]} 
                name={config.yAxis || 'Value'}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              {config.styling?.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
              <XAxis 
                dataKey={config.xAxis || 'name'} 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              {config.styling?.showLegend && <Legend />}
              <Line 
                type="monotone" 
                dataKey={config.yAxis || 'value'} 
                stroke={colors[0]} 
                strokeWidth={3}
                name={config.yAxis || 'Value'}
                dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2, fill: 'white' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              {config.styling?.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
              <XAxis 
                dataKey={config.xAxis || 'name'} 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              {config.styling?.showLegend && <Legend />}
              <Area 
                type="monotone" 
                dataKey={config.yAxis || 'value'} 
                stroke={colors[0]} 
                fill={colors[0]} 
                fillOpacity={0.2}
                strokeWidth={3}
                name={config.yAxis || 'Value'}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'doughnut':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={height * 0.25}
                innerRadius={config.type === 'doughnut' ? height * 0.15 : 0}
                fill="#8884d8"
                dataKey={config.yAxis || 'value'}
                nameKey={config.groupBy || config.xAxis || 'name'}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              {config.styling?.showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              {config.styling?.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
              <XAxis 
                dataKey={config.xAxis || 'name'} 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                dataKey={config.yAxis || 'value'} 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              {config.styling?.showLegend && <Legend />}
              <Scatter 
                name={config.yAxis || 'Value'} 
                data={chartData} 
                fill={colors[0]} 
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="h-96 flex items-center justify-center">
            <p className="text-gray-500">Chart type not supported yet</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {config.styling?.title && (
        <div className="text-center mb-6">
          <h4 className="text-lg font-medium text-gray-900">{config.styling.title}</h4>
          {config.styling.subtitle && (
            <p className="text-sm text-gray-600 mt-1">{config.styling.subtitle}</p>
          )}
        </div>
      )}
      
      <div className="bg-gray-50 rounded-lg p-4">
        {renderChart()}
      </div>

      {/* Chart Info */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span>Type: {config.type?.charAt(0).toUpperCase() + config.type?.slice(1)}</span>
          <span>Data points: {chartData.length}</span>
          {config.aggregation && (
            <span>Aggregation: {config.aggregation}</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {config.styling?.showLegend && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">Legend</span>
          )}
          {config.styling?.showGrid && (
            <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">Grid</span>
          )}
        </div>
      </div>
    </div>
  );
}