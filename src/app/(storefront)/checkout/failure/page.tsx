import type { Metadata } from 'next';
import type { Route } from 'next';
import Link from 'next/link';
import { CircleX } from 'lucide-react';
import { PrismaOrderRepository } from '@/features/orders';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import styles from '../CheckoutResult.module.scss';

export const metadata: Metadata = {
  title: 'Payment not completed',
  robots: { index: false, follow: false },
};

export interface CheckoutFailurePageProps {
  readonly searchParams: Promise<{ order?: string; reason?: string }>;
}

export default async function CheckoutFailurePage({ searchParams }: CheckoutFailurePageProps) {
  const session = await requireSession();
  const parameters = await searchParams;
  const order = parameters.order
    ? await new PrismaOrderRepository(prisma).findOwnedOrder(session.user.id, parameters.order)
    : null;
  return (
    <main id="main-content" className={styles.main}>
      <section className={styles.result}>
        <span className={styles.failureIcon}>
          <CircleX size={28} />
        </span>
        <p>Payment not completed</p>
        <h1>Your order was not paid</h1>
        <span>
          {parameters.reason ?? 'The provider did not return a verified successful payment.'}
        </span>
        {order ? <small>Order reference {order.orderNumber}</small> : null}
      </section>
      <div className={styles.recovery}>
        <p>
          No fulfilment has started. Any inventory reservation for this failed attempt has been
          released.
        </p>
        <div className={styles.actions}>
          <Link href={'/cart' as Route}>Return to shopping bag</Link>
          <Link href="/products">Keep browsing</Link>
        </div>
      </div>
    </main>
  );
}
