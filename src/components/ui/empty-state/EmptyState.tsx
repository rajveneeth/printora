import { useId } from 'react';
import { Box } from 'lucide-react';
import styles from './EmptyState.module.scss';
import type { EmptyStateProps } from './EmptyState.model';

export function EmptyState({ title, description, action }: EmptyStateProps) {
  const titleId = useId();
  return (
    <section className={styles.root} aria-labelledby={titleId}>
      <span className={styles.icon} aria-hidden="true">
        <Box size={22} />
      </span>
      <h2 className={styles.title} id={titleId}>
        {title}
      </h2>
      <p className={styles.description}>{description}</p>
      {action}
    </section>
  );
}
