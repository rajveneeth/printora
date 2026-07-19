'use client';

import { useActionState } from 'react';
import { Button, Select, Textarea } from '@/components/ui';
import type { AdminActionState } from '../../models';
import styles from './ModerationForm.module.scss';

interface ModerationFormProps {
  readonly action: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  readonly entityField: 'productId' | 'sellerId' | 'reviewId';
  readonly entityId: string;
  readonly decisionField: 'decision' | 'status';
  readonly options: readonly { value: string; label: string }[];
  readonly submitLabel: string;
}

const initialState = { status: 'idle', message: '' } as const;

export function ModerationForm({
  action,
  entityField,
  entityId,
  decisionField,
  options,
  submitLabel,
}: ModerationFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name={entityField} value={entityId} />
      <Select label="Decision" name={decisionField} options={options} />
      <Textarea
        label="Moderation reason"
        name="reason"
        maxLength={1000}
        hint="Required for rejection, requested changes, suspension, and review visibility changes."
      />
      <Button type="submit" isLoading={isPending}>
        {submitLabel}
      </Button>
      {state.message ? (
        <p className={state.status === 'error' ? styles.error : styles.success} role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
