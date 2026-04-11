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
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500 text-sm">No trend data available for the last 30 days</p>
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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            minTickGap={30}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#6B7280' }}
            width={30}
          />
          <Tooltip 
            labelFormatter={formatDate}
            contentStyle={{ 
              backgroundColor: '#FFF', 
              border: 'none', 
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
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
