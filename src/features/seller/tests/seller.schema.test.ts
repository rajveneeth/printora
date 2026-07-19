import { sellerProductEditorSchema, sellerProductSubmissionSchema } from '../schemas';

const validProduct = {
  name: 'Minimal phone stand',
  slug: 'minimal-phone-stand-seller-test',
  shortDescription: 'A stable compact stand for phones and small tablets.',
  fullDescription:
    'A carefully printed desktop stand with a charging channel, case-friendly ledge, smooth edges, and a stable viewing angle for everyday use.',
  categoryId: 'category-1',
  basePrice: 349,
  compareAtPrice: 449,
  sku: 'TEST-PHONE-001',
  minOrderQuantity: 1,
  maxOrderQuantity: 10,
  material: 'PLA',
  processingDays: 3,
  shippingOrigin: 'Pune, Maharashtra',
  customisationEnabled: true,
  ipDeclaration: 'This is an original seller design that I am permitted to produce and sell.',
  ipDeclarationAccepted: true,
  tags: 'phone stand, desk',
  searchKeywords: 'phone, mobile holder',
  quantity: 10,
  lowStockThreshold: 3,
  images: [
    {
      url: '/catalogue/minimal-phone-stand.svg',
      altText: 'Minimal charcoal phone stand on a desk',
    },
  ],
  variants: [],
};

describe('seller product schemas', () => {
  it('accepts a complete review-ready listing', () => {
    expect(sellerProductSubmissionSchema.safeParse(validProduct).success).toBe(true);
  });

  it('keeps compare-at pricing honest', () => {
    const result = sellerProductEditorSchema.safeParse({
      ...validProduct,
      compareAtPrice: validProduct.basePrice,
    });
    expect(result.success).toBe(false);
  });

  it('requires a declaration and image before review submission', () => {
    const result = sellerProductSubmissionSchema.safeParse({
      ...validProduct,
      images: [],
      ipDeclarationAccepted: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
        expect.arrayContaining(['images', 'ipDeclarationAccepted']),
      );
    }
  });
});
