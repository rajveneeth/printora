export interface CartItemOption {
  readonly label: string;
  readonly value: string;
}

export interface CartItemInput {
  readonly productId: string;
  readonly productSlug: string;
  readonly productName: string;
  readonly sellerId: string;
  readonly sellerName: string;
  readonly variantId?: string | undefined;
  readonly variantName?: string | undefined;
  readonly selectedOptions: readonly CartItemOption[];
  readonly customisation?: string | undefined;
  readonly quantity: number;
  readonly minimumQuantity: number;
  readonly maximumQuantity: number;
  readonly availableStock: number;
  readonly unitPriceInPaise: number;
  readonly imageUrl: string;
}

export interface CartItem extends CartItemInput {
  readonly lineId: string;
}

export interface CartTotals {
  readonly itemCount: number;
  readonly subtotalInPaise: number;
  readonly taxInPaise: number;
  readonly shippingInPaise: number;
  readonly totalInPaise: number;
}

export interface CartSellerGroup {
  readonly sellerId: string;
  readonly sellerName: string;
  readonly items: readonly CartItem[];
  readonly subtotalInPaise: number;
  readonly shippingInPaise: number;
}

export interface CartState {
  readonly items: readonly CartItem[];
  readonly isHydrated: boolean;
  readonly guestCartId: string;
  readonly isAccountCart: boolean;
  addItem: (input: CartItemInput) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
  markHydrated: () => void;
  setSynchronizedCart: (items: readonly CartItem[]) => void;
  startGuestCart: () => void;
}

export interface CartSyncLineInput {
  readonly productSlug: string;
  readonly variantId?: string | undefined;
  readonly customisation?: string | undefined;
  readonly quantity: number;
}

export type CartSyncResult =
  | { readonly status: 'authenticated'; readonly items: readonly CartItem[] }
  | { readonly status: 'anonymous' }
  | { readonly status: 'error'; readonly message: string };
