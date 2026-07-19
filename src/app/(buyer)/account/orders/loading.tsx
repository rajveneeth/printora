import { Skeleton } from '@/components/ui';
import styles from './OrdersPage.module.scss';

export default function BuyerOrdersLoading() {
  return (
    <main className={styles.page} aria-label="Loading your orders">
      <Skeleton style={{ height: '6rem' }} />
      <Skeleton style={{ height: '15rem' }} />
      <Skeleton style={{ height: '15rem' }} />
    </main>
  );
}
