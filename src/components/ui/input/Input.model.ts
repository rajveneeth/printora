import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
  readonly error?: string | undefined;
  readonly hint?: string | undefined;
}
