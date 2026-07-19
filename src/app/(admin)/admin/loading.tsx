import { Skeleton } from '@/components/ui';
import styles from './AdminPage.module.scss';

export default function AdminLoading() {
  return (
    <div className={styles.page} aria-label="Loading administration workspace">
      <Skeleton style={{ height: '5rem' }} />
      <section className={styles.metrics}>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton style={{ height: '8rem' }} key={index} />
        ))}
      </section>
      <Skeleton style={{ height: '22rem' }} />
    </div>
  );
}
