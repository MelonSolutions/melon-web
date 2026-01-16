'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useProjectActions } from '@/hooks/usePortfolio';
import { useModal } from '@/components/ui/Modal';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { 
  CreateProjectRequest, 
  ProjectSector, 
  ProjectRegion, 
  FundingSource,
} from '@/types/portfolio';

export default function CreateProjectPage() {
  const router = useRouter();
  const { createProject, loading } = useProjectActions();
  const { openModal } = useModal();
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [formData, setFormData] = useState<CreateProjectRequest>({
    title: '',
    description: '',
    sector: 'HEALTH',
    region: 'NORTHERN_REGION',
    startDate: '',
    endDate: '',
    totalBudget: 0,
    targetHouseholds: 0,
    fundingSource: undefined,
    teamMembers: [],
    tags: [],
  });

  const sectors: { value: ProjectSector; label: string }[] = [
    { value: 'HEALTH', label: 'Health' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'ENERGY', label: 'Energy' },
    { value: 'AGRICULTURE', label: 'Agriculture' },
    { value: 'FINANCE', label: 'Finance' },
    { value: 'ENVIRONMENT', label: 'Environment' },
    { value: 'TECHNOLOGY', label: 'Technology' },
    { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
    { value: 'SOCIAL_SERVICES', label: 'Social Services' },
    { value: 'ECONOMIC_DEVELOPMENT', label: 'Economic Development' },
  ];

  const regions: { value: ProjectRegion; label: string }[] = [
    { value: 'NORTHERN_REGION', label: 'Northern Region' },
    { value: 'SOUTHERN_REGION', label: 'Southern Region' },
    { value: 'EASTERN_REGION', label: 'Eastern Region' },
    { value: 'WESTERN_REGION', label: 'Western Region' },
    { value: 'CENTRAL_REGION', label: 'Central Region' },
    { value: 'NORTH_EAST', label: 'North East' },
    { value: 'NORTH_WEST', label: 'North West' },
    { value: 'SOUTH_EAST', label: 'South East' },
    { value: 'SOUTH_WEST', label: 'South West' },
  ];

  const fundingSources: { value: FundingSource; label: string }[] = [
    { value: 'GOVERNMENT', label: 'Government' },
    { value: 'PRIVATE_FOUNDATION', label: 'Private Foundation' },
    { value: 'INTERNATIONAL_DONOR', label: 'International Donor' },
    { value: 'CORPORATE_SPONSOR', label: 'Corporate Sponsor' },
    { value: 'CROWDFUNDING', label: 'Crowdfunding' },
    { value: 'BANK_LOAN', label: 'Bank Loan' },
    { value: 'VENTURE_CAPITAL', label: 'Venture Capital' },
    { value: 'GRANT', label: 'Grant' },
    { value: 'INTERNAL_FUNDING', label: 'Internal Funding' },
    { value: 'MIXED_FUNDING', label: 'Mixed Funding' },
  ];

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setFormData(prev => ({ 
        ...prev, 
        tags: updatedTags.map(name => ({ name, color: '#3B82F6' }))
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    setFormData(prev => ({ 
      ...prev, 
      tags: updatedTags.map(name => ({ name, color: '#3B82F6' }))
    }));
  };

  const showAlert = (title: string, description: string) => {
    openModal({
      type: 'error',
      title,
      description,
      actions: [
        {
          label: 'OK',
          variant: 'primary',
          onClick: () => {},
        }
      ]
    }, { size: 'sm' });
  };

  const handleSubmit = async (isDraft = false) => {
    try {
      if (!formData.title.trim()) {
        showAlert('Required Field', 'Please enter a project title');
        return;
      }

      if (!formData.startDate || !formData.endDate) {
        showAlert('Required Fields', 'Please select start and end dates');
        return;
      }

      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        showAlert('Invalid Dates', 'End date must be after start date');
        return;
      }

      if (formData.totalBudget <= 0) {
        showAlert('Invalid Budget', 'Please enter a valid budget amount');
        return;
      }

      const projectData: CreateProjectRequest = {
        ...formData,
        status: isDraft ? 'DRAFT' : 'ACTIVE',
        progressPercentage: 0,
        impactScore: 0,
        spentBudget: 0,
        actualHouseholds: 0,
      };
      
      const result = await createProject(projectData);
      
      if (result) {
        router.push(`/portfolio/${result._id}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      showAlert('Error', 'Failed to create project. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/portfolio" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Create New Project</h1>
              <p className="text-sm text-gray-600">Set up a new project for your portfolio</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/portfolio')}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button 
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Project
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                placeholder="Enter project title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors resize-none"
                placeholder="Describe your project objectives and scope"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector *
                </label>
                <CustomSelect
                  value={formData.sector}
                  onChange={(value) => setFormData(prev => ({ ...prev, sector: value as ProjectSector }))}
                  options={sectors}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region *
                </label>
                <CustomSelect
                  value={formData.region}
                  onChange={(value) => setFormData(prev => ({ ...prev, region: value as ProjectRegion }))}
                  options={regions}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Budget & Resources */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Budget & Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Budget *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  value={formData.totalBudget || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalBudget: Number(e.target.value) }))}
                  className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Households
              </label>
              <input
                type="number"
                value={formData.targetHouseholds || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, targetHouseholds: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coverage Area (km²)
              </label>
              <input
                type="number"
                value={formData.coverageArea || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, coverageArea: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funding Source
              </label>
              <CustomSelect
                value={formData.fundingSource || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, fundingSource: value as FundingSource || undefined }))}
                options={[
                  { value: '', label: 'Select funding source' },
                  ...fundingSources
                ]}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                placeholder="Specific location or address"
              />
            </div>
          </div>
        </div>

        {/* Project Goals */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Project Goals</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objectives
              </label>
              <textarea
                value={formData.objectives?.join('\n') || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  objectives: e.target.value.split('\n').filter(line => line.trim()) 
                }))}
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors resize-none"
                placeholder="Enter each objective on a new line"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Outcomes
              </label>
              <textarea
                value={formData.expectedOutcomes?.join('\n') || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  expectedOutcomes: e.target.value.split('\n').filter(line => line.trim()) 
                }))}
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors resize-none"
                placeholder="Enter each outcome on a new line"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potential Risks
              </label>
              <textarea
                value={formData.risks?.join('\n') || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  risks: e.target.value.split('\n').filter(line => line.trim()) 
                }))}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors resize-none"
                placeholder="Enter each risk on a new line"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors resize-none"
                placeholder="Any additional notes or comments"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Tags</h2>
          
          <div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-[#5B94E5] text-white text-sm font-medium rounded-lg hover:bg-[#4A7BC8] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-sm bg-gray-100 text-gray-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
