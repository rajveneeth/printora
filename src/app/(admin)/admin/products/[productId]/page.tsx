import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ModerationForm, PrismaAdministrationRepository } from '@/features/administration';
import { moderateProductAction } from '@/features/administration/actions';
import { formatPrice } from '@/features/catalogue';
import { SellerStatusBadge } from '@/features/seller/components';
import { prisma } from '@/lib/prisma';
import styles from '../../AdminPage.module.scss';

export const metadata: Metadata = { title: 'Review product' };

interface ProductModerationPageProps {
  readonly params: Promise<{ productId: string }>;
}

export default async function ProductModerationPage({ params }: ProductModerationPageProps) {
  const product = await new PrismaAdministrationRepository(prisma).findProduct(
    (await params).productId,
  );
  if (!product) notFound();
  return (
    <div className={styles.page}>
      <Link className={styles.backLink} href="/admin/products">
        Back to product approvals
      </Link>
      <header className={styles.header}>
        <div>
          <p>{product.categoryName}</p>
          <h1>{product.name}</h1>
          <span>Sold by {product.sellerName}</span>
        </div>
        <SellerStatusBadge status={product.status} />
      </header>
      <div className={styles.details}>
        <div className={styles.stack}>
          {product.imageUrl ? (
            <div className={styles.image}>
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
              />
            </div>
          ) : null}
          <section className={styles.panel}>
            <h2>Listing content</h2>
            <div className={styles.copy}>
              <strong>{product.shortDescription}</strong>
              <p>{product.fullDescription}</p>
            </div>
          </section>
          <section className={styles.panel}>
            <h2>Product facts</h2>
            <dl className={styles.definitionList}>
              <div>
                <dt>Price</dt>
                <dd>{formatPrice(product.priceInPaise)}</dd>
              </div>
              <div>
                <dt>Available stock</dt>
                <dd>{product.stock}</dd>
              </div>
              <div>
                <dt>Material</dt>
                <dd>{product.material}</dd>
              </div>
              <div>
                <dt>Finish</dt>
                <dd>{product.finish ?? 'Not specified'}</dd>
              </div>
              <div>
                <dt>Dimensions</dt>
                <dd>{product.dimensions ?? 'Not specified'}</dd>
              </div>
              <div>
                <dt>Customisation</dt>
                <dd>{product.customisationEnabled ? 'Available' : 'Not available'}</dd>
              </div>
            </dl>
          </section>
          <section className={styles.panel}>
            <h2>Safety and intellectual property</h2>
            <div className={styles.copy}>
              <p>{product.safetyNotes ?? 'No additional safety note.'}</p>
              <p>{product.ipDeclaration}</p>
            </div>
          </section>
          <section className={styles.panel}>
            <h2>Variants</h2>
            <div className={styles.tagList}>
              {product.variants.length ? (
                product.variants.map((variant) => (
                  <span key={variant.id}>
                    {variant.name} · {variant.sku}
                  </span>
                ))
              ) : (
                <span>No variants</span>
              )}
            </div>
          </section>
        </div>
        <aside className={styles.stack}>
          <section className={styles.panel}>
            <h2>Moderation decision</h2>
            <ModerationForm
              action={moderateProductAction}
              entityField="productId"
              entityId={product.id}
              decisionField="decision"
              options={[
                { value: 'APPROVE_AND_PUBLISH', label: 'Approve and publish' },
                { value: 'APPROVE', label: 'Approve without publishing' },
                { value: 'REQUEST_CHANGES', label: 'Request changes' },
                { value: 'REJECT', label: 'Reject' },
              ]}
              submitLabel="Save product decision"
            />
          </section>
          <section className={styles.panel}>
            <h2>Previous notes</h2>
            <div className={styles.auditList}>
              {product.events.length ? (
                product.events.map((event) => (
                  <article className={styles.auditRow} key={event.id}>
                    <div>
                      <strong>{event.newStatus.replaceAll('_', ' ')}</strong>
                      <span>{event.note ?? 'No note'}</span>
                    </div>
                    <time dateTime={event.createdAt.toISOString()}>
                      {event.createdAt.toLocaleDateString('en-IN')}
                    </time>
                  </article>
                ))
              ) : (
                <p className={styles.muted}>No prior moderation events.</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
