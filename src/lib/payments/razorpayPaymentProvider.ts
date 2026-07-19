import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import type {
  CreateProviderOrderInput,
  PaymentProviderAdapter,
  ProviderOrder,
  ProviderPaymentResult,
  VerifyProviderPaymentInput,
} from './paymentProvider.model';

const razorpayOrderSchema = z.object({
  id: z.string().min(1),
  amount: z.number().int().positive(),
  currency: z.literal('INR'),
});

const razorpayPaymentSchema = z.object({
  id: z.string().min(1),
  order_id: z.string().min(1),
  amount: z.number().int().positive(),
  currency: z.literal('INR'),
  status: z.enum(['created', 'authorized', 'captured', 'refunded', 'failed']),
  captured: z.boolean(),
  error_description: z.string().nullable().optional(),
});

export interface RazorpayPaymentProviderConfiguration {
  readonly keyId: string;
  readonly keySecret: string;
  readonly webhookSecret: string;
  readonly apiBaseUrl?: string | undefined;
  readonly fetchImplementation?: PaymentFetch | undefined;
}

export type PaymentFetch = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Pick<Response, 'ok' | 'json'>>;

const safeSignatureMatch = (expected: string, received: string): boolean => {
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const receivedBuffer = Buffer.from(received, 'utf8');
  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
};

export class RazorpayPaymentProvider implements PaymentProviderAdapter {
  readonly provider = 'RAZORPAY' as const;
  readonly publicKeyId: string;
  private readonly apiBaseUrl: string;
  private readonly fetchImplementation: PaymentFetch;

  constructor(private readonly configuration: RazorpayPaymentProviderConfiguration) {
    this.apiBaseUrl = configuration.apiBaseUrl ?? 'https://api.razorpay.com/v1';
    this.fetchImplementation = configuration.fetchImplementation ?? fetch;
    this.publicKeyId = configuration.keyId;
  }

  async createOrder(input: CreateProviderOrderInput): Promise<ProviderOrder> {
    const response = await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        amount: input.amountInPaise,
        currency: input.currency,
        receipt: input.receipt,
      }),
    });
    const order = razorpayOrderSchema.parse(response);
    if (order.amount !== input.amountInPaise) {
      throw new Error('The payment provider returned an unexpected order amount.');
    }
    return {
      provider: this.provider,
      providerOrderId: order.id,
      amountInPaise: order.amount,
      currency: order.currency,
      publicKeyId: this.configuration.keyId,
    };
  }

  async verifyPayment(input: VerifyProviderPaymentInput): Promise<ProviderPaymentResult> {
    if (!input.providerPaymentId || !input.signature) {
      return this.failure(input, 'Missing payment verification fields.');
    }
    const expectedSignature = createHmac('sha256', this.configuration.keySecret)
      .update(`${input.providerOrderId}|${input.providerPaymentId}`)
      .digest('hex');
    if (!safeSignatureMatch(expectedSignature, input.signature)) {
      return this.failure(input, 'Payment signature verification failed.');
    }
    return this.verifyPaymentState({
      providerOrderId: input.providerOrderId,
      providerPaymentId: input.providerPaymentId,
      expectedAmountInPaise: input.expectedAmountInPaise,
      currency: input.currency,
    });
  }

  async verifyPaymentState(input: {
    readonly providerOrderId: string;
    readonly providerPaymentId: string;
    readonly expectedAmountInPaise: number;
    readonly currency: 'INR';
  }): Promise<ProviderPaymentResult> {
    const response = await this.request(
      `/payments/${encodeURIComponent(input.providerPaymentId)}`,
      {
        method: 'GET',
      },
    );
    const payment = razorpayPaymentSchema.parse(response);
    const payload = {
      providerOrderId: payment.order_id,
      providerPaymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      captured: payment.captured,
    } as const;
    if (
      payment.order_id !== input.providerOrderId ||
      payment.amount !== input.expectedAmountInPaise ||
      payment.currency !== input.currency
    ) {
      return this.failure(input, 'The provider payment does not match this order.', payment.id);
    }
    if (payment.status === 'captured' && payment.captured) {
      return {
        status: 'SUCCEEDED',
        providerPaymentId: payment.id,
        providerEventId: `razorpay:checkout:${payment.id}:captured`,
        eventType: 'razorpay.checkout.captured',
        payload,
      };
    }
    if (payment.status === 'failed' || payment.status === 'refunded') {
      return this.failure(
        input,
        payment.error_description ?? `The provider reported ${payment.status}.`,
        payment.id,
      );
    }
    return {
      status: 'PENDING',
      providerPaymentId: payment.id,
      providerEventId: `razorpay:checkout:${payment.id}:${payment.status}`,
      eventType: `razorpay.checkout.${payment.status}`,
      reason: 'Payment is verified but has not been captured by the provider yet.',
      payload,
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const expectedSignature = createHmac('sha256', this.configuration.webhookSecret)
      .update(rawBody)
      .digest('hex');
    return safeSignatureMatch(expectedSignature, signature);
  }

  private async request(path: string, init: RequestInit): Promise<unknown> {
    const response = await this.fetchImplementation(`${this.apiBaseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${this.configuration.keyId}:${this.configuration.keySecret}`,
        ).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error('The payment provider request could not be completed.');
    }
    return response.json();
  }

  private failure(
    input: VerifyProviderPaymentInput,
    reason: string,
    providerPaymentId?: string,
  ): ProviderPaymentResult {
    const reference = providerPaymentId ?? input.providerPaymentId ?? input.providerOrderId;
    return {
      status: 'FAILED',
      ...(providerPaymentId ? { providerPaymentId } : {}),
      providerEventId: `razorpay:checkout:${reference}:failed`,
      eventType: 'razorpay.checkout.failed',
      reason,
      payload: {
        providerOrderId: input.providerOrderId,
        providerPaymentId: providerPaymentId ?? input.providerPaymentId ?? null,
      },
    };
  }
}
