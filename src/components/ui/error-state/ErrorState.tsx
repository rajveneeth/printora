import { useId } from 'react';
import styles from './ErrorState.module.scss';
import type { ErrorStateProps } from './ErrorState.model';

export function ErrorState({ title, description, action }: ErrorStateProps) {
  const titleId = useId();
  return (
    <section className={styles.root} role="alert" aria-labelledby={titleId}>
      <h2 className={styles.title} id={titleId}>
        {title}
      </h2>
      <p className={styles.description}>{description}</p>
      {action}
    </section>
  );
}
