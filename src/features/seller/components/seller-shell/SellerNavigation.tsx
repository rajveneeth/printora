'use client';

import Link from 'next/link';
import { Boxes, LayoutDashboard, Settings2, Store } from 'lucide-react';
import { usePathname } from 'next/navigation';
import styles from './SellerShell.module.scss';

interface SellerNavigationProps {
  readonly hasSellerProfile: boolean;
}

const sellerLinks = [
  { href: '/seller', label: 'Overview', icon: LayoutDashboard },
  { href: '/seller/products', label: 'Products', icon: Boxes },
  { href: '/seller/profile', label: 'Store profile', icon: Settings2 },
] as const;

export function SellerNavigation({ hasSellerProfile }: SellerNavigationProps) {
  const pathname = usePathname();
  if (!hasSellerProfile) {
    return (
      <nav aria-label="Seller navigation" className={styles.navigation}>
        <Link
          className={styles.navigationLink}
          data-active={pathname === '/seller/onboarding'}
          href="/seller/onboarding"
        >
          <Store aria-hidden="true" size={18} />
          Seller onboarding
        </Link>
      </nav>
    );
  }
  return (
    <nav aria-label="Seller navigation" className={styles.navigation}>
      {sellerLinks.map(({ href, label, icon: Icon }) => {
        const isActive = href === '/seller' ? pathname === href : pathname.startsWith(href);
        return (
          <Link className={styles.navigationLink} data-active={isActive} href={href} key={href}>
            <Icon aria-hidden="true" size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
