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
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500 text-sm">No geographic data available</p>
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
          <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#F3F4F6" vertical={false} />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="state" 
            type="category" 
            width={70}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#374151', fontWeight: 500 }}
          />
          <Tooltip 
            cursor={{ fill: '#F9FAFB' }}
            contentStyle={{ 
              backgroundColor: '#FFF', 
              border: 'none', 
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
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
