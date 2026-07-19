import type { SellerProductInput } from '../models';

export const validateCategorySpecificProduct = (
  categorySlug: string,
  product: SellerProductInput,
): void => {
  if (
    categorySlug === 'phone-electronics-accessories' &&
    (!product.dimensions || !product.weightGrams)
  ) {
    throw new Error('Phone and electronics products require dimensions and weight before review.');
  }
  if (categorySlug === 'home-decor' && !product.intendedUse) {
    throw new Error('Home and décor products require intended-use guidance before review.');
  }
};
