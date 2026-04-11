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
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500 text-sm">No organization data available</p>
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
          <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#F3F4F6" vertical={false} />
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            width={120}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
          />
          <Tooltip
            cursor={{ fill: '#F9FAFB' }}
            contentStyle={{
              backgroundColor: '#FFF',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
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
