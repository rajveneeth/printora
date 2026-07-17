import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly children: ReactNode;
  readonly tone?: BadgeTone;
}
