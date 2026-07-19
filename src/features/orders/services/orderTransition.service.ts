import type { OrderStatus } from '@/models/order.model';

const sellerTransitions: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  PENDING_PAYMENT: [],
  PAID: ['CONFIRMED'],
  CONFIRMED: ['IN_PRODUCTION'],
  IN_PRODUCTION: ['READY_TO_SHIP'],
  READY_TO_SHIP: ['SHIPPED'],
  SHIPPED: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REFUND_REQUESTED: [],
  REFUNDED: [],
};

const fulfilmentProgress: readonly OrderStatus[] = [
  'PAID',
  'CONFIRMED',
  'IN_PRODUCTION',
  'READY_TO_SHIP',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export const getSellerOrderTransitions = (status: OrderStatus): readonly OrderStatus[] =>
  sellerTransitions[status];

export const canSellerTransitionOrder = (
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
): boolean => sellerTransitions[currentStatus].includes(nextStatus);

export const deriveMarketplaceOrderStatus = (
  fulfilmentStatuses: readonly OrderStatus[],
  fallbackStatus: OrderStatus,
): OrderStatus => {
  if (!fulfilmentStatuses.length) return fallbackStatus;
  if (fulfilmentStatuses.every((status) => status === 'CANCELLED')) return 'CANCELLED';
  if (fulfilmentStatuses.some((status) => status === 'REFUND_REQUESTED')) {
    return 'REFUND_REQUESTED';
  }
  if (fulfilmentStatuses.some((status) => status === 'REFUNDED')) return 'REFUNDED';
  const activeStatuses = fulfilmentStatuses.filter((status) => status !== 'CANCELLED');
  const earliestProgress = Math.min(
    ...activeStatuses.map((status) => {
      const position = fulfilmentProgress.indexOf(status);
      return position === -1 ? 0 : position;
    }),
  );
  return fulfilmentProgress[earliestProgress] ?? fallbackStatus;
};

export const orderStatusLabel = (status: OrderStatus): string =>
  status.toLowerCase().replaceAll('_', ' ');
