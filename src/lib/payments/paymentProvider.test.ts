import { createHmac } from 'node:crypto';
import { MockPaymentProvider, type PaymentFetch, RazorpayPaymentProvider } from '@/lib/payments';

describe('payment providers', () => {
  it('requires the mock adapter to return an explicit simulated provider result', async () => {
    const provider = new MockPaymentProvider();
    const order = await provider.createOrder({
      amountInPaise: 10_000,
      currency: 'INR',
      receipt: 'FMV-TEST',
    });
    const result = await provider.verifyPayment({
      providerOrderId: order.providerOrderId,
      expectedAmountInPaise: 10_000,
      currency: 'INR',
      mockOutcome: 'success',
    });

    expect(result.status).toBe('SUCCEEDED');
    expect(result.payload.simulated).toBe(true);
  });

  it('verifies Razorpay checkout signatures and fetches captured provider state', async () => {
    const providerOrderId = 'order_verified';
    const providerPaymentId = 'pay_verified';
    const secret = 'test_secret';
    const fetchImplementation: PaymentFetch = async () => ({
      ok: true,
      json: async () => ({
        id: providerPaymentId,
        order_id: providerOrderId,
        amount: 10_000,
        currency: 'INR',
        status: 'captured',
        captured: true,
        error_description: null,
      }),
    });
    const provider = new RazorpayPaymentProvider({
      keyId: 'rzp_test_key',
      keySecret: secret,
      webhookSecret: 'webhook_secret',
      fetchImplementation,
    });
    const signature = createHmac('sha256', secret)
      .update(`${providerOrderId}|${providerPaymentId}`)
      .digest('hex');
    const result = await provider.verifyPayment({
      providerOrderId,
      providerPaymentId,
      signature,
      expectedAmountInPaise: 10_000,
      currency: 'INR',
    });

    expect(result.status).toBe('SUCCEEDED');
  });

  it('rejects a Razorpay callback with a mismatched signature before paid state', async () => {
    const provider = new RazorpayPaymentProvider({
      keyId: 'rzp_test_key',
      keySecret: 'test_secret',
      webhookSecret: 'webhook_secret',
      fetchImplementation: async () => ({ ok: true, json: async () => ({}) }),
    });
    const result = await provider.verifyPayment({
      providerOrderId: 'order_invalid',
      providerPaymentId: 'pay_invalid',
      signature: 'invalid',
      expectedAmountInPaise: 10_000,
      currency: 'INR',
    });

    expect(result.status).toBe('FAILED');
  });
});
