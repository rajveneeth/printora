import { Skeleton } from '@/components/ui';

export default function SellerLoading() {
  return (
    <div className="grid gap-5" aria-label="Loading seller workspace" role="status">
      <Skeleton className="h-12 w-full max-w-lg" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton className="h-32" key={index} />
        ))}
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}
