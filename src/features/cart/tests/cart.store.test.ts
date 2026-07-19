import type { CartItemInput } from '../models';
import { createCartLineId, useCartStore } from '../store';

const input: CartItemInput = {
  productId: 'product-phone-minimal',
  productSlug: 'minimal-phone-stand',
  productName: 'Minimal Phone Stand',
  sellerId: 'seller-pixel',
  sellerName: 'Pixel Crafts',
  variantId: 'variant-charcoal',
  variantName: 'Charcoal matte',
  selectedOptions: [{ label: 'Colour', value: 'Charcoal' }],
  quantity: 2,
  minimumQuantity: 1,
  maximumQuantity: 4,
  availableStock: 3,
  unitPriceInPaise: 34_900,
  imageUrl: '/catalogue/minimal-phone-stand.svg',
};

describe('cart store', () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.setState({ items: [], isHydrated: true });
  });

  it('merges matching selections and clamps quantity to available stock', () => {
    useCartStore.getState().addItem(input);
    useCartStore.getState().addItem(input);

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]?.quantity).toBe(3);
  });

  it('updates and removes a line by its stable selection key', () => {
    useCartStore.getState().addItem(input);
    const lineId = createCartLineId(input);
    useCartStore.getState().updateQuantity(lineId, 1);
    expect(useCartStore.getState().items[0]?.quantity).toBe(1);

    useCartStore.getState().removeItem(lineId);
    expect(useCartStore.getState().items).toEqual([]);
  });
});
