import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { BarChart3 } from 'lucide-react';

/**
 * Quick access button for KYC Visualizations
 * Add this to your KYC dashboard header or toolbar
 */
export function VisualizationButton() {
  return (
    <Link href="/kyc/visualizations">
      <Button variant="secondary">
        <BarChart3 className="h-4 w-4 mr-2" />
        Visualizations
      </Button>
    </Link>
  );
}
