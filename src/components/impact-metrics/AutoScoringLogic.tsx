'use client';

export function AutoScoringLogic() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Auto-Scoring Logic</h3>
      <p className="text-sm text-gray-500 mb-6">How metrics are automatically scored</p>
      
      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Achieved</p>
            <p className="text-sm text-gray-500">≥100% of target</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
            <div className="w-2 h-2 bg-[#5B94E5] rounded-full"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">On Track</p>
            <p className="text-sm text-gray-500">70-99% of target</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Failed</p>
            <p className="text-sm text-gray-500">&lt;70% of target</p>
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          Status is automatically calculated based on actual vs target values and updated in real-time.
        </p>
      </div>
    </div>
  );
}