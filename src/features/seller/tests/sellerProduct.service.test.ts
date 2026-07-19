import { LocalUrlProductImageStorage } from '@/lib/storage';
import type {
  SellerProductEditorRecord,
  SellerPermissionProfile,
  SellerPermissionUser,
} from '../models';
import { SellerProductService, type SellerProductRepositoryContract } from '../services';

const repository = (): jest.Mocked<SellerProductRepositoryContract> => ({
  createSellerProduct: jest.fn(),
  duplicateSellerProduct: jest.fn(),
  findOwnedProduct: jest.fn(),
  findActiveCategoryById: jest.fn(),
  findSellerInventory: jest.fn(),
  transitionSellerProduct: jest.fn(),
  updateSellerInventory: jest.fn(),
  updateSellerProduct: jest.fn(),
});

const user: SellerPermissionUser = { id: 'user-1', role: 'SELLER', status: 'ACTIVE' };
const seller: SellerPermissionProfile = {
  id: 'seller-1',
  userId: 'user-1',
  verificationStatus: 'APPROVED',
};
const values = {
  name: 'Minimal phone stand',
  slug: 'minimal-phone-stand-service-test',
  shortDescription: 'A stable compact stand for phones and small tablets.',
  fullDescription:
    'A carefully printed desktop stand with a charging channel, case-friendly ledge, smooth edges, and a stable viewing angle for everyday use.',
  categoryId: 'category-1',
  basePrice: 349,
  sku: 'SERVICE-PHONE-001',
  minOrderQuantity: 1,
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

const productRecord: SellerProductEditorRecord = {
  id: 'product-1',
  sellerId: seller.id,
  status: 'DRAFT',
  ...values,
};

describe('seller product service', () => {
  it('creates a review-ready product with pending status', async () => {
    const productRepository = repository();
    productRepository.createSellerProduct.mockResolvedValue('product-1');
    productRepository.findActiveCategoryById.mockResolvedValue({
      id: values.categoryId,
      slug: 'desk-workspace',
    });
    const service = new SellerProductService(
      productRepository,
      new LocalUrlProductImageStorage({ maxImages: 8, maxBytes: 1024 }),
    );
    await expect(
      service.saveProduct({ user, seller, intent: 'SUBMIT_REVIEW', values }),
    ).resolves.toBe('product-1');
    expect(productRepository.createSellerProduct).toHaveBeenCalledWith(
      seller.id,
      user.id,
      expect.objectContaining({ name: values.name }),
      expect.arrayContaining([expect.objectContaining({ isPrimary: true })]),
      'PENDING_REVIEW',
    );
  });

  it('prevents a seller from publishing an unapproved draft', async () => {
    const productRepository = repository();
    productRepository.findOwnedProduct.mockResolvedValue(productRecord);
    const service = new SellerProductService(
      productRepository,
      new LocalUrlProductImageStorage({ maxImages: 8, maxBytes: 1024 }),
    );
    await expect(
      service.runLifecycleAction({ user, seller }, productRecord.id, 'PUBLISH'),
    ).rejects.toThrow(/approved product/i);
    expect(productRepository.transitionSellerProduct).not.toHaveBeenCalled();
  });
});
