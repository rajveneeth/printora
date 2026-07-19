import type { ReactNode } from 'react';
import type { CartTotals } from '../../models';

export interface CartSummaryProps {
  readonly totals: CartTotals;
  readonly action?: ReactNode;
  readonly title?: string;
}
