import {
  calculateCartTotals,
  calculateLineTax,
  calculateSellerShipping,
  FREE_SHIPPING_THRESHOLD_IN_PAISE,
  SELLER_SHIPPING_IN_PAISE,
} from '../services';

describe('cart pricing', () => {
  it('calculates integer tax, one shipping charge per seller, and the final total', () => {
    const lines = [
      { sellerId: 'seller-a', quantity: 2, unitPriceInPaise: 34_900 },
      { sellerId: 'seller-a', quantity: 1, unitPriceInPaise: 27_900 },
      { sellerId: 'seller-b', quantity: 1, unitPriceInPaise: 44_900 },
    ];
    const totals = calculateCartTotals(lines);

    expect(totals.itemCount).toBe(4);
    expect(totals.subtotalInPaise).toBe(142_600);
    expect(totals.taxInPaise).toBe(lines.reduce((sum, line) => sum + calculateLineTax(line), 0));
    expect(totals.shippingInPaise).toBe(SELLER_SHIPPING_IN_PAISE * 2);
    expect(totals.totalInPaise).toBe(
      totals.subtotalInPaise + totals.taxInPaise + totals.shippingInPaise,
    );
  });

  it('makes seller-group delivery free at the threshold', () => {
    expect(calculateSellerShipping(FREE_SHIPPING_THRESHOLD_IN_PAISE - 1)).toBe(
      SELLER_SHIPPING_IN_PAISE,
    );
    expect(calculateSellerShipping(FREE_SHIPPING_THRESHOLD_IN_PAISE)).toBe(0);
  });
});
