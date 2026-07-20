import type { Metadata } from 'next';
import type { Route } from 'next';
import Link from 'next/link';
import { ChevronRight, LockKeyhole } from 'lucide-react';
import { CheckoutReview, PrismaAddressRepository } from '@/features/checkout';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import styles from './CheckoutPage.module.scss';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const session = await requireSession('/checkout');
  const addresses = (await new PrismaAddressRepository(prisma).listByUser(session.user.id)).filter(
    (address) => address.kind !== 'BILLING',
  );
  return (
    <main id="main-content" className={styles.main}>
      <nav aria-label="Breadcrumb">
        <Link href={'/cart' as Route}>Shopping bag</Link>
        <ChevronRight size={13} />
        <span>Checkout</span>
      </nav>
      <header>
        <div>
          <p>Secure checkout</p>
          <h1>Delivery and payment</h1>
        </div>
        <span>
          <LockKeyhole size={16} /> Server-verified checkout
        </span>
      </header>
      <CheckoutReview
        addresses={addresses}
        customer={{ name: session.user.name ?? 'Formivo customer', email: session.user.email }}
      />
    </main>
  );
}
