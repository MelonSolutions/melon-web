'use client';

import { useState, useEffect } from 'react';
import QuestionAnalyticsCard from './QuestionAnalyticsCard';
import { getAllQuestionsAnalytics, QuestionAnalytics } from '@/lib/api/reports';

interface QuestionBreakdownProps {
  reportId: string;
}

export default function QuestionBreakdown({ reportId }: QuestionBreakdownProps) {
  const [analytics, setAnalytics] = useState<QuestionAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await getAllQuestionsAnalytics(reportId);
        setAnalytics(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching question analytics:', err);
        setError('Failed to load question analytics');
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

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <QuestionAnalyticsCard
            key={i}
            analytics={{} as QuestionAnalytics}
            loading={true}
          />
        ))}
      </div>
    );
  }

  if (analytics.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No questions found in this report</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {analytics.map((questionAnalytics) => (
        <QuestionAnalyticsCard
          key={questionAnalytics.questionId}
          analytics={questionAnalytics}
        />
      ))}
    </div>
  );
}
