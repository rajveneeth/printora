import { ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/features/catalogue';
import styles from './CartSummary.module.scss';
import type { CartSummaryProps } from './CartSummary.model';

export function CartSummary({ totals, action, title = 'Order summary' }: CartSummaryProps) {
  return (
    <aside className={styles.root} aria-label={title}>
      <h2>{title}</h2>
      <dl>
        <div>
          <dt>Subtotal ({totals.itemCount} items)</dt>
          <dd>{formatPrice(totals.subtotalInPaise)}</dd>
        </div>
        <div>
          <dt>Estimated tax</dt>
          <dd>{formatPrice(totals.taxInPaise)}</dd>
        </div>
        <div>
          <dt>Delivery</dt>
          <dd>{totals.shippingInPaise ? formatPrice(totals.shippingInPaise) : 'Free'}</dd>
        </div>
        <div className={styles.total}>
          <dt>Total</dt>
          <dd>{formatPrice(totals.totalInPaise)}</dd>
        </div>
      </dl>
      {action}
      <p className={styles.assurance}>
        <ShieldCheck size={17} aria-hidden="true" /> Prices and stock are checked again securely at
        checkout.
      </p>
    </aside>
  );
}
