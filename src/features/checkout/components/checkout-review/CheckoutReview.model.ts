import type { AddressSummary } from '../../models';

export interface CheckoutReviewProps {
  readonly addresses: readonly AddressSummary[];
  readonly customer: {
    readonly name: string;
    readonly email: string;
  };
}

export interface RazorpayCheckoutSuccess {
  readonly razorpay_payment_id: string;
  readonly razorpay_order_id: string;
  readonly razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  readonly key: string;
  readonly amount: number;
  readonly currency: string;
  readonly name: string;
  readonly description: string;
  readonly order_id: string;
  readonly prefill: { readonly name: string; readonly email: string };
  readonly theme: { readonly color: string };
  readonly handler: (response: RazorpayCheckoutSuccess) => void;
}

export interface RazorpayCheckoutInstance {
  open: () => void;
  on: (event: 'payment.failed', handler: () => void) => void;
}

export type RazorpayCheckoutConstructor = new (
  options: RazorpayCheckoutOptions,
) => RazorpayCheckoutInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayCheckoutConstructor;
  }
}
