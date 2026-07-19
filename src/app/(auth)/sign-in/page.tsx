import Link from 'next/link';
import type { Route } from 'next';
import { AuthForm } from '@/features/authentication/components';
import { signInAction } from '@/features/authentication/actions';
import { getCurrentSession, resolvePostAuthPath } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface SignInPageProps {
  readonly searchParams: Promise<{ next?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const requestedPath = (await searchParams).next ?? '';
  const session = await getCurrentSession();
  if (session) redirect(resolvePostAuthPath(session.user.role, requestedPath) as Route);
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[var(--container-max)] place-items-center gap-6 px-[var(--gutter)] py-12">
      <AuthForm mode="sign-in" action={signInAction} returnTo={requestedPath} />
      <Link
        className="font-bold text-primary"
        href={requestedPath ? `/sign-up?next=${encodeURIComponent(requestedPath)}` : '/sign-up'}
      >
        Need an account? Sign up
      </Link>
    </main>
  );
}
