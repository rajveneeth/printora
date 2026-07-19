import { render, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { authenticatedCookieName } from '@/lib/auth/constants';
import {
  hasActiveCartSessionAction,
  saveAccountCartAction,
  synchronizeGuestCartAction,
} from '../actions';
import { CartHydrator } from '../components/cart-hydrator';
import type { CartItem } from '../models';
import { useCartStore } from '../store';

jest.mock('next/navigation', () => ({ usePathname: jest.fn() }));
jest.mock('../actions', () => ({
  hasActiveCartSessionAction: jest.fn(),
  saveAccountCartAction: jest.fn(),
  synchronizeGuestCartAction: jest.fn(),
}));

const guestCartId = '4f97e39e-99f3-4a6c-93c8-322977ad395f';
const item: CartItem = {
  lineId: 'product-phone-minimal:variant-charcoal:',
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

describe('CartHydrator authentication lifecycle', () => {
  let pathname = '/products';

  beforeEach(() => {
    jest.clearAllMocks();
    pathname = '/products';
    jest.mocked(usePathname).mockImplementation(() => pathname);
    jest.mocked(hasActiveCartSessionAction).mockResolvedValue(true);
    jest.mocked(saveAccountCartAction).mockResolvedValue({
      status: 'authenticated',
      items: [item],
    });
    jest.mocked(synchronizeGuestCartAction).mockResolvedValue({
      status: 'authenticated',
      items: [item],
    });
    localStorage.clear();
    document.cookie = `${authenticatedCookieName}=; Path=/; Max-Age=0; SameSite=Lax`;
    useCartStore.setState({
      items: [item],
      isHydrated: false,
      guestCartId,
      isAccountCart: false,
    });
  });

  afterEach(() => {
    document.cookie = `${authenticatedCookieName}=; Path=/; Max-Age=0; SameSite=Lax`;
  });

  it('merges a guest cart after sign-in and clears account state after sign-out', async () => {
    const view = render(<CartHydrator />);
    await waitFor(() => expect(useCartStore.getState().isHydrated).toBe(true));
    expect(synchronizeGuestCartAction).not.toHaveBeenCalled();

    document.cookie = `${authenticatedCookieName}=1; Path=/; SameSite=Lax`;
    pathname = '/account';
    view.rerender(<CartHydrator />);

    await waitFor(() => expect(synchronizeGuestCartAction).toHaveBeenCalledTimes(1));
    expect(synchronizeGuestCartAction).toHaveBeenCalledWith({
      guestCartId,
      items: [
        {
          productSlug: item.productSlug,
          variantId: item.variantId,
          quantity: item.quantity,
        },
      ],
    });
    await waitFor(() => expect(useCartStore.getState().isAccountCart).toBe(true));

    document.cookie = `${authenticatedCookieName}=; Path=/; Max-Age=0; SameSite=Lax`;
    pathname = '/sign-in';
    view.rerender(<CartHydrator />);

    await waitFor(() => expect(useCartStore.getState().isAccountCart).toBe(false));
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('clears account state when the browser marker belongs to a revoked session', async () => {
    document.cookie = `${authenticatedCookieName}=1; Path=/; SameSite=Lax`;
    useCartStore.getState().setSynchronizedCart([item]);
    jest.mocked(hasActiveCartSessionAction).mockResolvedValue(false);

    render(<CartHydrator />);

    await waitFor(() => expect(hasActiveCartSessionAction).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(useCartStore.getState().isAccountCart).toBe(false));
    expect(useCartStore.getState().items).toEqual([]);
    expect(synchronizeGuestCartAction).not.toHaveBeenCalled();
  });
});
