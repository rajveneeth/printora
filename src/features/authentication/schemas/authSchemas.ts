import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export const signUpSchema = signInSchema.extend({
  name: z.string().trim().min(2).max(80),
  role: z.enum(['CUSTOMER', 'SELLER']).default('CUSTOMER'),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
