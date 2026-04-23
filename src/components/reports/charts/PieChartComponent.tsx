'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PieChartComponentProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
  colors?: string[];
  height?: number;
  loading?: boolean;
}

const DEFAULT_COLORS = [
  '#5B94E5',
  '#4CAF50',
  '#FFC107',
  '#FF5722',
  '#9C27B0',
  '#00BCD4',
  '#FF9800',
  '#E91E63',
];

export default function PieChartComponent({
  data,
  title,
  colors = DEFAULT_COLORS,
  height = 300,
  loading,
}: PieChartComponentProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {title && <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>}
        <div className={`w-full bg-gray-200 rounded animate-pulse mx-auto`} style={{ height, maxWidth: height }}></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
        <div
          className="flex items-center justify-center text-gray-400 text-sm"
          style={{ height }}
        >
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            formatter={(value: number, name: string) => [
              `${value} responses (${((value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)`,
              name
            ]}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '13px',
              maxHeight: '120px',
              overflowY: 'auto'
            }}
            iconType="circle"
            formatter={(value: string) => {
              const maxLength = 40;
              return value.length > maxLength ? `${value.substring(0, maxLength)}...` : value;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
