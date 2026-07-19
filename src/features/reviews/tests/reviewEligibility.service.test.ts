import { calculateAverageRating, getReviewEligibilityError } from '../services';

const eligibleRecord = {
  orderItemId: 'item-1',
  buyerId: 'buyer-1',
  sellerUserId: 'seller-1',
  productId: 'product-1',
  orderStatus: 'DELIVERED',
  fulfilmentStatus: 'DELIVERED',
  hasProductReview: false,
  hasSellerReview: false,
} as const;

describe('review eligibility', () => {
  it('allows only the buyer of a delivered item to review it once', () => {
    expect(getReviewEligibilityError('buyer-1', eligibleRecord)).toBeNull();
    expect(getReviewEligibilityError('buyer-2', eligibleRecord)).toMatch(/not available/i);
    expect(
      getReviewEligibilityError('buyer-1', { ...eligibleRecord, fulfilmentStatus: 'SHIPPED' }),
    ).toMatch(/after delivery/i);
    expect(
      getReviewEligibilityError('buyer-1', { ...eligibleRecord, hasProductReview: true }),
    ).toMatch(/already/i);
  });

  it('prevents a seller from reviewing their own product', () => {
    expect(
      getReviewEligibilityError('buyer-1', { ...eligibleRecord, sellerUserId: 'buyer-1' }),
    ).toMatch(/own products/i);
  });

  it('calculates a stable one-decimal aggregate', () => {
    expect(calculateAverageRating([5, 4, 4])).toBe(4.3);
    expect(calculateAverageRating([])).toBe(0);
  });
});
