import type { ProductStatus } from '@/models/product.model';

const sellerTransitions = {
  DRAFT: ['PENDING_REVIEW', 'ARCHIVED'],
  PENDING_REVIEW: ['ARCHIVED'],
  CHANGES_REQUESTED: ['DRAFT', 'PENDING_REVIEW', 'ARCHIVED'],
  APPROVED: ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'],
  REJECTED: ['DRAFT', 'PENDING_REVIEW', 'ARCHIVED'],
  PUBLISHED: ['PENDING_REVIEW', 'PAUSED', 'ARCHIVED'],
  PAUSED: ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'],
  ARCHIVED: [],
} as const satisfies Record<ProductStatus, readonly ProductStatus[]>;

export const canSellerTransitionProduct = (
  currentStatus: ProductStatus,
  nextStatus: ProductStatus,
): boolean => sellerTransitions[currentStatus].some((status) => status === nextStatus);

export const getStatusAfterSellerEdit = (currentStatus: ProductStatus): ProductStatus => {
  if (currentStatus === 'DRAFT') {
    return 'DRAFT';
  }
  if (currentStatus === 'PENDING_REVIEW' || currentStatus === 'ARCHIVED') {
    throw new Error('This product cannot be edited in its current status.');
  }
  return 'DRAFT';
};
