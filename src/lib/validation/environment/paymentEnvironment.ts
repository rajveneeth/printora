import { z } from 'zod';

const optionalCredential = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().min(1).optional(),
);

export const paymentEnvironmentSchema = z
  .object({
    PAYMENT_PROVIDER: z.enum(['mock', 'razorpay']).default('mock'),
    ALLOW_MOCK_PAYMENTS_IN_PRODUCTION: z.stringbool().default(false),
    RAZORPAY_KEY_ID: optionalCredential,
    RAZORPAY_KEY_SECRET: optionalCredential,
    RAZORPAY_WEBHOOK_SECRET: optionalCredential,
  })
  .superRefine((configuration, context) => {
    if (configuration.PAYMENT_PROVIDER !== 'razorpay') return;
    const requiredCredentials = [
      ['RAZORPAY_KEY_ID', configuration.RAZORPAY_KEY_ID],
      ['RAZORPAY_KEY_SECRET', configuration.RAZORPAY_KEY_SECRET],
      ['RAZORPAY_WEBHOOK_SECRET', configuration.RAZORPAY_WEBHOOK_SECRET],
    ] as const;
    requiredCredentials.forEach(([name, value]) => {
      if (!value) {
        context.addIssue({
          code: 'custom',
          message: `${name} is required when PAYMENT_PROVIDER is razorpay.`,
          path: [name],
        });
      }
    });
  });

export const paymentEnvironment = paymentEnvironmentSchema.parse(process.env);
