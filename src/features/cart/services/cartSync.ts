import type { CartItem, CartSyncLineInput } from '../models';

export const createCartLineId = (input: {
  readonly productId: string;
  readonly variantId?: string | undefined;
  readonly customisation?: string | undefined;
}): string =>
  [input.productId, input.variantId ?? 'base', input.customisation?.trim() ?? ''].join(':');

export const mergeCartQuantity = (
  existingQuantity: number,
  addedQuantity: number,
  minimumQuantity: number,
  maximumQuantity: number,
): number => Math.min(maximumQuantity, Math.max(minimumQuantity, existingQuantity + addedQuantity));

export const toCartSyncLines = (items: readonly CartItem[]): readonly CartSyncLineInput[] =>
  items.map((item) => ({
    productSlug: item.productSlug,
    ...(item.variantId ? { variantId: item.variantId } : {}),
    ...(item.customisation ? { customisation: item.customisation } : {}),
    quantity: item.quantity,
  }));
