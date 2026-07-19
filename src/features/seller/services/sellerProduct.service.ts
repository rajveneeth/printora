import type { ProductStatus } from '@/models/product.model';
import type { ProductImageStorageProvider } from '@/lib/storage';
import {
  canCreateProductDraft,
  canManageOwnProduct,
  canPublishOwnProduct,
  canSubmitProductForReview,
} from '../permissions';
import type { ProductSaveIntent, SellerPermissionProfile, SellerPermissionUser } from '../models';
import { sellerProductEditorSchema, sellerProductSubmissionSchema } from '../schemas';
import { PrismaSellerRepository } from '../repositories';
import { validateInventoryQuantity } from './inventory.service';
import { validateCategorySpecificProduct } from './categoryProductValidation';
import { canSellerTransitionProduct, getStatusAfterSellerEdit } from './productLifecycle';

export type SellerProductRepositoryContract = Pick<
  PrismaSellerRepository,
  | 'createSellerProduct'
  | 'duplicateSellerProduct'
  | 'findOwnedProduct'
  | 'findActiveCategoryById'
  | 'findSellerInventory'
  | 'transitionSellerProduct'
  | 'updateSellerInventory'
  | 'updateSellerProduct'
>;

export type SellerProductLifecycleAction =
  'ARCHIVE' | 'DUPLICATE' | 'PAUSE' | 'PUBLISH' | 'SUBMIT_REVIEW';

interface SellerProductServiceContext {
  readonly user: SellerPermissionUser;
  readonly seller: SellerPermissionProfile;
}

interface SaveSellerProductInput extends SellerProductServiceContext {
  readonly productId?: string;
  readonly intent: ProductSaveIntent;
  readonly values: unknown;
}

interface UpdateSellerInventoryInput extends SellerProductServiceContext {
  readonly values: unknown;
}

export class SellerProductService {
  constructor(
    private readonly repository: SellerProductRepositoryContract,
    private readonly imageStorage: ProductImageStorageProvider,
  ) {}

  async saveProduct(input: SaveSellerProductInput): Promise<string> {
    const schema =
      input.intent === 'SUBMIT_REVIEW' ? sellerProductSubmissionSchema : sellerProductEditorSchema;
    const productInput = schema.parse(input.values);
    const images = this.imageStorage.prepare(productInput.images);
    const category = await this.repository.findActiveCategoryById(productInput.categoryId);
    if (!category) {
      throw new Error('Choose an active marketplace category.');
    }
    if (input.intent === 'SUBMIT_REVIEW') {
      validateCategorySpecificProduct(category.slug, productInput);
    }
    if (!canCreateProductDraft(input.user, input.seller)) {
      throw new Error('Your seller account cannot create or update product drafts.');
    }
    if (!input.productId) {
      if (input.intent === 'SUBMIT_REVIEW' && input.seller.verificationStatus !== 'APPROVED') {
        throw new Error('Seller verification is required before submitting products for review.');
      }
      const status = input.intent === 'SUBMIT_REVIEW' ? 'PENDING_REVIEW' : 'DRAFT';
      return this.repository.createSellerProduct(
        input.seller.id,
        input.user.id,
        productInput,
        images,
        status,
      );
    }
    const currentProduct = await this.repository.findOwnedProduct(input.seller.id, input.productId);
    if (!currentProduct) {
      throw new Error('Product not found.');
    }
    if (!canManageOwnProduct(input.user, input.seller, currentProduct)) {
      throw new Error('You do not have permission to update this product.');
    }
    const inventory = await this.repository.findSellerInventory(input.seller.id, currentProduct.id);
    if (inventory) {
      validateInventoryQuantity({
        quantity: productInput.quantity,
        reserved: inventory.productReserved,
        lowStockThreshold: productInput.lowStockThreshold,
      });
      for (const variant of productInput.variants) {
        const currentVariant = variant.id
          ? inventory.variants.find((entry) => entry.id === variant.id)
          : undefined;
        validateInventoryQuantity({
          quantity: variant.quantity,
          reserved: currentVariant?.reserved ?? 0,
          lowStockThreshold: variant.lowStockThreshold,
        });
      }
    }
    const status =
      input.intent === 'SUBMIT_REVIEW'
        ? this.getReviewSubmissionStatus(input.user, input.seller, currentProduct)
        : getStatusAfterSellerEdit(currentProduct.status);
    await this.repository.updateSellerProduct(
      currentProduct.id,
      input.user.id,
      productInput,
      images,
      currentProduct.status,
      status,
    );
    return currentProduct.id;
  }

  async runLifecycleAction(
    context: SellerProductServiceContext,
    productId: string,
    action: SellerProductLifecycleAction,
  ): Promise<string> {
    const product = await this.repository.findOwnedProduct(context.seller.id, productId);
    if (!product || !canManageOwnProduct(context.user, context.seller, product)) {
      throw new Error('Product not found or you do not have permission to manage it.');
    }
    if (action === 'DUPLICATE') {
      return this.repository.duplicateSellerProduct(context.seller.id, context.user.id, product.id);
    }
    const nextStatus = this.getNextStatus(action);
    if (action === 'SUBMIT_REVIEW') {
      sellerProductSubmissionSchema.parse(product);
      this.imageStorage.prepare(product.images);
      const category = await this.repository.findActiveCategoryById(product.categoryId);
      if (!category) {
        throw new Error('Choose an active marketplace category.');
      }
      validateCategorySpecificProduct(category.slug, product);
      if (!canSubmitProductForReview(context.user, context.seller, product)) {
        throw new Error('Approved seller verification is required before product submission.');
      }
    }
    if (action === 'PUBLISH' && !canPublishOwnProduct(context.user, context.seller, product)) {
      throw new Error('Only an approved product can be published.');
    }
    if (!canSellerTransitionProduct(product.status, nextStatus)) {
      throw new Error(
        `A ${product.status.toLowerCase()} product cannot move to ${nextStatus.toLowerCase()}.`,
      );
    }
    await this.repository.transitionSellerProduct(
      product.id,
      context.user.id,
      product.status,
      nextStatus,
    );
    return product.id;
  }

  async updateInventory(input: UpdateSellerInventoryInput): Promise<string> {
    const parsed = (await import('../schemas')).inventoryUpdateSchema.parse(input.values);
    const product = await this.repository.findOwnedProduct(input.seller.id, parsed.productId);
    const inventory = await this.repository.findSellerInventory(input.seller.id, parsed.productId);
    if (!product || !inventory || !canManageOwnProduct(input.user, input.seller, product)) {
      throw new Error('Product inventory was not found or cannot be managed.');
    }
    validateInventoryQuantity({
      quantity: parsed.productQuantity,
      reserved: inventory.productReserved,
      lowStockThreshold: parsed.productLowStockThreshold,
    });
    for (const variant of parsed.variants) {
      const currentVariant = inventory.variants.find((entry) => entry.id === variant.variantId);
      if (!currentVariant) {
        throw new Error('A variant does not belong to this product.');
      }
      validateInventoryQuantity({
        quantity: variant.quantity,
        reserved: currentVariant.reserved,
        lowStockThreshold: variant.lowStockThreshold,
      });
    }
    await this.repository.updateSellerInventory(parsed);
    return product.id;
  }

  private getReviewSubmissionStatus(
    user: SellerPermissionUser,
    seller: SellerPermissionProfile,
    product: { id: string; sellerId: string; status: ProductStatus },
  ): ProductStatus {
    if (!canSubmitProductForReview(user, seller, product)) {
      throw new Error('Approved seller verification is required before product submission.');
    }
    if (!canSellerTransitionProduct(product.status, 'PENDING_REVIEW')) {
      throw new Error('This product cannot be submitted in its current status.');
    }
    return 'PENDING_REVIEW';
  }

  private getNextStatus(action: Exclude<SellerProductLifecycleAction, 'DUPLICATE'>): ProductStatus {
    const statusByAction = {
      ARCHIVE: 'ARCHIVED',
      PAUSE: 'PAUSED',
      PUBLISH: 'PUBLISHED',
      SUBMIT_REVIEW: 'PENDING_REVIEW',
    } as const;
    return statusByAction[action];
  }
}
