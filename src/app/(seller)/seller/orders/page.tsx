import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/ui';
import { formatPrice } from '@/features/catalogue';
import { OrderStatusBadge, PrismaOrderRepository } from '@/features/orders';
import { requireSellerProductContext } from '@/features/seller/services';
import { prisma } from '@/lib/prisma';
import type { OrderStatus } from '@/models/order.model';
import styles from './SellerOrders.module.scss';

export const metadata: Metadata = {
  title: 'Seller orders',
  robots: { index: false, follow: false },
};

interface SellerOrdersPageProps {
  readonly searchParams: Promise<{ status?: string }>;
}

const filters: readonly { value: '' | OrderStatus; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'PAID', label: 'New' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'IN_PRODUCTION', label: 'In production' },
  { value: 'READY_TO_SHIP', label: 'Ready to ship' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default async function SellerOrdersPage({ searchParams }: SellerOrdersPageProps) {
  const { seller } = await requireSellerProductContext();
  const requestedStatus = (await searchParams).status ?? '';
  const activeStatus = filters.find(({ value }) => value === requestedStatus)?.value ?? '';
  const allOrders = await new PrismaOrderRepository(prisma).listSellerOrders(seller.id);
  const orders = allOrders.filter((order) => !activeStatus || order.status === activeStatus);
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>Fulfilment workspace</p>
          <h1>Orders</h1>
          <span>
            Advance only valid fulfilment steps. Every change is retained in the audit trail.
          </span>
        </div>
      </header>
      <nav className={styles.filters} aria-label="Seller order filters">
        {filters.map((filter) => (
          <Link
            data-active={activeStatus === filter.value}
            href={filter.value ? `/seller/orders?status=${filter.value}` : '/seller/orders'}
            key={filter.label}
          >
            {filter.label}
          </Link>
        ))}
      </nav>
      {orders.length ? (
        <section className={styles.orders} aria-label="Seller orders">
          {orders.map((order) => (
            <article className={styles.orderCard} key={order.orderId}>
              <header className={styles.orderHeader}>
                <div>
                  <p className={styles.eyebrow}>{order.orderNumber}</p>
                  <h2>{order.buyerName}</h2>
                  <time dateTime={order.placedAt.toISOString()}>
                    {order.placedAt.toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </time>
                </div>
                <OrderStatusBadge status={order.status} />
              </header>
              <div className={styles.items}>
                {order.items.map((item) => (
                  <div className={styles.item} key={item.id}>
                    <div>
                      <strong>{item.productName}</strong>
                      <span>Quantity {item.quantity}</span>
                    </div>
                    <strong>{formatPrice(item.lineTotalInPaise)}</strong>
                  </div>
                ))}
              </div>
              <div className={styles.summary}>
                <span>Seller total</span>
                <strong>{formatPrice(order.totalInPaise)}</strong>
              </div>
              <Link href={`/seller/orders/${order.orderNumber}`}>Manage fulfilment</Link>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState
          title="No seller orders in this view"
          description="Paid orders containing your products will appear here for fulfilment."
        />
      )}
    </div>
  );
}
