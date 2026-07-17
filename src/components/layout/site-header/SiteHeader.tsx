import Link from 'next/link';
import { Heart, Menu, Package, Search, ShoppingBag, UserRound } from 'lucide-react';
import { categories } from '@/features/catalogue';
import { siteConfig } from '@/config/site';
import { MobileNavigation } from './MobileNavigation';
import styles from './SiteHeader.module.scss';

function BrandMark() {
  return (
    <span className={styles.brandMark} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className={styles.root}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <div className={styles.topbar}>
        <div className={styles.topbarInner}>
          <MobileNavigation categories={categories} />
          <Link className={styles.brand} href="/" aria-label={`${siteConfig.name} home`}>
            <BrandMark />
            <span>{siteConfig.shortName}</span>
          </Link>
          <form className={styles.search} action="/products" role="search">
            <Search size={18} aria-hidden="true" />
            <label className="sr-only" htmlFor="site-search">
              Search the marketplace
            </label>
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder="What would you like to create?"
              autoComplete="off"
            />
            <button type="submit" aria-label="Search products">
              Search
            </button>
          </form>
          <nav className={styles.actions} aria-label="Account actions">
            <Link href="/products" aria-label="Saved products">
              <Heart size={19} />
              <span>Wishlist</span>
            </Link>
            <Link href="/account" aria-label="Your orders">
              <Package size={19} />
              <span>Orders</span>
            </Link>
            <Link href="/account" aria-label="Your account">
              <UserRound size={19} />
              <span>Account</span>
            </Link>
            <Link className={styles.cart} href="/products" aria-label="Shopping bag, empty">
              <ShoppingBag size={19} />
              <span>Bag</span>
              <b>0</b>
            </Link>
          </nav>
          <Link className={styles.mobileCart} href="/products" aria-label="Shopping bag, empty">
            <ShoppingBag size={21} />
            <span>0</span>
          </Link>
        </div>
      </div>
      <div className={styles.navigationBar}>
        <div className={styles.navigationInner}>
          <details className={styles.categoryMenu}>
            <summary>
              <Menu size={17} aria-hidden="true" />
              Categories
            </summary>
            <div className={styles.categoryPanel}>
              {categories.map((category) => (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <span>{category.name}</span>
                  <small>{category.productCount} creations</small>
                </Link>
              ))}
            </div>
          </details>
          <nav className={styles.primaryNav} aria-label="Marketplace navigation">
            <Link href="/products">Shop all</Link>
            <Link href="/categories">Explore categories</Link>
            <a href="#how-it-works">How it works</a>
          </nav>
          <nav className={styles.secondaryNav} aria-label="Marketplace actions">
            <Link className={styles.ideaLink} href="/products?customisable=true">
              Post your idea
            </Link>
            <Link href="/sign-up">Become a seller</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
