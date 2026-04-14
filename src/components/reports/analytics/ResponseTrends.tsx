'use client';

import { useState, useEffect } from 'react';
import LineChartComponent from '../charts/LineChartComponent';
import { getReportAnalytics, ReportAnalytics } from '@/lib/api/reports';

interface ResponseTrendsProps {
  reportId: string;
}

export default function ResponseTrends({ reportId }: ResponseTrendsProps) {
  const [analytics, setAnalytics] = useState<ReportAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await getReportAnalytics(reportId);
        setAnalytics(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load trends');
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchAnalytics();
    }
  }, [reportId]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  return (
    <LineChartComponent
      data={analytics?.responsesOverTime || []}
      xKey="date"
      yKey="count"
      title="Response Trends (Last 30 Days)"
      height={350}
      loading={loading}
    />
  );
}
