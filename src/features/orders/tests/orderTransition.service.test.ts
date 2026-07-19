import {
  canSellerTransitionOrder,
  deriveMarketplaceOrderStatus,
  getSellerOrderTransitions,
} from '../services';

describe('order status transitions', () => {
  it('permits only the next fulfilment step', () => {
    expect(getSellerOrderTransitions('PAID')).toEqual(['CONFIRMED']);
    expect(canSellerTransitionOrder('PAID', 'CONFIRMED')).toBe(true);
    expect(canSellerTransitionOrder('PAID', 'DELIVERED')).toBe(false);
    expect(canSellerTransitionOrder('CONFIRMED', 'CANCELLED')).toBe(false);
  });

  it('treats terminal fulfilment states as immutable for sellers', () => {
    expect(getSellerOrderTransitions('DELIVERED')).toEqual([]);
    expect(getSellerOrderTransitions('CANCELLED')).toEqual([]);
  });

  it('derives the marketplace status from the slowest active seller group', () => {
    expect(deriveMarketplaceOrderStatus(['SHIPPED', 'IN_PRODUCTION'], 'PAID')).toBe(
      'IN_PRODUCTION',
    );
    expect(deriveMarketplaceOrderStatus(['DELIVERED', 'CANCELLED'], 'PAID')).toBe('DELIVERED');
    expect(deriveMarketplaceOrderStatus(['CANCELLED', 'CANCELLED'], 'PAID')).toBe('CANCELLED');
  });
});
