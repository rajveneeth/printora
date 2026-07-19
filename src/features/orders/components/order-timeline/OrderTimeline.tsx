import { Check } from 'lucide-react';
import type { OrderTimelineEvent } from '../../models';
import { orderStatusLabel } from '../../services';
import styles from './OrderTimeline.module.scss';

interface OrderTimelineProps {
  readonly events: readonly OrderTimelineEvent[];
}

export function OrderTimeline({ events }: OrderTimelineProps) {
  return (
    <ol className={styles.timeline} aria-label="Order status history">
      {events.map((event) => (
        <li key={event.id}>
          <span className={styles.marker} aria-hidden="true">
            <Check size={14} />
          </span>
          <div>
            <strong>{orderStatusLabel(event.status)}</strong>
            <time dateTime={event.createdAt.toISOString()}>
              {event.createdAt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </time>
            {event.note ? <p>{event.note}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
