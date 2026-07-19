import type { CartItem, CartSellerGroup, CartTotals } from '../models';

export const MARKETPLACE_TAX_PERCENTAGE = 18;
export const SELLER_SHIPPING_IN_PAISE = 7_900;
export const FREE_SHIPPING_THRESHOLD_IN_PAISE = 150_000;

export interface PricedCartLine {
  readonly sellerId: string;
  readonly quantity: number;
  readonly unitPriceInPaise: number;
}

export const calculateLineSubtotal = (line: PricedCartLine): number =>
  line.unitPriceInPaise * line.quantity;

export const calculateLineTax = (line: PricedCartLine): number =>
  Math.round((calculateLineSubtotal(line) * MARKETPLACE_TAX_PERCENTAGE) / 100);

export const calculateSellerShipping = (subtotalInPaise: number): number =>
  subtotalInPaise >= FREE_SHIPPING_THRESHOLD_IN_PAISE ? 0 : SELLER_SHIPPING_IN_PAISE;

export const calculateShippingBySeller = (
  lines: readonly PricedCartLine[],
): ReadonlyMap<string, number> => {
  const subtotals = new Map<string, number>();
  lines.forEach((line) => {
    subtotals.set(line.sellerId, (subtotals.get(line.sellerId) ?? 0) + calculateLineSubtotal(line));
  });
  return new Map(
    Array.from(subtotals.entries()).map(([sellerId, subtotal]) => [
      sellerId,
      calculateSellerShipping(subtotal),
    ]),
  );
};

export const calculateCartTotals = (lines: readonly PricedCartLine[]): CartTotals => {
  const subtotalInPaise = lines.reduce((total, line) => total + calculateLineSubtotal(line), 0);
  const taxInPaise = lines.reduce((total, line) => total + calculateLineTax(line), 0);
  const shippingInPaise = Array.from(calculateShippingBySeller(lines).values()).reduce(
    (total, shipping) => total + shipping,
    0,
  );
  return {
    itemCount: lines.reduce((total, line) => total + line.quantity, 0),
    subtotalInPaise,
    taxInPaise,
    shippingInPaise,
    totalInPaise: subtotalInPaise + taxInPaise + shippingInPaise,
  };
};

export const groupCartItemsBySeller = (items: readonly CartItem[]): readonly CartSellerGroup[] => {
  const shippingBySeller = calculateShippingBySeller(items);
  const groupedItems = new Map<string, CartItem[]>();
  items.forEach((item) => {
    groupedItems.set(item.sellerId, [...(groupedItems.get(item.sellerId) ?? []), item]);
  });
  return Array.from(groupedItems.entries()).map(([sellerId, sellerItems]) => ({
    sellerId,
    sellerName: sellerItems[0]?.sellerName ?? 'Independent maker',
    items: sellerItems,
    subtotalInPaise: sellerItems.reduce((total, line) => total + calculateLineSubtotal(line), 0),
    shippingInPaise: shippingBySeller.get(sellerId) ?? 0,
  }));
};
