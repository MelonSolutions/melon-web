import { VerificationStatus, getStatusDisplayName } from '@/types/kyc';
import { Badge } from '@/components/ui/Badge';

interface StatusBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const displayName = getStatusDisplayName(status);

  const variantMap: Record<VerificationStatus, 'success' | 'warning' | 'info' | 'error' | 'neutral'> = {
    PENDING: 'info',
    ASSIGNED: 'neutral',
    IN_REVIEW: 'warning',
    VERIFICATION_SUBMITTED: 'warning',
    VERIFIED: 'success',
    REJECTED: 'error',
  };

  return (
    <Badge 
      variant={variantMap[status]} 
      size={size}
      dot
    >
      {displayName}
    </Badge>
  );
}
