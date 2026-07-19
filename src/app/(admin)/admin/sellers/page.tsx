import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui';
import { PrismaAdministrationRepository } from '@/features/administration';
import { prisma } from '@/lib/prisma';
import styles from '../AdminPage.module.scss';

export const metadata: Metadata = { title: 'Seller moderation' };

const tone = (status: string): 'success' | 'warning' | 'error' | 'neutral' =>
  status === 'APPROVED'
    ? 'success'
    : status === 'REJECTED' || status === 'SUSPENDED'
      ? 'error'
      : status === 'PENDING' || status === 'CHANGES_REQUESTED'
        ? 'warning'
        : 'neutral';

export default async function AdminSellersPage() {
  const sellers = await new PrismaAdministrationRepository(prisma).listSellers();
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>Trust and safety</p>
          <h1>Seller moderation</h1>
          <span>Review store identity, location, capabilities, and prior decisions.</span>
        </div>
      </header>
      <section className={styles.list}>
        {sellers.map((seller) => (
          <article className={styles.row} key={seller.id}>
            <header className={styles.rowHeader}>
              <div>
                <p className={styles.eyebrow}>{seller.origin}</p>
                <h2>{seller.storeName}</h2>
                <p>{seller.contactEmail}</p>
              </div>
              <Badge tone={tone(seller.status)}>{seller.status.replaceAll('_', ' ')}</Badge>
            </header>
            <div className={styles.tagList}>
              {seller.supportedMaterials.map((material) => (
                <span key={material}>{material}</span>
              ))}
            </div>
            <div className={styles.rowFooter}>
              <span>{seller.printTechnologies.join(', ') || 'Technology not listed'}</span>
              <Link href={`/admin/sellers/${seller.id}`}>Review seller</Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
