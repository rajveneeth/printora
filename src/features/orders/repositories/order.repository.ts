import { Prisma, type PrismaClient } from '@prisma/client';
import type { OrderStatus } from '@/models/order.model';
import type {
  BuyerOrderDetails,
  BuyerOrderSummary,
  OrderConfirmationDetails,
  OrderLineSnapshot,
  SellerOrderSummary,
} from '../models';
import { canSellerTransitionOrder, deriveMarketplaceOrderStatus } from '../services';

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

  async listBuyerOrders(buyerId: string): Promise<readonly BuyerOrderSummary[]> {
    const orders = await this.database.order.findMany({
      where: { buyerId },
      include: {
        items: { include: { review: true, sellerReview: true } },
        fulfilments: { include: { seller: { select: { storeName: true } } } },
      },
      orderBy: { placedAt: 'desc' },
    });
    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      placedAt: order.placedAt,
      totalInPaise: decimalToPaise(order.grandTotal),
      items: order.items.map((item) => this.mapOrderItem(item, order.status, order.fulfilments)),
      fulfilments: order.fulfilments.map((fulfilment) => ({
        sellerId: fulfilment.sellerId,
        sellerName: fulfilment.seller.storeName,
        status: fulfilment.status,
        trackingNumber: fulfilment.trackingNumber,
        carrier: fulfilment.carrier,
      })),
    }));
  }

  async findBuyerOrderDetails(
    buyerId: string,
    orderNumber: string,
  ): Promise<BuyerOrderDetails | null> {
    const order = await this.database.order.findFirst({
      where: { buyerId, orderNumber },
      include: {
        address: true,
        items: { include: { review: true, sellerReview: true } },
        fulfilments: { include: { seller: { select: { storeName: true } } } },
        statusEvents: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!order) return null;
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      placedAt: order.placedAt,
      totalInPaise: decimalToPaise(order.grandTotal),
      subtotalInPaise: decimalToPaise(order.subtotal),
      taxInPaise: decimalToPaise(order.taxTotal),
      shippingInPaise: decimalToPaise(order.shippingTotal),
      items: order.items.map((item) => this.mapOrderItem(item, order.status, order.fulfilments)),
      fulfilments: order.fulfilments.map((fulfilment) => ({
        sellerId: fulfilment.sellerId,
        sellerName: fulfilment.seller.storeName,
        status: fulfilment.status,
        trackingNumber: fulfilment.trackingNumber,
        carrier: fulfilment.carrier,
      })),
      timeline: order.statusEvents.map((event) => ({
        id: event.id,
        status: event.status,
        previousStatus: event.previousStatus,
        note: event.note,
        sellerId: event.sellerId,
        createdAt: event.createdAt,
      })),
      address: order.address
        ? {
            fullName: order.address.fullName,
            phone: order.address.phone,
            line1: order.address.line1,
            line2: order.address.line2,
            city: order.address.city,
            state: order.address.state,
            postalCode: order.address.postalCode,
            country: order.address.country,
          }
        : null,
    };
  }

  async listSellerOrders(sellerId: string): Promise<readonly SellerOrderSummary[]> {
    const fulfilments = await this.database.sellerOrderFulfilment.findMany({
      where: { sellerId },
      include: {
        order: {
          include: {
            buyer: { select: { name: true, email: true } },
            items: { where: { sellerId }, include: { review: true, sellerReview: true } },
          },
        },
      },
      orderBy: { order: { placedAt: 'desc' } },
    });
    return fulfilments.map((fulfilment) => {
      const items = fulfilment.order.items.map((item) =>
        this.mapOrderItem(item, fulfilment.status, [fulfilment]),
      );
      return {
        orderId: fulfilment.orderId,
        orderNumber: fulfilment.order.orderNumber,
        buyerName: fulfilment.order.buyer.name ?? fulfilment.order.buyer.email,
        status: fulfilment.status,
        placedAt: fulfilment.order.placedAt,
        totalInPaise: items.reduce((total, item) => total + item.lineTotalInPaise, 0),
        trackingNumber: fulfilment.trackingNumber,
        carrier: fulfilment.carrier,
        items,
      };
    });
  }

  async transitionSellerOrder(input: {
    readonly actorId: string;
    readonly sellerId: string;
    readonly orderNumber: string;
    readonly nextStatus: OrderStatus;
    readonly note: string;
    readonly trackingNumber?: string | undefined;
    readonly carrier?: string | undefined;
  }): Promise<void> {
    await this.database.$transaction(async (transaction) => {
      const fulfilment = await transaction.sellerOrderFulfilment.findFirst({
        where: { sellerId: input.sellerId, order: { orderNumber: input.orderNumber } },
        include: { order: { select: { status: true } } },
      });
      if (!fulfilment) throw new Error('Seller order not found.');
      if (!canSellerTransitionOrder(fulfilment.status, input.nextStatus)) {
        throw new Error('This order cannot move to the requested status.');
      }
      await transaction.sellerOrderFulfilment.update({
        where: { id: fulfilment.id },
        data: {
          status: input.nextStatus,
          trackingNumber: input.trackingNumber ?? fulfilment.trackingNumber,
          carrier: input.carrier ?? fulfilment.carrier,
        },
      });
      const fulfilments = await transaction.sellerOrderFulfilment.findMany({
        where: { orderId: fulfilment.orderId },
        select: { status: true },
      });
      const orderStatus = deriveMarketplaceOrderStatus(
        fulfilments.map(({ status }) => status),
        fulfilment.order.status,
      );
      await transaction.order.update({
        where: { id: fulfilment.orderId },
        data: { status: orderStatus },
      });
      await transaction.orderStatusEvent.create({
        data: {
          orderId: fulfilment.orderId,
          sellerId: input.sellerId,
          actorId: input.actorId,
          previousStatus: fulfilment.status,
          status: input.nextStatus,
          note: input.note,
        },
      });
      await transaction.auditLog.create({
        data: {
          actorId: input.actorId,
          action: 'ORDER_STATUS_CHANGED',
          entityType: 'ORDER',
          entityId: fulfilment.orderId,
          previousState: { sellerId: input.sellerId, status: fulfilment.status },
          newState: { sellerId: input.sellerId, status: input.nextStatus },
          reason: input.note,
        },
      });
    });
  }

  private mapOrderItem(
    item: {
      id: string;
      productId: string | null;
      sellerId: string;
      productNameSnapshot: string;
      sellerNameSnapshot: string;
      productImageSnapshot: string | null;
      quantity: number;
      unitPrice: Prisma.Decimal;
      tax: Prisma.Decimal;
      shippingFee: Prisma.Decimal;
      review: { id: string } | null;
      sellerReview: { id: string } | null;
    },
    orderStatus: OrderStatus,
    fulfilments: readonly { sellerId: string; status: OrderStatus }[],
  ): OrderLineSnapshot {
    const fulfilmentStatus =
      fulfilments.find((fulfilment) => fulfilment.sellerId === item.sellerId)?.status ??
      orderStatus;
    const hasReview = Boolean(item.review || item.sellerReview);
    const unitPriceInPaise = decimalToPaise(item.unitPrice);
    return {
      id: item.id,
      productName: item.productNameSnapshot,
      sellerName: item.sellerNameSnapshot,
      sellerId: item.sellerId,
      productImageUrl: item.productImageSnapshot,
      quantity: item.quantity,
      unitPriceInPaise,
      lineTotalInPaise:
        unitPriceInPaise * item.quantity +
        decimalToPaise(item.tax) +
        decimalToPaise(item.shippingFee),
      isReviewEligible: fulfilmentStatus === 'DELIVERED' && Boolean(item.productId) && !hasReview,
      hasReview,
    };
  }
}
