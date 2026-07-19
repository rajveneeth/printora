import { Prisma, type PrismaClient } from '@prisma/client';
import type { RatingSubmissionInput, ReviewEligibilityRecord } from '../models';
import { calculateAverageRating, getReviewEligibilityError } from '../services';

export class PrismaReviewRepository {
  constructor(private readonly database: PrismaClient) {}

  async findEligibility(
    userId: string,
    orderItemId: string,
  ): Promise<ReviewEligibilityRecord | null> {
    const item = await this.database.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        order: { include: { fulfilments: true } },
        product: { include: { seller: { select: { userId: true } } } },
        review: { select: { id: true } },
        sellerReview: { select: { id: true } },
      },
    });
    if (!item?.product) return null;
    const fulfilment = item.order.fulfilments.find(({ sellerId }) => sellerId === item.sellerId);
    return {
      orderItemId: item.id,
      buyerId: item.order.buyerId,
      sellerUserId: item.product.seller.userId,
      productId: item.productId,
      orderStatus: item.order.status,
      fulfilmentStatus: fulfilment?.status ?? null,
      hasProductReview: Boolean(item.review),
      hasSellerReview: Boolean(item.sellerReview),
    };
  }

  async submitVerifiedRatings(userId: string, input: RatingSubmissionInput): Promise<void> {
    await this.database.$transaction(
      async (transaction) => {
        const item = await transaction.orderItem.findUnique({
          where: { id: input.orderItemId },
          include: {
            order: { include: { fulfilments: true } },
            product: { include: { seller: { select: { userId: true } } } },
            review: { select: { id: true } },
            sellerReview: { select: { id: true } },
          },
        });
        const record: ReviewEligibilityRecord | null = item?.product
          ? {
              orderItemId: item.id,
              buyerId: item.order.buyerId,
              sellerUserId: item.product.seller.userId,
              productId: item.productId,
              orderStatus: item.order.status,
              fulfilmentStatus:
                item.order.fulfilments.find(({ sellerId }) => sellerId === item.sellerId)?.status ??
                null,
              hasProductReview: Boolean(item.review),
              hasSellerReview: Boolean(item.sellerReview),
            }
          : null;
        const eligibilityError = getReviewEligibilityError(userId, record);
        if (eligibilityError || !item?.productId) {
          throw new Error(eligibilityError ?? 'This purchase is not available for review.');
        }
        const productRating = Math.round(
          calculateAverageRating([
            input.qualityRating,
            input.finishRating,
            input.accuracyRating,
            input.valueRating,
          ]),
        );
        const sellerRating = Math.round(
          calculateAverageRating([
            input.communicationRating,
            input.dispatchSpeedRating,
            input.customisationRating,
          ]),
        );
        await transaction.review.create({
          data: {
            productId: item.productId,
            authorId: userId,
            orderItemId: item.id,
            rating: productRating,
            qualityRating: input.qualityRating,
            finishRating: input.finishRating,
            accuracyRating: input.accuracyRating,
            valueRating: input.valueRating,
            title: input.title,
            body: input.body,
            status: 'PUBLISHED',
          },
        });
        await transaction.sellerReview.create({
          data: {
            sellerId: item.sellerId,
            authorId: userId,
            orderItemId: item.id,
            rating: sellerRating,
            communicationRating: input.communicationRating,
            dispatchSpeedRating: input.dispatchSpeedRating,
            customisationRating: input.customisationRating,
            status: 'PUBLISHED',
          },
        });
        const sellerRatingAggregate = await transaction.sellerReview.aggregate({
          where: { sellerId: item.sellerId, status: 'PUBLISHED' },
          _avg: { rating: true },
        });
        await transaction.sellerProfile.update({
          where: { id: item.sellerId },
          data: {
            averageRating: new Prisma.Decimal(
              Number(sellerRatingAggregate._avg.rating ?? sellerRating).toFixed(2),
            ),
          },
        });
        await transaction.auditLog.create({
          data: {
            actorId: userId,
            action: 'VERIFIED_REVIEW_SUBMITTED',
            entityType: 'ORDER_ITEM',
            entityId: item.id,
            newState: { productRating, sellerRating, status: 'PUBLISHED' },
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
