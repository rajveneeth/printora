import { z } from 'zod';

const checkoutCartLineSchema = z.object({
  productSlug: z.string().trim().min(1).max(160),
  variantId: z.string().trim().min(1).max(160).optional(),
  quantity: z.number().int().min(1).max(10_000),
  displayedUnitPriceInPaise: z.number().int().positive().max(100_000_000),
  customisation: z.string().trim().max(500).optional(),
  selectedOptions: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(40),
        value: z.string().trim().min(1).max(100),
      }),
    )
    .max(12),
});

export const createCheckoutSchema = z.object({
  addressId: z.string().trim().min(1),
  idempotencyKey: z.string().uuid(),
  items: z.array(checkoutCartLineSchema).min(1, 'Your shopping bag is empty.').max(50),
});

export const paymentConfirmationSchema = z.discriminatedUnion('provider', [
  z.object({
    provider: z.literal('MOCK'),
    paymentId: z.string().trim().min(1),
    outcome: z.enum(['success', 'failure']),
  }),
  z.object({
    provider: z.literal('RAZORPAY'),
    paymentId: z.string().trim().min(1),
    providerOrderId: z.string().trim().min(1),
    providerPaymentId: z.string().trim().min(1),
    signature: z.string().trim().min(1),
  }),
]);
