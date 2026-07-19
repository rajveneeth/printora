import { z } from 'zod';

const sellerOrderStatuses = [
  'CONFIRMED',
  'IN_PRODUCTION',
  'READY_TO_SHIP',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
] as const;

export const sellerOrderTransitionSchema = z
  .object({
    orderNumber: z.string().trim().min(1).max(40),
    nextStatus: z.enum(sellerOrderStatuses),
    note: z.string().trim().min(5, 'Add a short fulfilment note.').max(240),
    trackingNumber: z.string().trim().max(80).optional(),
    carrier: z.string().trim().max(80).optional(),
  })
  .superRefine((input, context) => {
    if (input.nextStatus === 'SHIPPED' && (!input.trackingNumber || !input.carrier)) {
      context.addIssue({
        code: 'custom',
        message: 'Carrier and tracking number are required when an order ships.',
        path: ['trackingNumber'],
      });
    }
  });
