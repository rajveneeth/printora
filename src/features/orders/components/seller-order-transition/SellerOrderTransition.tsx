'use client';

import { useActionState } from 'react';
import { Button, Input, Select } from '@/components/ui';
import type { OrderStatus } from '@/models/order.model';
import { updateSellerOrderStatusAction } from '../../actions';
import { getSellerOrderTransitions, orderStatusLabel } from '../../services';
import styles from './SellerOrderTransition.module.scss';

interface SellerOrderTransitionProps {
  readonly orderNumber: string;
  readonly status: OrderStatus;
}

const initialState = { status: 'idle', message: '' } as const;

export function SellerOrderTransition({ orderNumber, status }: SellerOrderTransitionProps) {
  const [state, action, isPending] = useActionState(updateSellerOrderStatusAction, initialState);
  const transitions = getSellerOrderTransitions(status);
  if (!transitions.length) {
    return <p className={styles.terminal}>No seller action is available for this order.</p>;
  }
  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <Select
        label="Next status"
        name="nextStatus"
        options={transitions.map((nextStatus) => ({
          value: nextStatus,
          label: orderStatusLabel(nextStatus),
        }))}
      />
      <Input label="Fulfilment note" name="note" maxLength={240} required />
      {transitions.includes('SHIPPED') ? (
        <div className={styles.shippingFields}>
          <Input label="Carrier" name="carrier" maxLength={80} required />
          <Input label="Tracking number" name="trackingNumber" maxLength={80} required />
        </div>
      ) : null}
      <Button type="submit" isLoading={isPending}>
        Record status change
      </Button>
      {state.message ? (
        <p className={state.status === 'error' ? styles.error : styles.success} role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
