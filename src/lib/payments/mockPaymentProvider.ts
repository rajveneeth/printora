import { randomUUID } from 'node:crypto';
import type {
  CreateProviderOrderInput,
  PaymentProviderAdapter,
  ProviderOrder,
  ProviderPaymentResult,
  VerifyProviderPaymentInput,
} from './paymentProvider.model';

export class MockPaymentProvider implements PaymentProviderAdapter {
  readonly provider = 'MOCK' as const;

  async createOrder(input: CreateProviderOrderInput): Promise<ProviderOrder> {
    return {
      provider: this.provider,
      providerOrderId: `mock_order_${randomUUID()}`,
      amountInPaise: input.amountInPaise,
      currency: input.currency,
    };
  }

  async verifyPayment(input: VerifyProviderPaymentInput): Promise<ProviderPaymentResult> {
    if (!input.providerOrderId.startsWith('mock_order_')) {
      return this.failure('The simulated provider order is invalid.');
    }
    if (!input.mockOutcome) {
      return this.failure('Choose a simulated payment result.');
    }
    const providerPaymentId = `mock_payment_${randomUUID()}`;
    if (input.mockOutcome === 'failure') {
      return this.failure('The simulated payment was declined.', providerPaymentId);
    }
    return {
      status: 'SUCCEEDED',
      providerPaymentId,
      providerEventId: `mock:payment.succeeded:${providerPaymentId}`,
      eventType: 'mock.payment.succeeded',
      payload: {
        providerOrderId: input.providerOrderId,
        providerPaymentId,
        simulated: true,
      },
    };
  }

  private failure(reason: string, providerPaymentId?: string): ProviderPaymentResult {
    const eventReference = providerPaymentId ?? randomUUID();
    return {
      status: 'FAILED',
      ...(providerPaymentId ? { providerPaymentId } : {}),
      providerEventId: `mock:payment.failed:${eventReference}`,
      eventType: 'mock.payment.failed',
      reason,
      payload: { simulated: true, reason },
    };
  }
}
