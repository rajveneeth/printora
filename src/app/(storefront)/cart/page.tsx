import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { CartView } from '@/features/cart';
import styles from './CartPage.module.scss';

export const metadata: Metadata = {
  title: 'Shopping bag',
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <main id="main-content" className={styles.main}>
      <nav aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <ChevronRight size={13} />
        <span>Shopping bag</span>
      </nav>
      <header>
        <p>Selected creations</p>
        <h1>Your shopping bag</h1>
        <span>Review maker options and quantities before secure checkout.</span>
      </header>
      <CartView />
    </main>
  );
}
