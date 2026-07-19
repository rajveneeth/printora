import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui';
import { ProductEditor, SellerStatusBadge } from '@/features/seller/components';
import type { SellerProductEditorInput } from '@/features/seller/schemas';
import { requireSellerProductContext, sellerRepository } from '@/features/seller/services';
import styles from '../../../SellerPage.module.scss';

interface EditSellerProductPageProps {
  readonly params: Promise<{ productId: string }>;
}

export default async function EditSellerProductPage({ params }: EditSellerProductPageProps) {
  const { productId } = await params;
  const { seller } = await requireSellerProductContext();
  const [product, categories] = await Promise.all([
    sellerRepository.findOwnedProduct(seller.id, productId),
    sellerRepository.listActiveCategories(),
  ]);
  if (!product) notFound();
  if (product.status === 'PENDING_REVIEW' || product.status === 'ARCHIVED') {
    return (
      <Card>
        <SellerStatusBadge status={product.status} />
        <h1>This product cannot be edited right now</h1>
        <p>
          Pending products are locked during review. Archived products remain available for audit
          history but cannot be modified.
        </p>
        <Link href="/seller/products">Return to products</Link>
      </Card>
    );
  }
  const defaultValues: SellerProductEditorInput = {
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    fullDescription: product.fullDescription,
    categoryId: product.categoryId,
    basePrice: product.basePrice,
    ...(product.compareAtPrice === undefined ? {} : { compareAtPrice: product.compareAtPrice }),
    sku: product.sku,
    minOrderQuantity: product.minOrderQuantity,
    ...(product.maxOrderQuantity === undefined
      ? {}
      : { maxOrderQuantity: product.maxOrderQuantity }),
    ...(product.dimensions === undefined ? {} : { dimensions: product.dimensions }),
    ...(product.weightGrams === undefined ? {} : { weightGrams: product.weightGrams }),
    material: product.material,
    ...(product.finish === undefined ? {} : { finish: product.finish }),
    ...(product.colour === undefined ? {} : { colour: product.colour }),
    processingDays: product.processingDays,
    shippingOrigin: product.shippingOrigin,
    customisationEnabled: product.customisationEnabled,
    ...(product.safetyNotes === undefined ? {} : { safetyNotes: product.safetyNotes }),
    ...(product.intendedUse === undefined ? {} : { intendedUse: product.intendedUse }),
    ...(product.ageRestriction === undefined ? {} : { ageRestriction: product.ageRestriction }),
    ipDeclaration: product.ipDeclaration,
    ipDeclarationAccepted: product.ipDeclarationAccepted,
    tags: product.tags,
    searchKeywords: product.searchKeywords,
    ...(product.seoTitle === undefined ? {} : { seoTitle: product.seoTitle }),
    ...(product.seoDescription === undefined ? {} : { seoDescription: product.seoDescription }),
    quantity: product.quantity,
    lowStockThreshold: product.lowStockThreshold,
    images: product.images.map((image) => ({ ...image })),
    variants: product.variants.map((variant) => ({ ...variant })),
  };
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>Edit listing</p>
          <h1>{product.name}</h1>
          <span>
            Material edits to approved or published content return the product to draft review.
          </span>
        </div>
        <SellerStatusBadge status={product.status} />
      </header>
      <ProductEditor categories={categories} defaultValues={defaultValues} productId={product.id} />
    </div>
  );
}
