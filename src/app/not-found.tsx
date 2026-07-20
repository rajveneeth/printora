import Link from 'next/link';
import { EmptyState } from '@/components/ui';

export default function RootNotFound() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[var(--container-max)] place-items-center px-[var(--gutter)] py-12">
      <EmptyState
        title="We could not find that page"
        description="The link may be outdated, or the page may have moved."
        action={<Link href="/">Return home</Link>}
      />
    </main>
  );
}
