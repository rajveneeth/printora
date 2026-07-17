import Link from 'next/link';
import { AuthForm } from '@/features/authentication/components';
import { signUpAction } from '@/features/authentication/actions';

export default function SignUpPage() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[var(--container-max)] place-items-center gap-6 px-[var(--gutter)] py-12">
      <AuthForm mode="sign-up" action={signUpAction} />
      <Link className="font-bold text-primary" href="/sign-in">
        Already registered? Sign in
      </Link>
    </main>
  );
}
