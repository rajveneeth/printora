'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { canManageSellerOrder } from '@/features/permissions';
import { requireSellerProductContext } from '@/features/seller/services';
import { prisma } from '@/lib/prisma';
import type { OrderActionState } from '../models';
import { PrismaOrderRepository } from '../repositories';
import { sellerOrderTransitionSchema } from '../schemas';

const repository = new PrismaOrderRepository(prisma);

export const updateSellerOrderStatusAction = async (
  _state: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> => {
  try {
    const { session, seller } = await requireSellerProductContext();
    if (!canManageSellerOrder(session.user, seller, seller.id)) {
      return { status: 'error', message: 'You cannot update orders for this seller account.' };
    }
    const input = sellerOrderTransitionSchema.parse({
      orderNumber: formData.get('orderNumber'),
      nextStatus: formData.get('nextStatus'),
      note: formData.get('note'),
      trackingNumber: formData.get('trackingNumber') || undefined,
      carrier: formData.get('carrier') || undefined,
    });
    await repository.transitionSellerOrder({
      actorId: session.user.id,
      sellerId: seller.id,
      ...input,
    });
    revalidatePath('/seller');
    revalidatePath('/seller/orders');
    revalidatePath(`/seller/orders/${input.orderNumber}`);
    revalidatePath('/account/orders');
    return { status: 'success', message: 'Order status updated and added to its audit history.' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'error', message: error.issues[0]?.message ?? 'Check the order update.' };
    }
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'The order status could not be updated.',
    };
  }
};
