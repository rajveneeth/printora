import { Prisma, type PrismaClient } from '@prisma/client';
import type { OrderConfirmationDetails } from '../models';

const decimalToPaise = (amount: Prisma.Decimal): number =>
  amount.mul(100).toDecimalPlaces(0).toNumber();

export class PrismaOrderRepository {
  constructor(private readonly database: PrismaClient) {}

  async findOwnedOrder(
    buyerId: string,
    orderNumber: string,
  ): Promise<OrderConfirmationDetails | null> {
    const order = await this.database.order.findFirst({
      where: { buyerId, orderNumber },
      include: {
        address: true,
        items: true,
        payments: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    if (!order) return null;
    const payment = order.payments[0];
    return {
      orderNumber: order.orderNumber,
      status: order.status,
      placedAt: order.placedAt.toISOString(),
      totalInPaise: decimalToPaise(order.grandTotal),
      ...(payment ? { paymentProvider: payment.provider } : {}),
      items: order.items.map((item) => {
        const variant = item.variantSnapshot;
        const variantName =
          typeof variant === 'object' &&
          variant !== null &&
          !Array.isArray(variant) &&
          typeof variant.name === 'string'
            ? variant.name
            : undefined;
        return {
          id: item.id,
          productName: item.productNameSnapshot,
          sellerName: item.sellerNameSnapshot,
          ...(item.productImageSnapshot ? { imageUrl: item.productImageSnapshot } : {}),
          ...(variantName ? { variantName } : {}),
          quantity: item.quantity,
          unitPriceInPaise: decimalToPaise(item.unitPrice),
        };
      }),
      ...(order.address
        ? {
            address: {
              fullName: order.address.fullName,
              line1: order.address.line1,
              ...(order.address.line2 ? { line2: order.address.line2 } : {}),
              city: order.address.city,
              state: order.address.state,
              postalCode: order.address.postalCode,
            },
          }
        : {}),
    };
  }
}
