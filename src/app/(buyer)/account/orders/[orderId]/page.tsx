import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatPrice } from '@/features/catalogue';
import { OrderStatusBadge, OrderTimeline, PrismaOrderRepository } from '@/features/orders';
import { ReviewForm } from '@/features/reviews';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import styles from '../OrdersPage.module.scss';

export const metadata: Metadata = {
  title: 'Order details',
  robots: { index: false, follow: false },
};

interface BuyerOrderDetailsPageProps {
  readonly params: Promise<{ orderId: string }>;
}

export default async function BuyerOrderDetailsPage({ params }: BuyerOrderDetailsPageProps) {
  const session = await requireSession();
  const { orderId } = await params;
  const order = await new PrismaOrderRepository(prisma).findBuyerOrderDetails(
    session.user.id,
    orderId,
  );
  if (!order) notFound();
  return (
    <main id="main-content" className={styles.page}>
      <Link className={styles.backLink} href="/account/orders">
        Back to orders
      </Link>
      <header className={styles.orderHeader}>
        <div>
          <p className={styles.eyebrow}>Order details</p>
          <h1>{order.orderNumber}</h1>
          <time dateTime={order.placedAt.toISOString()}>
            Placed {order.placedAt.toLocaleDateString('en-IN', { dateStyle: 'long' })}
          </time>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>
      <div className={styles.detailGrid}>
        <div className={styles.items}>
          <section className={styles.panel}>
            <h2>Items</h2>
            {order.items.map((item) => (
              <article key={item.id}>
                <div className={styles.item}>
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
                {item.isReviewEligible ? (
                  <ReviewForm orderItemId={item.id} productName={item.productName} />
                ) : item.hasReview ? (
                  <p className={styles.muted}>Your verified review has been submitted.</p>
                ) : null}
              </article>
            ))}
          </section>
          <section className={styles.panel}>
            <h2>Seller fulfilment</h2>
            <div className={styles.fulfilments}>
              {order.fulfilments.map((fulfilment) => (
                <div className={styles.fulfilmentRow} key={fulfilment.sellerId}>
                  <div>
                    <strong>{fulfilment.sellerName}</strong>
                    {fulfilment.trackingNumber ? (
                      <p>
                        {fulfilment.carrier} · {fulfilment.trackingNumber}
                      </p>
                    ) : (
                      <p>Tracking will appear after dispatch.</p>
                    )}
                  </div>
                  <OrderStatusBadge status={fulfilment.status} />
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside className={styles.items}>
          <section className={styles.panel}>
            <h2>Order timeline</h2>
            <OrderTimeline events={order.timeline} />
          </section>
          <section className={styles.panel}>
            <h2>Order total</h2>
            <div className={styles.totals}>
              <div>
                <span>Subtotal</span>
                <strong>{formatPrice(order.subtotalInPaise)}</strong>
              </div>
              <div>
                <span>Tax</span>
                <strong>{formatPrice(order.taxInPaise)}</strong>
              </div>
              <div>
                <span>Delivery</span>
                <strong>{formatPrice(order.shippingInPaise)}</strong>
              </div>
              <div>
                <span>Total</span>
                <strong>{formatPrice(order.totalInPaise)}</strong>
              </div>
            </div>
          </section>
          {order.address ? (
            <section className={styles.panel}>
              <h2>Delivery address</h2>
              <address className={styles.address}>
                <strong>{order.address.fullName}</strong>
                <span>
                  {order.address.line1}
                  {order.address.line2 ? `, ${order.address.line2}` : ''}
                </span>
                <span>
                  {order.address.city}, {order.address.state} {order.address.postalCode}
                </span>
                <span>
                  {order.address.country} · {order.address.phone}
                </span>
              </address>
            </section>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
