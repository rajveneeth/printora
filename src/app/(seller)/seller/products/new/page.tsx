import { ProductEditor } from '@/features/seller/components';
import type { SellerProductEditorInput } from '@/features/seller/schemas';
import { requireSellerProductContext, sellerRepository } from '@/features/seller/services';
import styles from '../../SellerPage.module.scss';

const getDefaultProduct = (material: string, shippingOrigin: string): SellerProductEditorInput => ({
  name: '',
  slug: '',
  shortDescription: '',
  fullDescription: '',
  categoryId: '',
  basePrice: 0,
  sku: '',
  minOrderQuantity: 1,
  material,
  processingDays: 5,
  shippingOrigin,
  customisationEnabled: false,
  ipDeclaration:
    'This is an original or appropriately licensed design that I am permitted to sell.',
  ipDeclarationAccepted: false,
  tags: '',
  searchKeywords: '',
  quantity: 0,
  lowStockThreshold: 5,
  images: [],
  variants: [],
});

export default async function NewSellerProductPage() {
  const { seller } = await requireSellerProductContext();
  const categories = await sellerRepository.listActiveCategories();
  const defaultProduct = getDefaultProduct(
    seller.supportedMaterials[0] ?? 'PLA',
    `${seller.originCity}, ${seller.originState}`,
  );
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>New listing</p>
          <h1>Create product</h1>
          <span>
            Save a private draft at any time, or complete every section and submit for review.
          </span>
        </div>
      </header>
      <ProductEditor categories={categories} defaultValues={defaultProduct} />
    </div>
  );
}
