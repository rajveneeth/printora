export type PaymentProviderCode = 'MOCK' | 'RAZORPAY';

export interface CreateProviderOrderInput {
  readonly amountInPaise: number;
  readonly currency: 'INR';
  readonly receipt: string;
}

export interface ProviderOrder {
  readonly provider: PaymentProviderCode;
  readonly providerOrderId: string;
  readonly amountInPaise: number;
  readonly currency: 'INR';
  readonly publicKeyId?: string | undefined;
}

export interface VerifyProviderPaymentInput {
  readonly providerOrderId: string;
  readonly expectedAmountInPaise: number;
  readonly currency: 'INR';
  readonly providerPaymentId?: string | undefined;
  readonly signature?: string | undefined;
  readonly mockOutcome?: 'success' | 'failure' | undefined;
}

export interface ProviderPaymentSuccess {
  readonly status: 'SUCCEEDED';
  readonly providerPaymentId: string;
  readonly providerEventId: string;
  readonly eventType: string;
  readonly payload: Readonly<Record<string, string | number | boolean | null>>;
}

export interface ProviderPaymentFailure {
  readonly status: 'FAILED';
  readonly providerPaymentId?: string | undefined;
  readonly providerEventId: string;
  readonly eventType: string;
  readonly reason: string;
  readonly payload: Readonly<Record<string, string | number | boolean | null>>;
}

export interface ProviderPaymentPending {
  readonly status: 'PENDING';
  readonly providerPaymentId: string;
  readonly providerEventId: string;
  readonly eventType: string;
  readonly reason: string;
  readonly payload: Readonly<Record<string, string | number | boolean | null>>;
}

export type ProviderPaymentResult =
  ProviderPaymentSuccess | ProviderPaymentFailure | ProviderPaymentPending;

export interface PaymentProviderAdapter {
  readonly provider: PaymentProviderCode;
  readonly publicKeyId?: string | undefined;
  createOrder: (input: CreateProviderOrderInput) => Promise<ProviderOrder>;
  verifyPayment: (input: VerifyProviderPaymentInput) => Promise<ProviderPaymentResult>;
}
