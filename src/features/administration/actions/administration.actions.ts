'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  canApproveProduct,
  canManageCategories,
  canModerateReview,
  canModerateSeller,
  canViewAdminDashboard,
} from '@/features/permissions';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { adminEnvironment } from '@/lib/validation/environment';
import type { AdminActionState } from '../models';
import { PrismaAdministrationRepository } from '../repositories';
import {
  categorySchema,
  productModerationSchema,
  reviewModerationSchema,
  sellerModerationSchema,
} from '../schemas';

const repository = new PrismaAdministrationRepository(prisma);

const requireAdmin = async () => {
  if (!adminEnvironment.ADMIN_DASHBOARD_ENABLED) redirect('/unauthorised');
  const session = await requireSession();
  if (!canViewAdminDashboard(session.user)) redirect('/unauthorised');
  return session.user;
};

const actionError = (error: unknown): AdminActionState => {
  if (error instanceof z.ZodError) {
    return { status: 'error', message: error.issues[0]?.message ?? 'Check the submitted fields.' };
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return { status: 'error', message: 'That slug is already used by another category.' };
  }
  return {
    status: 'error',
    message: error instanceof Error ? error.message : 'The administration action failed.',
  };
};

export const saveCategoryAction = async (
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> => {
  try {
    const admin = await requireAdmin();
    if (!canManageCategories(admin)) redirect('/unauthorised');
    const input = categorySchema.parse(Object.fromEntries(formData));
    await repository.saveCategory(admin.id, input);
    revalidatePath('/admin');
    revalidatePath('/admin/categories');
    revalidatePath('/categories');
    return { status: 'success', message: 'Category saved and recorded in the audit log.' };
  } catch (error) {
    return actionError(error);
  }
};

export const moderateProductAction = async (
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> => {
  try {
    const admin = await requireAdmin();
    if (!canApproveProduct(admin)) redirect('/unauthorised');
    const input = productModerationSchema.parse(Object.fromEntries(formData));
    await repository.moderateProduct({ actorId: admin.id, ...input });
    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${input.productId}`);
    revalidatePath('/products');
    return { status: 'success', message: 'Product decision saved with an audit event.' };
  } catch (error) {
    return actionError(error);
  }
};

export const moderateSellerAction = async (
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> => {
  try {
    const admin = await requireAdmin();
    if (!canModerateSeller(admin)) redirect('/unauthorised');
    const input = sellerModerationSchema.parse(Object.fromEntries(formData));
    await repository.moderateSeller({ actorId: admin.id, ...input });
    revalidatePath('/admin');
    revalidatePath('/admin/sellers');
    revalidatePath(`/admin/sellers/${input.sellerId}`);
    revalidatePath('/seller');
    revalidatePath('/products');
    return { status: 'success', message: 'Seller decision saved with an audit event.' };
  } catch (error) {
    return actionError(error);
  }
};

export const moderateReviewAction = async (
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> => {
  try {
    const admin = await requireAdmin();
    if (!canModerateReview(admin)) redirect('/unauthorised');
    const input = reviewModerationSchema.parse(Object.fromEntries(formData));
    await repository.moderateReview({ actorId: admin.id, ...input });
    revalidatePath('/admin');
    revalidatePath('/admin/reviews');
    return { status: 'success', message: 'Review visibility updated with moderation history.' };
  } catch (error) {
    return actionError(error);
  }
};
