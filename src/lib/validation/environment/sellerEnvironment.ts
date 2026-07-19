import { z } from 'zod';

export const sellerEnvironmentSchema = z.object({
  SELLER_DASHBOARD_ENABLED: z.stringbool().default(true),
  SELLER_IMAGE_MAX_COUNT: z.coerce.number().int().min(1).max(12).default(8),
  SELLER_IMAGE_MAX_BYTES: z.coerce.number().int().min(1024).default(5_242_880),
});

export const sellerEnvironment = sellerEnvironmentSchema.parse(process.env);
