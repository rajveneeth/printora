import Link from 'next/link';
import { AuthForm } from '@/features/authentication/components';
import { signUpAction } from '@/features/authentication/actions';

interface SignUpPageProps {
  readonly searchParams: Promise<{ next?: string }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const requestedPath = (await searchParams).next ?? '';
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[var(--container-max)] place-items-center gap-6 px-[var(--gutter)] py-12">
      <AuthForm mode="sign-up" action={signUpAction} returnTo={requestedPath} />
      <Link
        className="font-bold text-primary"
        href={requestedPath ? `/sign-in?next=${encodeURIComponent(requestedPath)}` : '/sign-in'}
      >
        Already registered? Sign in
      </Link>
    </main>
  );
}
