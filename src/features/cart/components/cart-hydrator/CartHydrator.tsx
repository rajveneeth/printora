'use client';

import { useEffect } from 'react';
import { useCartStore } from '../../store';

export function CartHydrator() {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);
  return null;
}
