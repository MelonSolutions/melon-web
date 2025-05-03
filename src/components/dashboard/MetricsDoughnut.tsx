/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface MetricsData {
  name: string;
  value: number;
  color: string;
}

interface MetricsDoughnutProps {
  data: MetricsData[];
  title?: string;
  showLegend?: boolean;
}

const MetricsDoughnut: React.FC<MetricsDoughnutProps> = ({ 
  data, 
  title,
  showLegend = false 
}) => {
  return (
    <>
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `${value}%`}
              contentStyle={{
                borderRadius: '0.375rem',
                border: 'none',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
            />
            {showLegend && (
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                formatter={(value, entry, index) => (
                  <span className="text-gray-700 text-sm">{value}</span>
                )}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* The legend is now optional and can be controlled via props */}
      {showLegend && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
              <div className="text-sm">
                <span className="font-medium">{item.name}</span>
                {' '}
                <span className="text-gray-500">({item.value}%)</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default MetricsDoughnut;