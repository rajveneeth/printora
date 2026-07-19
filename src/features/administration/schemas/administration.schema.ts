import { z } from 'zod';

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().trim().max(maximum).optional(),
  );

export const categorySchema = z.object({
  id: optionalText(80),
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(90)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase URL slug.'),
  description: optionalText(500),
  parentId: optionalText(80),
  imageUrl: optionalText(500),
  icon: optionalText(80),
  seoTitle: optionalText(70),
  seoDescription: optionalText(160),
  position: z.coerce.number().int().min(0).max(10_000),
  isActive: z.preprocess((value) => value === 'true' || value === 'on', z.boolean()),
});

export const productModerationSchema = z
  .object({
    productId: z.string().trim().min(1),
    decision: z.enum(['APPROVE', 'APPROVE_AND_PUBLISH', 'REQUEST_CHANGES', 'REJECT']),
    reason: optionalText(1000),
  })
  .superRefine((input, context) => {
    if ((input.decision === 'REQUEST_CHANGES' || input.decision === 'REJECT') && !input.reason) {
      context.addIssue({
        code: 'custom',
        message: 'A moderation reason is required.',
        path: ['reason'],
      });
    }
  });

export const sellerModerationSchema = z
  .object({
    sellerId: z.string().trim().min(1),
    decision: z.enum(['APPROVE', 'REQUEST_CHANGES', 'REJECT', 'SUSPEND']),
    reason: optionalText(1000),
  })
  .superRefine((input, context) => {
    if (input.decision !== 'APPROVE' && !input.reason) {
      context.addIssue({
        code: 'custom',
        message: 'A moderation reason is required.',
        path: ['reason'],
      });
    }
  });

export const reviewModerationSchema = z.object({
  reviewId: z.string().trim().min(1),
  status: z.enum(['PUBLISHED', 'HIDDEN', 'REJECTED']),
  reason: z.string().trim().min(5).max(500),
});
