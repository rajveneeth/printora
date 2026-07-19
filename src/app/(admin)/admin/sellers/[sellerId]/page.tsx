import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui';
import { ModerationForm, PrismaAdministrationRepository } from '@/features/administration';
import { moderateSellerAction } from '@/features/administration/actions';
import { prisma } from '@/lib/prisma';
import styles from '../../AdminPage.module.scss';

export const metadata: Metadata = { title: 'Review seller' };

interface SellerModerationPageProps {
  readonly params: Promise<{ sellerId: string }>;
}

export default async function SellerModerationPage({ params }: SellerModerationPageProps) {
  const seller = await new PrismaAdministrationRepository(prisma).findSeller(
    (await params).sellerId,
  );
  if (!seller) notFound();
  return (
    <div className={styles.page}>
      <Link className={styles.backLink} href="/admin/sellers">
        Back to sellers
      </Link>
      <header className={styles.header}>
        <div>
          <p>Seller verification</p>
          <h1>{seller.storeName}</h1>
          <span>
            {seller.origin} · {seller.contactEmail}
          </span>
        </div>
        <Badge
          tone={
            seller.status === 'APPROVED'
              ? 'success'
              : seller.status === 'SUSPENDED' || seller.status === 'REJECTED'
                ? 'error'
                : 'warning'
          }
        >
          {seller.status.replaceAll('_', ' ')}
        </Badge>
      </header>
      <div className={styles.details}>
        <div className={styles.stack}>
          <section className={styles.panel}>
            <h2>Store information</h2>
            <div className={styles.copy}>
              <p>{seller.description}</p>
              <p>Store URL: /sellers/{seller.storeSlug}</p>
            </div>
          </section>
          <section className={styles.panel}>
            <h2>Capabilities</h2>
            <div className={styles.tagList}>
              {[...seller.supportedMaterials, ...seller.printTechnologies].map((capability) => (
                <span key={capability}>{capability}</span>
              ))}
            </div>
          </section>
          <section className={styles.panel}>
            <h2>Application record</h2>
            <p className={styles.muted}>
              {seller.submittedAt
                ? `Submitted ${seller.submittedAt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`
                : 'No submitted application timestamp.'}
            </p>
            <p>
              Safety and originality declaration:{' '}
              <strong>{seller.declarationAccepted ? 'Accepted' : 'Missing'}</strong>
            </p>
            {seller.changeRequestNote ? <p>{seller.changeRequestNote}</p> : null}
          </section>
        </div>
        <aside className={styles.panel}>
          <h2>Moderation decision</h2>
          <ModerationForm
            action={moderateSellerAction}
            entityField="sellerId"
            entityId={seller.id}
            decisionField="decision"
            options={[
              { value: 'APPROVE', label: 'Approve seller' },
              { value: 'REQUEST_CHANGES', label: 'Request changes' },
              { value: 'REJECT', label: 'Reject application' },
              { value: 'SUSPEND', label: 'Suspend approved seller' },
            ]}
            submitLabel="Save seller decision"
          />
        </aside>
      </div>
    </div>
  );
}
