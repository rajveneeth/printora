'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { sellerEnvironment } from '@/lib/validation/environment';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';
import { LocalUrlProductImageStorage } from '@/lib/storage';
import { canApplyToBecomeSeller, canManageSellerProfile } from '../permissions';
import { PrismaSellerRepository } from '../repositories';
import { sellerProfileSchema } from '../schemas';
import { SellerProductService, type SellerProductLifecycleAction } from '../services';
import type { ProductActionResult, ProductSaveIntent } from '../models';

const repository = new PrismaSellerRepository(prisma);
const imageStorage = new LocalUrlProductImageStorage({
  maxImages: sellerEnvironment.SELLER_IMAGE_MAX_COUNT,
  maxBytes: sellerEnvironment.SELLER_IMAGE_MAX_BYTES,
});
const productService = new SellerProductService(repository, imageStorage);

const success = (message: string, productId?: string): ProductActionResult => ({
  status: 'success',
  message,
  ...(productId ? { productId } : {}),
});

const failure = (error: unknown): ProductActionResult => {
  if (error instanceof z.ZodError) {
    return { status: 'error', message: error.issues[0]?.message ?? 'Check the form fields.' };
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return { status: 'error', message: 'A store slug, product slug, or SKU is already in use.' };
  }
  if (error instanceof Error && error.constructor.name.startsWith('Prisma')) {
    return { status: 'error', message: 'Seller data is temporarily unavailable. Try again.' };
  }
  if (error instanceof Error) {
    return { status: 'error', message: error.message };
  }
  return { status: 'error', message: 'The seller action could not be completed.' };
};

const getContext = async () => {
  if (!sellerEnvironment.SELLER_DASHBOARD_ENABLED) {
    throw new Error('The seller dashboard is disabled in this environment.');
  }
  const session = await requireSession();
  const workspace = await repository.findSellerWorkspaceByUserId(session.user.id);
  if (!workspace.seller) {
    throw new Error('Complete seller onboarding before using product tools.');
  }
  return { user: session.user, seller: workspace.seller };
};

export const submitSellerApplicationAction = async (
  values: unknown,
): Promise<ProductActionResult> => {
  try {
    const session = await requireSession();
    if (!canApplyToBecomeSeller(session.user)) {
      throw new Error('This account cannot submit a seller application.');
    }
    const workspace = await repository.findSellerWorkspaceByUserId(session.user.id);
    if (workspace.seller?.verificationStatus === 'APPROVED') {
      throw new Error('Use store profile settings to update an approved seller account.');
    }
    const input = sellerProfileSchema.parse(values);
    await repository.saveSellerApplication(session.user.id, input);
    revalidatePath('/seller');
    revalidatePath('/seller/onboarding');
    return success('Your seller application has been submitted for review.');
  } catch (error) {
    return failure(error);
  }
};

export const updateSellerProfileAction = async (values: unknown): Promise<ProductActionResult> => {
  try {
    const context = await getContext();
    if (!canManageSellerProfile(context.user, context.seller)) {
      throw new Error('You do not have permission to update this seller profile.');
    }
    const input = sellerProfileSchema.parse(values);
    await repository.updateSellerProfile(context.user.id, input);
    revalidatePath('/seller');
    revalidatePath('/seller/profile');
    return success('Store profile updated.');
  } catch (error) {
    return failure(error);
  }
};

export const saveSellerProductAction = async (
  productId: string | null,
  intent: ProductSaveIntent,
  values: unknown,
): Promise<ProductActionResult> => {
  try {
    const context = await getContext();
    const savedProductId = await productService.saveProduct({
      ...context,
      ...(productId ? { productId } : {}),
      intent,
      values,
    });
    revalidatePath('/seller');
    revalidatePath('/seller/products');
    return success(
      intent === 'SUBMIT_REVIEW'
        ? 'Product submitted for administrator review.'
        : 'Product draft saved.',
      savedProductId,
    );
  } catch (error) {
    return failure(error);
  }
};

export const runSellerProductAction = async (
  productId: string,
  action: SellerProductLifecycleAction,
): Promise<ProductActionResult> => {
  try {
    const context = await getContext();
    const affectedProductId = await productService.runLifecycleAction(context, productId, action);
    revalidatePath('/seller');
    revalidatePath('/seller/products');
    return success(
      action === 'DUPLICATE'
        ? 'Product duplicated as a private draft.'
        : `Product ${action.toLowerCase().replace('_', ' ')} completed.`,
      affectedProductId,
    );
  } catch (error) {
    return failure(error);
  }
};

export const updateSellerInventoryAction = async (
  values: unknown,
): Promise<ProductActionResult> => {
  try {
    const context = await getContext();
    const productId = await productService.updateInventory({ ...context, values });
    revalidatePath('/seller');
    revalidatePath('/seller/products');
    revalidatePath(`/seller/products/${productId}/inventory`);
    return success('Inventory updated.', productId);
  } catch (error) {
    return failure(error);
  }
};
