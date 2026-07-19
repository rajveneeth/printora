import type { ProductStatus } from '@/models/product.model';
import type { SellerVerificationStatus } from '@/models/seller.model';

export type ProductModerationDecision =
  'APPROVE' | 'APPROVE_AND_PUBLISH' | 'REQUEST_CHANGES' | 'REJECT';
export type SellerModerationDecision = 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT' | 'SUSPEND';

export const getProductModerationStatus = (
  currentStatus: ProductStatus,
  decision: ProductModerationDecision,
): ProductStatus => {
  const allowedStatuses: Readonly<Record<ProductModerationDecision, readonly ProductStatus[]>> = {
    APPROVE: ['PENDING_REVIEW', 'CHANGES_REQUESTED'],
    APPROVE_AND_PUBLISH: ['PENDING_REVIEW', 'CHANGES_REQUESTED', 'APPROVED'],
    REQUEST_CHANGES: ['PENDING_REVIEW'],
    REJECT: ['PENDING_REVIEW', 'CHANGES_REQUESTED'],
  };
  if (!allowedStatuses[decision].includes(currentStatus)) {
    throw new Error('This product is not in a state that supports the selected decision.');
  }
  if (decision === 'APPROVE') return 'APPROVED';
  if (decision === 'APPROVE_AND_PUBLISH') return 'PUBLISHED';
  if (decision === 'REQUEST_CHANGES') return 'CHANGES_REQUESTED';
  return 'REJECTED';
};

export const getSellerModerationStatus = (
  currentStatus: SellerVerificationStatus,
  decision: SellerModerationDecision,
): SellerVerificationStatus => {
  const allowedStatuses: Readonly<
    Record<SellerModerationDecision, readonly SellerVerificationStatus[]>
  > = {
    APPROVE: ['PENDING', 'CHANGES_REQUESTED', 'REJECTED'],
    REQUEST_CHANGES: ['PENDING'],
    REJECT: ['PENDING', 'CHANGES_REQUESTED'],
    SUSPEND: ['APPROVED'],
  };
  if (!allowedStatuses[decision].includes(currentStatus)) {
    throw new Error('This seller is not in a state that supports the selected decision.');
  }
  if (decision === 'APPROVE') return 'APPROVED';
  if (decision === 'REQUEST_CHANGES') return 'CHANGES_REQUESTED';
  if (decision === 'SUSPEND') return 'SUSPENDED';
  return 'REJECTED';
};
