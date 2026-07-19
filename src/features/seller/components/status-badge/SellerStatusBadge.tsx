import { Badge, type BadgeTone } from '@/components/ui';
import type { ProductStatus } from '@/models/product.model';

interface SellerStatusBadgeProps {
  readonly status: ProductStatus;
}

const statusTone = {
  DRAFT: 'neutral',
  PENDING_REVIEW: 'warning',
  CHANGES_REQUESTED: 'warning',
  APPROVED: 'info',
  REJECTED: 'error',
  PUBLISHED: 'success',
  PAUSED: 'warning',
  ARCHIVED: 'neutral',
} as const satisfies Record<ProductStatus, BadgeTone>;

export function SellerStatusBadge({ status }: SellerStatusBadgeProps) {
  return <Badge tone={statusTone[status]}>{status.replaceAll('_', ' ')}</Badge>;
}
