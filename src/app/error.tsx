'use client';

import { useEffect } from 'react';
import { Button, ErrorState } from '@/components/ui';

export default function RootError({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    console.error('Application route error', { digest: error.digest });
  }, [error]);
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[var(--container-max)] place-items-center px-[var(--gutter)] py-12">
      <ErrorState
        title="This page could not be loaded"
        description="Your account and payment details have not been changed. Please try again."
        action={<Button onClick={reset}>Try again</Button>}
      />
    </main>
  );
}
