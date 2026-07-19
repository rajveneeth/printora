import { categorySchema, productModerationSchema, sellerModerationSchema } from '../schemas';

describe('administration schemas', () => {
  it('normalises a category form', () => {
    expect(
      categorySchema.parse({
        name: 'Home décor',
        slug: 'home-decor',
        description: '',
        parentId: '',
        imageUrl: '',
        icon: 'House',
        seoTitle: '',
        seoDescription: '',
        position: '2',
        isActive: 'on',
      }),
    ).toMatchObject({ slug: 'home-decor', position: 2, isActive: true });
  });

  it('requires reasons for adverse decisions', () => {
    expect(
      productModerationSchema.safeParse({
        productId: 'product-1',
        decision: 'REJECT',
        reason: '',
      }).success,
    ).toBe(false);
    expect(
      sellerModerationSchema.safeParse({
        sellerId: 'seller-1',
        decision: 'SUSPEND',
        reason: 'Policy violation',
      }).success,
    ).toBe(true);
  });
});
