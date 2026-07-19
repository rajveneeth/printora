import { z } from 'zod';
import {
  adminEnvironmentSchema,
  customerEnvironmentSchema,
  paymentEnvironmentSchema,
  sellerEnvironmentSchema,
  sharedEnvironmentSchema,
} from './environment';
import { developmentRateLimitSecret } from './environment/sharedEnvironment';

const environmentSchema = sharedEnvironmentSchema
  .merge(customerEnvironmentSchema)
  .merge(sellerEnvironmentSchema)
  .merge(adminEnvironmentSchema)
  .merge(paymentEnvironmentSchema)
  .superRefine((configuration, context) => {
    if (
      configuration.NODE_ENV === 'production' &&
      configuration.RATE_LIMIT_SECRET === developmentRateLimitSecret
    ) {
      context.addIssue({
        code: 'custom',
        message: 'RATE_LIMIT_SECRET must be replaced in production.',
        path: ['RATE_LIMIT_SECRET'],
      });
    }
  });

export type Environment = z.infer<typeof environmentSchema>;

export const environment = environmentSchema.parse(process.env);
