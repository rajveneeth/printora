import { paymentEnvironment } from '@/lib/validation/environment';
import { MockPaymentProvider } from './mockPaymentProvider';
import type { PaymentProviderAdapter } from './paymentProvider.model';
import { RazorpayPaymentProvider } from './razorpayPaymentProvider';

export const createPaymentProvider = (): PaymentProviderAdapter => {
  if (paymentEnvironment.PAYMENT_PROVIDER === 'mock') {
    if (
      process.env.NODE_ENV === 'production' &&
      !paymentEnvironment.ALLOW_MOCK_PAYMENTS_IN_PRODUCTION
    ) {
      throw new Error('Mock payments are disabled in production.');
    }
    return new MockPaymentProvider();
  }
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET } = paymentEnvironment;
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET || !RAZORPAY_WEBHOOK_SECRET) {
    throw new Error('Razorpay configuration is incomplete.');
  }
  return new RazorpayPaymentProvider({
    keyId: RAZORPAY_KEY_ID,
    keySecret: RAZORPAY_KEY_SECRET,
    webhookSecret: RAZORPAY_WEBHOOK_SECRET,
  });
};
