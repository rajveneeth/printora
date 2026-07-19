import type { PaymentProviderAdapter } from '@/lib/payments';
import { CheckoutService, type CheckoutRepositoryContract } from '../services';

const checkoutInput = {
  addressId: 'address-1',
  idempotencyKey: '4f97e39e-99f3-4a6c-93c8-322977ad395f',
  items: [
    {
      productSlug: 'minimal-phone-stand',
      variantId: 'variant-1',
      quantity: 1,
      displayedUnitPriceInPaise: 34_900,
      selectedOptions: [{ label: 'Colour', value: 'Charcoal' }],
    },
  ],
} as const;

const pendingCheckout = {
  paymentId: 'payment-1',
  orderId: 'order-1',
  orderNumber: 'FMV-2026-TEST',
  provider: 'MOCK',
  amountInPaise: 49_082,
  currency: 'INR',
  isExisting: false,
} as const;

const createRepository = (): CheckoutRepositoryContract => ({
  createPendingCheckout: jest.fn().mockResolvedValue(pendingCheckout),
  attachProviderOrder: jest.fn().mockResolvedValue(undefined),
  findPaymentForUser: jest.fn().mockResolvedValue({
    paymentId: 'payment-1',
    orderNumber: pendingCheckout.orderNumber,
    provider: 'MOCK',
    providerOrderId: 'mock_order_1',
    amountInPaise: pendingCheckout.amountInPaise,
    currency: 'INR',
    status: 'PENDING',
  }),
  finalizePayment: jest.fn().mockResolvedValue({
    status: 'SUCCEEDED',
    orderNumber: pendingCheckout.orderNumber,
  }),
  failProviderOrder: jest.fn().mockResolvedValue(undefined),
});

const createProvider = (): PaymentProviderAdapter => ({
  provider: 'MOCK',
  createOrder: jest.fn().mockResolvedValue({
    provider: 'MOCK',
    providerOrderId: 'mock_order_1',
    amountInPaise: pendingCheckout.amountInPaise,
    currency: 'INR',
  }),
  verifyPayment: jest.fn().mockResolvedValue({
    status: 'SUCCEEDED',
    providerPaymentId: 'mock_payment_1',
    providerEventId: 'mock:event:1',
    eventType: 'mock.payment.succeeded',
    payload: { simulated: true },
  }),
});

describe('CheckoutService', () => {
  it('creates the provider order only after the pending database checkout exists', async () => {
    const repository = createRepository();
    const provider = createProvider();
    const result = await new CheckoutService(repository, provider).createCheckout(
      'buyer-1',
      'session-1',
      checkoutInput,
    );

    expect(repository.createPendingCheckout).toHaveBeenCalledWith({
      userId: 'buyer-1',
      sessionId: 'session-1',
      provider: 'MOCK',
      checkout: checkoutInput,
    });
    expect(provider.createOrder).toHaveBeenCalledWith({
      amountInPaise: pendingCheckout.amountInPaise,
      currency: 'INR',
      receipt: pendingCheckout.orderNumber,
    });
    expect(repository.attachProviderOrder).toHaveBeenCalledWith('payment-1', 'mock_order_1');
    expect(result.status).toBe('success');
  });

  it('compensates the reservation when provider-order creation fails', async () => {
    const repository = createRepository();
    const provider = createProvider();
    jest.mocked(provider.createOrder).mockRejectedValueOnce(new Error('provider unavailable'));

    await expect(
      new CheckoutService(repository, provider).createCheckout(
        'buyer-1',
        'session-1',
        checkoutInput,
      ),
    ).rejects.toThrow('reserved stock has been released');
    expect(repository.failProviderOrder).toHaveBeenCalledWith(
      'payment-1',
      'The payment provider could not prepare this checkout.',
    );
  });

  it('finalizes paid state only after the provider adapter returns success', async () => {
    const repository = createRepository();
    const provider = createProvider();
    const result = await new CheckoutService(repository, provider).confirmPayment('buyer-1', {
      provider: 'MOCK',
      paymentId: 'payment-1',
      outcome: 'success',
    });

    expect(provider.verifyPayment).toHaveBeenCalledWith({
      providerOrderId: 'mock_order_1',
      expectedAmountInPaise: pendingCheckout.amountInPaise,
      currency: 'INR',
      mockOutcome: 'success',
    });
    expect(repository.finalizePayment).toHaveBeenCalledWith(
      expect.objectContaining({ paymentId: 'payment-1' }),
    );
    expect(result).toEqual({ status: 'succeeded', orderNumber: pendingCheckout.orderNumber });
  });
});
