import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  readonly children: ReactNode;
  readonly as?: 'article' | 'section' | 'div';
}
