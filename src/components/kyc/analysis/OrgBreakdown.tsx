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
  Legend
} from 'recharts';

interface OrgData {
  name: string;
  total: number;
  verified: number;
  rejected: number;
}

interface OrgBreakdownProps {
  data: OrgData[];
}

export const OrgBreakdown: React.FC<OrgBreakdownProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-surface-secondary rounded-xl border border-dashed border-border">
        <p className="text-gray-500 dark:text-gray-400 text-sm">No organization data available</p>
      </div>
    );
  }

  // Sort by total requests
  const sortedData = [...data]
    .sort((a, b) => b.total - a.total)
    .slice(0, 10); // Top 10

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={sortedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="var(--chart-grid)" vertical={false} />
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            width={120}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--chart-axis)', fontWeight: 500 }}
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
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Bar
            name="Verified"
            dataKey="verified"
            stackId="a"
            fill="#10B981"
            radius={[0, 0, 0, 0]}
            barSize={20}
          />
          <Bar
            name="Rejected"
            dataKey="rejected"
            stackId="a"
            fill="#EF4444"
            radius={[0, 4, 4, 0]}
            barSize={20}
          />
          <Bar
            name="Total Requests"
            dataKey="total"
            fill="#4F46E5"
            opacity={0.3}
            radius={[0, 4, 4, 0]}
            barSize={8}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
