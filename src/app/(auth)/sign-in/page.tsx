import Link from 'next/link';
import { AuthForm } from '@/features/authentication/components';
import { signInAction } from '@/features/authentication/actions';

export default function SignInPage() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[var(--container-max)] place-items-center gap-6 px-[var(--gutter)] py-12">
      <AuthForm mode="sign-in" action={signInAction} />
      <Link className="font-bold text-primary" href="/sign-up">
        Need an account? Sign up
      </Link>
    </main>
  );
}
