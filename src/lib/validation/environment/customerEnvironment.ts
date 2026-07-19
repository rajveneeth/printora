import { z } from 'zod';

export const customerEnvironmentSchema = z.object({
  CUSTOMER_DASHBOARD_ENABLED: z.stringbool().default(true),
});

export const customerEnvironment = customerEnvironmentSchema.parse(process.env);
