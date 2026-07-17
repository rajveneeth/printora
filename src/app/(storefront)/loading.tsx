import { Skeleton } from '@/components/ui';
import styles from './StorefrontStates.module.scss';

export default function StorefrontLoading() {
  return (
    <main id="main-content" className={styles.main} aria-busy="true">
      <span className="sr-only">Loading marketplace</span>
      <Skeleton className={styles.hero} label="Loading page heading" />
      <div className={styles.toolbar}>
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
      <div className={styles.grid}>
        {Array.from({ length: 8 }, (_, index) => (
          <article key={index} className={styles.card}>
            <Skeleton className={styles.image} label={`Loading product ${index + 1}`} />
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </article>
        ))}
      </div>
    </main>
  );
}
