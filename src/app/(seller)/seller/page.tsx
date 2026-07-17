import { Card } from '@/components/ui';
import { requireRole } from '@/lib/auth/session';

export default async function SellerPage() {
  const session = await requireRole('SELLER');
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[var(--container-max)] gap-6 px-[var(--gutter)] py-12">
      <Card>
        <h1 className="text-4xl font-extrabold text-primary">Seller dashboard</h1>
        <p className="mt-3 text-muted-foreground">
          {session.user.email} can manage listings, orders, quotes, and store verification.
        </p>
      </Card>
    </main>
  );
}
