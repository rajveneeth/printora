import Image from 'next/image';
import Link from 'next/link';
import { PackagePlus } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import { PriceDisplay } from '@/features/catalogue';
import { ProductActions, SellerStatusBadge } from '@/features/seller/components';
import { requireSellerProductContext, sellerRepository } from '@/features/seller/services';
import type { ProductStatus } from '@/models/product.model';
import styles from './SellerProducts.module.scss';

interface SellerProductsPageProps {
  readonly searchParams: Promise<{ status?: string }>;
}

const productStatuses: readonly ProductStatus[] = [
  'DRAFT',
  'PENDING_REVIEW',
  'CHANGES_REQUESTED',
  'APPROVED',
  'REJECTED',
  'PUBLISHED',
  'PAUSED',
  'ARCHIVED',
];

const publicationState = (status: ProductStatus): string => {
  if (status === 'PUBLISHED') return 'Live in storefront';
  if (status === 'PAUSED') return 'Publication paused';
  if (status === 'ARCHIVED') return 'Archived';
  return 'Private';
};

export default async function SellerProductsPage({ searchParams }: SellerProductsPageProps) {
  const { seller } = await requireSellerProductContext();
  const requestedStatus = (await searchParams).status;
  const activeStatus = productStatuses.find((status) => status === requestedStatus);
  const products = (await sellerRepository.listSellerProducts(seller.id)).filter(
    (product) => !activeStatus || product.status === activeStatus,
  );
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>Catalogue management</p>
          <h1>Products</h1>
          <span>
            Create drafts, track review status, publish approved products, and manage stock.
          </span>
        </div>
        <Link className={styles.createAction} href="/seller/products/new">
          <PackagePlus aria-hidden="true" size={18} />
          Create product
        </Link>
      </header>
      <form className={styles.filters} method="get">
        <label htmlFor="product-status">Approval and publication status</label>
        <select id="product-status" name="status" defaultValue={activeStatus ?? ''}>
          <option value="">All products</option>
          {productStatuses.map((status) => (
            <option value={status} key={status}>
              {status.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
        <button type="submit">Apply</button>
        {activeStatus ? <Link href="/seller/products">Clear</Link> : null}
      </form>
      {products.length ? (
        <div className={styles.productList}>
          <div className={styles.tableHeader} aria-hidden="true">
            <span>Product</span>
            <span>Price and stock</span>
            <span>Performance</span>
            <span>Status and actions</span>
          </div>
          {products.map((product) => (
            <article className={styles.productRow} key={product.id}>
              <div className={styles.productIdentity}>
                <div className={styles.imageFrame}>
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.imageAlt} fill sizes="72px" />
                  ) : (
                    <PackagePlus aria-hidden="true" size={24} />
                  )}
                </div>
                <div>
                  <h2>{product.name}</h2>
                  <p>{product.categoryName}</p>
                  <span>Updated {product.updatedAt.toLocaleDateString('en-IN')}</span>
                </div>
              </div>
              <div className={styles.stockCell}>
                <PriceDisplay priceInPaise={product.priceInPaise} size="small" />
                <p>
                  <strong>{product.stock}</strong> available · {product.reserved} reserved
                </p>
                {product.stock <= product.lowStockThreshold ? <span>Low stock</span> : null}
              </div>
              <div className={styles.performance}>
                <span>
                  <strong>{product.viewCount}</strong> views
                </span>
                <span>
                  <strong>{product.orderCount}</strong> orders
                </span>
              </div>
              <div className={styles.actionCell}>
                <SellerStatusBadge status={product.status} />
                <span className={styles.publicationState}>{publicationState(product.status)}</span>
                <ProductActions
                  productId={product.id}
                  productSlug={product.slug}
                  status={product.status}
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            activeStatus
              ? `No ${activeStatus.toLowerCase().replaceAll('_', ' ')} products`
              : 'No seller products yet'
          }
          description="Create a private draft, add product details and images, then submit it for administrator review."
          action={<Link href="/seller/products/new">Create your first product</Link>}
        />
      )}
    </div>
  );
}
