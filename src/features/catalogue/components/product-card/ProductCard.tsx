import Image from 'next/image';
import Link from 'next/link';
import { Clock3, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui';
import { PriceDisplay } from '@/features/catalogue/components/price-display';
import { RatingSummary } from '@/features/catalogue/components/rating-summary';
import { WishlistButton } from './WishlistButton';
import styles from './ProductCard.module.scss';
import type { ProductCardProps } from './ProductCard.model';

export function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <article className={styles.root}>
      <div className={styles.media}>
        <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 520px) 50vw, (max-width: 900px) 33vw, 22vw"
          />
        </Link>
        <WishlistButton productName={product.name} />
        {product.customisable ? (
          <Badge className={styles.badge} tone="success">
            <SlidersHorizontal size={12} aria-hidden="true" /> Customisable
          </Badge>
        ) : null}
      </div>
      <div className={styles.body}>
        <p className={styles.seller}>{product.seller.name}</p>
        <h3>
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className={styles.meta}>
          <RatingSummary rating={product.rating} reviewCount={product.reviewCount} compact />
          <span>
            <Clock3 size={13} aria-hidden="true" /> {product.processingDays} days
          </span>
        </div>
        <PriceDisplay
          priceInPaise={product.priceInPaise}
          {...(product.compareAtPriceInPaise === undefined
            ? {}
            : { compareAtPriceInPaise: product.compareAtPriceInPaise })}
          size="small"
        />
      </div>
    </article>
  );
}
