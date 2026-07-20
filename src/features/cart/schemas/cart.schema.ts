import { z } from 'zod';

export const cartSyncLineSchema = z.object({
  productSlug: z.string().trim().min(1).max(160),
  variantId: z.string().trim().min(1).max(160).optional(),
  customisation: z.string().trim().max(500).optional(),
  quantity: z.number().int().min(1).max(10_000),
});

export const guestCartSyncSchema = z.object({
  guestCartId: z.string().uuid(),
  items: z.array(cartSyncLineSchema).max(50),
});

export const accountCartSaveSchema = z.object({
  items: z.array(cartSyncLineSchema).max(50),
});
