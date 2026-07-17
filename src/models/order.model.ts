export type OrderStatus =
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

export interface CartModel {
  id: string;
  userId?: string;
  sessionId?: string;
  currency: string;
}
export interface CartItemModel {
  id: string;
  cartId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  customisation?: string;
}
export interface OrderModel {
  id: string;
  orderNumber: string;
  buyerId: string;
  status: OrderStatus;
  currency: string;
  subtotal: number;
  taxTotal: number;
  shippingTotal: number;
  grandTotal: number;
}
export interface OrderItemModel {
  id: string;
  orderId: string;
  sellerId: string;
  productNameSnapshot: string;
  sellerNameSnapshot: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  shippingFee: number;
}
