import { Skeleton } from '@/components/ui';
import styles from '../StorefrontStates.module.scss';

export default function SearchLoading() {
  return (
    <main id="main-content" className={styles.main} aria-label="Loading search results">
      <Skeleton className={styles.hero} label="Loading search controls" />
      <div className={styles.grid}>
        {Array.from({ length: 8 }, (_, index) => (
          <div className={styles.card} key={index}>
            <Skeleton className={styles.image} label="Loading product image" />
            <Skeleton label="Loading product details" />
          </div>
        ))}
      </div>
    </main>
  );
}
