'use server';

import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { CartSyncResult } from '../models';
import { PrismaCartRepository } from '../repositories';
import { accountCartSaveSchema, guestCartSyncSchema } from '../schemas';

const repository = new PrismaCartRepository(prisma);

export const hasActiveCartSessionAction = async (): Promise<boolean> =>
  Boolean(await getCurrentSession());

export const synchronizeGuestCartAction = async (values: unknown): Promise<CartSyncResult> => {
  const session = await getCurrentSession();
  if (!session) return { status: 'anonymous' };
  const parsed = guestCartSyncSchema.safeParse(values);
  if (!parsed.success) return { status: 'error', message: 'The shopping bag could not be synced.' };
  try {
    const items = await repository.synchronizeGuestCart(
      session.user.id,
      session.id,
      parsed.data.guestCartId,
      parsed.data.items,
    );
    return { status: 'authenticated', items };
  } catch {
    return { status: 'error', message: 'The account shopping bag is temporarily unavailable.' };
  }
};

export const saveAccountCartAction = async (values: unknown): Promise<CartSyncResult> => {
  const session = await getCurrentSession();
  if (!session) return { status: 'anonymous' };
  const parsed = accountCartSaveSchema.safeParse(values);
  if (!parsed.success) return { status: 'error', message: 'The shopping bag could not be saved.' };
  try {
    const items = await repository.replaceAccountCart(
      session.user.id,
      session.id,
      parsed.data.items,
    );
    return { status: 'authenticated', items };
  } catch {
    return { status: 'error', message: 'The account shopping bag could not be saved.' };
  }
};
