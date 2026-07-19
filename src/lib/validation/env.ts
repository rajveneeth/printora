import { z } from 'zod';
import {
  adminEnvironmentSchema,
  customerEnvironmentSchema,
  sellerEnvironmentSchema,
  sharedEnvironmentSchema,
} from './environment';

const environmentSchema = sharedEnvironmentSchema
  .merge(customerEnvironmentSchema)
  .merge(sellerEnvironmentSchema)
  .merge(adminEnvironmentSchema);

export type Environment = z.infer<typeof environmentSchema>;

export const environment = environmentSchema.parse(process.env);
