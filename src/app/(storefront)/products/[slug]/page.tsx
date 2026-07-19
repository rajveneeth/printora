import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BadgeCheck,
  Box,
  ChevronRight,
  Clock3,
  MapPin,
  PackageCheck,
  Ruler,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react';
import { Badge } from '@/components/ui';
import {
  findProductBySlug,
  listRelatedProducts,
  ProductGallery,
  ProductGrid,
  ProductPurchasePanel,
  RatingSummary,
} from '@/features/catalogue';
import styles from './ProductPage.module.scss';

export interface ProductPageProps {
  readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = findProductBySlug((await params).slug);
  if (!product) return { title: 'Product not found' };
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [{ url: product.imageUrl, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.shortDescription,
      images: [product.imageUrl],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = findProductBySlug((await params).slug);
  if (!product) notFound();
  const relatedProducts = listRelatedProducts(product, 4);
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.gallery,
    description: product.shortDescription,
    brand: { '@type': 'Brand', name: product.seller.name },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: product.currency,
      price: product.priceInPaise / 100,
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <main id="main-content" className={styles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replaceAll('<', '\\u003c'),
        }}
      />
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <ChevronRight size={13} />
        <Link href={`/categories/${product.category.slug}`}>{product.category.name}</Link>
        <ChevronRight size={13} />
        <span aria-current="page">{product.name}</span>
      </nav>
      <section className={styles.productLayout}>
        <ProductGallery productName={product.name} images={product.gallery} />
        <div className={styles.productDetails}>
          <div className={styles.productHeading}>
            <div className={styles.badges}>
              <Badge tone="success">Made by an independent maker</Badge>
              {product.customisable ? (
                <Badge tone="warning">
                  <Sparkles size={12} /> Customisable
                </Badge>
              ) : null}
            </div>
            <h1>{product.name}</h1>
            <p>{product.shortDescription}</p>
            <div className={styles.ratingLine}>
              <RatingSummary rating={product.rating} reviewCount={product.reviewCount} />
              <span />
              <Link href={`/categories/${product.category.slug}`}>{product.category.name}</Link>
            </div>
          </div>
          <ProductPurchasePanel product={product} />
          <div className={styles.deliveryNotes}>
            <div>
              <Clock3 size={18} />
              <span>
                <b>Made in {product.processingDays} days</b>
                <small>Prepared after you order</small>
              </span>
            </div>
            <div>
              <Truck size={18} />
              <span>
                <b>
                  Estimated delivery in {product.processingDays + 4}–{product.processingDays + 6}{' '}
                  days
                </b>
                <small>Tracked delivery from {product.seller.city}</small>
              </span>
            </div>
            <div>
              <ShieldCheck size={18} />
              <span>
                <b>Buyer protection</b>
                <small>Support if the item arrives damaged</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.informationGrid}>
        <article className={styles.description}>
          <p className={styles.eyebrow}>About this creation</p>
          <h2>Designed to be useful. Finished to feel special.</h2>
          <p>{product.description}</p>
          <ul>
            {product.highlights.map((highlight) => (
              <li key={highlight}>
                <PackageCheck size={17} /> {highlight}
              </li>
            ))}
          </ul>
        </article>
        <aside className={styles.specifications} aria-label="Product specifications">
          <h2>Details</h2>
          <dl>
            <div>
              <dt>
                <Box size={17} /> Material
              </dt>
              <dd>{product.availableMaterials.join(', ')}</dd>
            </div>
            <div>
              <dt>
                <Ruler size={17} /> Dimensions
              </dt>
              <dd>{product.dimensions}</dd>
            </div>
            <div>
              <dt>
                <Scale size={17} /> Weight
              </dt>
              <dd>{product.weightGrams} g</dd>
            </div>
            <div>
              <dt>
                <Sparkles size={17} /> Finish
              </dt>
              <dd>{product.finish}</dd>
            </div>
            <div>
              <dt>
                <MapPin size={17} /> Ships from
              </dt>
              <dd>
                {product.seller.city}, {product.seller.state}
              </dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className={styles.sellerCard}>
        <div className={styles.sellerAvatar}>
          {product.seller.name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .slice(0, 2)}
        </div>
        <div>
          <p className={styles.eyebrow}>Meet your maker</p>
          <h2>
            {product.seller.name} <BadgeCheck size={20} aria-label="Verified maker" />
          </h2>
          <p>
            {product.seller.city}, {product.seller.state} ·{' '}
            {product.seller.supportedMaterials.join(' · ')}
          </p>
        </div>
        <div className={styles.sellerStats}>
          <span>
            <Star size={16} fill="currentColor" /> <b>{product.seller.rating}</b>
            <small>seller rating</small>
          </span>
          <span>
            <PackageCheck size={16} /> <b>{product.seller.completedOrders}</b>
            <small>orders completed</small>
          </span>
        </div>
        <Link href="/products">View maker’s work</Link>
      </section>

      <section className={styles.reviews} id="reviews">
        <div>
          <p className={styles.eyebrow}>Verified customer feedback</p>
          <h2>Loved for quality and thoughtful details.</h2>
          <p>Ratings come from customers whose orders were delivered through Formivo.</p>
        </div>
        <div className={styles.reviewSummary}>
          <strong>{product.rating.toFixed(1)}</strong>
          <RatingSummary
            rating={product.rating}
            reviewCount={product.reviewCount}
            label="average rating"
          />
          {[5, 4, 3, 2, 1].map((rating, index) => (
            <div key={rating}>
              <span>{rating}</span>
              <div>
                <i style={{ width: `${Math.max(4, 78 - index * 17)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.related}>
        <div className={styles.relatedHeading}>
          <div>
            <p className={styles.eyebrow}>Keep exploring</p>
            <h2>Similar creations</h2>
          </div>
          <Link href={`/categories/${product.category.slug}`}>View category</Link>
        </div>
        <ProductGrid products={relatedProducts} />
      </section>
    </main>
  );
}
