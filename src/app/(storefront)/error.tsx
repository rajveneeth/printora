'use client';

import { Button, ErrorState } from '@/components/ui';
import styles from './StorefrontStates.module.scss';

export default function StorefrontError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <main id="main-content" className={styles.errorMain}>
      <ErrorState
        title="The marketplace took an unexpected pause"
        description="Your filters and account are safe. Try loading this page again, or return to the catalogue."
        action={<Button onClick={reset}>Try again</Button>}
      />
    </main>
  );
}
