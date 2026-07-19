import { notFound } from 'next/navigation';
import { InventoryForm } from '@/features/seller/components';
import { requireSellerProductContext, sellerRepository } from '@/features/seller/services';
import type { InventoryUpdateInput } from '@/features/seller/schemas';
import styles from '../../../SellerPage.module.scss';

interface SellerInventoryPageProps {
  readonly params: Promise<{ productId: string }>;
}

export default async function SellerInventoryPage({ params }: SellerInventoryPageProps) {
  const { productId } = await params;
  const { seller } = await requireSellerProductContext();
  const inventory = await sellerRepository.findSellerInventory(seller.id, productId);
  if (!inventory) notFound();
  const defaultValues: InventoryUpdateInput = {
    productId: inventory.productId,
    productQuantity: inventory.productQuantity,
    productLowStockThreshold: inventory.productLowStockThreshold,
    variants: inventory.variants.map((variant) => ({
      variantId: variant.id,
      quantity: variant.quantity,
      lowStockThreshold: variant.lowStockThreshold,
    })),
  };
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>Inventory</p>
          <h1>{inventory.productName}</h1>
          <span>Update available stock without reducing quantities below reserved units.</span>
        </div>
      </header>
      <InventoryForm
        defaultValues={defaultValues}
        productReserved={inventory.productReserved}
        variants={inventory.variants}
      />
    </div>
  );
}
