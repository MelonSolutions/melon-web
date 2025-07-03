'use client';

import { ReportCard } from './ReportCard';

interface Report {
  _id: string;
  title: string;
  description?: string;
  category: string;
  status: 'draft' | 'published' | 'closed';
  responseCount: number;
  createdAt: string;
  updatedAt: string;
  lastResponseAt?: string;
}

interface ReportsListProps {
  reports: Report[];
  view: 'grid' | 'list';
  onRefetch: () => void;
}

export function ReportsList({ reports, view, onRefetch }: ReportsListProps) {
  if (view === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <ReportCard
            key={report._id}
            report={report}
            view="grid"
            onRefetch={onRefetch}
          />
        ))}
      </div>
    );
  }

  // List view
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
          <div className="col-span-4">Report</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Responses</div>
          <div className="col-span-2">Last Updated</div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {reports.map((report) => (
          <ReportCard
            key={report._id}
            report={report}
            view="list"
            onRefetch={onRefetch}
          />
        ))}
      </div>
    </div>
  );
}