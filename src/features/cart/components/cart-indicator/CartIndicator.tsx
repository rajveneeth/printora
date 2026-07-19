'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store';
import type { CartIndicatorProps } from './CartIndicator.model';

export function CartIndicator({ className, compact = false }: CartIndicatorProps) {
  const itemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const isHydrated = useCartStore((state) => state.isHydrated);
  const visibleCount = isHydrated ? itemCount : 0;
  const label = visibleCount
    ? `Shopping bag, ${visibleCount} ${visibleCount === 1 ? 'item' : 'items'}`
    : 'Shopping bag, empty';

  return (
    <Link className={className} href={'/cart' as Route} aria-label={label}>
      <ShoppingBag size={compact ? 21 : 19} />
      {compact ? null : <span>Bag</span>}
      {compact ? <span>{visibleCount}</span> : <b>{visibleCount}</b>}
    </Link>
  );
}
