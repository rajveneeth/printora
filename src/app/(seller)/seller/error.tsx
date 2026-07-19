'use client';

import { ErrorState } from '@/components/ui';

export default function SellerError({ reset }: { readonly reset: () => void }) {
  return (
    <ErrorState
      title="Seller workspace unavailable"
      description="We could not load the seller data safely. Try the request again."
      action={<button onClick={reset}>Try again</button>}
    />
  );
}
