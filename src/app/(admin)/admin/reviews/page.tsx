import type { ReviewStatus } from '@prisma/client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, EmptyState } from '@/components/ui';
import { ModerationForm, PrismaAdministrationRepository } from '@/features/administration';
import { moderateReviewAction } from '@/features/administration/actions';
import { prisma } from '@/lib/prisma';
import styles from '../AdminPage.module.scss';

export const metadata: Metadata = { title: 'Review moderation' };

interface AdminReviewsPageProps {
  readonly searchParams: Promise<{ status?: string }>;
}

const statuses: readonly { value: '' | ReviewStatus; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'HIDDEN', label: 'Hidden' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default async function AdminReviewsPage({ searchParams }: AdminReviewsPageProps) {
  const requested = (await searchParams).status ?? '';
  const status = statuses.find(({ value }) => value === requested)?.value ?? '';
  const reviews = await new PrismaAdministrationRepository(prisma).listReviews(status || undefined);
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>Verified feedback</p>
          <h1>Review moderation</h1>
          <span>Moderate visibility with a required reason and immutable decision history.</span>
        </div>
      </header>
      <nav className={styles.filters} aria-label="Review filters">
        {statuses.map((filter) => (
          <Link
            data-active={status === filter.value}
            href={filter.value ? `/admin/reviews?status=${filter.value}` : '/admin/reviews'}
            key={filter.label}
          >
            {filter.label}
          </Link>
        ))}
      </nav>
      {reviews.length ? (
        <section className={styles.list}>
          {reviews.map((review) => (
            <article className={styles.row} key={review.id}>
              <header className={styles.rowHeader}>
                <div>
                  <p className={styles.eyebrow}>
                    {review.productName} · {review.sellerName}
                  </p>
                  <h2>{review.title}</h2>
                  <p>
                    {review.customerName}
                    {review.orderNumber ? ` · Verified order ${review.orderNumber}` : ''}
                  </p>
                </div>
                <div>
                  <span className={styles.rating}>{'★'.repeat(review.rating)}</span>
                  <Badge
                    tone={
                      review.status === 'PUBLISHED'
                        ? 'success'
                        : review.status === 'PENDING'
                          ? 'warning'
                          : 'error'
                    }
                  >
                    {review.status}
                  </Badge>
                </div>
              </header>
              <p>{review.body}</p>
              <ModerationForm
                action={moderateReviewAction}
                entityField="reviewId"
                entityId={review.id}
                decisionField="status"
                options={[
                  { value: 'PUBLISHED', label: 'Publish' },
                  { value: 'HIDDEN', label: 'Hide' },
                  { value: 'REJECTED', label: 'Reject' },
                ]}
                submitLabel="Update visibility"
              />
            </article>
          ))}
        </section>
      ) : (
        <EmptyState
          title="No reviews in this view"
          description="Verified ratings and moderation candidates will appear here."
        />
      )}
    </div>
  );
}
