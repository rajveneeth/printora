import type { Metadata } from 'next';
import { CategoryNavigation, categories } from '@/features/catalogue';
import styles from '../StorefrontPage.module.scss';

export const metadata: Metadata = {
  title: 'Product categories',
  description: 'Browse 3D-printed products by room, purpose, interest, or use case.',
};

export default function CategoriesPage() {
  return (
    <main id="main-content" className={styles.main}>
      <section className={styles.pageIntro}>
        <p>Explore the marketplace</p>
        <h1>Find the right corner to start from.</h1>
        <span>
          Browse by purpose, space, or interest. Every category includes ready-made and customisable
          work from verified independent makers.
        </span>
      </section>
      <CategoryNavigation categories={categories} />
    </main>
  );
}
