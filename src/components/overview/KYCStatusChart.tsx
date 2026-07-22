'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface KYCBreakdown {
  pending: number;
  assigned: number;
  inReview: number;
  verificationSubmitted: number;
  verified: number;
  rejected: number;
  total: number;
}

interface KYCStatusChartProps {
  data: KYCBreakdown;
}

const STATUS_CONFIG = [
  { key: 'verified', label: 'Verified', color: '#10B981' },
  { key: 'pending', label: 'Pending', color: '#F59E0B' },
  { key: 'assigned', label: 'Assigned', color: '#3B82F6' },
  { key: 'inReview', label: 'In Review', color: '#8B5CF6' },
  { key: 'verificationSubmitted', label: 'Submitted', color: '#06B6D4' },
  { key: 'rejected', label: 'Rejected', color: '#EF4444' },
];

export const KYCStatusChart: React.FC<KYCStatusChartProps> = ({ data }) => {
  const chartData = STATUS_CONFIG
    .map(s => ({
      name: s.label,
      value: data[s.key as keyof KYCBreakdown] as number,
      color: s.color,
    }))
    .filter(d => d.value > 0);

  if (chartData.length === 0 || data.total === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <div className="text-center">
          <p className="text-gray-400 text-sm font-medium">No KYC data yet</p>
          <p className="text-gray-400 text-xs mt-1">KYC requests will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full h-52 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [value, name]}
              contentStyle={{
                backgroundColor: '#FFF',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '13px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{data.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {chartData.map((entry, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-600">
              {entry.name} <span className="font-semibold text-gray-800">{entry.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
