import type { CatalogueProduct } from '@/features/catalogue/models';

export interface ProductCardProps {
  readonly product: CatalogueProduct;
  readonly priority?: boolean;
}
