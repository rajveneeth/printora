'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Menu, Package, Search, UserRound, X } from 'lucide-react';
import type { CategorySummary } from '@/features/catalogue';
import styles from './SiteHeader.module.scss';

export interface MobileNavigationProps {
  readonly categories: readonly CategorySummary[];
}

export function MobileNavigation({ categories }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.mobileNavigation}>
      <button
        className={styles.mobileMenuButton}
        type="button"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-panel"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      {isOpen ? (
        <div className={styles.mobilePanel} id="mobile-navigation-panel">
          <form className={styles.mobileSearch} action="/products" role="search">
            <Search size={18} aria-hidden="true" />
            <label className="sr-only" htmlFor="mobile-site-search">
              Search the marketplace
            </label>
            <input id="mobile-site-search" name="q" type="search" placeholder="Search products" />
          </form>
          <nav aria-label="Mobile marketplace navigation">
            <Link href="/products" onClick={() => setIsOpen(false)}>
              Shop all products
            </Link>
            <Link href="/categories" onClick={() => setIsOpen(false)}>
              All categories
            </Link>
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                onClick={() => setIsOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </nav>
          <div className={styles.mobileAccountLinks}>
            <Link href="/products" onClick={() => setIsOpen(false)}>
              <Heart size={18} /> Wishlist
            </Link>
            <Link href="/account" onClick={() => setIsOpen(false)}>
              <Package size={18} /> Orders
            </Link>
            <Link href="/account" onClick={() => setIsOpen(false)}>
              <UserRound size={18} /> Account
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
