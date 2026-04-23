'use client';

import { QuestionAnalytics } from '@/lib/api/reports';
import BarChartComponent from '../charts/BarChartComponent';
import PieChartComponent from '../charts/PieChartComponent';

interface QuestionAnalyticsCardProps {
  analytics: QuestionAnalytics;
  loading?: boolean;
}

export default function QuestionAnalyticsCard({
  analytics,
  loading,
}: QuestionAnalyticsCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-6 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  const renderAnalyticsContent = () => {
    // For choice-based questions (multiple choice, checkboxes, dropdown)
    if (analytics.optionBreakdown && analytics.optionBreakdown.length > 0) {
      const chartData = analytics.optionBreakdown.map(item => ({
        name: item.option,
        value: item.count,
        percentage: item.percentage,
      }));

      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="min-h-[300px]">
              <BarChartComponent
                data={chartData}
                xKey="name"
                yKey="value"
                title="Response Distribution"
                height={280}
              />
            </div>
            <div className="min-h-[300px]">
              <PieChartComponent
                data={chartData}
                title="Percentage Breakdown"
                height={280}
              />
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Detailed Breakdown</h4>
            {analytics.optionBreakdown.map((option, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                <span className="text-sm font-medium text-gray-900 flex-1 mr-4 leading-relaxed">
                  {option.option}
                </span>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-sm text-gray-600 font-medium">{option.count} {option.count === 1 ? 'response' : 'responses'}</span>
                  <span className="text-sm font-bold text-[#5B94E5] min-w-[50px] text-right">
                    {option.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // For numeric questions (linear scale, number)
    if (analytics.numericStats) {
      const stats = analytics.numericStats;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Minimum</p>
              <p className="text-2xl font-bold text-gray-900">{stats.min}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Maximum</p>
              <p className="text-2xl font-bold text-gray-900">{stats.max}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Average</p>
              <p className="text-2xl font-bold text-gray-900">{stats.average.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Median</p>
              <p className="text-2xl font-bold text-gray-900">{stats.median}</p>
            </div>
          </div>

          {stats.distribution && stats.distribution.length > 0 && (
            <BarChartComponent
              data={stats.distribution}
              xKey="range"
              yKey="count"
              title="Value Distribution"
              height={250}
            />
          )}
        </div>
      );
    }

    // For text questions (short answer, paragraph)
    if (analytics.textStats) {
      const stats = analytics.textStats;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Average Words</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgWordCount}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Total Words</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalWords}</p>
            </div>
          </div>

          {stats.commonKeywords && stats.commonKeywords.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Common Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {stats.commonKeywords.slice(0, 10).map((keyword, index) => (
                  <div
                    key={index}
                    className="px-3 py-1 bg-[#5B94E5] text-white rounded-full text-sm"
                  >
                    {keyword.word} ({keyword.count})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // For time/date questions
    if (analytics.timeDistribution && analytics.timeDistribution.length > 0) {
      return (
        <BarChartComponent
          data={analytics.timeDistribution}
          xKey="period"
          yKey="count"
          title="Time Distribution"
          height={250}
        />
      );
    }

    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No visualization available for this question type
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {analytics.questionTitle}
        </h3>
        <p className="text-sm text-gray-500">
          {analytics.totalResponses} {analytics.totalResponses === 1 ? 'response' : 'responses'}
        </p>
      </div>

      {renderAnalyticsContent()}
    </div>
  );
}
