import { validateCategorySpecificProduct } from '../services';
import type { SellerProductInput } from '../models';

const product: SellerProductInput = {
  name: 'Phone stand',
  slug: 'phone-stand-category-test',
  shortDescription: 'A stable stand for phones.',
  fullDescription: 'A stable desktop phone stand with a charging channel and smooth finish.',
  categoryId: 'category-1',
  basePrice: 349,
  sku: 'CATEGORY-PHONE-001',
  minOrderQuantity: 1,
  material: 'PLA',
  processingDays: 3,
  shippingOrigin: 'Pune, Maharashtra',
  customisationEnabled: false,
  ipDeclaration: 'This is an original seller design that I am permitted to produce and sell.',
  ipDeclarationAccepted: true,
  tags: 'phone stand',
  searchKeywords: 'phone holder',
  quantity: 10,
  lowStockThreshold: 3,
  images: [],
  variants: [],
};

describe('category-specific product validation', () => {
  it('requires dimensions and weight for phone and electronics products', () => {
    expect(() => validateCategorySpecificProduct('phone-electronics-accessories', product)).toThrow(
      /dimensions and weight/i,
    );
    expect(() =>
      validateCategorySpecificProduct('phone-electronics-accessories', {
        ...product,
        dimensions: '90 × 75 × 80 mm',
        weightGrams: 120,
      }),
    ).not.toThrow();
  });

  it('requires intended-use guidance for home décor products', () => {
    expect(() => validateCategorySpecificProduct('home-decor', product)).toThrow(/intended-use/i);
  });
});
