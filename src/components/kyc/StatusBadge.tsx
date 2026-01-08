// src/components/kyc/StatusBadge.tsx

import { VerificationStatus, getStatusDisplayName, getStatusColor } from '@/types/kyc';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const color = getStatusColor(status);
  const displayName = getStatusDisplayName(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const colorClasses: Record<string, string> = {
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  const getIcon = () => {
    const iconClass = iconSizes[size];
    
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle className={iconClass} />;
      case 'IN_REVIEW':
        return <Clock className={iconClass} />;
      case 'PENDING':
        return <AlertCircle className={iconClass} />;
      case 'REJECTED':
        return <XCircle className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full border
        ${sizeClasses[size]}
        ${colorClasses[color] || colorClasses.gray}
      `}
    >
      {getIcon()}
      {displayName}
    </span>
  );
}
