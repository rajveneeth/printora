import { ProductCard } from '@/features/catalogue/components/product-card';
import styles from './ProductGrid.module.scss';
import type { ProductGridProps } from './ProductGrid.model';

export function ProductGrid({ products, priorityCount = 0 }: ProductGridProps) {
  return (
    <div className={styles.root}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < priorityCount} />
      ))}
    </div>
  );
}
