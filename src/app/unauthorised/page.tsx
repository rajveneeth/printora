import Link from 'next/link';
import { Card } from '@/components/ui';

export default function UnauthorisedPage() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[var(--container-max)] place-items-center px-[var(--gutter)] py-12">
      <Card className="grid max-w-xl gap-4 text-center">
        <p className="text-sm font-extrabold uppercase tracking-wide text-error">Unauthorised</p>
        <h1 className="text-4xl font-extrabold text-primary">
          This area requires a different role.
        </h1>
        <p className="text-muted-foreground">
          Formivo 3D checks permissions on the server for protected buyer, seller, and admin routes.
        </p>
        <Link className="font-bold text-primary" href="/">
          Return home
        </Link>
      </Card>
    </main>
  );
}
