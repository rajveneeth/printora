'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { authenticatedCookieName } from '@/lib/auth/constants';
import {
  hasActiveCartSessionAction,
  saveAccountCartAction,
  synchronizeGuestCartAction,
} from '../../actions';
import { toCartSyncLines } from '../../services';
import { useCartStore } from '../../store';

const hasAuthenticatedMarker = (): boolean =>
  document.cookie.split('; ').some((cookie) => cookie === `${authenticatedCookieName}=1`);

const clearAuthenticatedMarker = (): void => {
  document.cookie = `${authenticatedCookieName}=; Path=/; Max-Age=0; SameSite=Lax`;
};

export function CartHydrator() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    const refreshAuthenticationState = async (): Promise<void> => {
      const hasMarker = hasAuthenticatedMarker();
      if (!hasMarker) {
        setIsAuthenticated(false);
        return;
      }
      try {
        const hasActiveSession = await hasActiveCartSessionAction();
        if (!active) return;
        if (!hasActiveSession) clearAuthenticatedMarker();
        setIsAuthenticated(hasActiveSession);
      } catch {
        if (active) setIsAuthenticated(true);
      }
    };

    const refreshOnBrowserEvent = (): void => {
      void refreshAuthenticationState();
    };

    void refreshAuthenticationState();
    window.addEventListener('focus', refreshOnBrowserEvent);
    window.addEventListener('pageshow', refreshOnBrowserEvent);
    return () => {
      active = false;
      window.removeEventListener('focus', refreshOnBrowserEvent);
      window.removeEventListener('pageshow', refreshOnBrowserEvent);
    };
  }, [pathname]);

  useEffect(() => {
    if (isAuthenticated === null) return;
    let unsubscribe: (() => void) | undefined;
    let saveTimer: ReturnType<typeof setTimeout> | undefined;
    let active = true;

    const hydrateAndSynchronize = async (): Promise<void> => {
      await useCartStore.persist.rehydrate();
      if (!active) return;
      const hydrated = useCartStore.getState();
      if (!isAuthenticated) {
        if (hydrated.isAccountCart) hydrated.startGuestCart();
        return;
      }

      const result = await synchronizeGuestCartAction({
        guestCartId: hydrated.guestCartId,
        items: hydrated.isAccountCart ? [] : toCartSyncLines(hydrated.items),
      });
      if (!active) return;
      if (result.status === 'anonymous') {
        clearAuthenticatedMarker();
        if (useCartStore.getState().isAccountCart) useCartStore.getState().startGuestCart();
        return;
      }
      if (result.status !== 'authenticated') return;
      useCartStore.getState().setSynchronizedCart(result.items);

      unsubscribe = useCartStore.subscribe((state, previousState) => {
        if (!state.isAccountCart || state.items === previousState.items) return;
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
          void saveAccountCartAction({
            items: toCartSyncLines(useCartStore.getState().items),
          }).then((saveResult) => {
            if (saveResult.status === 'anonymous') {
              clearAuthenticatedMarker();
              useCartStore.getState().startGuestCart();
            }
          });
        }, 400);
      });
    };

    void hydrateAndSynchronize();
    return () => {
      active = false;
      unsubscribe?.();
      if (saveTimer) clearTimeout(saveTimer);
    };
  }, [isAuthenticated]);
  return null;
}
