import type { Metadata } from 'next';
import { PrismaAdministrationRepository } from '@/features/administration';
import { prisma } from '@/lib/prisma';
import styles from '../AdminPage.module.scss';

export const metadata: Metadata = { title: 'Audit log' };

export default async function AdminAuditPage() {
  const events = await new PrismaAdministrationRepository(prisma).listAuditLogs();
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>Accountability</p>
          <h1>Audit log</h1>
          <span>
            Chronological records for moderation, fulfilment, review, and category state changes.
          </span>
        </div>
      </header>
      <section className={styles.panel}>
        <div className={styles.auditList}>
          {events.length ? (
            events.map((event) => (
              <article className={styles.auditRow} key={event.id}>
                <div>
                  <strong>{event.action.replaceAll('_', ' ')}</strong>
                  <span>
                    {event.actorName} · {event.entityType}
                  </span>
                  <code>{event.entityId}</code>
                  {event.reason ? <p>{event.reason}</p> : null}
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
            <p className={styles.muted}>No audited state changes have been recorded yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
