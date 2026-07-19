import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui';
import { CategoryForm, PrismaAdministrationRepository } from '@/features/administration';
import { prisma } from '@/lib/prisma';
import styles from '../AdminPage.module.scss';

export const metadata: Metadata = { title: 'Categories' };

interface AdminCategoriesPageProps {
  readonly searchParams: Promise<{ edit?: string }>;
}

export default async function AdminCategoriesPage({ searchParams }: AdminCategoriesPageProps) {
  const categories = await new PrismaAdministrationRepository(prisma).listCategories();
  const editId = (await searchParams).edit;
  const selectedCategory = categories.find((category) => category.id === editId);
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>Catalogue structure</p>
          <h1>Categories</h1>
          <span>Manage hierarchy, navigation order, visibility, and SEO metadata.</span>
        </div>
      </header>
      <div className={styles.details}>
        <section className={styles.list} aria-label="Marketplace categories">
          {categories.map((category) => (
            <article className={styles.row} key={category.id}>
              <header className={styles.rowHeader}>
                <div>
                  <p className={styles.eyebrow}>{category.parentName ?? 'Top level'}</p>
                  <h2>{category.name}</h2>
                  <p>/{category.slug}</p>
                </div>
                <Badge tone={category.isActive ? 'success' : 'neutral'}>
                  {category.isActive ? 'Active' : 'Archived'}
                </Badge>
              </header>
              <div className={styles.rowFooter}>
                <span>
                  {category.productCount} products · Position {category.position}
                </span>
                <Link href={`/admin/categories?edit=${category.id}`}>Edit category</Link>
              </div>
            </article>
          ))}
        </section>
        <aside className={styles.panel}>
          <h2>{selectedCategory ? `Edit ${selectedCategory.name}` : 'Add category'}</h2>
          <CategoryForm category={selectedCategory} categories={categories} />
          {selectedCategory ? (
            <Link className={styles.backLink} href="/admin/categories">
              Create another category
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
