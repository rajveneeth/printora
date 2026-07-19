'use client';

import { ErrorState } from '@/components/ui';

interface AdminErrorProps {
  readonly reset: () => void;
}

export default function AdminError({ reset }: AdminErrorProps) {
  return (
    <ErrorState
      title="Administration data is unavailable"
      description="The moderation workspace could not be loaded safely. Try the request again."
      action={<button onClick={reset}>Try again</button>}
    />
  );
}
