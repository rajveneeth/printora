import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { EmptyState } from '@/components/ui';
import { formatPrice } from '@/features/catalogue';
import { OrderStatusBadge, PrismaOrderRepository } from '@/features/orders';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import styles from './OrdersPage.module.scss';

export const metadata: Metadata = { title: 'Your orders', robots: { index: false, follow: false } };

interface BuyerOrdersPageProps {
  readonly searchParams: Promise<{ view?: string }>;
}

const filters = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

const activeStatuses = new Set([
  'PAID',
  'CONFIRMED',
  'IN_PRODUCTION',
  'READY_TO_SHIP',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
]);

export default async function BuyerOrdersPage({ searchParams }: BuyerOrdersPageProps) {
  const session = await requireSession();
  const requestedView = (await searchParams).view ?? 'all';
  const activeView = filters.some(({ value }) => value === requestedView) ? requestedView : 'all';
  const allOrders = await new PrismaOrderRepository(prisma).listBuyerOrders(session.user.id);
  const orders = allOrders.filter((order) => {
    if (activeView === 'active') return activeStatuses.has(order.status);
    if (activeView === 'delivered') return order.status === 'DELIVERED';
    if (activeView === 'cancelled') return order.status === 'CANCELLED';
    return true;
  });
  return (
    <main id="main-content" className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>Buyer account</p>
          <h1>Your orders</h1>
          <span>Track every seller fulfilment and review purchases after delivery.</span>
        </div>
      </header>
      <nav className={styles.filters} aria-label="Order filters">
        {filters.map((filter) => (
          <Link
            data-active={activeView === filter.value}
            href={
              filter.value === 'all' ? '/account/orders' : `/account/orders?view=${filter.value}`
            }
            key={filter.value}
          >
            {filter.label}
          </Link>
        ))}
      </nav>
      {orders.length ? (
        <section className={styles.orders} aria-label="Order history">
          {orders.map((order) => (
            <article className={styles.orderCard} key={order.id}>
              <header className={styles.orderHeader}>
                <div>
                  <p className={styles.eyebrow}>Order {order.orderNumber}</p>
                  <h2>
                    {order.items.length} order item{order.items.length === 1 ? '' : 's'}
                  </h2>
                  <time dateTime={order.placedAt.toISOString()}>
                    Placed {order.placedAt.toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </time>
                </div>
                <OrderStatusBadge status={order.status} />
              </header>
              {order.items.slice(0, 2).map((item) => (
                <div className={styles.item} key={item.id}>
                  {item.productImageUrl ? (
                    <Image src={item.productImageUrl} alt="" width={72} height={72} />
                  ) : (
                    <span className={styles.imagePlaceholder} />
                  )}
                  <div className={styles.itemDetails}>
                    <strong>{item.productName}</strong>
                    <span>{item.sellerName}</span>
                    <small>Quantity {item.quantity}</small>
                  </div>
                  <strong>{formatPrice(item.lineTotalInPaise)}</strong>
                </div>
              ))}
              <div className={styles.summaryRow}>
                <span>Total</span>
                <strong>{formatPrice(order.totalInPaise)}</strong>
              </div>
              <Link href={`/account/orders/${order.orderNumber}`}>View order details</Link>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState
          title="No orders in this view"
          description="Your marketplace purchases and current fulfilment progress will appear here."
          action={<Link href="/products">Browse products</Link>}
        />
      )}
    </main>
  );
}
