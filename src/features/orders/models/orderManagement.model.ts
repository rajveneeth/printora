import type { OrderStatus } from '@/models/order.model';

export interface OrderLineSnapshot {
  readonly id: string;
  readonly productName: string;
  readonly sellerName: string;
  readonly sellerId: string;
  readonly productImageUrl: string | null;
  readonly quantity: number;
  readonly unitPriceInPaise: number;
  readonly lineTotalInPaise: number;
  readonly isReviewEligible: boolean;
  readonly hasReview: boolean;
}

export interface OrderFulfilmentSummary {
  readonly sellerId: string;
  readonly sellerName: string;
  readonly status: OrderStatus;
  readonly trackingNumber: string | null;
  readonly carrier: string | null;
}

export interface BuyerOrderSummary {
  readonly id: string;
  readonly orderNumber: string;
  readonly status: OrderStatus;
  readonly placedAt: Date;
  readonly totalInPaise: number;
  readonly items: readonly OrderLineSnapshot[];
  readonly fulfilments: readonly OrderFulfilmentSummary[];
}

export interface OrderTimelineEvent {
  readonly id: string;
  readonly status: OrderStatus;
  readonly previousStatus: OrderStatus | null;
  readonly note: string | null;
  readonly sellerId: string | null;
  readonly createdAt: Date;
}

export interface BuyerOrderDetails extends BuyerOrderSummary {
  readonly subtotalInPaise: number;
  readonly taxInPaise: number;
  readonly shippingInPaise: number;
  readonly address: {
    readonly fullName: string;
    readonly phone: string;
    readonly line1: string;
    readonly line2: string | null;
    readonly city: string;
    readonly state: string;
    readonly postalCode: string;
    readonly country: string;
  } | null;
  readonly timeline: readonly OrderTimelineEvent[];
}

export interface SellerOrderSummary {
  readonly orderId: string;
  readonly orderNumber: string;
  readonly buyerName: string;
  readonly status: OrderStatus;
  readonly placedAt: Date;
  readonly totalInPaise: number;
  readonly trackingNumber: string | null;
  readonly carrier: string | null;
  readonly items: readonly OrderLineSnapshot[];
}

export interface OrderActionState {
  readonly status: 'idle' | 'success' | 'error';
  readonly message: string;
}
