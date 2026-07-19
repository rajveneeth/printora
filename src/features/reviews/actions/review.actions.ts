'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ReviewActionState } from '../models';
import { PrismaReviewRepository } from '../repositories';
import { ratingSubmissionSchema } from '../schemas';

const repository = new PrismaReviewRepository(prisma);

export const submitRatingAction = async (
  _state: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> => {
  try {
    const session = await requireSession();
    const input = ratingSubmissionSchema.parse(Object.fromEntries(formData));
    await repository.submitVerifiedRatings(session.user.id, input);
    revalidatePath('/account/orders');
    return { status: 'success', message: 'Your verified product and seller ratings are live.' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'error', message: error.issues[0]?.message ?? 'Check your review.' };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { status: 'error', message: 'A review already exists for this order item.' };
    }
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Your review could not be submitted.',
    };
  }
};
