import { mergeCartQuantity, toCartSyncLines } from '../services';
import type { CartItem } from '../models';

const line: CartItem = {
  lineId: 'line',
  productId: 'product',
  productSlug: 'minimal-phone-stand',
  productName: 'Minimal Phone Stand',
  sellerId: 'seller',
  sellerName: 'Pixel Crafts',
  variantId: 'variant',
  variantName: 'Charcoal',
  selectedOptions: [],
  customisation: 'Initials: AB',
  quantity: 2,
  minimumQuantity: 1,
  maximumQuantity: 4,
  availableStock: 4,
  unitPriceInPaise: 34_900,
  imageUrl: '/catalogue/minimal-phone-stand.svg',
};

describe('cart account synchronization helpers', () => {
  it('adds guest quantities once and clamps to current server limits', () => {
    expect(mergeCartQuantity(1, 2, 1, 4)).toBe(3);
    expect(mergeCartQuantity(3, 2, 1, 4)).toBe(4);
  });

  it('sends only product selections and quantities to the authoritative server cart', () => {
    expect(toCartSyncLines([line])).toEqual([
      {
        productSlug: 'minimal-phone-stand',
        variantId: 'variant',
        customisation: 'Initials: AB',
        quantity: 2,
      },
    ]);
  });
});
