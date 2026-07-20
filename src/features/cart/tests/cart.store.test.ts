import type { CartItemInput } from '../models';
import { createCartLineId } from '../services';
import {
  CART_RETENTION_IN_MILLISECONDS,
  CART_STORAGE_KEY,
  createGuestCartId,
  isCartPersistenceFresh,
  useCartStore,
} from '../store';

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
    useCartStore.setState({
      items: [],
      isHydrated: true,
      guestCartId: createGuestCartId(),
      isAccountCart: false,
    });
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

  it('expires anonymous cart persistence after 30 days', () => {
    const now = Date.now();
    expect(isCartPersistenceFresh(now - CART_RETENTION_IN_MILLISECONDS, now)).toBe(true);
    expect(isCartPersistenceFresh(now - CART_RETENTION_IN_MILLISECONDS - 1, now)).toBe(false);
    expect(isCartPersistenceFresh(now + 1, now)).toBe(false);
  });

  it('does not retain authenticated account items in local storage', () => {
    useCartStore.getState().addItem(input);
    useCartStore.getState().setSynchronizedCart(useCartStore.getState().items);
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '{}') as {
      state?: { items?: unknown[]; isAccountCart?: boolean };
    };
    expect(stored.state?.isAccountCart).toBe(true);
    expect(stored.state?.items).toEqual([]);
  });
});
