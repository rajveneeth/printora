import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Check, MapPin, PackageCheck, ShieldCheck } from 'lucide-react';
import { notFound } from 'next/navigation';
import { formatPrice } from '@/features/catalogue';
import { PrismaOrderRepository } from '@/features/orders';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import styles from '../CheckoutResult.module.scss';

export const metadata: Metadata = {
  title: 'Order confirmed',
  robots: { index: false, follow: false },
};

export interface CheckoutSuccessPageProps {
  readonly searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const session = await requireSession();
  const orderNumber = (await searchParams).order;
  if (!orderNumber) notFound();
  const order = await new PrismaOrderRepository(prisma).findOwnedOrder(
    session.user.id,
    orderNumber,
  );
  if (
    !order ||
    ![
      'PAID',
      'CONFIRMED',
      'IN_PRODUCTION',
      'READY_TO_SHIP',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ].includes(order.status)
  )
    notFound();
  return (
    <main id="main-content" className={styles.main}>
      <section className={styles.result}>
        <span className={styles.successIcon}>
          <Check size={28} />
        </span>
        <p>Payment verified</p>
        <h1>Your order is confirmed</h1>
        <span>
          Order {order.orderNumber} · {new Date(order.placedAt).toLocaleDateString('en-IN')}
        </span>
        {order.paymentProvider === 'MOCK' ? (
          <div className={styles.mockNotice}>
            <ShieldCheck size={18} />
            This demo order used the simulated local provider. No money was charged.
          </div>
        ) : null}
      </section>
      <div className={styles.grid}>
        <section className={styles.panel}>
          <h2>
            <PackageCheck size={19} /> Order items
          </h2>
          {order.items.map((item) => (
            <article className={styles.item} key={item.id}>
              {item.imageUrl ? <Image src={item.imageUrl} alt="" width={76} height={76} /> : null}
              <div>
                <strong>{item.productName}</strong>
                <span>
                  {item.sellerName}
                  {item.variantName ? ` · ${item.variantName}` : ''}
                </span>
                <small>Quantity {item.quantity}</small>
              </div>
              <b>{formatPrice(item.unitPriceInPaise * item.quantity)}</b>
            </article>
          ))}
          <div className={styles.total}>
            <span>Total paid</span>
            <strong>{formatPrice(order.totalInPaise)}</strong>
          </div>
        </section>
        {order.address ? (
          <aside className={styles.panel}>
            <h2>
              <MapPin size={19} /> Delivering to
            </h2>
            <address>
              <strong>{order.address.fullName}</strong>
              <span>
                {order.address.line1}
                {order.address.line2 ? `, ${order.address.line2}` : ''}
              </span>
              <span>
                {order.address.city}, {order.address.state} {order.address.postalCode}
              </span>
            </address>
          </aside>
        ) : null}
      </div>
      <div className={styles.actions}>
        <Link href="/account">View your orders</Link>
        <Link href="/products">Continue shopping</Link>
      </div>
    </main>
  );
}
