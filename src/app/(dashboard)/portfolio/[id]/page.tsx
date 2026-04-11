'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Download, Share2, Edit3, Calendar, DollarSign, Users, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useProject } from '@/hooks/usePortfolio';
import { getStatusColor, getStatusDisplayName, getSectorDisplayName, getRegionDisplayName } from '@/types/portfolio';

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const { project, loading, error } = useProject(projectId);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'team' | 'timeline' | 'files'>('overview');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5B94E5]" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <h3 className="text-base font-medium text-gray-900 mb-2">Project not found</h3>
          <p className="text-sm text-gray-600 mb-4">{error || 'The project you are looking for does not exist.'}</p>
          <Link href="/portfolio" className="text-sm font-medium text-[#5B94E5] hover:text-[#4A7BC8]">
            Back to Portfolio
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatBudget = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const budgetUtilization = project.totalBudget > 0 
    ? Math.round((project.spentBudget / project.totalBudget) * 100) 
    : 0;

  const householdProgress = project.targetHouseholds && project.targetHouseholds > 0
    ? Math.round(((project.actualHouseholds || 0) / project.targetHouseholds) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <div className="bg-surface border-b border-border px-6 py-4 sticky top-0 z-10 shadow-sm transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/portfolio" className="p-2.5 text-gray-400 hover:text-primary hover:bg-surface-secondary rounded-xl transition-all border border-transparent hover:border-border">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{project.title}</h1>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusColor(project.status)}`}>
                  {getStatusDisplayName(project.status)}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">{project.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 bg-surface border border-border rounded-lg hover:bg-surface-secondary transition-all shadow-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 bg-surface border border-border rounded-lg hover:bg-surface-secondary transition-all shadow-sm">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="cursor-pointer inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
              <Edit3 className="w-4 h-4" />
              Edit Project
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-sm group hover:border-primary/30 transition-all">
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Impact Score</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{project.impactScore}%</p>
              <div className="w-full bg-surface-secondary rounded-full h-2 border border-border/50">
                <div 
                  className="bg-success h-2 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  style={{ width: `${project.impactScore}%` }}
                />
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-6 shadow-sm group hover:border-primary/30 transition-all">
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Households Reached</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{(project.actualHouseholds || 0).toLocaleString()}</p>
              {project.targetHouseholds && (
                <>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 italic font-medium">of {project.targetHouseholds.toLocaleString()} target</p>
                  <div className="w-full bg-surface-secondary rounded-full h-2 border border-border/50">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(91,148,229,0.3)]"
                      style={{ width: `${Math.min(householdProgress, 100)}%` }}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="bg-surface rounded-xl border border-border p-6 shadow-sm group hover:border-primary/30 transition-all">
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Budget Utilization</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{budgetUtilization}%</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 italic font-medium">{formatBudget(project.spentBudget)} used</p>
              <div className="w-full bg-surface-secondary rounded-full h-2 border border-border/50">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    budgetUtilization > 90 ? 'bg-error shadow-[0_0_8px_rgba(239,68,68,0.3)]' : budgetUtilization > 75 ? 'bg-warning shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'bg-success shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  }`}
                  style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-6 shadow-sm group hover:border-primary/30 transition-all">
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Overal Progress</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{project.progressPercentage}%</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 italic font-medium">Project completion status</p>
              <div className="w-full bg-surface-secondary rounded-full h-2 border border-border/50">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(91,148,229,0.3)]"
                  style={{ width: `${project.progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden transition-all duration-300">
            <div className="border-b border-border px-8 bg-surface-secondary/30">
              <nav className="-mb-px flex space-x-10">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'metrics', label: 'Metrics' },
                  { id: 'team', label: 'Team' },
                  { id: 'timeline', label: 'Timeline' },
                  { id: 'files', label: 'Files' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`py-5 px-1 border-b-2 font-bold text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-10">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  {/* Project Details */}
                  <div className="lg:col-span-2 space-y-10">
                    {/* Basic Info */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">Project Metadata</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex items-start gap-4">
                          <div className="p-2.5 bg-surface-secondary rounded-xl border border-border">
                            <Calendar className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Timeline</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatDate(project.startDate)} - {formatDate(project.endDate)}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="p-2.5 bg-surface-secondary rounded-xl border border-border">
                            <MapPin className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Region</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{getRegionDisplayName(project.region)}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="p-2.5 bg-surface-secondary rounded-xl border border-border">
                            <DollarSign className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Total Budget</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatBudget(project.totalBudget)}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="p-2.5 bg-surface-secondary rounded-xl border border-border">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Team Size</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{project.teamMembers.length} Professional{project.teamMembers.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Objectives */}
                    {project.objectives.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-4">Strategic Objectives</h4>
                        <div className="grid grid-cols-1 gap-3">
                          {project.objectives.map((objective, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-surface-secondary/20 hover:bg-surface-secondary/40 transition-colors">
                              <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0 shadow-[0_0_6px_rgba(91,148,229,0.5)]"></div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">{objective}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expected Outcomes */}
                    {project.expectedOutcomes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-4">Expected Outcomes</h4>
                        <div className="grid grid-cols-1 gap-3">
                          {project.expectedOutcomes.map((outcome, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-surface-secondary/20 hover:bg-surface-secondary/40 transition-colors">
                              <div className="w-2 h-2 bg-success rounded-full mt-1.5 flex-shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">{outcome}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-10">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-6">Execution Context</h3>
                      <div className="space-y-6">
                        <div className="p-5 rounded-2xl border border-border bg-surface-secondary/20 transition-all">
                          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Sector</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{getSectorDisplayName(project.sector)}</p>
                        </div>

                        <div className="p-5 rounded-2xl border border-border bg-surface-secondary/20 transition-all">
                          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Funding Source</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{project.fundingSource || 'Not specified'}</p>
                        </div>

                        <div className="p-5 rounded-2xl border border-border bg-surface-secondary/20 transition-all">
                          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Coverage Area</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{project.coverageArea ? `${project.coverageArea} km²` : 'Not specified'}</p>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Created By</p>
                          <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                            {project.createdBy?.firstName} {project.createdBy?.lastName}
                          </p>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Last Updated</p>
                          <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{formatDate(project.updatedAt)}</p>
                        </div>

                        {/* Tags */}
                        {project.tags.length > 0 && (
                          <div className="pt-4">
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Classifications</p>
                            <div className="flex flex-wrap gap-2">
                              {project.tags.map((tag, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-surface-secondary text-gray-600 dark:text-gray-400 border border-border">
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'team' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Project Personnel</h3>
                    <button className="cursor-pointer text-xs font-bold text-primary hover:text-primary-hover uppercase tracking-widest transition-colors">
                      Manage Team
                    </button>
                  </div>
                  
                  {project.teamMembers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {project.teamMembers.map((member, index) => (
                        <div key={index} className="group relative flex items-center gap-5 p-5 bg-surface-secondary/30 rounded-2xl border border-transparent hover:border-primary/30 transition-all">
                          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                            <span className="text-white font-bold text-lg">
                              {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 dark:text-gray-100 text-sm group-hover:text-primary transition-colors">{member.name}</p>
                            <p className="text-xs text-primary font-bold uppercase tracking-widest mt-0.5">{member.role}</p>
                            {member.email && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate italic font-medium">{member.email}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-24 bg-surface-secondary/20 rounded-2xl border-2 border-dashed border-border">
                      <Users className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                      <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">No team members assigned</p>
                    </div>
                  )}
                </div>
              )}

              {['metrics', 'timeline', 'files'].includes(activeTab) && (
                <div className="text-center py-32 bg-surface-secondary/10 rounded-2xl border-2 border-dashed border-border transition-all">
                  <Loader2 className="h-10 w-10 animate-spin text-primary/30 mx-auto mb-6" />
                  <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    {activeTab === 'metrics' && 'Detailed metrics and analytics coming soon'}
                    {activeTab === 'timeline' && 'Project timeline and milestones coming soon'}
                    {activeTab === 'files' && 'File attachments coming soon'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}