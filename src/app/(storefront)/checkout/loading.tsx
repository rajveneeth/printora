import { Skeleton } from '@/components/ui';
import styles from './CheckoutPage.module.scss';

export default function CheckoutLoading() {
  return (
    <main id="main-content" className={styles.main} aria-busy="true" aria-label="Loading checkout">
      <header>
        <div>
          <Skeleton style={{ width: '8rem' }} />
          <Skeleton style={{ width: '20rem', height: '2.5rem' }} />
        </div>
      </header>
      <Skeleton style={{ height: '26rem' }} />
    </main>
  );
}
