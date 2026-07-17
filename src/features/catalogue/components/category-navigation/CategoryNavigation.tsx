import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './CategoryNavigation.module.scss';
import type { CategoryNavigationProps } from './CategoryNavigation.model';

export function CategoryNavigation({ categories, compact = false }: CategoryNavigationProps) {
  return (
    <div className={styles.root} data-compact={compact}>
      {categories.map((category) => (
        <Link key={category.id} className={styles.card} href={`/categories/${category.slug}`}>
          <span className={styles.image}>
            <Image
              src={category.imageUrl}
              alt=""
              fill
              sizes={compact ? '160px' : '(max-width: 600px) 50vw, 25vw'}
            />
          </span>
          <span className={styles.content}>
            <strong>{category.name}</strong>
            {compact ? null : <small>{category.description}</small>}
            <span>
              {category.productCount} creations <ArrowRight size={14} />
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
