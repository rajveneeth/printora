import { Badge, type BadgeTone } from '@/components/ui';
import type { OrderStatus } from '@/models/order.model';
import { orderStatusLabel } from '../../services';

interface OrderStatusBadgeProps {
  readonly status: OrderStatus;
}

const statusTones = {
  PENDING_PAYMENT: 'warning',
  PAID: 'info',
  CONFIRMED: 'info',
  IN_PRODUCTION: 'warning',
  READY_TO_SHIP: 'warning',
  SHIPPED: 'info',
  OUT_FOR_DELIVERY: 'info',
  DELIVERED: 'success',
  CANCELLED: 'error',
  REFUND_REQUESTED: 'warning',
  REFUNDED: 'neutral',
} as const satisfies Record<OrderStatus, BadgeTone>;

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <Badge tone={statusTones[status]}>{orderStatusLabel(status)}</Badge>;
}
