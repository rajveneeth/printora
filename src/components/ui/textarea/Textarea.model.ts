import type { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly label: string;
  readonly error?: string | undefined;
  readonly hint?: string | undefined;
}
