import { ImpactMetricsStats } from '@/types/impact-metrics';
import { Target, CheckCircle2, XCircle, Activity, BarChart3, TrendingUp, Award, Gauge } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';

interface MetricsHeaderProps {
  stats: ImpactMetricsStats;
}

export function MetricsHeader({ stats }: MetricsHeaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      <StatCard
        label="Total Metrics"
        value={stats.totalMetrics}
        description="Active indicators tracked"
        icon={<Activity className="w-5 h-5 text-primary" />}
      />
      <StatCard
        label="Achieved"
        value={stats.achievedMetrics ?? stats.achieved}
        description="Targets fully reached"
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
      />
      <StatCard
        label="On Track"
        value={stats.onTrackMetrics ?? 0}
        description="Steady progression"
        icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
      />
      <StatCard
        label="Failing"
        value={stats.failingMetrics ?? stats.failed}
        description="Requiring intervention"
        icon={<XCircle className="w-5 h-5 text-error" />}
      />
      <StatCard
        label="Overall Score"
        value={`${stats.overallScore ?? 0}/${stats.totalScoringWeight ?? 0}`}
        description="Weighted platform score"
        icon={<Award className="w-5 h-5 text-amber-500" />}
      />
      <StatCard
        label="Avg Progress"
        value={`${stats.avgProgress ?? 0}%`}
        description="Mean metric completion"
        icon={<Gauge className="w-5 h-5 text-primary" />}
      />
    </div>
  );
}