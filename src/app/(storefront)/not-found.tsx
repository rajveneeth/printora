import Link from 'next/link';
import { EmptyState } from '@/components/ui';
import styles from './StorefrontStates.module.scss';

export default function StorefrontNotFound() {
  return (
    <main id="main-content" className={styles.errorMain}>
      <EmptyState
        title="We couldn’t find that creation"
        description="It may have moved, sold out, or no longer be available. There is plenty more to discover."
        action={
          <Link className={styles.action} href="/products">
            Browse all products
          </Link>
        }
      />
    </main>
  );
}
