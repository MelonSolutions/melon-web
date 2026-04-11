'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface GeoData {
  state: string;
  count: number;
  verified: number;
}

interface GeographicDistributionProps {
  data: GeoData[];
}

export const GeographicDistribution: React.FC<GeographicDistributionProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-surface-secondary rounded-xl border border-dashed border-border">
        <p className="text-gray-500 dark:text-gray-400 text-sm">No geographic data available</p>
      </div>
    );
  }

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#EC4899'];

  return (
    <div className="w-full h-64 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="var(--chart-grid)" vertical={false} />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="state" 
            type="category" 
            width={70}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: 'var(--chart-axis)', fontWeight: 500 }}
          />
          <Tooltip 
            cursor={{ fill: 'var(--color-surface-secondary)' }}
            contentStyle={{ 
              backgroundColor: 'var(--chart-tooltip-bg)', 
              border: '1px solid var(--color-border)', 
              borderRadius: '8px',
              boxShadow: 'var(--shadow-md)'
            }}
            itemStyle={{ fontSize: '12px' }}
            labelStyle={{ fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}
            formatter={(value: any, name: string) => [value, name === 'count' ? 'Total' : 'Verified']}
          />
          <Bar 
            name="count"
            dataKey="count" 
            fill="#4F46E5" 
            radius={[0, 4, 4, 0]}
            barSize={15}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
           <Bar 
            name="verified"
            dataKey="verified" 
            fill="#10B981" 
            radius={[0, 4, 4, 0]}
            barSize={8}
            opacity={0.8}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
