import type { PaymentProviderAdapter, ProviderPaymentResult } from '@/lib/payments';
import type {
  CheckoutActionResult,
  CreateCheckoutInput,
  PaymentConfirmationInput,
  PaymentConfirmationResult,
} from '../models';
import type {
  CheckoutPaymentRecord,
  CreatePendingCheckoutPersistenceInput,
  FinalizePaymentPersistenceInput,
  PaymentFinalizationRecord,
  PendingCheckoutRecord,
} from '../repositories';

export interface CheckoutRepositoryContract {
  createPendingCheckout: (
    input: CreatePendingCheckoutPersistenceInput,
  ) => Promise<PendingCheckoutRecord>;
  attachProviderOrder: (paymentId: string, providerOrderId: string) => Promise<void>;
  findPaymentForUser: (userId: string, paymentId: string) => Promise<CheckoutPaymentRecord | null>;
  finalizePayment: (input: FinalizePaymentPersistenceInput) => Promise<PaymentFinalizationRecord>;
  failProviderOrder: (paymentId: string, reason: string) => Promise<void>;
}

export class CheckoutService {
  constructor(
    private readonly repository: CheckoutRepositoryContract,
    private readonly paymentProvider: PaymentProviderAdapter,
  ) {}

  async createCheckout(
    userId: string,
    sessionId: string,
    input: CreateCheckoutInput,
  ): Promise<CheckoutActionResult> {
    const pendingCheckout = await this.repository.createPendingCheckout({
      userId,
      sessionId,
      provider: this.paymentProvider.provider,
      checkout: input,
    });
    if (pendingCheckout.providerOrderId) {
      return this.successResult(pendingCheckout, pendingCheckout.providerOrderId);
    }
    try {
      const providerOrder = await this.paymentProvider.createOrder({
        amountInPaise: pendingCheckout.amountInPaise,
        currency: pendingCheckout.currency,
        receipt: pendingCheckout.orderNumber,
      });
      await this.repository.attachProviderOrder(
        pendingCheckout.paymentId,
        providerOrder.providerOrderId,
      );
      return this.successResult(pendingCheckout, providerOrder.providerOrderId);
    } catch {
      await this.repository.failProviderOrder(
        pendingCheckout.paymentId,
        'The payment provider could not prepare this checkout.',
      );
      throw new Error('Payment could not be started. Your reserved stock has been released.');
    }
  }

  async confirmPayment(
    userId: string,
    input: PaymentConfirmationInput,
  ): Promise<PaymentConfirmationResult> {
    const payment = await this.repository.findPaymentForUser(userId, input.paymentId);
    if (!payment || payment.provider !== input.provider) {
      throw new Error('Payment not found or unavailable for this account.');
    }
    if (payment.status === 'SUCCEEDED') {
      return { status: 'succeeded', orderNumber: payment.orderNumber };
    }
    if (payment.status === 'FAILED') {
      return {
        status: 'failed',
        orderNumber: payment.orderNumber,
        message: 'This payment has already failed.',
      };
    }
    const providerResult = await this.paymentProvider.verifyPayment({
      providerOrderId: payment.providerOrderId,
      expectedAmountInPaise: payment.amountInPaise,
      currency: payment.currency,
      ...(input.provider === 'MOCK'
        ? { mockOutcome: input.outcome }
        : {
            providerPaymentId: input.providerPaymentId,
            signature: input.signature,
          }),
    });
    return this.finalizeResult(
      await this.repository.finalizePayment({
        paymentId: payment.paymentId,
        result: providerResult,
      }),
    );
  }

  async finalizeProviderEvent(
    paymentId: string,
    result: ProviderPaymentResult,
  ): Promise<PaymentFinalizationRecord> {
    return this.repository.finalizePayment({ paymentId, result });
  }

  private successResult(
    checkout: PendingCheckoutRecord,
    providerOrderId: string,
  ): CheckoutActionResult {
    return {
      status: 'success',
      orderNumber: checkout.orderNumber,
      payment: {
        paymentId: checkout.paymentId,
        provider: checkout.provider,
        providerOrderId,
        amountInPaise: checkout.amountInPaise,
        currency: checkout.currency,
        ...(this.paymentProvider.publicKeyId
          ? { publicKeyId: this.paymentProvider.publicKeyId }
          : {}),
      },
    };
  }

  private finalizeResult(result: PaymentFinalizationRecord): PaymentConfirmationResult {
    if (result.status === 'SUCCEEDED') {
      return { status: 'succeeded', orderNumber: result.orderNumber };
    }
    if (result.status === 'FAILED') {
      return {
        status: 'failed',
        orderNumber: result.orderNumber,
        message: result.message ?? 'Payment failed.',
      };
    }
    return {
      status: 'pending',
      orderNumber: result.orderNumber,
      message: result.message ?? 'Payment is awaiting provider confirmation.',
    };
  }
}
