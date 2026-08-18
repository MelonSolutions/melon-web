'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/context/AuthContext';
import {
  Target,
  FileText,
  BarChart3,
  MapPin,
  ArrowRight,
  Plus,
  Users,
  Shield,
  TrendingUp,
  Activity,
  ClipboardList,
  MessageSquare,
  CheckCircle2,
  Info,
  Loader2,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { useOverview } from '@/hooks/useOverview';
import {
  getResponseTrendData,
  getKYCBreakdownData,
  getRecentActivityData,
  getRegionalDistribution as fetchRegionalDistribution,
  ResponseTrendPoint,
  KYCBreakdown,
  ActivityItem,
  RegionalDistribution,
} from '@/lib/api/overview';
import { ResponseTrendChart } from '@/components/overview/ResponseTrendChart';
import { KYCStatusChart } from '@/components/overview/KYCStatusChart';
import { ActivityFeed } from '@/components/overview/ActivityFeed';
import { getOrganizations } from '@/lib/api/kyc';

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  external?: boolean;
}

// Helper for rendering unified time range options (Relative Periods + Specific Months)
function renderTimeFilterOptions(availableMonths?: string[]) {
  const months =
    availableMonths && availableMonths.length > 0
      ? availableMonths
      : Array.from({ length: 12 }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        });

  return (
    <>
      <optgroup label="Relative Period">
        <option value="1month">Last 30 Days</option>
        <option value="3months">Last 3 Months</option>
        <option value="6months">Last 6 Months</option>
        <option value="1year">Last Year</option>
        <option value="all">All Time</option>
      </optgroup>
      <optgroup label="Specific Month">
        {months.map((m) => {
          const [year, month] = m.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1, 1);
          const label = date.toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          });
          return (
            <option key={m} value={`month:${m}`}>
              {label}
            </option>
          );
        })}
      </optgroup>
    </>
  );
}

// Helper for parsing select value into { timeframe, month }
function parseTimeValue(value: string): { timeframe: string; month: string } {
  if (value.startsWith('month:')) {
    return { timeframe: '1month', month: value.replace('month:', '') };
  }
  return { timeframe: value, month: '' };
}

// Helper for getting current select value from { timeframe, month }
function getTimeValue(timeframe: string, month: string): string {
  if (month) return `month:${month}`;
  return timeframe || '6months';
}

// Helper for rendering organization options
function renderOrgOptions(organizations: any[]) {
  return (
    <>
      <option value="">All Organizations</option>
      {organizations.map((org) => (
        <option key={org._id || org.id} value={org._id || org.id}>
          {org.name}
        </option>
      ))}
    </>
  );
}

// -------------------------------------------------------------
// Component-specific Card: Survey Response Trends
// -------------------------------------------------------------
function SurveyResponseTrendsCard({
  initialData,
  availableMonths,
  organizations,
  isMelonAdmin,
  globalTimeframe,
  globalOrgId,
  globalMonth,
}: {
  initialData: ResponseTrendPoint[];
  availableMonths?: string[];
  organizations: any[];
  isMelonAdmin?: boolean;
  globalTimeframe: string;
  globalOrgId: string;
  globalMonth: string;
}) {
  const [data, setData] = useState<ResponseTrendPoint[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const [timeframe, setTimeframe] = useState(globalTimeframe);
  const [orgId, setOrgId] = useState(globalOrgId);
  const [month, setMonth] = useState(globalMonth);

  useEffect(() => {
    setTimeframe(globalTimeframe);
    setOrgId(globalOrgId);
    setMonth(globalMonth);
    setData(initialData);
  }, [globalTimeframe, globalOrgId, globalMonth, initialData]);

  const hasCustomFilter =
    timeframe !== globalTimeframe || orgId !== globalOrgId || month !== globalMonth;

  const handleTimeChange = async (val: string) => {
    const { timeframe: tf, month: m } = parseTimeValue(val);
    setTimeframe(tf);
    setMonth(m);
    setLoading(true);
    try {
      const res = await getResponseTrendData(tf, orgId, m);
      setData(res);
    } catch (err) {
      console.error('Failed fetching trend:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrgChange = async (val: string) => {
    setOrgId(val);
    setLoading(true);
    try {
      const res = await getResponseTrendData(timeframe, val, month);
      setData(res);
    } catch (err) {
      console.error('Failed fetching trend:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setTimeframe(globalTimeframe);
    setOrgId(globalOrgId);
    setMonth(globalMonth);
    setLoading(true);
    try {
      const res = await getResponseTrendData(globalTimeframe, globalOrgId, globalMonth);
      setData(res);
    } catch (err) {
      console.error('Failed resetting trend:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Survey Response Trends
            </CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Daily survey responses recorded over time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                hasCustomFilter || showFilterDrawer
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasCustomFilter && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 ml-0.5"></span>
              )}
            </button>
            <Link href="/reports">
              <Button variant="ghost" size="sm">
                View Surveys
              </Button>
            </Link>
          </div>
        </div>

        {/* Micro Filter Drawer */}
        {showFilterDrawer && (
          <div className="mt-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200 flex flex-wrap items-center gap-3 transition-all">
            {isMelonAdmin && (
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] font-semibold uppercase text-gray-400 mb-1">
                  Organization
                </label>
                <select
                  value={orgId}
                  onChange={(e) => handleOrgChange(e.target.value)}
                  className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer pr-6 truncate font-medium"
                >
                  {renderOrgOptions(organizations)}
                </select>
              </div>
            )}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-[10px] font-semibold uppercase text-gray-400 mb-1">
                Time Range / Month
              </label>
              <select
                value={getTimeValue(timeframe, month)}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer pr-6 truncate font-medium"
              >
                {renderTimeFilterOptions(availableMonths)}
              </select>
            </div>
            {hasCustomFilter && (
              <div className="self-end pb-0.5">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
                  title="Reset component filters to global defaults"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 min-h-[280px]">
        {loading ? (
          <div className="h-full min-h-[280px] flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <ResponseTrendChart data={data || []} />
        )}
      </CardContent>
    </Card>
  );
}

// -------------------------------------------------------------
// Component-specific Card: KYC Status Donut
// -------------------------------------------------------------
function KYCStatusCardSection({
  initialData,
  availableMonths,
  organizations,
  isMelonAdmin,
  globalOrgId,
  globalMonth,
}: {
  initialData: KYCBreakdown;
  availableMonths?: string[];
  organizations: any[];
  isMelonAdmin?: boolean;
  globalOrgId: string;
  globalMonth: string;
}) {
  const [data, setData] = useState<KYCBreakdown>(initialData);
  const [loading, setLoading] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const [orgId, setOrgId] = useState(globalOrgId);
  const [month, setMonth] = useState(globalMonth);

  useEffect(() => {
    setOrgId(globalOrgId);
    setMonth(globalMonth);
    setData(initialData);
  }, [globalOrgId, globalMonth, initialData]);

  const hasCustomFilter = orgId !== globalOrgId || month !== globalMonth;

  const handleOrgChange = async (val: string) => {
    setOrgId(val);
    setLoading(true);
    try {
      const res = await getKYCBreakdownData(val, month);
      setData(res);
    } catch (err) {
      console.error('Failed fetching KYC breakdown:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = async (val: string) => {
    const { month: m } = parseTimeValue(val);
    setMonth(m);
    setLoading(true);
    try {
      const res = await getKYCBreakdownData(orgId, m);
      setData(res);
    } catch (err) {
      console.error('Failed fetching KYC breakdown:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setOrgId(globalOrgId);
    setMonth(globalMonth);
    setLoading(true);
    try {
      const res = await getKYCBreakdownData(globalOrgId, globalMonth);
      setData(res);
    } catch (err) {
      console.error('Failed resetting KYC breakdown:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              KYC Status
            </CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Verification breakdown</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                hasCustomFilter || showFilterDrawer
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
              {hasCustomFilter && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 ml-0.5"></span>
              )}
            </button>
            <Link href="/kyc">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </div>

        {/* Micro Filter Drawer */}
        {showFilterDrawer && (
          <div className="mt-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200 flex flex-wrap items-center gap-3 transition-all">
            {isMelonAdmin && (
              <div className="flex-1 min-w-[130px]">
                <label className="block text-[10px] font-semibold uppercase text-gray-400 mb-1">
                  Organization
                </label>
                <select
                  value={orgId}
                  onChange={(e) => handleOrgChange(e.target.value)}
                  className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer pr-6 truncate font-medium"
                >
                  {renderOrgOptions(organizations)}
                </select>
              </div>
            )}
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-semibold uppercase text-gray-400 mb-1">
                Time Range / Month
              </label>
              <select
                value={getTimeValue('6months', month)}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer pr-6 truncate font-medium"
              >
                {renderTimeFilterOptions(availableMonths)}
              </select>
            </div>
            {hasCustomFilter && (
              <div className="self-end pb-0.5">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
                  title="Reset component filters to global defaults"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        {loading ? (
          <div className="h-full min-h-[220px] flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <KYCStatusChart
            data={
              data || {
                pending: 0,
                assigned: 0,
                inReview: 0,
                verificationSubmitted: 0,
                verified: 0,
                rejected: 0,
                total: 0,
              }
            }
          />
        )}
      </CardContent>
    </Card>
  );
}

// -------------------------------------------------------------
// Component-specific Card: Recent Activity Feed
// -------------------------------------------------------------
function RecentActivityCardSection({
  initialData,
  availableMonths,
  organizations,
  isMelonAdmin,
  globalOrgId,
  globalMonth,
}: {
  initialData: ActivityItem[];
  availableMonths?: string[];
  organizations: any[];
  isMelonAdmin?: boolean;
  globalOrgId: string;
  globalMonth: string;
}) {
  const [data, setData] = useState<ActivityItem[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const [orgId, setOrgId] = useState(globalOrgId);
  const [month, setMonth] = useState(globalMonth);

  useEffect(() => {
    setOrgId(globalOrgId);
    setMonth(globalMonth);
    setData(initialData);
  }, [globalOrgId, globalMonth, initialData]);

  const hasCustomFilter = orgId !== globalOrgId || month !== globalMonth;

  const handleOrgChange = async (val: string) => {
    setOrgId(val);
    setLoading(true);
    try {
      const res = await getRecentActivityData(val, month);
      setData(res);
    } catch (err) {
      console.error('Failed fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = async (val: string) => {
    const { month: m } = parseTimeValue(val);
    setMonth(m);
    setLoading(true);
    try {
      const res = await getRecentActivityData(orgId, m);
      setData(res);
    } catch (err) {
      console.error('Failed fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setOrgId(globalOrgId);
    setMonth(globalMonth);
    setLoading(true);
    try {
      const res = await getRecentActivityData(globalOrgId, globalMonth);
      setData(res);
    } catch (err) {
      console.error('Failed resetting activities:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-orange-500" />
              Recent Activity
            </CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Latest KYC status changes and survey response submissions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                hasCustomFilter || showFilterDrawer
                  ? 'bg-orange-50 border-orange-200 text-orange-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
              {hasCustomFilter && (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 ml-0.5"></span>
              )}
            </button>
          </div>
        </div>

        {/* Micro Filter Drawer */}
        {showFilterDrawer && (
          <div className="mt-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200 flex flex-wrap items-center gap-3 transition-all">
            {isMelonAdmin && (
              <div className="flex-1 min-w-[130px]">
                <label className="block text-[10px] font-semibold uppercase text-gray-400 mb-1">
                  Organization
                </label>
                <select
                  value={orgId}
                  onChange={(e) => handleOrgChange(e.target.value)}
                  className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer pr-6 truncate font-medium"
                >
                  {renderOrgOptions(organizations)}
                </select>
              </div>
            )}
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-semibold uppercase text-gray-400 mb-1">
                Time Range / Month
              </label>
              <select
                value={getTimeValue('6months', month)}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer pr-6 truncate font-medium"
              >
                {renderTimeFilterOptions(availableMonths)}
              </select>
            </div>
            {hasCustomFilter && (
              <div className="self-end pb-0.5">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
                  title="Reset component filters to global defaults"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        {loading ? (
          <div className="h-full min-h-[220px] flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <ActivityFeed activities={data || []} />
        )}
      </CardContent>
    </Card>
  );
}

// -------------------------------------------------------------
// Component-specific Card: Regional Distribution
// -------------------------------------------------------------
function RegionalDistributionCardSection({
  initialData,
  organizations,
  isMelonAdmin,
  globalOrgId,
}: {
  initialData: RegionalDistribution[];
  organizations: any[];
  isMelonAdmin?: boolean;
  globalOrgId: string;
}) {
  const [data, setData] = useState<RegionalDistribution[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const [orgId, setOrgId] = useState(globalOrgId);

  useEffect(() => {
    setOrgId(globalOrgId);
    setData(initialData);
  }, [globalOrgId, initialData]);

  const hasCustomFilter = orgId !== globalOrgId;

  const handleOrgChange = async (val: string) => {
    setOrgId(val);
    setLoading(true);
    try {
      const res = await fetchRegionalDistribution(val);
      setData(res);
    } catch (err) {
      console.error('Failed fetching regional distribution:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setOrgId(globalOrgId);
    setLoading(true);
    try {
      const res = await fetchRegionalDistribution(globalOrgId);
      setData(res);
    } catch (err) {
      console.error('Failed resetting regional distribution:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!data || data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>Regional Distribution</CardTitle>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-72 p-2.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50">
                  Dynamic geographical breakdown aggregated directly from active Portfolio projects and beneficiary counts in MongoDB.
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Program reach and beneficiary coverage across regional zones
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isMelonAdmin && (
              <button
                onClick={() => setShowFilterDrawer(!showFilterDrawer)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                  hasCustomFilter || showFilterDrawer
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
                {hasCustomFilter && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-0.5"></span>
                )}
              </button>
            )}
            <Link href="/map-view">
              <Button variant="primary" size="sm" icon={<MapPin className="w-3.5 h-3.5" />}>
                View Map
              </Button>
            </Link>
          </div>
        </div>

        {/* Micro Filter Drawer */}
        {showFilterDrawer && isMelonAdmin && (
          <div className="mt-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200 flex flex-wrap items-center gap-3 transition-all">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-[10px] font-semibold uppercase text-gray-400 mb-1">
                Organization
              </label>
              <select
                value={orgId}
                onChange={(e) => handleOrgChange(e.target.value)}
                className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer pr-6 truncate font-medium"
              >
                {renderOrgOptions(organizations)}
              </select>
            </div>
            {hasCustomFilter && (
              <div className="self-end pb-0.5">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.map((region, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300 transition-all shadow-sm"
              >
                <h4 className="text-xs font-bold text-gray-700 tracking-wider mb-3 uppercase">
                  {region.region.replace(/_/g, ' ')}
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-[var(--color-primary)]">{region.projects}</p>
                    <p className="text-xs text-gray-500">Active Projects</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{region.beneficiaries}</p>
                    <p className="text-xs text-gray-500">Beneficiaries Reached</p>
                  </div>
                  {region.coverage > 0 && (
                    <div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                        <div
                          className="bg-[var(--color-primary)] h-1.5 rounded-full"
                          style={{ width: `${region.coverage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{region.coverage}% area coverage</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// -------------------------------------------------------------
// Main Overview Page
// -------------------------------------------------------------
export default function OverviewPage() {
  const router = useRouter();
  const { user, organization, isTrial, isLoading: authLoading } = useAuthContext();
  const isMelonAdmin = organization?.name?.toLowerCase().includes('melon');

  useEffect(() => {
    if (!authLoading && isTrial) {
      router.push('/reports');
    }
  }, [isTrial, authLoading, router]);

  const [timeframe, setTimeframe] = useState('6months');
  const [organizationId, setOrganizationId] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [organizations, setOrganizations] = useState<any[]>([]);

  useEffect(() => {
    async function fetchOrgs() {
      if (isMelonAdmin) {
        try {
          const orgs = await getOrganizations(isMelonAdmin);
          setOrganizations(orgs);
        } catch (error) {
          console.error('Failed to fetch organizations:', error);
        }
      }
    }
    fetchOrgs();
  }, [isMelonAdmin]);

  const {
    dashboardStats,
    regionalDistribution,
    loading,
    error,
  } = useOverview(timeframe, organizationId, monthFilter);

  // Handle unified top bar time select change
  const handleGlobalTimeChange = (val: string) => {
    const { timeframe: tf, month: m } = parseTimeValue(val);
    setTimeframe(tf);
    setMonthFilter(m);
  };

  const quickActions: QuickAction[] = [
    {
      title: 'Create New Survey',
      description: 'Set up a new data collection form',
      href: '/reports/create',
      icon: FileText,
    },
    {
      title: 'New Project',
      description: 'Start a new program or initiative',
      href: '/portfolio/create',
      icon: Target,
    },
    {
      title: 'Add KYC Request',
      description: 'Verify a new customer',
      href: '/kyc/create',
      icon: Users,
    },
    {
      title: 'View Map Data',
      description: 'Explore geospatial insights',
      href: '/map-view',
      icon: MapPin,
    },
    {
      title: 'Partner Onboarding Docs',
      description: 'API & Dashboard Overview guide',
      href: 'https://docs.google.com/document/d/1PlHuAmveWWKn_fxkmAN3XBtZnGUbHlnVb8GBBuTh_48/edit?tab=t.0',
      icon: FileText,
      external: true,
    },
  ];

  if (loading && !dashboardStats) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-white rounded-xl border border-gray-200 p-5 animate-pulse"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="h-7 w-14 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-5 w-36 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-52 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3">Failed to load dashboard data</p>
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const hasProjects = dashboardStats?.totalPrograms?.value !== '0';

  return (
    <div className="space-y-6">
      {/* Unified Global Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-gray-500 mt-1">
            Global metrics control bar — use individual component filter buttons below for localized drill-downs
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {isMelonAdmin && (
            <div className="w-full sm:w-56">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Organization
              </label>
              <select
                className="w-full truncate px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer transition-colors pr-8 text-gray-800"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.6rem center',
                  backgroundSize: '1.1rem',
                }}
              >
                {renderOrgOptions(organizations)}
              </select>
            </div>
          )}
          <div className="w-full sm:w-52">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Time Range / Month
            </label>
            <select
              value={getTimeValue(timeframe, monthFilter)}
              onChange={(e) => handleGlobalTimeChange(e.target.value)}
              className="w-full truncate px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer transition-colors pr-8 text-gray-800"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.6rem center',
                backgroundSize: '1.1rem',
              }}
            >
              {renderTimeFilterOptions(dashboardStats?.availableMonths)}
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics — 7 cards */}
      {dashboardStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <StatCard
            label={dashboardStats.totalPrograms?.description || 'Total Programs'}
            value={dashboardStats.totalPrograms?.value || '0'}
            icon={<Target className="w-5 h-5" />}
          />
          <StatCard
            label={dashboardStats.activeProjects?.description || 'Active Projects'}
            value={dashboardStats.activeProjects?.value || '0'}
            icon={<Activity className="w-5 h-5" />}
          />
          <StatCard
            label={dashboardStats.beneficiaries?.description || 'Beneficiaries'}
            value={dashboardStats.beneficiaries?.value || '0'}
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            label={dashboardStats.verifiedUsers?.description || 'Verified Customers'}
            value={dashboardStats.verifiedUsers?.value || '0'}
            icon={<CheckCircle2 className="w-5 h-5" />}
          />
          <StatCard
            label={dashboardStats.pendingKYC?.description || 'Pending KYC'}
            value={dashboardStats.pendingKYC?.value || '0'}
            icon={<Shield className="w-5 h-5" />}
          />
          <StatCard
            label={dashboardStats.totalSurveys?.description || 'Surveys Created'}
            value={dashboardStats.totalSurveys?.value || '0'}
            icon={<ClipboardList className="w-5 h-5" />}
          />
          <StatCard
            label={dashboardStats.totalResponses?.description || 'Survey Responses'}
            value={dashboardStats.totalResponses?.value || '0'}
            icon={<MessageSquare className="w-5 h-5" />}
          />
        </div>
      )}

      {/* Empty State - No Projects */}
      {!hasProjects && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Programs Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start by creating your first program to begin tracking impact and managing projects.
              </p>
              <Link href="/portfolio/create">
                <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
                  Create Your First Program
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Charts Row */}
      {dashboardStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SurveyResponseTrendsCard
              initialData={dashboardStats.responseTrend || []}
              availableMonths={dashboardStats.availableMonths}
              organizations={organizations}
              isMelonAdmin={isMelonAdmin}
              globalTimeframe={timeframe}
              globalOrgId={organizationId}
              globalMonth={monthFilter}
            />
          </div>
          <div>
            <KYCStatusCardSection
              initialData={
                dashboardStats.kycBreakdown || {
                  pending: 0,
                  assigned: 0,
                  inReview: 0,
                  verificationSubmitted: 0,
                  verified: 0,
                  rejected: 0,
                  total: 0,
                }
              }
              availableMonths={dashboardStats.availableMonths}
              organizations={organizations}
              isMelonAdmin={isMelonAdmin}
              globalOrgId={organizationId}
              globalMonth={monthFilter}
            />
          </div>
        </div>
      )}

      {/* Activity Feed + Quick Actions Row */}
      {dashboardStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivityCardSection
              initialData={dashboardStats.recentActivity || []}
              availableMonths={dashboardStats.availableMonths}
              organizations={organizations}
              isMelonAdmin={isMelonAdmin}
              globalOrgId={organizationId}
              globalMonth={monthFilter}
            />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link 
                      key={index} 
                      href={action.href}
                      {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[var(--color-primary)] hover:bg-gray-50 transition-colors group">
                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-[var(--color-primary-light)] transition-colors">
                          <Icon className="w-4 h-4 text-gray-600 group-hover:text-[var(--color-primary)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{action.title}</p>
                          <p className="text-xs text-gray-500 truncate">{action.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[var(--color-primary)]" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Regional Distribution — Real Database Aggregation */}
      {regionalDistribution && regionalDistribution.length > 0 && (
        <RegionalDistributionCardSection
          initialData={regionalDistribution}
          organizations={organizations}
          isMelonAdmin={isMelonAdmin}
          globalOrgId={organizationId}
        />
      )}
    </div>
  );
}