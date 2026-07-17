import styles from './ErrorState.module.scss';
import type { ErrorStateProps } from './ErrorState.model';

export function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <section className={styles.root} role="alert" aria-labelledby="error-state-title">
      <h2 className={styles.title} id="error-state-title">
        {title}
      </h2>
      <p className={styles.description}>{description}</p>
      {action}
    </section>
  );
}
