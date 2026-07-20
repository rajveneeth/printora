import { z } from 'zod';

export const developmentRateLimitSecret = 'formivo-development-rate-limit-secret';

export const sharedEnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().url().optional(),
  RATE_LIMIT_SECRET: z.string().min(32).default(developmentRateLimitSecret),
  TRUSTED_PROXY_HOPS: z.coerce.number().int().min(0).max(10).default(0),
});
