import type { ProductStatus } from '@prisma/client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/ui';
import { PrismaAdministrationRepository } from '@/features/administration';
import { SellerStatusBadge } from '@/features/seller/components';
import { prisma } from '@/lib/prisma';
import styles from '../AdminPage.module.scss';

export const metadata: Metadata = { title: 'Product approvals' };

interface AdminProductsPageProps {
  readonly searchParams: Promise<{ status?: string }>;
}

const filters: readonly { value: '' | ProductStatus; label: string }[] = [
  { value: 'PENDING_REVIEW', label: 'Pending' },
  { value: 'CHANGES_REQUESTED', label: 'Changes requested' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: '', label: 'All' },
];

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const requestedStatus = (await searchParams).status ?? 'PENDING_REVIEW';
  const activeStatus =
    filters.find(({ value }) => value === requestedStatus)?.value ?? 'PENDING_REVIEW';
  const products = await new PrismaAdministrationRepository(prisma).listProducts(
    activeStatus || undefined,
  );
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>Moderation queue</p>
          <h1>Product approvals</h1>
          <span>
            Review listing quality, safety declarations, pricing, inventory, and search metadata.
          </span>
        </div>
      </header>
      <nav className={styles.filters} aria-label="Product moderation filters">
        {filters.map((filter) => (
          <Link
            data-active={activeStatus === filter.value}
            href={
              filter.value ? `/admin/products?status=${filter.value}` : '/admin/products?status='
            }
            key={filter.label}
          >
            {filter.label}
          </Link>
        ))}
      </nav>
      {products.length ? (
        <section className={styles.list}>
          {products.map((product) => (
            <article className={styles.row} key={product.id}>
              <header className={styles.rowHeader}>
                <div>
                  <p className={styles.eyebrow}>{product.categoryName}</p>
                  <h2>{product.name}</h2>
                  <p>
                    {product.sellerName} · Updated {product.updatedAt.toLocaleDateString('en-IN')}
                  </p>
                </div>
                <SellerStatusBadge status={product.status} />
              </header>
              <div className={styles.rowFooter}>
                <span>Full listing review required before publication</span>
                <Link href={`/admin/products/${product.id}`}>Review product</Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState
          title="No products in this queue"
          description="Submitted seller listings will appear here when they need a moderation decision."
        />
      )}
    </div>
  );
}
