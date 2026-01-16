import React from 'react';
import { Button } from '@/components/ui/Button';

interface FilterBarProps {
  onFilter?: () => void;
  onExport?: () => void;
  onShare?: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  onFilter,
  onExport,
  onShare,
}) => {
  return (
    <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 mb-6">
      <Button
        variant="primary"
        className="flex items-center"
        onClick={onFilter}
      >
        <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
        </svg>
        Filter
      </Button>
      
      <Button
        variant="primary"
        className="flex items-center"
        onClick={onExport}
      >
        <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        Export
      </Button>
      
      <Button
        variant="primary"
        className="flex items-center"
        onClick={onShare}
      >
        <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
        </svg>
        Share
      </Button>
    </div>
  );
};

export default FilterBar;