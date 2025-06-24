"use client";

import React from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  BarChart,
  LineChart,
  Map,
  Calendar,
  Download,
  Share2,
  Filter,
  FileText,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import MetricsDoughnut from "@/components/dashboard/MetricsDoughnut";

export default function OverviewPage() {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "reports", label: "Reports" },
    { id: "analytics", label: "Analytics" },
    { id: "insights", label: "Insights" },
  ];

  const sectorData = [
    { name: 'Healthcare', value: 32, color: '#10b981' },
    { name: 'Agriculture', value: 28, color: '#3b82f6' },
    { name: 'Energy', value: 24, color: '#f59e0b' },
    { name: 'Infrastructure', value: 16, color: '#8b5cf6' },
  ];

  const recentPrograms = [
    {
      id: 1,
      name: "Health Facility Coverage Rate",
      sector: "Healthcare",
      progress: 78,
      beneficiaries: 2600,
      lastUpdated: "28/04/2025",
    },
    {
      id: 2,
      name: "Electricity Access Rate",
      sector: "Agriculture",
      progress: 92,
      beneficiaries: 5200,
      lastUpdated: "01/05/2025",
    },
    {
      id: 3,
      name: "Crop Yield per Hectare covered",
      sector: "Energy",
      progress: 65,
      beneficiaries: 1840,
      lastUpdated: "30/04/2025",
    },
    {
      id: 4,
      name: "Road Accessibility Index",
      sector: "Infrastructure",
      progress: 45,
      beneficiaries: 980,
      lastUpdated: "25/04/2025",
    },
  ];
  
  const upcomingReports = [
    {
      title: "Q2 Impact Report",
      dueIn: "5 days",
    },
    {
      title: "Donor Presentation",
      dueIn: "12 days",
    },
    {
      title: "Stakeholder Review",
      dueIn: "18 days",
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start">
              <div>
                <div className="text-3xl font-medium">24</div>
                <div className="mt-1 flex items-center text-sm text-green-600">
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                  <span>+12% from last quarter</span>
                </div>
              </div>
              <div className="ml-auto flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                <FileText className="h-6 w-6 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start">
              <div>
                <div className="text-3xl font-medium">86</div>
                <div className="mt-1 flex items-center text-sm text-green-600">
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                  <span>+8% from last quarter</span>
                </div>
              </div>
              <div className="ml-auto flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                <BarChart className="h-6 w-6 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Beneficiaries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start">
              <div>
                <div className="text-3xl font-medium">12.5K</div>
                <div className="mt-1 flex items-center text-sm text-green-600">
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                  <span>+18% from last quarter</span>
                </div>
              </div>
              <div className="ml-auto flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                <Users className="h-6 w-6 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Impact Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start">
              <div>
                <div className="text-3xl font-medium">87%</div>
                <div className="mt-1 flex items-center text-sm text-red-600">
                  <ArrowDownRight className="mr-1 h-4 w-4" />
                  <span>-3% from target</span>
                </div>
              </div>
              <div className="ml-auto flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                <BarChart className="h-6 w-6 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="inline-flex h-10 items-center rounded-md bg-gray-100 p-1 text-gray-600">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                tab.id === "overview"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-10">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="h-10">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="h-10">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Program Progress */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col space-y-1.5">
              <CardTitle className="text-xl font-semibold">Program Progress</CardTitle>
              <p className="text-sm text-gray-500">Tracking key performance indicators across key sectors</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {recentPrograms.map((program) => (
              <div key={program.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      program.sector === "Healthcare" && "bg-green-100 text-green-800",
                      program.sector === "Agriculture" && "bg-blue-100 text-blue-800",
                      program.sector === "Energy" && "bg-yellow-100 text-yellow-800",
                      program.sector === "Infrastructure" && "bg-purple-100 text-purple-800",
                    )}>
                      {program.sector}
                    </span>
                    <p className="text-sm font-medium text-gray-900">{program.name}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{program.progress}%</p>
                </div>
                <Progress 
                  value={program.progress} 
                  className={cn(
                    "h-2 w-full",
                    program.sector === "Healthcare" && "bg-green-100 [&>div]:bg-green-600",
                    program.sector === "Agriculture" && "bg-blue-100 [&>div]:bg-blue-600",
                    program.sector === "Energy" && "bg-yellow-100 [&>div]:bg-yellow-600",
                    program.sector === "Infrastructure" && "bg-purple-100 [&>div]:bg-purple-600",
                  )}
                />
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Programs
            </Button>
          </CardFooter>
        </Card>

        {/* Impact Metrics */}
        <Card className="border-0 shadow-sm">
        <CardHeader>
            <div className="flex flex-col space-y-1.5">
            <CardTitle className="text-xl font-semibold">Impact Metrics</CardTitle>
            <p className="text-sm text-gray-500">Key performance indicators across sectors</p>
            </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
            <MetricsDoughnut data={sectorData} showLegend={false} />
        </CardContent>
        <CardFooter>
            <div className="flex flex-wrap gap-4 justify-center w-full">
            <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-green-500"></span>
                <p className="text-xs text-gray-600">Healthcare (32%)</p>
            </div>
            <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                <p className="text-xs text-gray-600">Agriculture (28%)</p>
            </div>
            <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-500"></span>
                <p className="text-xs text-gray-600">Energy (24%)</p>
            </div>
            <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-purple-500"></span>
                <p className="text-xs text-gray-600">Infrastructure (16%)</p>
            </div>
            </div>
        </CardFooter>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center">
            <div className="space-y-1.5">
              <CardTitle className="text-xl font-semibold">Trend Analysis</CardTitle>
              <p className="text-sm text-gray-500">Program performance over time</p>
            </div>
            <Select defaultValue="6months">
              <SelectTrigger className="w-[180px] mt-2 sm:mt-0">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <LineChart className="h-32 w-32 text-gray-200" />
          </div>
        </CardContent>
      </Card>

      {/* Regional Distribution & Upcoming Reports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col space-y-1.5">
              <CardTitle className="text-xl font-semibold">Regional Distribution</CardTitle>
              <p className="text-sm text-gray-500">Program coverage across different regions</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] flex items-center justify-center">
              <Map className="h-36 w-36 text-gray-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col space-y-1.5">
              <CardTitle className="text-xl font-semibold">Upcoming Reports</CardTitle>
              <p className="text-sm text-gray-500">Scheduled reports and deadlines</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingReports.map((report, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                    <Calendar className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{report.title}</p>
                    <p className="text-xs text-gray-500">Due in {report.dueIn}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View Calendar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}