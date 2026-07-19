import { z } from 'zod';

export const addressSchema = z.object({
  kind: z.enum(['SHIPPING', 'BILLING', 'BOTH']),
  fullName: z.string().trim().min(2, 'Enter the recipient’s full name.').max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s-]{8,16}$/, 'Enter a valid phone number.'),
  line1: z.string().trim().min(5, 'Enter the building and street address.').max(160),
  line2: z.string().trim().max(160).optional(),
  city: z.string().trim().min(2, 'Enter a city.').max(80),
  state: z.string().trim().min(2, 'Enter a state.').max(80),
  postalCode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit PIN code.'),
  country: z.literal('India'),
  isDefault: z.boolean(),
});

export type AddressInput = z.infer<typeof addressSchema>;
