'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartItemInput, CartState } from '../models';

export const createCartLineId = (input: CartItemInput): string =>
  [input.productId, input.variantId ?? 'base', input.customisation?.trim() ?? ''].join(':');

const clampQuantity = (input: CartItemInput, quantity: number): number =>
  Math.min(input.availableStock, input.maximumQuantity, Math.max(input.minimumQuantity, quantity));

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isHydrated: false,
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
    }),
    {
      name: 'formivo-shopping-bag-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
);
