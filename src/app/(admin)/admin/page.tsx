import type { Metadata } from 'next';
import Link from 'next/link';
import { Boxes, FolderTree, ScrollText, Star, Store } from 'lucide-react';
import { PrismaAdministrationRepository } from '@/features/administration';
import { MetricCard } from '@/features/seller/components';
import { prisma } from '@/lib/prisma';
import styles from './AdminPage.module.scss';

export const metadata: Metadata = { title: 'Overview' };

const quickLinks = [
  { href: '/admin/products', label: 'Review products', icon: Boxes },
  { href: '/admin/sellers', label: 'Verify sellers', icon: Store },
  { href: '/admin/categories', label: 'Manage categories', icon: FolderTree },
  { href: '/admin/reviews', label: 'Moderate reviews', icon: Star },
  { href: '/admin/audit', label: 'Open audit log', icon: ScrollText },
] as const;

export default async function AdminPage() {
  const dashboard = await new PrismaAdministrationRepository(prisma).getDashboard();
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>Marketplace operations</p>
          <h1>Administration overview</h1>
          <span>Moderation queues, commerce health, and traceable platform decisions.</span>
        </div>
      </header>
      <section className={styles.metrics} aria-label="Administration metrics">
        {dashboard.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>
      <nav className={styles.quickLinks} aria-label="Administration tools">
        {quickLinks.map(({ href, label, icon: Icon }) => (
          <Link href={href} key={href}>
            <Icon aria-hidden="true" size={22} />
            <strong>{label}</strong>
            <span>Open operational workspace</span>
          </Link>
        ))}
      </nav>
      <section className={styles.panel}>
        <h2>Recent audit activity</h2>
        <div className={styles.auditList}>
          {dashboard.recentAudit.length ? (
            dashboard.recentAudit.map((event) => (
              <article className={styles.auditRow} key={event.id}>
                <div>
                  <strong>{event.action.replaceAll('_', ' ')}</strong>
                  <span>
                    {event.actorName} · {event.entityType}
                  </span>
                </div>
                <time dateTime={event.createdAt.toISOString()}>
                  {event.createdAt.toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </time>
              </article>
            ))
          ) : (
            <p className={styles.muted}>
              Audit events will appear after the first administration action.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
