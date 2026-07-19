import { z } from 'zod';

export const adminEnvironmentSchema = z.object({
  ADMIN_DASHBOARD_ENABLED: z.stringbool().default(true),
});

export const adminEnvironment = adminEnvironmentSchema.parse(process.env);
