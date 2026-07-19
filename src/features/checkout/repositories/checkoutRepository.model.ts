import type { ProviderPaymentResult } from '@/lib/payments';
import type { CreateCheckoutInput } from '../models';

export interface PendingCheckoutRecord {
  readonly paymentId: string;
  readonly orderId: string;
  readonly orderNumber: string;
  readonly provider: 'MOCK' | 'RAZORPAY';
  readonly providerOrderId?: string | undefined;
  readonly amountInPaise: number;
  readonly currency: 'INR';
  readonly isExisting: boolean;
}

export interface CheckoutPaymentRecord {
  readonly paymentId: string;
  readonly orderNumber: string;
  readonly provider: 'MOCK' | 'RAZORPAY';
  readonly providerOrderId: string;
  readonly amountInPaise: number;
  readonly currency: 'INR';
  readonly status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
}

export interface PaymentFinalizationRecord {
  readonly status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
  readonly orderNumber: string;
  readonly message?: string | undefined;
}

export interface CreatePendingCheckoutPersistenceInput {
  readonly userId: string;
  readonly provider: 'MOCK' | 'RAZORPAY';
  readonly checkout: CreateCheckoutInput;
}

export interface FinalizePaymentPersistenceInput {
  readonly paymentId: string;
  readonly result: ProviderPaymentResult;
}
