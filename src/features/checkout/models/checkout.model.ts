import type { CartItemOption } from '@/features/cart';

export interface CheckoutCartLineInput {
  readonly productSlug: string;
  readonly variantId?: string | undefined;
  readonly quantity: number;
  readonly displayedUnitPriceInPaise: number;
  readonly customisation?: string | undefined;
  readonly selectedOptions: readonly CartItemOption[];
}

export interface CreateCheckoutInput {
  readonly addressId: string;
  readonly idempotencyKey: string;
  readonly items: readonly CheckoutCartLineInput[];
}

export interface CheckoutPaymentDetails {
  readonly paymentId: string;
  readonly provider: 'MOCK' | 'RAZORPAY';
  readonly providerOrderId: string;
  readonly amountInPaise: number;
  readonly currency: 'INR';
  readonly publicKeyId?: string | undefined;
}

export type CheckoutActionResult =
  | {
      readonly status: 'success';
      readonly orderNumber: string;
      readonly payment: CheckoutPaymentDetails;
    }
  | { readonly status: 'error'; readonly message: string };

export type PaymentConfirmationInput =
  | {
      readonly provider: 'MOCK';
      readonly paymentId: string;
      readonly outcome: 'success' | 'failure';
    }
  | {
      readonly provider: 'RAZORPAY';
      readonly paymentId: string;
      readonly providerOrderId: string;
      readonly providerPaymentId: string;
      readonly signature: string;
    };

export type PaymentConfirmationResult =
  | { readonly status: 'succeeded'; readonly orderNumber: string }
  | { readonly status: 'failed'; readonly orderNumber: string; readonly message: string }
  | { readonly status: 'pending'; readonly orderNumber: string; readonly message: string }
  | { readonly status: 'error'; readonly message: string };

export interface AddressSummary {
  readonly id: string;
  readonly kind: 'SHIPPING' | 'BILLING' | 'BOTH';
  readonly fullName: string;
  readonly phone: string;
  readonly line1: string;
  readonly line2?: string | undefined;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
  readonly isDefault: boolean;
}

export type AddressActionResult =
  | { readonly status: 'success'; readonly message: string; readonly addressId?: string }
  | { readonly status: 'error'; readonly message: string };
