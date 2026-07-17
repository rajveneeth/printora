import { Button, Card } from '@/components/ui';
import { requireRole } from '@/lib/auth/session';
import { signOutAction } from '@/features/authentication/actions';

export default async function AccountPage() {
  const session = await requireRole('CUSTOMER');
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[var(--container-max)] gap-6 px-[var(--gutter)] py-12">
      <Card className="grid gap-3">
        <h1 className="text-4xl font-extrabold text-primary">Buyer dashboard</h1>
        <p className="text-muted-foreground">
          Signed in as {session.user.email}. Track orders, quotations, reviews, and favourites here.
        </p>
        <form action={signOutAction}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </Card>
    </main>
  );
}
