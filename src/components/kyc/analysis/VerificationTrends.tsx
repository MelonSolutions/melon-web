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
  Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface TrendData {
  date: string;
  pending: number;
  verified: number;
  rejected: number;
  total: number;
}

interface VerificationTrendsProps {
  data: TrendData[];
}

export const VerificationTrends: React.FC<VerificationTrendsProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-surface-secondary rounded-xl border border-dashed border-border">
        <p className="text-gray-500 dark:text-gray-400 text-sm">No trend data available for the last 30 days</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d');
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="w-full h-64 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--chart-axis)' }}
            minTickGap={30}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: 'var(--chart-axis)' }}
            width={30}
          />
          <Tooltip 
            labelFormatter={formatDate}
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
          <Area
            name="Verified"
            type="monotone"
            dataKey="verified"
            stroke="#10B981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorVerified)"
          />
          <Area
            name="Rejected"
            type="monotone"
            dataKey="rejected"
            stroke="#EF4444"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRejected)"
          />
          <Area
            name="Total Requests"
            type="monotone"
            dataKey="total"
            stroke="#4F46E5"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="transparent"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
