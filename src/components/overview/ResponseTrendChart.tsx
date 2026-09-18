'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface TrendDataPoint {
  date: string;
  count: number;
}

interface ResponseTrendChartProps {
  data: TrendDataPoint[];
}

export const ResponseTrendChart: React.FC<ResponseTrendChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <div className="text-center">
          <p className="text-gray-400 text-sm font-medium">No response data yet</p>
          <p className="text-gray-400 text-xs mt-1">Responses will appear here once surveys are published</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d');
    } catch {
      return dateStr;
    }
  };

  const maxCount = Math.max(...data.map(d => d.count), 0);

  const getYAxisUpperDomain = (max: number) => {
    if (max <= 5) return 5;
    const padded = max * 1.25; // 25% headroom so peaks don't hit the top boundary
    if (padded <= 20) return Math.ceil(padded / 5) * 5;
    if (padded <= 100) return Math.ceil(padded / 10) * 10;
    if (padded <= 500) return Math.ceil(padded / 50) * 50;
    return Math.ceil(padded / 100) * 100;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 16, right: 16, left: 6, bottom: 4 }}
        >
          <defs>
            <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5B94E5" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#5B94E5" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            minTickGap={40}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            width={40}
            allowDecimals={false}
            domain={[0, getYAxisUpperDomain(maxCount)]}
          />
          <Tooltip
            labelFormatter={formatDate}
            formatter={(value: number) => [value, 'Responses']}
            contentStyle={{
              backgroundColor: '#FFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              fontSize: '13px',
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#5B94E5"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorResponses)"
            dot={false}
            activeDot={{ r: 4, fill: '#5B94E5', stroke: '#FFF', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
