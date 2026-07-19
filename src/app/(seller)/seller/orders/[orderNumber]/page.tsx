import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatPrice } from '@/features/catalogue';
import { OrderStatusBadge, PrismaOrderRepository, SellerOrderTransition } from '@/features/orders';
import { requireSellerProductContext } from '@/features/seller/services';
import { prisma } from '@/lib/prisma';
import styles from '../SellerOrders.module.scss';

export const metadata: Metadata = {
  title: 'Manage order',
  robots: { index: false, follow: false },
};

interface SellerOrderPageProps {
  readonly params: Promise<{ orderNumber: string }>;
}

export default async function SellerOrderPage({ params }: SellerOrderPageProps) {
  const { seller } = await requireSellerProductContext();
  const { orderNumber } = await params;
  const order = (await new PrismaOrderRepository(prisma).listSellerOrders(seller.id)).find(
    (candidate) => candidate.orderNumber === orderNumber,
  );
  if (!order) notFound();
  return (
    <div className={styles.page}>
      <Link className={styles.backLink} href="/seller/orders">
        Back to seller orders
      </Link>
      <header className={styles.orderHeader}>
        <div>
          <p className={styles.eyebrow}>Manage fulfilment</p>
          <h1>{order.orderNumber}</h1>
          <time dateTime={order.placedAt.toISOString()}>
            Ordered by {order.buyerName} on{' '}
            {order.placedAt.toLocaleDateString('en-IN', { dateStyle: 'medium' })}
          </time>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>
      <div className={styles.details}>
        <section className={styles.panel}>
          <h2>Your items</h2>
          {order.items.map((item) => (
            <div className={styles.item} key={item.id}>
              <div>
                <strong>{item.productName}</strong>
                <span>Quantity {item.quantity}</span>
              </div>
              <strong>{formatPrice(item.lineTotalInPaise)}</strong>
            </div>
          ))}
          <div className={styles.summary}>
            <span>Seller total</span>
            <strong>{formatPrice(order.totalInPaise)}</strong>
          </div>
        </section>
        <section className={styles.panel}>
          <h2>Record the next step</h2>
          <SellerOrderTransition orderNumber={order.orderNumber} status={order.status} />
        </section>
      </div>
    </div>
  );
}
