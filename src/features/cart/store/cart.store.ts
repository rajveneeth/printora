'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartItem, CartItemInput, CartState } from '../models';
import { createCartLineId } from '../services/cartSync';

export const CART_STORAGE_KEY = 'formivo-shopping-bag-v2';
export const CART_RETENTION_IN_MILLISECONDS = 30 * 24 * 60 * 60 * 1_000;

interface PersistedCartState {
  readonly items: readonly CartItem[];
  readonly guestCartId: string;
  readonly isAccountCart: boolean;
  readonly persistedAt: number;
}

export const createGuestCartId = (): string => globalThis.crypto.randomUUID();

export const isCartPersistenceFresh = (persistedAt: number, now = Date.now()): boolean =>
  Number.isFinite(persistedAt) &&
  persistedAt <= now &&
  now - persistedAt <= CART_RETENTION_IN_MILLISECONDS;

const clampQuantity = (input: CartItemInput, quantity: number): number =>
  Math.min(input.availableStock, input.maximumQuantity, Math.max(input.minimumQuantity, quantity));

export const useCartStore = create<CartState>()(
  persist<CartState, [], [], PersistedCartState>(
    (set) => ({
      items: [],
      isHydrated: false,
      guestCartId: createGuestCartId(),
      isAccountCart: false,
      addItem: (input) =>
        set((state) => {
          const lineId = createCartLineId(input);
          const existingItem = state.items.find((item) => item.lineId === lineId);
          if (!existingItem) {
            return {
              items: [
                ...state.items,
                { ...input, lineId, quantity: clampQuantity(input, input.quantity) },
              ],
            };
          }
          return {
            items: state.items.map((item) =>
              item.lineId === lineId
                ? {
                    ...item,
                    quantity: clampQuantity(item, item.quantity + input.quantity),
                    unitPriceInPaise: input.unitPriceInPaise,
                    availableStock: input.availableStock,
                  }
                : item,
            ),
          };
        }),
      updateQuantity: (lineId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.lineId === lineId ? { ...item, quantity: clampQuantity(item, quantity) } : item,
          ),
        })),
      removeItem: (lineId) =>
        set((state) => ({ items: state.items.filter((item) => item.lineId !== lineId) })),
      clearCart: () => set({ items: [] }),
      markHydrated: () => set({ isHydrated: true }),
      setSynchronizedCart: (items) => set({ items, isAccountCart: true }),
      startGuestCart: () =>
        set({ items: [], guestCartId: createGuestCartId(), isAccountCart: false }),
    }),
    {
      name: CART_STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.isAccountCart ? [] : state.items,
        guestCartId: state.guestCartId,
        isAccountCart: state.isAccountCart,
        persistedAt: Date.now(),
      }),
      merge: (persistedState, currentState) => {
        const savedState = persistedState as PersistedCartState;
        if (!isCartPersistenceFresh(savedState.persistedAt)) return currentState;
        return {
          ...currentState,
          ...savedState,
          items: savedState.isAccountCart ? [] : savedState.items,
          isHydrated: false,
        };
      },
      skipHydration: true,
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
);
