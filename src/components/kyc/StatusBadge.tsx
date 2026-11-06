import { AddressData, VerificationStatus, getAddressExceptions, getStatusDisplayName } from '@/types/kyc';
import { Badge } from '@/components/ui/Badge';

interface StatusBadgeProps {
  status: VerificationStatus;
  /**
   * Pass for a request's overall status: a VERIFIED request with an address
   * that didn't pass shows as "Verified · Exception". Leave out for a single
   * address's own status.
   */
  addresses?: Pick<AddressData, 'label' | 'status' | 'isDeleted'>[];
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ status, addresses, size = 'md', className }: StatusBadgeProps) {
  const exceptions = getAddressExceptions(status, addresses);

  const variantMap: Record<VerificationStatus, 'success' | 'warning' | 'info' | 'error' | 'neutral'> = {
    PENDING: 'info',
    ASSIGNED: 'neutral',
    IN_REVIEW: 'warning',
    VERIFICATION_SUBMITTED: 'warning',
    VERIFIED: 'success',
    NOT_APPROVED: 'warning',
    REJECTED: 'error',
    EXPIRED: 'neutral',
  };

  if (exceptions.length > 0) {
    const detail = exceptions.map((e) => `${e.label}: ${getStatusDisplayName(e.status)}`).join(', ');
    return (
      <Badge
        variant="warning"
        size={size}
        dot
        className={className}
        title={`Verified, but not every address passed (${detail})`}
        aria-label={`Verified with exception. ${detail}`}
      >
        Verified · Exception
      </Badge>
    );
  }

  return (
    <Badge variant={variantMap[status]} size={size} dot className={className}>
      {getStatusDisplayName(status)}
    </Badge>
  );
}
