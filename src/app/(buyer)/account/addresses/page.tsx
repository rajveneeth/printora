import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { AddressManager, PrismaAddressRepository } from '@/features/checkout';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import styles from './AddressesPage.module.scss';

export const metadata: Metadata = {
  title: 'Delivery addresses',
  robots: { index: false, follow: false },
};

export default async function AddressesPage() {
  const session = await requireSession();
  const addresses = await new PrismaAddressRepository(prisma).listByUser(session.user.id);
  return (
    <main id="main-content" className={styles.main}>
      <nav aria-label="Breadcrumb">
        <Link href="/account">Account</Link>
        <ChevronRight size={13} />
        <span>Addresses</span>
      </nav>
      <header>
        <p>Your account</p>
        <h1>Delivery addresses</h1>
        <span>Manage addresses available during checkout.</span>
      </header>
      <section className={styles.panel}>
        <AddressManager addresses={addresses} />
      </section>
    </main>
  );
}
