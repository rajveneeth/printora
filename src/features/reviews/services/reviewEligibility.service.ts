import type { ReviewEligibilityRecord } from '../models';

export const calculateAverageRating = (ratings: readonly number[]): number => {
  if (!ratings.length) return 0;
  return (
    Math.round((ratings.reduce((total, rating) => total + rating, 0) / ratings.length) * 10) / 10
  );
};

export const getReviewEligibilityError = (
  userId: string,
  record: ReviewEligibilityRecord | null,
): string | null => {
  if (!record || record.buyerId !== userId) return 'This purchase is not available for review.';
  if (!record.productId) return 'This product is no longer available for review.';
  if (record.sellerUserId === userId) return 'Sellers cannot review their own products.';
  if ((record.fulfilmentStatus ?? record.orderStatus) !== 'DELIVERED') {
    return 'A review can be submitted only after delivery.';
  }
  if (record.hasProductReview || record.hasSellerReview) {
    return 'A review has already been submitted for this order item.';
  }
  return null;
};
