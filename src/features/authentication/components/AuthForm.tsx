'use client';

import { useActionState } from 'react';
import { Button, Card, Input } from '@/components/ui';
import type { AuthActionState } from '../actions';
import styles from './AuthForm.module.scss';

interface AuthFormProps {
  mode: 'sign-in' | 'sign-up';
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  returnTo?: string | undefined;
}

const initialState: AuthActionState = { message: '' };

export function AuthForm({ mode, action, returnTo = '' }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isSignUp = mode === 'sign-up';
  return (
    <Card className={styles.panel}>
      <form action={formAction} className={styles.form}>
        <input type="hidden" name="returnTo" value={returnTo} />
        <div className={styles.heading}>
          <p className={styles.kicker}>
            {isSignUp ? 'Create your marketplace account' : 'Welcome back'}
          </p>
          <h1>{isSignUp ? 'Sign up for Formivo 3D' : 'Sign in to Formivo 3D'}</h1>
          <p>
            {isSignUp
              ? 'Choose buyer access for shopping or seller access to start an approval-ready store profile.'
              : 'Access buyer orders, seller tools, or admin moderation from one secure session.'}
          </p>
        </div>
        {isSignUp ? <Input label="Full name" name="name" autoComplete="name" required /> : null}
        <Input label="Email" name="email" type="email" autoComplete="username" required />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          minLength={8}
          required
        />
        {isSignUp ? (
          <fieldset className={styles.roles}>
            <legend>Account role</legend>
            <label>
              <input name="role" type="radio" value="CUSTOMER" defaultChecked /> Buyer
            </label>
            <label>
              <input name="role" type="radio" value="SELLER" /> Seller
            </label>
          </fieldset>
        ) : null}
        {state.message ? (
          <p className={styles.error} role="alert">
            {state.message}
          </p>
        ) : null}
        <Button type="submit" isLoading={isPending}>
          {isSignUp ? 'Create account' : 'Sign in'}
        </Button>
      </form>
    </Card>
  );
}
