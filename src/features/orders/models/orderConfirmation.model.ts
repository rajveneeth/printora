export interface OrderConfirmationItem {
  readonly id: string;
  readonly productName: string;
  readonly sellerName: string;
  readonly imageUrl?: string | undefined;
  readonly variantName?: string | undefined;
  readonly quantity: number;
  readonly unitPriceInPaise: number;
}

export interface OrderConfirmationDetails {
  readonly orderNumber: string;
  readonly status:
    | 'PENDING_PAYMENT'
    | 'PAID'
    | 'CONFIRMED'
    | 'IN_PRODUCTION'
    | 'READY_TO_SHIP'
    | 'SHIPPED'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'REFUND_REQUESTED'
    | 'REFUNDED';
  readonly placedAt: string;
  readonly totalInPaise: number;
  readonly paymentProvider?: 'MOCK' | 'RAZORPAY' | undefined;
  readonly items: readonly OrderConfirmationItem[];
  readonly address?: {
    readonly fullName: string;
    readonly line1: string;
    readonly line2?: string | undefined;
    readonly city: string;
    readonly state: string;
    readonly postalCode: string;
  };
}
