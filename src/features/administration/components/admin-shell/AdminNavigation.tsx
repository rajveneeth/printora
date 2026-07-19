'use client';

import Link from 'next/link';
import { Boxes, FolderTree, LayoutDashboard, ScrollText, Star, Store } from 'lucide-react';
import { usePathname } from 'next/navigation';
import styles from './AdminShell.module.scss';

const links = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Product approvals', icon: Boxes },
  { href: '/admin/sellers', label: 'Sellers', icon: Store },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/audit', label: 'Audit log', icon: ScrollText },
] as const;

export function AdminNavigation() {
  const pathname = usePathname();
  return (
    <nav className={styles.navigation} aria-label="Administration navigation">
      {links.map(({ href, label, icon: Icon }) => {
        const isActive = href === '/admin' ? pathname === href : pathname.startsWith(href);
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
