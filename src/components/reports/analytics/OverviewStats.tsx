'use client';

import { useState, useEffect } from 'react';
import { Users, CheckCircle, PieChart, TrendingUp } from 'lucide-react';
import StatCard from '../charts/StatCard';
import { getReportAnalytics, ReportAnalytics } from '@/lib/api/reports';

interface OverviewStatsProps {
  reportId: string;
}

export default function OverviewStats({ reportId }: OverviewStatsProps) {
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
        setError('Failed to load analytics');
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Responses"
        value={analytics?.totalResponses ?? 0}
        icon={Users}
        subtitle="All submissions"
        loading={loading}
      />
      <StatCard
        title="Completed"
        value={analytics?.completedResponses ?? 0}
        icon={CheckCircle}
        subtitle={`${analytics?.completionRate ?? 0}% completion rate`}
        loading={loading}
      />
      <StatCard
        title="Partial"
        value={analytics?.partialResponses ?? 0}
        icon={PieChart}
        subtitle="Incomplete submissions"
        loading={loading}
      />
      <StatCard
        title="Completion Rate"
        value={`${analytics?.completionRate ?? 0}%`}
        icon={TrendingUp}
        subtitle="Finished vs started"
        loading={loading}
      />
    </div>
  );
}
